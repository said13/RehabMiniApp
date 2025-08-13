const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrationsFolder = path.resolve('drizzle');
  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`Migrations folder "${migrationsFolder}" not found. Skipping migrations.`);
    return;
  }
  console.log(`Starting database migrations from "${migrationsFolder}"`);
  try {
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { neon } = await import('@neondatabase/serverless');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    await migrate(db, { migrationsFolder });
    console.log('Database migration complete');
  } catch (error) {
    console.error('Database migration failed', error);
    throw error;
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('Migration script failed', err);
    process.exit(1);
  });
}
