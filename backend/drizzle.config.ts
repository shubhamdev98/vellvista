import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const databaseUrl = new URL(connectionString);

if (databaseUrl.username === 'username' || databaseUrl.password === 'password') {
  throw new Error(
    'DATABASE_URL still contains placeholder credentials. Update backend/.env with your real PostgreSQL username and password.'
  );
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  },
});
