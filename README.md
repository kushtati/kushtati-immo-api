# Kushtati Immo - Backend API

API REST pour la plateforme immobilière Kushtati Immo (Guinée).

## 🚀 Technologies

- Node.js 20
- Express.js
- SQLite3
- JWT Authentication
- bcryptjs
- multer (upload fichiers)

## 📦 Installation

\\\ash
npm install
\\\

## 🔧 Configuration

Créer un fichier \.env\ :

\\\nv
PORT=5000
NODE_ENV=development
JWT_SECRET=votre_secret_jwt
DATABASE_PATH=./database/kushtati.db
FRONTEND_URL=http://localhost:3000
\\\

## 🗄️ Base de données

Initialiser la base de données avec les données de test :

\\\ash
node src/scripts/seed.js
\\\

## ▶️ Démarrage

\\\ash
npm start
\\\

API accessible sur : http://localhost:5000

## 📚 Endpoints

### Properties
- \GET /api/properties\ - Liste des propriétés
- \GET /api/properties/:id\ - Détails d'une propriété
- \POST /api/properties\ - Créer une propriété (auth)
- \PUT /api/properties/:id\ - Modifier une propriété (auth)
- \DELETE /api/properties/:id\ - Supprimer une propriété (auth)

### Authentication
- \POST /api/auth/register\ - Inscription
- \POST /api/auth/login\ - Connexion
- \GET /api/auth/me\ - Profil utilisateur (auth)

### Users
- \GET /api/users\ - Liste des utilisateurs (auth)
- \GET /api/users/:id\ - Détails utilisateur (auth)

### Contracts
- \GET /api/contracts\ - Liste des contrats (auth)
- \POST /api/contracts\ - Créer un contrat (auth)

### Payments
- \GET /api/payments\ - Liste des paiements (auth)
- \POST /api/payments\ - Enregistrer un paiement (auth)

## 🐳 Docker

\\\ash
docker build -t kushtati-backend .
docker run -p 5000:5000 kushtati-backend
\\\

## 🚀 Déploiement Railway

Voir le guide complet dans le repository frontend.

## 📄 Licence

Projet privé - Kushtati Immo © 2024
