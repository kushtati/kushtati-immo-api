# 🔄 Migration SQLite → PostgreSQL

## Étapes de migration pour Kushtati Immo API

### 1️⃣ Installer PostgreSQL localement

**Option A - Installer PostgreSQL directement :**
```bash
# Téléchargez depuis : https://www.postgresql.org/download/windows/
# Ou utilisez Chocolatey :
choco install postgresql
```

**Option B - Utiliser Docker (recommandé pour dev) :**
```bash
docker run --name kushtati-postgres -e POSTGRES_PASSWORD=kushtati123 -e POSTGRES_DB=kushtati_immo -p 5432:5432 -d postgres:16
```

### 2️⃣ Modifier package.json

Remplacer `sqlite3` par `pg` :
```bash
cd "C:\Users\ib362\Documents\perso\kushtati-immo-api"
npm uninstall sqlite3
npm install pg dotenv
```

### 3️⃣ Créer la configuration PostgreSQL

**Fichier `.env` (local) :**
```env
# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:kushtati123@localhost:5432/kushtati_immo

# Ou pour Render (sera fourni automatiquement)
# DATABASE_URL=postgresql://user:password@host:5432/database

# Autres variables
NODE_ENV=development
JWT_SECRET=votre_secret_jwt_ici
PORT=5000
FRONTEND_URL=http://localhost:3001
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### 4️⃣ Créer le nouveau fichier de configuration database

**Fichier `src/config/database.js` (nouveau) :**
```javascript
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

module.exports = pool;
```

### 5️⃣ Créer le schéma PostgreSQL

**Fichier `src/scripts/schema.sql` (nouveau) :**
```sql
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('proprietaire', 'locataire', 'admin')) DEFAULT 'locataire',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des propriétés
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('Sale', 'Rent')) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  beds INTEGER DEFAULT 0,
  baths INTEGER DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('available', 'rented', 'sold')) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des contrats de location
CREATE TABLE IF NOT EXISTS leases (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(15, 2) NOT NULL,
  deposit DECIMAL(15, 2),
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'terminated')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  lease_id INTEGER REFERENCES leases(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
```

### 6️⃣ Script d'initialisation

**Fichier `src/scripts/init-db.js` (nouveau) :**
```javascript
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('📦 Initialisation de la base de données PostgreSQL...\n');
    
    // Lire le fichier SQL
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    
    // Exécuter le schéma
    await client.query(schemaSQL);
    
    console.log('✅ Schéma créé avec succès\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Base de données initialisée');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
```

### 7️⃣ Configurer PostgreSQL sur Render

1. **Dashboard Render** → Service backend **"kushtati-immo-api"**
2. Menu gauche → **"Environment"**
3. **Add PostgreSQL Database** :
   - Nom : `kushtati-postgres`
   - Render va créer automatiquement la base
   - Variable `DATABASE_URL` sera ajoutée automatiquement
4. **Redéployer** le service

### 8️⃣ Scripts npm à ajouter dans package.json

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "db:init": "node src/scripts/init-db.js",
  "db:seed": "node src/scripts/seed.js"
}
```

### 9️⃣ Commandes d'exécution

```bash
# Local
npm run db:init   # Créer les tables
npm run db:seed   # Insérer les données
npm run dev       # Démarrer le serveur

# Sur Render (après déploiement)
# Les tables seront créées automatiquement au premier démarrage
```

---

## ✅ Avantages de PostgreSQL vs SQLite

- ✅ Meilleur pour la production
- ✅ Connexions multiples simultanées
- ✅ Transactions ACID complètes
- ✅ Types de données avancés
- ✅ Meilleure performance pour gros volumes
- ✅ Backup et réplication natifs
- ✅ Gratuit sur Render (plan Free)

---

## 🚀 Prochaines étapes

Après cette migration, je devrai mettre à jour tous les fichiers qui utilisent la base de données :
- `src/routes/properties.js`
- `src/routes/auth.js`
- `src/routes/users.js`
- `src/scripts/seed.js`

**Voulez-vous que je procède avec la migration complète maintenant ?**
