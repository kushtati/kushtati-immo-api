const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Route pour corriger les URLs des images
router.get('/fix-images', async (req, res) => {
  try {
    console.log('🔧 Mise à jour des URLs des images...');
    
    // URLs complètes Unsplash pour les 18 propriétés
    const imageUrls = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260066-6bc35f0a1480?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop'
    ];
    
    // Récupérer toutes les propriétés
    const result = await pool.query('SELECT id FROM properties ORDER BY id');
    const properties = result.rows;
    
    console.log(`📊 ${properties.length} propriétés trouvées`);
    
    // Mettre à jour chaque propriété avec la bonne URL
    let updated = 0;
    for (let i = 0; i < properties.length && i < imageUrls.length; i++) {
      await pool.query(
        'UPDATE properties SET image_url = $1 WHERE id = $2',
        [imageUrls[i], properties[i].id]
      );
      console.log(`✅ Propriété ${properties[i].id} mise à jour`);
      updated++;
    }
    
    res.json({
      success: true,
      message: '✅ Images mises à jour avec succès',
      updated: updated,
      total: properties.length
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
