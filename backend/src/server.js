const http = require('http');
const { execSync } = require('child_process');
const app = require('./app');
const prisma = require('./config/database');
const runAutoMigration = require('./database/autoMigrate');
const ingestionService = require('./features/ingestion/ingestion.service');

const PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Free up port if an orphaned process is holding it
 */
function freePortIfOccupied(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`) && parts[3] === 'LISTENING') {
          const pid = parseInt(parts[4], 10);
          if (pid && pid !== process.pid && pid !== process.ppid) {
            pids.add(pid);
          }
        }
      });

      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch (_) {}
      });
    }
  } catch (_) {
    // Port is clean
  }
}

async function startServer() {
  try {
    console.log('====================================================');
    console.log('  CityPulse REST API Engine - Initializing Backend  ');
    console.log('====================================================');

    // 1. Ensure port 5000 is cleanly available
    freePortIfOccupied(PORT);

    // 2. Run Code-Based Auto Migration
    await runAutoMigration();

    // 3. Create HTTP Server and attach error listeners BEFORE listening
    const server = http.createServer(app);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Port Conflict] Port ${PORT} is occupied. Attempting to release and retry...`);
        freePortIfOccupied(PORT);
        setTimeout(() => {
          try {
            server.close();
          } catch (_) {}
          server.listen(PORT);
        }, 1200);
      } else {
        console.error('Server error:', err);
      }
    });

    server.listen(PORT, async () => {
      console.log('====================================================');
      console.log(`  Server successfully listening on port: ${PORT}   `);
      console.log(`  Base URL: http://localhost:${PORT}               `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
      console.log('Feature Endpoints Active:');
      console.log('  • GET  /health');
      console.log('  • REST /api/weather');
      console.log('  • REST /api/incidents');
      console.log('  • REST /api/air-quality');
      console.log('  • REST /api/social-sentiment');
      console.log('  • REST /api/disaster');
      console.log('  • REST /api/zones');
      console.log('  • REST /api/pulse');
      console.log('  • REST /api/summary');
      console.log('  • REST /api/anomalies');
      console.log('  • REST /api/correlations');
      console.log('  • POST /api/ingest/sync');
      console.log('====================================================');

      // 4. Initial Live Multi-Feed Ingestion on Boot
      try {
        console.log('[Live Sync] Triggering initial live data synchronization across Jaipur...');
        await ingestionService.syncAllZones();
        console.log('[Live Sync] Initial synchronization complete.');
      } catch (syncErr) {
        console.warn('[Live Sync Warning] Initial sync:', syncErr.message);
      }

      // 5. Periodic Live Background Refresh (every 10 minutes)
      setInterval(async () => {
        try {
          console.log('[Live Sync] Running scheduled multi-feed refresh for Jaipur...');
          await ingestionService.syncAllZones();
        } catch (_) {}
      }, 10 * 60 * 1000);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully closing HTTP server...`);
      try {
        await prisma.$disconnect();
      } catch (_) {}
      server.close(() => {
        process.exit(0);
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Startup initialization error:', error);
  }
}

startServer();
