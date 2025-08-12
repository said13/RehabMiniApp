import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'neon-http',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
