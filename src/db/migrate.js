const fs = require('fs');

async function runMigrations() {
  const migrationsFolder = 'drizzle';
  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`Migrations folder "${migrationsFolder}" not found. Skipping migrations.`);
    return;
  }

  const { migrate } = await import('drizzle-orm/neon-http/migrator');
  const { drizzle } = await import('drizzle-orm/neon-http');
  const { neon } = await import('@neondatabase/serverless');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder });
  console.log('Database migration complete');
}

module.exports = { runMigrations };
