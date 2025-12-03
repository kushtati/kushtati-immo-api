const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middlewares/auth');

/**
 * @route   GET /api/payments
 * @desc    Obtenir tous les paiements (filtré selon le rôle)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'tenant') {
      // Les locataires ne voient que leurs propres paiements
      query = `
        SELECT p.*, c.property_id, c.monthly_rent,
               prop.title as property_title, prop.location as property_location,
               owner.name as owner_name
        FROM payments p
        LEFT JOIN contracts c ON p.contract_id = c.id
        LEFT JOIN properties prop ON c.property_id = prop.id
        LEFT JOIN users owner ON c.owner_id = owner.id
        WHERE p.tenant_id = $1
        ORDER BY p.payment_date DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'owner') {
      // Les propriétaires voient les paiements de leurs propriétés
      query = `
        SELECT p.*, c.property_id, c.monthly_rent,
               prop.title as property_title, prop.location as property_location,
               tenant.name as tenant_name, tenant.email as tenant_email
        FROM payments p
        LEFT JOIN contracts c ON p.contract_id = c.id
        LEFT JOIN properties prop ON c.property_id = prop.id
        LEFT JOIN users tenant ON p.tenant_id = tenant.id
        WHERE c.owner_id = $1
        ORDER BY p.payment_date DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ payments: result.rows });
  } catch (err) {
    console.error('Erreur get payments:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Obtenir un paiement par ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.property_id, c.monthly_rent,
              prop.title as property_title, prop.location as property_location,
              tenant.name as tenant_name, tenant.email as tenant_email,
              owner.name as owner_name, owner.email as owner_email
       FROM payments p
       LEFT JOIN contracts c ON p.contract_id = c.id
       LEFT JOIN properties prop ON c.property_id = prop.id
       LEFT JOIN users tenant ON p.tenant_id = tenant.id
       LEFT JOIN users owner ON c.owner_id = owner.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    const payment = result.rows[0];

    // Vérifier les permissions
    if (req.user.role === 'tenant' && payment.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    res.json({ payment });
  } catch (err) {
    console.error('Erreur get payment:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   GET /api/payments/contract/:contractId
 * @desc    Obtenir tous les paiements d'un contrat
 * @access  Private
 */
router.get('/contract/:contractId', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur a accès à ce contrat
    const contractResult = await pool.query(
      'SELECT * FROM contracts WHERE id = $1 AND (tenant_id = $2 OR owner_id = $3)',
      [req.params.contractId, req.user.id, req.user.id]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contrat non trouvé ou accès non autorisé' });
    }

    const paymentsResult = await pool.query(
      `SELECT p.*,
              tenant.name as tenant_name,
              owner.name as owner_name
       FROM payments p
       LEFT JOIN users tenant ON p.tenant_id = tenant.id
       LEFT JOIN contracts c ON p.contract_id = c.id
       LEFT JOIN users owner ON c.owner_id = owner.id
       WHERE p.contract_id = $1
       ORDER BY p.payment_date DESC`,
      [req.params.contractId]
    );

    res.json({ payments: paymentsResult.rows });
  } catch (err) {
    console.error('Erreur get contract payments:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/payments
 * @desc    Créer un nouveau paiement
 * @access  Private (Tenant or Owner)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { contract_id, amount, payment_date, payment_method, status, transaction_id, notes } = req.body;

    // Validation
    if (!contract_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Contrat, montant et méthode de paiement requis' });
    }

    const validMethods = ['Orange Money', 'MTN Money', 'Wave', 'Carte Bancaire', 'Cash', 'Virement'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    const validStatuses = ['Payé', 'En Attente', 'En Retard', 'Annulé'];
    const paymentStatus = status || 'En Attente';
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Vérifier que le contrat existe et que l'utilisateur y a accès
    const contractResult = await pool.query(
      'SELECT * FROM contracts WHERE id = $1',
      [contract_id]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    const contract = contractResult.rows[0];

    // Vérifier les permissions (tenant ou owner du contrat)
    if (contract.tenant_id !== req.user.id && contract.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const result = await pool.query(
      `INSERT INTO payments
       (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        contract_id,
        contract.tenant_id,
        parseFloat(amount),
        payment_date || new Date().toISOString().split('T')[0],
        payment_method,
        paymentStatus,
        transaction_id || null,
        notes || null
      ]
    );

    res.status(201).json({
      message: 'Paiement créé avec succès',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur create payment:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   PUT /api/payments/:id
 * @desc    Mettre à jour un paiement
 * @access  Private (Owner only)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Récupérer le paiement
    const paymentResult = await pool.query(
      `SELECT p.*, c.owner_id
       FROM payments p
       LEFT JOIN contracts c ON p.contract_id = c.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    const payment = paymentResult.rows[0];

    // Seul le propriétaire peut modifier le statut
    if (payment.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { status, transaction_id, notes } = req.body;

    const validStatuses = ['Payé', 'En Attente', 'En Retard', 'Annulé'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const result = await pool.query(
      `UPDATE payments
       SET status = $1, transaction_id = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        status || payment.status,
        transaction_id !== undefined ? transaction_id : payment.transaction_id,
        notes !== undefined ? notes : payment.notes,
        paymentId
      ]
    );

    res.json({
      message: 'Paiement mis à jour avec succès',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur update payment:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

/**
 * @route   DELETE /api/payments/:id
 * @desc    Supprimer un paiement
 * @access  Private (Owner only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Récupérer le paiement avec info du propriétaire
    const paymentResult = await pool.query(
      `SELECT p.*, c.owner_id
       FROM payments p
       LEFT JOIN contracts c ON p.contract_id = c.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    const payment = paymentResult.rows[0];

    // Seul le propriétaire peut supprimer
    if (payment.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await pool.query('DELETE FROM payments WHERE id = $1', [paymentId]);

    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (err) {
    console.error('Erreur delete payment:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
