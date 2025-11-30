const express = require('express');
const router = express.Router();
const db = require('../config/database');
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
router.get('/', (req, res) => {
  const { type, status, minPrice, maxPrice, location } = req.query;
  
  let query = `
    SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
    FROM properties p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (type) {
    query += ' AND p.type = ?';
    params.push(type);
  }

  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }

  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (location) {
    query += ' AND p.location LIKE ?';
    params.push(`%${location}%`);
  }

  query += ' ORDER BY p.created_at DESC';

  db.all(query, params, (err, properties) => {
    if (err) {
      console.error('Erreur get properties:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ properties });
  });
});

/**
 * @route   GET /api/properties/:id
 * @desc    Obtenir une propriété par ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  db.get(
    `SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
     FROM properties p
     LEFT JOIN users u ON p.owner_id = u.id
     WHERE p.id = ?`,
    [req.params.id],
    (err, property) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!property) {
        return res.status(404).json({ error: 'Propriété non trouvée' });
      }

      res.json({ property });
    }
  );
});

/**
 * @route   POST /api/properties
 * @desc    Créer une nouvelle propriété
 * @access  Private (Owner only)
 */
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    // Vérifier que l'utilisateur est un propriétaire
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Seuls les propriétaires peuvent ajouter des propriétés' });
    }

    const { title, description, location, price, type, beds, baths, sqft, status } = req.body;

    // Validation
    if (!title || !location || !price || !type) {
      return res.status(400).json({ error: 'Titre, localisation, prix et type sont requis' });
    }

    if (!['Sale', 'Rent'].includes(type)) {
      return res.status(400).json({ error: 'Type doit être "Sale" ou "Rent"' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
      `INSERT INTO properties 
       (owner_id, title, description, location, price, type, beds, baths, sqft, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description || null,
        location,
        parseFloat(price),
        type,
        beds ? parseInt(beds) : null,
        baths ? parseInt(baths) : null,
        sqft ? parseInt(sqft) : null,
        image_url,
        status || 'available'
      ],
      function(err) {
        if (err) {
          console.error('Erreur create property:', err);
          return res.status(500).json({ error: 'Erreur lors de la création de la propriété' });
        }

        // Récupérer la propriété créée
        db.get('SELECT * FROM properties WHERE id = ?', [this.lastID], (err, property) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
          }

          res.status(201).json({
            message: 'Propriété créée avec succès',
            property
          });
        });
      }
    );
  } catch (error) {
    console.error('Erreur create property:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   PUT /api/properties/:id
 * @desc    Mettre à jour une propriété
 * @access  Private (Owner only - own properties)
 */
router.put('/:id', auth, upload.single('image'), (req, res) => {
  try {
    const propertyId = req.params.id;

    // Vérifier que la propriété existe et appartient à l'utilisateur
    db.get('SELECT * FROM properties WHERE id = ?', [propertyId], (err, property) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!property) {
        return res.status(404).json({ error: 'Propriété non trouvée' });
      }

      if (property.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      const { title, description, location, price, type, beds, baths, sqft, status } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : property.image_url;

      db.run(
        `UPDATE properties 
         SET title = ?, description = ?, location = ?, price = ?, type = ?, 
             beds = ?, baths = ?, sqft = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          title || property.title,
          description !== undefined ? description : property.description,
          location || property.location,
          price ? parseFloat(price) : property.price,
          type || property.type,
          beds !== undefined ? (beds ? parseInt(beds) : null) : property.beds,
          baths !== undefined ? (baths ? parseInt(baths) : null) : property.baths,
          sqft !== undefined ? (sqft ? parseInt(sqft) : null) : property.sqft,
          image_url,
          status || property.status,
          propertyId
        ],
        function(err) {
          if (err) {
            console.error('Erreur update property:', err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
          }

          // Récupérer la propriété mise à jour
          db.get('SELECT * FROM properties WHERE id = ?', [propertyId], (err, updatedProperty) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur serveur' });
            }

            res.json({
              message: 'Propriété mise à jour avec succès',
              property: updatedProperty
            });
          });
        }
      );
    });
  } catch (error) {
    console.error('Erreur update property:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/properties/:id
 * @desc    Supprimer une propriété
 * @access  Private (Owner only - own properties)
 */
router.delete('/:id', auth, (req, res) => {
  const propertyId = req.params.id;

  // Vérifier que la propriété existe et appartient à l'utilisateur
  db.get('SELECT * FROM properties WHERE id = ?', [propertyId], (err, property) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!property) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    if (property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    db.run('DELETE FROM properties WHERE id = ?', [propertyId], function(err) {
      if (err) {
        console.error('Erreur delete property:', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      res.json({ message: 'Propriété supprimée avec succès' });
    });
  });
});

/**
 * @route   GET /api/properties/owner/:ownerId
 * @desc    Obtenir toutes les propriétés d'un propriétaire
 * @access  Public
 */
router.get('/owner/:ownerId', (req, res) => {
  db.all(
    'SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC',
    [req.params.ownerId],
    (err, properties) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.json({ properties });
    }
  );
});

module.exports = router;
