# Dockerfile pour le backend API Kushtati Immo
# Base image Node.js LTS
FROM node:20-alpine

# Métadonnées
LABEL maintainer="Kushtati Immo"
LABEL description="Backend API pour la plateforme immobilière Kushtati"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier tout le code source
COPY . .

# Créer le dossier pour la base de données
RUN mkdir -p database

# Créer le dossier pour les uploads
RUN mkdir -p uploads

# Exposer le port 5000
EXPOSE 5000

# Variable d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Initialiser la base de données au démarrage
RUN node src/scripts/seed.js

# Démarrer le serveur
CMD ["node", "src/server.js"]
