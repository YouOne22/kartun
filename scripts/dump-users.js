const pg = require('pg');
require('dotenv').config();
const c = process.env.DATABASE_URL;
const u = new URL(c);
const pool = new pg.Pool({ connectionString: c, password: decodeURIComponent(u.password) });

(async () => {
  try {
    const col = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='cash_transactions' AND column_name='sumber_kas'");
    console.log('sumber_kas:', col.rowCount ? col.rows[0] : 'NOT FOUND');

    const typeCheck = await pool.query("SELECT typname FROM pg_type WHERE typname='cash_source_enum'");
    if (typeCheck.rowCount) {
      const vals = await pool.query("SELECT enumlabel FROM pg_enum WHERE enumtypid=(SELECT oid FROM pg_type WHERE typname='cash_source_enum') ORDER BY enumsortorder");
      console.log('cash_source_enum:', vals.rows.map(r => r.enumlabel).join(','));
    } else {
      console.log('cash_source_enum: MISSING');
    }

    const tx = await pool.query("SELECT id, type, sumber_kas, amount, category FROM cash_transactions ORDER BY created_at DESC LIMIT 3");
    console.log('recent transactions:', tx.rows.length);
    tx.rows.forEach(r => console.log(' ', JSON.stringify(r)));

    const fin = await pool.query("SELECT sumber_kas, SUM(amount) FROM cash_transactions GROUP BY sumber_kas ORDER BY sumber_kas");
    console.log('aggregate by sumber_kas:', fin.rows);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();

