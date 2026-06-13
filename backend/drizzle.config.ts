import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const useSupabase = process.env.USE_SUPABASE === 'true';
const connectionString = useSupabase ? process.env.SUPABASE_DB : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(useSupabase ? 'SUPABASE_DB is not set' : 'DATABASE_URL is not set');
}

if (!useSupabase) {
  const databaseUrl = new URL(connectionString);

  if (databaseUrl.username === 'username' || databaseUrl.password === 'password') {
    throw new Error(
      'DATABASE_URL still contains placeholder credentials. Update backend/.env with your real PostgreSQL username and password.'
    );
  }
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  },
});
