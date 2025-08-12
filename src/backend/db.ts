import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/rehab',
});

export async function query<T = any>(
  text: string,
  params: any[] = []
): Promise<{ rows: T[] }> {
  const res = await pool.query<T>(text, params);
  return res;
}

export async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subscription_plan TEXT,
      subscription_status TEXT,
      subscription_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

