const rateLimit = require('express-rate-limit');

/**
 * Rate limiter pour les tentatives de connexion
 * Limite à 5 tentatives toutes les 15 minutes par IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 requêtes par fenêtre
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignorer les requêtes réussies
  skipSuccessfulRequests: true
});

/**
 * Rate limiter pour les inscriptions
 * Limite à 3 inscriptions par heure par IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: {
    error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter général pour l'API
 * Limite à 100 requêtes par 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Trop de requêtes. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter
};
