FROM node:20-alpine

WORKDIR /app

# Copie le code source
COPY ./api/src ./src
COPY ./api/test ./test
COPY ./api/package*.json ./
COPY ./api/tsconfig.json ./
COPY .env.test ./

# Installation des dépendances
RUN npm install \
  && npm install -g ts-jest @types/jest

# Lance les tests
CMD ["npm", "run", "test:e2e"]
