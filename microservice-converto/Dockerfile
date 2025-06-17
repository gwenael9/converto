FROM node:20-alpine

# Installation des dépendances nécessaires à LibreOffice
RUN apk add --no-cache \
    libreoffice \
    openjdk17 \
    fontconfig \
    ttf-dejavu \
    ttf-liberation \
    bash \
    curl

# Dossier de travail
WORKDIR /app

# Copie et installation des dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Commande de lancement du microservice
CMD ["npm", "run", "start:dev"]
