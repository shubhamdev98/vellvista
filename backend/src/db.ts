import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      'DATABASE_URL still contains placeholder credentials. Update backend/.env with your real PostgreSQL username and password, for example: postgresql://postgres:<your-password>@localhost:5432/luxescents'
    );
  }
}

// Client for queries
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Client for migrations
export const migrationClient = postgres(connectionString, { prepare: false });
