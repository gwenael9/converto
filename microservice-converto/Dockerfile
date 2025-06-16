FROM node:20-alpine

# Installe LibreOffice
RUN apk add --no-cache libreoffice

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm i

# Copie du code source
COPY . .

# Commande de démarrage
CMD ["npm", "run", "start:dev"]