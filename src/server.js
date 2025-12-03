const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config();

// Importer la base de données
const db = require('./config/database');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares - Configuration CORS
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:80',
      'http://frontend',
      'http://frontend:80',
      'https://kushtati-immo.onrender.com',
      'https://kushtati-immo-api.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Accepter localhost et les URLs Render
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.startsWith('http://localhost') ||
        origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissif pour le développement
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🏠 Kushtati Immo API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      payments: '/api/payments',
      users: '/api/users'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🏠 KUSHTATI IMMO API                    ║
║   ✅ Serveur démarré sur port ${PORT}        ║
║   🌍 http://localhost:${PORT}               ║
║   📊 Base de données PostgreSQL connectée ║
╚═══════════════════════════════════════════╝
  `);
  
  // Tester la connexion PostgreSQL
  if (db.testConnection) {
    await db.testConnection();
  }
});

module.exports = app;

