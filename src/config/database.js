const { Pool } = require('pg');
require('dotenv').config();

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL requis en production (Render)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Configuration du pool
  max: 20, // Maximum de connexions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Événements de connexion
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL inattendue:', err);
  process.exit(-1);
});

// Fonction pour tester la connexion
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Test de connexion PostgreSQL réussi:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erreur de test de connexion:', error.message);
    return false;
  }
}

// Helper pour les requêtes avec gestion d'erreur
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query exécutée:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erreur de requête:', error.message);
    throw error;
  }
}

// Helper pour les transactions
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
