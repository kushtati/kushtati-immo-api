# Kushtati Immo API

API Backend pour la plateforme Kushtati Immo

## 🚀 Déploiement sur Render

### Méthode 1 : Blueprint (Recommandé)

1. Push le code sur GitHub
2. Sur Render : New → Blueprint
3. Connectez le repository
4. Render détectera automatiquement render.yaml
5. Ajoutez FRONTEND_URL dans les variables d'environnement
6. Deploy !

### Méthode 2 : Web Service

1. New → Web Service
2. Repository : kushtati-immo-api
3. Runtime : Node
4. Build Command : npm install
5. Start Command : npm start
6. Ajoutez un Disk :
   - Name : kushtati-data
   - Mount Path : /var/data
   - Size : 1 GB
7. Variables d'environnement :
   - NODE_ENV=production
   - JWT_SECRET=(généré automatiquement)
   - DATABASE_PATH=/var/data/kushtati.db
   - FRONTEND_URL=(URL de votre frontend)
   - MAX_FILE_SIZE=5242880
   - UPLOAD_DIR=/var/data/uploads

## 📡 API Endpoints

- GET /api/properties - Liste des propriétés
- POST /api/auth/login - Connexion
- POST /api/auth/register - Inscription
- GET /api/users/profile - Profil utilisateur
- POST /api/contracts - Créer contrat
- GET /api/payments - Historique paiements

## 🔐 Variables d'environnement

Voir .env.example pour la liste complète

## 💻 Installation locale

\\\ash
npm install
npm start
\\\

© 2025 Kushtati Immo API
