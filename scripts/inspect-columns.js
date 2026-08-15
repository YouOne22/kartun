const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const dbUrl = new URL(connectionString);
const password = decodeURIComponent(dbUrl.password);
const pool = new pg.Pool({ connectionString, password });

async function main() {
  try {
    const typeCheck = await pool.query("SELECT typname FROM pg_type WHERE typname = 'cash_source_enum'");
    console.log('cash_source_enum exists:', typeCheck.rowCount > 0);
    if (typeCheck.rowCount === 0) {
      console.log('Creating cash_source_enum...');
      await pool.query("CREATE TYPE cash_source_enum AS ENUM ('INDUK', 'JIMPITAN')");
    }

    const colCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='cash_transactions' AND column_name='sumber_kas'");
    console.log('sumber_kas column exists:', colCheck.rowCount > 0);
    if (colCheck.rowCount === 0) {
      console.log('Adding sumber_kas column to cash_transactions...');
      await pool.query("ALTER TABLE cash_transactions ADD COLUMN sumber_kas cash_source_enum NOT NULL DEFAULT 'INDUK'");
      console.log('Column added successfully.');
    }
  } catch (e) {
    console.error('Migration fix error:', e);
  } finally {
    await pool.end();
  }
}

main();

