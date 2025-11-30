const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middlewares/auth');

/**
 * @route   GET /api/payments
 * @desc    Obtenir tous les paiements (filtré selon le rôle)
 * @access  Private
 */
router.get('/', auth, (req, res) => {
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
      WHERE p.tenant_id = ?
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
      WHERE c.owner_id = ?
      ORDER BY p.payment_date DESC
    `;
    params = [req.user.id];
  }

  db.all(query, params, (err, payments) => {
    if (err) {
      console.error('Erreur get payments:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ payments });
  });
});

/**
 * @route   GET /api/payments/:id
 * @desc    Obtenir un paiement par ID
 * @access  Private
 */
router.get('/:id', auth, (req, res) => {
  db.get(
    `SELECT p.*, c.property_id, c.monthly_rent,
            prop.title as property_title, prop.location as property_location,
            tenant.name as tenant_name, tenant.email as tenant_email,
            owner.name as owner_name, owner.email as owner_email
     FROM payments p
     LEFT JOIN contracts c ON p.contract_id = c.id
     LEFT JOIN properties prop ON c.property_id = prop.id
     LEFT JOIN users tenant ON p.tenant_id = tenant.id
     LEFT JOIN users owner ON c.owner_id = owner.id
     WHERE p.id = ?`,
    [req.params.id],
    (err, payment) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!payment) {
        return res.status(404).json({ error: 'Paiement non trouvé' });
      }

      // Vérifier les permissions
      if (req.user.role === 'tenant' && payment.tenant_id !== req.user.id) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      res.json({ payment });
    }
  );
});

/**
 * @route   GET /api/payments/contract/:contractId
 * @desc    Obtenir tous les paiements d'un contrat
 * @access  Private
 */
router.get('/contract/:contractId', auth, (req, res) => {
  // Vérifier que l'utilisateur a accès à ce contrat
  db.get(
    'SELECT * FROM contracts WHERE id = ? AND (tenant_id = ? OR owner_id = ?)',
    [req.params.contractId, req.user.id, req.user.id],
    (err, contract) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!contract) {
        return res.status(404).json({ error: 'Contrat non trouvé ou accès non autorisé' });
      }

      db.all(
        `SELECT p.*, 
                tenant.name as tenant_name,
                owner.name as owner_name
         FROM payments p
         LEFT JOIN users tenant ON p.tenant_id = tenant.id
         LEFT JOIN contracts c ON p.contract_id = c.id
         LEFT JOIN users owner ON c.owner_id = owner.id
         WHERE p.contract_id = ?
         ORDER BY p.payment_date DESC`,
        [req.params.contractId],
        (err, payments) => {
          if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
          }

          res.json({ payments });
        }
      );
    }
  );
});

/**
 * @route   POST /api/payments
 * @desc    Créer un nouveau paiement
 * @access  Private (Tenant or Owner)
 */
router.post('/', auth, (req, res) => {
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
    db.get(
      'SELECT * FROM contracts WHERE id = ?',
      [contract_id],
      (err, contract) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!contract) {
          return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        // Vérifier les permissions (tenant ou owner du contrat)
        if (contract.tenant_id !== req.user.id && contract.owner_id !== req.user.id) {
          return res.status(403).json({ error: 'Non autorisé' });
        }

        db.run(
          `INSERT INTO payments 
           (contract_id, tenant_id, amount, payment_date, payment_method, status, transaction_id, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            contract_id,
            contract.tenant_id,
            parseFloat(amount),
            payment_date || new Date().toISOString().split('T')[0],
            payment_method,
            paymentStatus,
            transaction_id || null,
            notes || null
          ],
          function(err) {
            if (err) {
              console.error('Erreur create payment:', err);
              return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
            }

            // Récupérer le paiement créé
            db.get('SELECT * FROM payments WHERE id = ?', [this.lastID], (err, payment) => {
              if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
              }

              res.status(201).json({
                message: 'Paiement créé avec succès',
                payment
              });
            });
          }
        );
      }
    );
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
router.put('/:id', auth, (req, res) => {
  try {
    const paymentId = req.params.id;

    // Récupérer le paiement
    db.get(
      `SELECT p.*, c.owner_id
       FROM payments p
       LEFT JOIN contracts c ON p.contract_id = c.id
       WHERE p.id = ?`,
      [paymentId],
      (err, payment) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!payment) {
          return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        // Seul le propriétaire peut modifier le statut
        if (payment.owner_id !== req.user.id) {
          return res.status(403).json({ error: 'Non autorisé' });
        }

        const { status, transaction_id, notes } = req.body;

        const validStatuses = ['Payé', 'En Attente', 'En Retard', 'Annulé'];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Statut invalide' });
        }

        db.run(
          `UPDATE payments 
           SET status = ?, transaction_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            status || payment.status,
            transaction_id !== undefined ? transaction_id : payment.transaction_id,
            notes !== undefined ? notes : payment.notes,
            paymentId
          ],
          function(err) {
            if (err) {
              console.error('Erreur update payment:', err);
              return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
            }

            // Récupérer le paiement mis à jour
            db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, updatedPayment) => {
              if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
              }

              res.json({
                message: 'Paiement mis à jour avec succès',
                payment: updatedPayment
              });
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erreur update payment:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route   DELETE /api/payments/:id
 * @desc    Supprimer un paiement
 * @access  Private (Owner only)
 */
router.delete('/:id', auth, (req, res) => {
  const paymentId = req.params.id;

  // Récupérer le paiement avec info du propriétaire
  db.get(
    `SELECT p.*, c.owner_id
     FROM payments p
     LEFT JOIN contracts c ON p.contract_id = c.id
     WHERE p.id = ?`,
    [paymentId],
    (err, payment) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!payment) {
        return res.status(404).json({ error: 'Paiement non trouvé' });
      }

      // Seul le propriétaire peut supprimer
      if (payment.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      db.run('DELETE FROM payments WHERE id = ?', [paymentId], function(err) {
        if (err) {
          console.error('Erreur delete payment:', err);
          return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }

        res.json({ message: 'Paiement supprimé avec succès' });
      });
    }
  );
});

module.exports = router;
