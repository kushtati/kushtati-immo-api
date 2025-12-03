const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

console.log('🌱 Début du seeding de la base de données PostgreSQL...\n');

const seed = async () => {
  const client = await pool.connect();
  
  try {
    // Commencer une transaction
    await client.query('BEGIN');

    // 1. Créer des utilisateurs
    console.log('👤 Création des utilisateurs...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Propriétaires
    const owner1Result = await client.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['mamadou@kushtati.com', hashedPassword, 'Mamadou Diallo', '+224 621 00 00 01', 'owner']
    );
    const owner1 = owner1Result.rows[0].id;

    const owner2Result = await client.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['fatoumata@kushtati.com', hashedPassword, 'Fatoumata Camara', '+224 621 00 00 02', 'owner']
    );
    const owner2 = owner2Result.rows[0].id;

    // Locataires
    const tenant1Result = await client.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['ibrahima@gmail.com', hashedPassword, 'Ibrahima Baldé', '+224 621 00 00 03', 'tenant']
    );
    const tenant1 = tenant1Result.rows[0].id;

    const tenant2Result = await client.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['aissatou@gmail.com', hashedPassword, 'Aissatou Sylla', '+224 621 00 00 04', 'tenant']
    );
    const tenant2 = tenant2Result.rows[0].id;

    const tenant3Result = await client.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['abdoul@gmail.com', hashedPassword, 'Abdoul Sow', '+224 621 00 00 05', 'tenant']
    );
    const tenant3 = tenant3Result.rows[0].id;

    console.log('✅ 5 utilisateurs créés (2 propriétaires, 3 locataires)\n');

    // 2. Créer des propriétés
    console.log('🏠 Création des propriétés...');

    const prop1Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner1,
        'Villa Moderne à Kaloum',
        'Superbe villa moderne avec vue panoramique sur la mer, 4 chambres spacieuses, salon double, cuisine équipée, jardin paysager.',
        'Kaloum, Conakry',
        15000000,
        'Sale',
        4,
        3,
        2500,
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
        'available'
      ]
    );
    const prop1 = prop1Result.rows[0].id;

    const prop2Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner1,
        'Appartement F3 Matam',
        'Bel appartement de 3 pièces au 2ème étage, bien aéré avec balcon. Parking disponible.',
        'Matam, Conakry',
        2500000,
        'Rent',
        3,
        2,
        1200,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'rented'
      ]
    );
    const prop2 = prop2Result.rows[0].id;

    const prop3Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner1,
        'Studio Meublé Taouyah',
        'Studio tout équipé avec cuisine américaine, climatisation, idéal pour célibataire ou couple.',
        'Taouyah, Conakry',
        1500000,
        'Rent',
        1,
        1,
        500,
        'https://images.unsplash.com/photo-1502672260066-6bc35f0a1934?w=800&h=600&fit=crop',
        'available'
      ]
    );
    const prop3 = prop3Result.rows[0].id;

    const prop4Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner2,
        'Duplex Ratoma',
        'Superbe duplex de 5 chambres avec terrasse, vue mer. Construction récente.',
        'Ratoma, Conakry',
        25000000,
        'Sale',
        5,
        4,
        3500,
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'available'
      ]
    );
    const prop4 = prop4Result.rows[0].id;

    const prop5Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner2,
        'Appartement F4 Dixinn',
        'Grand appartement familial de 4 chambres, salon spacieux, cuisine moderne.',
        'Dixinn, Conakry',
        3000000,
        'Rent',
        4,
        2,
        1800,
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'rented'
      ]
    );
    const prop5 = prop5Result.rows[0].id;

    const prop6Result = await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        owner2,
        'Chambre Meublée Kipé',
        'Chambre individuelle meublée dans villa partagée, salle de bain commune.',
        'Kipé, Conakry',
        800000,
        'Rent',
        1,
        1,
        250,
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop',
        'available'
      ]
    );
    const prop6 = prop6Result.rows[0].id;

    // Nouvelles propriétés (7-18)
    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Villa de Luxe Cameroun',
        'Villa haut standing avec piscine, 6 chambres, jardin tropical, sécurité 24h/24.',
        'Cameroun, Conakry',
        35000000,
        'Sale',
        6,
        5,
        4500,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Appartement F5 Kipé',
        'Spacieux appartement familial, 5 chambres, 3 salles de bain, grande terrasse.',
        'Kipé, Ratoma',
        4000000,
        'Rent',
        5,
        3,
        2200,
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Bureau Commercial Almamya',
        'Espace de bureau moderne, 4 pièces, parking, climatisation, internet haut débit.',
        'Almamya, Kaloum',
        5000000,
        'Rent',
        0,
        2,
        1500,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Maison Familiale Hamdallaye',
        'Belle maison de 4 chambres, jardin arboré, garage double, quartier calme.',
        'Hamdallaye, Ratoma',
        18000000,
        'Sale',
        4,
        3,
        2800,
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Studio Moderne Taouyah',
        'Studio neuf avec kitchenette équipée, salle de bain moderne, terrasse.',
        'Taouyah, Kaloum',
        1200000,
        'Rent',
        1,
        1,
        450,
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Appartement F2 Matoto',
        'Petit appartement de 2 pièces, idéal jeune couple, proche des commerces.',
        'Matoto, Conakry',
        1800000,
        'Rent',
        2,
        1,
        800,
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Villa avec Piscine Kipé',
        'Magnifique villa avec piscine, 5 chambres, jardin paysager, vue panoramique.',
        'Kipé, Ratoma',
        28000000,
        'Sale',
        5,
        4,
        3800,
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Immeuble Commercial Kaloum',
        'Immeuble de 3 étages, idéal bureaux ou commerce, parking, ascenseur.',
        'Centre-ville, Kaloum',
        75000000,
        'Sale',
        0,
        6,
        5000,
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Penthouse Corniche',
        'Penthouse luxueux avec vue mer 180°, 4 chambres, terrasse immense, finitions haut de gamme.',
        'Corniche Sud, Kaloum',
        45000000,
        'Sale',
        4,
        4,
        3200,
        'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Appartement F3 Standing Dixinn',
        'Appartement standing, 3 chambres climatisées, cuisine équipée, ascenseur, parking sécurisé.',
        'Dixinn Extension, Conakry',
        3500000,
        'Rent',
        3,
        2,
        1600,
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner1,
        'Villa Résidentielle Coleah',
        'Villa dans résidence sécurisée, 4 chambres, jardin privatif, proche écoles internationales.',
        'Coleah, Matam',
        22000000,
        'Sale',
        4,
        3,
        3000,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        'available'
      ]
    );

    await client.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        owner2,
        'Magasin Commercial Madina',
        'Local commercial bien situé, grande vitrine, stockage, idéal commerce de détail.',
        'Madina, Conakry',
        6000000,
        'Rent',
        0,
        1,
        800,
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        'available'
      ]
    );

    console.log('✅ 18 propriétés créées avec images Unsplash\n');

    // 3. Créer des contrats
    console.log('📄 Création des contrats...');

    const contract1Result = await client.query(
      `INSERT INTO contracts (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, deposit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        prop2,
        tenant1,
        owner1,
        '2024-01-01',
        '2025-12-31',
        2500000,
        5000000,
        'active'
      ]
    );
    const contract1 = contract1Result.rows[0].id;

    const contract2Result = await client.query(
      `INSERT INTO contracts (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, deposit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        prop5,
        tenant2,
        owner2,
        '2024-06-01',
        '2025-05-31',
        3000000,
        6000000,
        'active'
      ]
    );
    const contract2 = contract2Result.rows[0].id;

    console.log('✅ 2 contrats créés\n');

    // 4. Créer des paiements
    console.log('💰 Création des paiements...');

    await client.query(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        contract1,
        tenant1,
        2500000,
        '2024-01-05',
        'Orange Money',
        'Payé',
        'OM-2024-001-ABC123',
        'Paiement janvier 2024'
      ]
    );

    await client.query(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        contract1,
        tenant1,
        2500000,
        '2024-02-05',
        'Orange Money',
        'Payé',
        'OM-2024-002-DEF456',
        'Paiement février 2024'
      ]
    );

    await client.query(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        contract2,
        tenant2,
        3000000,
        '2024-06-05',
        'Wave',
        'Payé',
        'WAVE-2024-001-GHI789',
        'Paiement juin 2024'
      ]
    );

    await client.query(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        contract2,
        tenant2,
        3000000,
        '2024-12-05',
        'Wave',
        'En Attente',
        'WAVE-2024-002-JKL012'
      ]
    );

    console.log('✅ 4 paiements créés\n');

    // Commit de la transaction
    await client.query('COMMIT');

    console.log('✅ Seeding terminé avec succès!\n');
    console.log('📊 Résumé:');
    console.log('   - 5 utilisateurs (2 propriétaires, 3 locataires)');
    console.log('   - 18 propriétés avec images Unsplash');
    console.log('   - 2 contrats de location');
    console.log('   - 4 paiements\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seeding:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    client.release();
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding terminé');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Échec du seeding:', err.message);
      process.exit(1);
    });
}

module.exports = seed;
