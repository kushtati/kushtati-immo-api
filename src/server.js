const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');

// Charger les variables d'environnement
dotenv.config();

// Importer la base de données
const db = require('./config/database');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Sécurité: Helmet pour headers HTTP sécurisés
app.use(helmet());

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.railway.app') ||
      origin.endsWith('.up.railway.app') ||
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production') {
      callback(new Error('Not allowed by CORS'));
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting global pour toutes les routes API
app.use('/api/', apiLimiter);

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));

// Health check pour Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Kushtati Immo API',
    version: '2.0.0',
    status: 'running',
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  // Log détaillé avec stack trace complète
  console.error('❌ Erreur globale:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
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

