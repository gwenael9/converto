# Converto

## Installation

1. Cloner le repository :

```bash
git clone [URL_DU_REPO]
cd converto
```

2. Installer les dépendances :

```bash
npm install
```

3. Installer Husky :

```bash
npm run prepare
```

## Docker Compose

Le projet utilise Docker Compose pour orchestrer les différents services. Voici comment l'utiliser :

### Démarrage

Pour démarrer tous les services :

```bash
docker compose up -d
```

Pour arrêter tous les services :

```bash
docker compose down
```

### Services disponibles

- `api` : Service API NestJS (port 4000)
- `frontend` : Service Frontend (port 3001)
- `database` : Base de données PostgreSQL (port 5432)

### Variables d'environnement

Copiez le fichier `.env.example` en `.env` à la racine du projet en modifiant les variables.

### Commandes utiles

Voir les logs des services :

```bash
docker compose logs -f [service_name]
```

Reconstruire un service :

```bash
docker compose up -d --build [service_name]
```

### Ports

L'api sera disponible sur `http://localhost:4000/graphql`
Minio sera disponible sur `http://localhost:9000/`
PGAdmin sera disponible sur `http://localhost:8080`

## Workflow de développement

### Structure des branches

- `main` : Branche principale (production)
- `staging` : Branche de pré-production
- `dev` : Branche de développement
- `feature/*` : Branches de fonctionnalités

### Règles de commit

1. Format des messages de commit :

```
type(scope): description
```

Types autorisés :

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

Exemple :

```bash
git commit -m "feat(auth): ajout de l'authentification"
```

### Processus de développement

1. Créer une branche feature depuis `dev` :

```bash
git checkout dev
git pull origin dev
git checkout -b feature/nom-de-votre-fonctionnalite
```

2. Développer votre fonctionnalité

3. Créer une Pull Request vers `dev`

4. Une fois validée, la PR suivra le flux :

```
feature/* → dev → staging → main
```
