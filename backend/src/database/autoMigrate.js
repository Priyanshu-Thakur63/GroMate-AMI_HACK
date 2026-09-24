const { execSync } = require('child_process');
const path = require('path');
const prisma = require('../config/database');

/**
 * Code-Based Auto Migration Runner
 * Automatically checks connection and synchronizes Prisma models with PostgreSQL on boot.
 */
async function runAutoMigration() {
  console.log('[Auto-Migration] Initiating code-based database migration...');

  try {
    // 1. Verify Database connectivity
    await prisma.$connect();
    console.log('[Auto-Migration] Database connection verified.');

    // 2. Execute Prisma schema synchronization programmatically
    const projectRoot = path.resolve(__dirname, '../../');
    const command = 'npx prisma db push --schema=./prisma/schema --accept-data-loss';

    console.log(`[Auto-Migration] Synchronizing schema models to PostgreSQL...`);
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: { ...process.env },
    });

    console.log('[Auto-Migration] Schema synchronization successful:');
    console.log(output.trim());
    return { success: true };
  } catch (error) {
    console.error('[Auto-Migration] Auto migration failed:', error.message);
    if (error.stdout) console.error('[Auto-Migration Output]:', error.stdout);
    if (error.stderr) console.error('[Auto-Migration Error]:', error.stderr);
    
    // In local dev without active DB, allow graceful fallback warning rather than hard crash
    console.warn('[Auto-Migration] Proceeding with server start (Verify DATABASE_URL in .env)');
    return { success: false, error: error.message };
  }
}

module.exports = runAutoMigration;
