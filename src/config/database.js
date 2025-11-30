const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const DB_PATH = path.join(__dirname, '../../database/kushtati.db');

// Connexion à la base de données
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
  }
});

// Création des tables
db.serialize(() => {
  // Table Users (Propriétaires et Locataires)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT CHECK(role IN ('owner', 'tenant')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table Properties (Propriétés)
  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT CHECK(type IN ('Sale', 'Rent')) NOT NULL,
      beds INTEGER NOT NULL,
      baths INTEGER NOT NULL,
      sqft INTEGER NOT NULL,
      image_url TEXT,
      status TEXT CHECK(status IN ('available', 'rented', 'sold')) DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table Contracts (Contrats de location)
  db.run(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      monthly_rent REAL NOT NULL,
      deposit REAL NOT NULL,
      status TEXT CHECK(status IN ('active', 'expired', 'terminated')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table Payments (Paiements)
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('Orange Money', 'MTN Money', 'Wave', 'Carte Bancaire', 'Cash', 'Virement')) NOT NULL,
      status TEXT CHECK(status IN ('Payé', 'En Attente', 'En Retard', 'Annulé')) DEFAULT 'En Attente',
      transaction_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tables créées avec succès');
});

module.exports = db;
