const db = require('../config/database');
const bcrypt = require('bcryptjs');

console.log('🌱 Début du seeding de la base de données...\n');

// Fonction pour exécuter des requêtes SQL de manière asynchrone
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const seed = async () => {
  try {
    // 1. Créer des utilisateurs
    console.log('👤 Création des utilisateurs...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Propriétaires
    const owner1 = await runQuery(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['mamadou@kushtati.com', hashedPassword, 'Mamadou Diallo', '+224 621 00 00 01', 'owner']
    );

    const owner2 = await runQuery(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['fatoumata@kushtati.com', hashedPassword, 'Fatoumata Camara', '+224 621 00 00 02', 'owner']
    );

    // Locataires
    const tenant1 = await runQuery(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['ibrahima@gmail.com', hashedPassword, 'Ibrahima Baldé', '+224 621 00 00 03', 'tenant']
    );

    const tenant2 = await runQuery(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['aissatou@gmail.com', hashedPassword, 'Aissatou Sylla', '+224 621 00 00 04', 'tenant']
    );

    const tenant3 = await runQuery(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['abdoul@gmail.com', hashedPassword, 'Abdoul Sow', '+224 621 00 00 05', 'tenant']
    );

    console.log('✅ 5 utilisateurs créés (2 propriétaires, 3 locataires)\n');

    // 2. Créer des propriétés
    console.log('🏠 Création des propriétés...');

    const prop1 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const prop2 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const prop3 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const prop4 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const prop5 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const prop6 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Maison de Campagne Kindia',
        'Belle maison à Kindia avec grand terrain, parfaite pour retraite au calme.',
        'Kindia',
        8000000,
        'Sale',
        3,
        2,
        2000,
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop7 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Local Commercial Madina',
        'Espace commercial de 100m² idéal pour boutique, bien situé sur axe passant.',
        'Madina, Conakry',
        2000000,
        'Rent',
        0,
        1,
        1000,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop8 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Villa de Luxe Kipé',
        'Villa haut standing avec piscine, jardin paysager, sécurité 24h/24.',
        'Kipé, Conakry',
        45000000,
        'Sale',
        6,
        5,
        5000,
        'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop9 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Appartement Standing Almamya',
        'Appartement haut standing 3 chambres avec vue panoramique sur Conakry.',
        'Almamya, Conakry',
        3500000,
        'Rent',
        3,
        2,
        1500,
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop10 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Bureau Moderne Centre-Ville',
        'Espace de bureaux moderne de 200m², climatisé, avec parking sécurisé.',
        'Centre-Ville, Conakry',
        4000000,
        'Rent',
        0,
        2,
        2000,
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop11 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Villa Familiale Lambanyi',
        'Grande villa familiale 5 chambres avec jardin arboré et garage 2 voitures.',
        'Lambanyi, Conakry',
        18000000,
        'Sale',
        5,
        3,
        3000,
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop12 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Studio Équipé Hamdallaye',
        'Studio tout équipé avec cuisine américaine, idéal étudiant ou célibataire.',
        'Hamdallaye, Conakry',
        1200000,
        'Rent',
        1,
        1,
        400,
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop13 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Immeuble de Rapport Koloma',
        'Immeuble R+2 avec 6 appartements F3, entièrement loués, excellent rendement.',
        'Koloma, Conakry',
        120000000,
        'Sale',
        18,
        12,
        15000,
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop14 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Appartement F2 Bambeto',
        'Bel appartement 2 pièces lumineux, proche écoles et commerces.',
        'Bambeto, Conakry',
        2000000,
        'Rent',
        2,
        1,
        800,
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
        'rented'
      ]
    );

    const prop15 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Résidence Sécurisée Coléah',
        'Villa dans résidence fermée avec gardiennage, piscine commune, 4 chambres.',
        'Coléah, Conakry',
        22000000,
        'Sale',
        4,
        3,
        2800,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop16 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Terrain Constructible Kobaya',
        'Terrain viabilisé de 1000m² avec titre foncier, idéal construction villa.',
        'Kobaya, Conakry',
        35000000,
        'Sale',
        0,
        0,
        10000,
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop17 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Penthouse Tombo',
        'Penthouse luxueux dernier étage, terrasse 360°, vue mer exceptionnelle.',
        'Tombo, Conakry',
        55000000,
        'Sale',
        4,
        4,
        4000,
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
        'available'
      ]
    );

    const prop18 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner2,
        'Maison Traditionnelle Labé',
        'Belle maison traditionnelle rénovée au cœur de Labé, charme authentique.',
        'Labé',
        6000000,
        'Sale',
        4,
        2,
        1800,
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'available'
      ]
    );

    console.log('✅ 18 propriétés créées\n');

    // 3. Créer des contrats
    console.log('📋 Création des contrats...');

    const contract1 = await runQuery(
      `INSERT INTO contracts (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, deposit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prop2, tenant1, owner1, '2024-01-01', '2025-12-31', 2500000, 5000000, 'active']
    );

    const contract2 = await runQuery(
      `INSERT INTO contracts (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, deposit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prop5, tenant2, owner2, '2024-03-01', '2025-02-28', 3000000, 6000000, 'active']
    );

    const contract3 = await runQuery(
      `INSERT INTO contracts (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, deposit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prop3, tenant3, owner1, '2023-06-01', '2024-05-31', 1500000, 3000000, 'expired']
    );

    console.log('✅ 3 contrats créés\n');

    // 4. Créer des paiements
    console.log('💰 Création des paiements...');

    // Paiements pour contract1 (tenant1 - prop2)
    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract1, tenant1, 2500000, '2024-01-05', 'Orange Money', 'Payé', 'OM20240105001']
    );

    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract1, tenant1, 2500000, '2024-02-05', 'Orange Money', 'Payé', 'OM20240205001']
    );

    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract1, tenant1, 2500000, '2024-03-05', 'Wave', 'Payé', 'WV20240305001']
    );

    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [contract1, tenant1, 2500000, '2024-04-05', 'Orange Money', 'En Attente']
    );

    // Paiements pour contract2 (tenant2 - prop5)
    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract2, tenant2, 3000000, '2024-03-01', 'MTN Money', 'Payé', 'MTN20240301001']
    );

    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [contract2, tenant2, 3000000, '2024-04-01', 'MTN Money', 'En Retard']
    );

    // Paiements pour contract3 (tenant3 - prop3) - contrat expiré
    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract3, tenant3, 1500000, '2023-06-05', 'Cash', 'Payé', 'CASH20230605001']
    );

    await runQuery(
      `INSERT INTO payments (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contract3, tenant3, 1500000, '2023-07-05', 'Cash', 'Payé', 'CASH20230705001']
    );

    console.log('✅ 8 paiements créés\n');

    console.log('🎉 Seeding terminé avec succès!\n');
    console.log('📊 Résumé:');
    console.log('   - 5 utilisateurs (2 propriétaires, 3 locataires)');
    console.log('   - 8 propriétés');
    console.log('   - 3 contrats');
    console.log('   - 8 paiements');
    console.log('\n🔑 Vous pouvez vous connecter avec:');
    console.log('   Email: mamadou@kushtati.com');
    console.log('   Email: fatoumata@kushtati.com');
    console.log('   Email: ibrahima@gmail.com');
    console.log('   Mot de passe: password123');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    db.close();
    process.exit(1);
  }
};

// Exécuter le seeding
seed();
