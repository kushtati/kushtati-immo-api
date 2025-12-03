const { pool, testConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Initialiser la base de données PostgreSQL
 * Crée toutes les tables et index nécessaires
 */
async function initDatabase() {
  console.log('\n📦 Initialisation de la base de données PostgreSQL...\n');

  try {
    // Test de connexion
    console.log('🔌 Test de connexion...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Impossible de se connecter à la base de données');
    }

    // Lire le fichier schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📄 Lecture du schéma SQL...');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Exécuter le schéma
    console.log('⚙️  Exécution du schéma...');
    await pool.query(schema);

    console.log('✅ Schéma créé avec succès\n');

    // Vérifier les tables créées
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Tables créées:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✅ Base de données PostgreSQL initialisée avec succès!\n');
    return true;

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Échec de l\'initialisation:', err.message);
      process.exit(1);
    });
}

module.exports = initDatabase;
