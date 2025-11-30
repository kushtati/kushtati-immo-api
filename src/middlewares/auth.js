const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans le header Authorization
 * Attache les données utilisateur à req.user
 */
module.exports = (req, res, next) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Le format attendu est "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacher les données utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Erreur auth middleware:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }

    res.status(500).json({ error: 'Erreur serveur' });
  }
};
