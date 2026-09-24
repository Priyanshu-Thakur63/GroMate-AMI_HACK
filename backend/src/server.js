const app = require('./app');
const prisma = require('./config/database');
const runAutoMigration = require('./database/autoMigrate');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Run Code-Based Auto Migration before accepting incoming HTTP requests
    console.log('====================================================');
    console.log('  CityPulse REST API Engine - Initializing Backend  ');
    console.log('====================================================');
    
    await runAutoMigration();

    // 2. Start Express HTTP Server
    const server = app.listen(PORT, () => {
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
      console.log('====================================================');
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully closing Prisma and HTTP server...`);
      await prisma.$disconnect();
      server.close(() => {
        console.log('HTTP server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Fatal error during backend startup:', error);
    process.exit(1);
  }
}

startServer();
