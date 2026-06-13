import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const useSupabase = process.env.USE_SUPABASE === 'true';
const connectionString = useSupabase ? process.env.SUPABASE_DB : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(useSupabase ? 'SUPABASE_DB is not set' : 'DATABASE_URL is not set');
}

async function main() {
  console.log('Connecting to database...');
  const sql = postgres(connectionString!, { max: 1 });
  
  try {
    console.log('Dropping schema public...');
    await sql`DROP SCHEMA public CASCADE;`;
    
    console.log('Creating schema public...');
    await sql`CREATE SCHEMA public;`;
    
    console.log('Granting permissions...');
    await sql`GRANT ALL ON SCHEMA public TO public;`;
    
    console.log('Database successfully reset!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
