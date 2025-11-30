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
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Villa Moderne à Kaloum',
        'Magnifique villa de 4 chambres avec jardin, située dans un quartier calme de Kaloum. Proche de tous les services.',
        'Kaloum, Conakry',
        15000000,
        'Sale',
        4,
        3,
        2500,
        'available'
      ]
    );

    const prop2 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'rented'
      ]
    );

    const prop3 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner1,
        'Studio Meublé Taouyah',
        'Studio moderne entièrement meublé et équipé, idéal pour jeune professionnel.',
        'Taouyah, Conakry',
        1500000,
        'Rent',
        1,
        1,
        450,
        'available'
      ]
    );

    const prop4 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'available'
      ]
    );

    const prop5 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'rented'
      ]
    );

    const prop6 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'available'
      ]
    );

    const prop7 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'available'
      ]
    );

    const prop8 = await runQuery(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        'available'
      ]
    );

    console.log('✅ 8 propriétés créées\n');

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
