const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Route pour initialiser la base de données (créer les tables)
router.get('/init', async (req, res) => {
  try {
    console.log('🔧 Initialisation de la base de données...');
    
    // Lire le fichier schema.sql
    const schemaPath = path.join(__dirname, '../scripts/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécuter le schéma
    await pool.query(schema);
    
    // Vérifier les tables créées
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    console.log('✅ Tables créées:', tables);
    
    res.json({
      success: true,
      message: '✅ Base de données initialisée avec succès',
      tables: tables
    });
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour peupler la base de données
router.get('/seed', async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Peuplement de la base de données...');
    
    await client.query('BEGIN');
    
    // 1. Créer les utilisateurs
    console.log('👤 Création des utilisateurs...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { email: 'mamadou.diallo@kushtati.com', name: 'Mamadou Diallo', role: 'owner' },
      { email: 'fatoumata.camara@kushtati.com', name: 'Fatoumata Camara', role: 'owner' },
      { email: 'ibrahim.barry@email.com', name: 'Ibrahim Barry', role: 'tenant' },
      { email: 'aissatou.toure@email.com', name: 'Aissatou Touré', role: 'tenant' },
      { email: 'mohamed.kone@email.com', name: 'Mohamed Koné', role: 'tenant' }
    ];
    
    const userIds = [];
    for (const user of users) {
      const result = await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, hashedPassword, user.name, user.role]
      );
      userIds.push(result.rows[0].id);
    }
    
    // 2. Créer les propriétés avec images Unsplash
    console.log('🏠 Création des propriétés...');
    const properties = [
      { title: 'Villa Moderne Kaloum', price: 250000, location: 'Kaloum, Conakry', type: 'villa', bedrooms: 4, bathrooms: 3, area: 250, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop' },
      { title: 'Appartement de Luxe Ratoma', price: 150000, location: 'Ratoma, Conakry', type: 'appartement', bedrooms: 3, bathrooms: 2, area: 120, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop' },
      { title: 'Studio Moderne Matam', price: 45000, location: 'Matam, Conakry', type: 'studio', bedrooms: 1, bathrooms: 1, area: 35, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop' },
      { title: 'Maison Familiale Matoto', price: 180000, location: 'Matoto, Conakry', type: 'maison', bedrooms: 5, bathrooms: 3, area: 200, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop' },
      { title: 'Duplex Standing Dixinn', price: 220000, location: 'Dixinn, Conakry', type: 'duplex', bedrooms: 4, bathrooms: 3, area: 180, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop' },
      { title: 'Appartement Vue Mer', price: 175000, location: 'Kaloum, Conakry', type: 'appartement', bedrooms: 3, bathrooms: 2, area: 130, image: 'https://images.unsplash.com/photo-1502672260066-6bc35f0a1480?w=800&h=600&fit=crop' },
      { title: 'Villa avec Piscine', price: 350000, location: 'Kipé, Conakry', type: 'villa', bedrooms: 5, bathrooms: 4, area: 300, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop' },
      { title: 'Studio Étudiant Hamdallaye', price: 35000, location: 'Hamdallaye, Ratoma', type: 'studio', bedrooms: 1, bathrooms: 1, area: 30, image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop' },
      { title: 'Penthouse Centre-Ville', price: 280000, location: 'Kaloum, Conakry', type: 'appartement', bedrooms: 4, bathrooms: 3, area: 200, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { title: 'Maison de Campagne Dubréka', price: 120000, location: 'Dubréka', type: 'maison', bedrooms: 4, bathrooms: 2, area: 180, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop' },
      { title: 'Appartement Neuf Cosa', price: 95000, location: 'Cosa, Ratoma', type: 'appartement', bedrooms: 2, bathrooms: 1, area: 75, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' },
      { title: 'Villa Sécurisée Landréah', price: 200000, location: 'Landréah, Matam', type: 'villa', bedrooms: 4, bathrooms: 3, area: 220, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop' },
      { title: 'Loft Industriel Taouyah', price: 85000, location: 'Taouyah, Ratoma', type: 'studio', bedrooms: 1, bathrooms: 1, area: 50, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop' },
      { title: 'Résidence de Standing', price: 320000, location: 'Kipé, Dixinn', type: 'villa', bedrooms: 6, bathrooms: 4, area: 350, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop' },
      { title: 'Appartement Familial', price: 140000, location: 'Bambeto, Ratoma', type: 'appartement', bedrooms: 3, bathrooms: 2, area: 110, image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop' },
      { title: 'Maison Traditionnelle', price: 90000, location: 'Sonfonia, Matoto', type: 'maison', bedrooms: 3, bathrooms: 2, area: 150, image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop' },
      { title: 'Studio Premium Matam', price: 55000, location: 'Matam, Conakry', type: 'studio', bedrooms: 1, bathrooms: 1, area: 40, image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop' },
      { title: 'Villa Contemporaine', price: 290000, location: 'Coronthie, Matam', type: 'villa', bedrooms: 5, bathrooms: 3, area: 280, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop' }
    ];
    
    const propertyIds = [];
    for (const prop of properties) {
      const ownerId = prop.price > 200000 ? userIds[1] : userIds[0];
      const result = await client.query(
        `INSERT INTO properties (
          title, description, price, location, property_type, 
          bedrooms, bathrooms, area, image_url, owner_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id`,
        [
          prop.title,
          `Belle ${prop.type} située à ${prop.location}. Idéale pour famille ou investissement.`,
          prop.price,
          prop.location,
          prop.type,
          prop.bedrooms,
          prop.bathrooms,
          prop.area,
          prop.image,
          ownerId,
          'available'
        ]
      );
      propertyIds.push(result.rows[0].id);
    }
    
    // 3. Créer quelques contrats
    console.log('📄 Création des contrats...');
    await client.query(
      `INSERT INTO contracts (property_id, tenant_id, start_date, end_date, monthly_rent, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [propertyIds[0], userIds[2], '2024-01-01', '2024-12-31', 2500, 'active']
    );
    
    await client.query(
      `INSERT INTO contracts (property_id, tenant_id, start_date, end_date, monthly_rent, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [propertyIds[1], userIds[3], '2024-02-01', '2025-01-31', 1800, 'active']
    );
    
    // 4. Créer quelques paiements
    console.log('💰 Création des paiements...');
    const contractsResult = await client.query('SELECT id FROM contracts LIMIT 2');
    const contractIds = contractsResult.rows.map(r => r.id);
    
    if (contractIds.length >= 2) {
      await client.query(
        `INSERT INTO payments (contract_id, amount, payment_date, payment_method, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [contractIds[0], 2500, '2024-01-05', 'bank_transfer', 'completed']
      );
      
      await client.query(
        `INSERT INTO payments (contract_id, amount, payment_date, payment_method, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [contractIds[0], 2500, '2024-02-05', 'bank_transfer', 'completed']
      );
      
      await client.query(
        `INSERT INTO payments (contract_id, amount, payment_date, payment_method, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [contractIds[1], 1800, '2024-02-05', 'mobile_money', 'completed']
      );
      
      await client.query(
        `INSERT INTO payments (contract_id, amount, payment_date, payment_method, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [contractIds[1], 1800, '2024-03-05', 'mobile_money', 'pending']
      );
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Base de données peuplée avec succès!');
    
    res.json({
      success: true,
      message: '✅ Base de données peuplée avec succès',
      data: {
        users: users.length,
        properties: properties.length,
        contracts: 2,
        payments: 4
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur seed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
