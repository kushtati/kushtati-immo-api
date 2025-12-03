-- =============================================
-- Kushtati Immo - Schéma PostgreSQL
-- =============================================

-- Table des utilisateurs (Propriétaires et Locataires)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK(role IN ('owner', 'tenant', 'admin')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des propriétés
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) CHECK(type IN ('Sale', 'Rent')) NOT NULL,
  beds INTEGER NOT NULL DEFAULT 0,
  baths INTEGER NOT NULL DEFAULT 0,
  sqft INTEGER NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  status VARCHAR(20) CHECK(status IN ('available', 'rented', 'sold')) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des contrats de location
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(15, 2) NOT NULL,
  deposit DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) CHECK(status IN ('active', 'expired', 'terminated')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) CHECK(payment_method IN ('Orange Money', 'MTN Money', 'Wave', 'Carte Bancaire', 'Cash', 'Virement')) NOT NULL,
  status VARCHAR(20) CHECK(status IN ('Payé', 'En Attente', 'En Retard', 'Annulé')) DEFAULT 'En Attente',
  transaction_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_contracts_property ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
