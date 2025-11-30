const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!['owner', 'tenant'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier si l'email existe déjà
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (user) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer l'utilisateur
      db.run(
        'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, phone || null, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création du compte' });
          }

          // Générer le token JWT
          const token = jwt.sign(
            { id: this.lastID, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: {
              id: this.lastID,
              email,
              name,
              phone,
              role
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les infos de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', require('../middlewares/auth'), (req, res) => {
  db.get(
    'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    }
  );
});

module.exports = router;
