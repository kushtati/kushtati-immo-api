const { Pool } = require('pg');
require('dotenv').config();

const IS_DEV = process.env.NODE_ENV === 'development';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: IS_DEV ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  if (IS_DEV) console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL inattendue:', err.message);
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connecté:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion PostgreSQL:', error.message);
    return false;
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    if (IS_DEV) {
      console.log('Query:', { duration: Date.now() - start, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Erreur requete:', { message: error.message });
    throw error;
  }
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction annulee:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, transaction, testConnection };
