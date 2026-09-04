import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'path';
import * as schema from './schema';

config({ path: path.resolve(__dirname, '../.env') });

const useSupabase = process.env.USE_SUPABASE === 'true';
const connectionString = useSupabase ? process.env.SUPABASE_DB : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(useSupabase ? 'SUPABASE_DB is not set' : 'DATABASE_URL is not set');
}

if (!useSupabase) {
  const databaseUrl = new URL(connectionString);
  const [databaseUser, databasePassword] = databaseUrl.username
    ? [databaseUrl.username, databaseUrl.password]
    : ['', ''];

  if (databaseUser === 'username' || databasePassword === 'password') {
    throw new Error(
      'DATABASE_URL still contains placeholder credentials. Update backend/.env with your real PostgreSQL username and password, for example: postgresql://postgres:<your-password>@localhost:5432/vellvista'
    );
  }
}

// Global connection singleton to prevent connection leaks during hot reloading or multiple module imports
const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.postgresClient ||
  postgres(connectionString, {
    prepare: false,
    max: 3,
    idle_timeout: 3,
    connect_timeout: 10,
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });

// Lightweight migration client reusing global pool connection
export const migrationClient = client;
