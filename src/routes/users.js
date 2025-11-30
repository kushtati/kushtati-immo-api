const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs
 * @access  Private
 */
router.get('/', auth, (req, res) => {
  db.all(
    'SELECT id, email, name, phone, role, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        console.error('Erreur get users:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.json({ users });
    }
  );
});

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Private
 */
router.get('/:id', auth, (req, res) => {
  db.get(
    'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
    [req.params.id],
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

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (Own profile only)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Vérifier que l'utilisateur modifie son propre profil
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Récupérer l'utilisateur actuel
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const { name, phone, email, currentPassword, newPassword } = req.body;

      // Si changement d'email, vérifier qu'il n'existe pas déjà
      if (email && email !== user.email) {
        const existingUser = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
      }

      let hashedPassword = user.password;

      // Si changement de mot de passe
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Mot de passe actuel requis' });
        }

        // Vérifier le mot de passe actuel
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Hasher le nouveau mot de passe
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // Mettre à jour l'utilisateur
      db.run(
        `UPDATE users 
         SET name = ?, phone = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          name || user.name,
          phone !== undefined ? phone : user.phone,
          email || user.email,
          hashedPassword,
          userId
        ],
        function(err) {
          if (err) {
            console.error('Erreur update user:', err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
          }

          // Récupérer l'utilisateur mis à jour
          db.get(
            'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
            [userId],
            (err, updatedUser) => {
              if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
              }

              res.json({
                message: 'Profil mis à jour avec succès',
                user: updatedUser
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Erreur update user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (Own profile only)
 */
router.delete('/:id', auth, (req, res) => {
  const userId = parseInt(req.params.id);

  // Vérifier que l'utilisateur supprime son propre compte
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Erreur delete user:', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      res.json({ message: 'Compte supprimé avec succès' });
    });
  });
});

/**
 * @route   GET /api/users/owners/list
 * @desc    Obtenir tous les propriétaires
 * @access  Public
 */
router.get('/owners/list', (req, res) => {
  db.all(
    'SELECT id, name, email, phone, created_at FROM users WHERE role = ? ORDER BY name',
    ['owner'],
    (err, owners) => {
      if (err) {
        console.error('Erreur get owners:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.json({ owners });
    }
  );
});

/**
 * @route   GET /api/users/tenants/list
 * @desc    Obtenir tous les locataires
 * @access  Private (Owner only)
 */
router.get('/tenants/list', auth, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Accès réservé aux propriétaires' });
  }

  db.all(
    'SELECT id, name, email, phone, created_at FROM users WHERE role = ? ORDER BY name',
    ['tenant'],
    (err, tenants) => {
      if (err) {
        console.error('Erreur get tenants:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.json({ tenants });
    }
  );
});

module.exports = router;
