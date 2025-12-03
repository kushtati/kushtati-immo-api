const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * @route   GET /api/properties
 * @desc    Obtenir toutes les propriétés
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, location } = req.query;
    
    let query = `
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM properties p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND p.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (location) {
      query += ` AND p.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ properties: result.rows });
  } catch (err) {
    console.error('Erreur get properties:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Obtenir une propriété par ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    res.json({ property: result.rows[0] });
  } catch (err) {
    console.error('Erreur get property:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/properties
 * @desc    Créer une nouvelle propriété
 * @access  Private (Propriétaires uniquement)
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un propriétaire
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les propriétaires peuvent ajouter des propriétés.' });
    }

    const { title, description, location, price, type, beds, baths, sqft, status } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO properties (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user.userId, title, description, location, price, type, beds || 0, baths || 0, sqft || 0, image_url, status || 'available']
    );

    res.status(201).json({
      message: 'Propriété créée avec succès',
      property: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur create property:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   PUT /api/properties/:id
 * @desc    Mettre à jour une propriété
 * @access  Private (Propriétaire de la propriété uniquement)
 */
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    // Vérifier que la propriété existe et appartient à l'utilisateur
    const checkResult = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    const property = checkResult.rows[0];

    if (property.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { title, description, location, price, type, beds, baths, sqft, status } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : property.image_url;

    const result = await pool.query(
      `UPDATE properties 
       SET title = $1, description = $2, location = $3, price = $4, type = $5, 
           beds = $6, baths = $7, sqft = $8, image_url = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [title, description, location, price, type, beds, baths, sqft, image_url, status, req.params.id]
    );

    res.json({
      message: 'Propriété mise à jour avec succès',
      property: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur update property:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/properties/:id
 * @desc    Supprimer une propriété
 * @access  Private (Propriétaire de la propriété uniquement)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Vérifier que la propriété existe et appartient à l'utilisateur
    const checkResult = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    const property = checkResult.rows[0];

    if (property.owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await pool.query('DELETE FROM properties WHERE id = $1', [req.params.id]);

    res.json({ message: 'Propriété supprimée avec succès' });
  } catch (err) {
    console.error('Erreur delete property:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/properties/owner/:ownerId
 * @desc    Obtenir toutes les propriétés d'un propriétaire
 * @access  Private
 */
router.get('/owner/:ownerId', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur demande ses propres propriétés
    if (req.user.userId !== parseInt(req.params.ownerId)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const result = await pool.query(
      `SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.owner_id = $1
       ORDER BY p.created_at DESC`,
      [req.params.ownerId]
    );

    res.json({ properties: result.rows });
  } catch (err) {
    console.error('Erreur get owner properties:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
