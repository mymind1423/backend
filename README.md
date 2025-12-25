# InternFlow - Backend 🧠

API robuste pour la plateforme InternFlow, gérant les utilisateurs, les offres, les candidatures et l'intelligence artificielle.

## 🚀 Technologies
- **Express 5** : Framework web minimaliste et performant.
- **Oracle Database** : Base de données relationnelle d'entreprise.
- **Firebase Admin SDK** : Authentification et sécurité.
- **Google Generative AI (Gemini)** : Analyse de profil et coaching IA.
- **Nodemailer** : Envoi de notifications par email.
- **Multer** : Gestion des uploads de fichiers (CV, logos).

## 📦 Installation

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Configurez vos variables d'environnement dans un fichier `.env`.

3. Démarrez le serveur :
   ```bash
   npm run dev
   ```

## 🏗️ Architecture
- `/controllers` : Logique métier et gestion des requêtes.
- `/services` : Couche d'accès à la base de données (dbService.js).
- `/routes` : Définition des points de terminaison (API endpoints).
- `/middleware` : Authentification, validation et upload.
- `/utils` : Helpers (IA, fichiers, emails).

## 💾 Base de Données
Le backend utilise OracleDB. Un script de réinitialisation du schéma est disponible :
```bash
node reset_schema.js
```
