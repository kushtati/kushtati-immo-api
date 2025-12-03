const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Erreur get users:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Erreur get user:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
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
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = userResult.rows[0];
    const { name, phone, email, currentPassword, newPassword } = req.body;

    // Si changement d'email, vérifier qu'il n'existe pas déjà
    if (email && email !== user.email) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
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
    const result = await pool.query(
      `UPDATE users
       SET name = $1, phone = $2, email = $3, password = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, phone, role, created_at`,
      [
        name || user.name,
        phone !== undefined ? phone : user.phone,
        email || user.email,
        hashedPassword,
        userId
      ]
    );

    res.json({
      message: 'Profil mis à jour avec succès',
      user: result.rows[0]
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Vérifier que l'utilisateur supprime son propre compte
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    console.error('Erreur delete user:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

/**
 * @route   GET /api/users/owners/list
 * @desc    Obtenir tous les propriétaires
 * @access  Public
 */
router.get('/owners/list', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE role = $1 ORDER BY name',
      ['owner']
    );
    res.json({ owners: result.rows });
  } catch (err) {
    console.error('Erreur get owners:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/users/tenants/list
 * @desc    Obtenir tous les locataires
 * @access  Private (Owner only)
 */
router.get('/tenants/list', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Accès réservé aux propriétaires' });
    }

    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE role = $1 ORDER BY name',
      ['tenant']
    );
    res.json({ tenants: result.rows });
  } catch (err) {
    console.error('Erreur get tenants:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
