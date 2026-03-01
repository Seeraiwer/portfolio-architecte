# Portfolio de Sophie Bluel — Architecte d'intérieur

Projet 6 de la formation Développeur Web OpenClassrooms.

Développement du site portfolio d'une architecte d'intérieur : affichage dynamique des projets, authentification et interface d'administration (ajout/suppression de projets via une modale).

---

## Structure du projet

```
portfolio-architecte/
├── Backend/   API REST Node.js/Express + base de données SQLite
└── FrontEnd/  Site statique HTML/CSS/JS vanilla
```

---

## Technologies

| Côté | Stack |
|------|-------|
| Frontend | HTML5, CSS3, JavaScript (ES6+, Fetch API) |
| Backend | Node.js, Express, Sequelize, SQLite |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Fichiers | Multer (upload d'images) |
| Docs API | Swagger (disponible sur `/api-docs`) |

---

## Lancer le projet

### 1. Backend

```bash
cd Backend
npm install
npm start
```

Le serveur démarre sur **http://localhost:5678**.

Compte de test :

```
email    : sophie.bluel@test.tld
password : S0phie
```

Documentation Swagger : [http://localhost:5678/api-docs](http://localhost:5678/api-docs)

### 2. Frontend

Ouvrir `FrontEnd/index.html` dans un navigateur ou via un serveur local (Live Server, etc.).

> Lancer Backend et Frontend dans deux instances séparées de l'éditeur pour éviter tout conflit.

---

## Fonctionnalités

- Affichage de la galerie de projets chargée dynamiquement via l'API
- Filtrage des projets par catégorie
- Page de connexion avec gestion des erreurs
- Mode administration (accessible après connexion) :
  - Bandeau « Mode édition »
  - Modale de gestion : suppression et ajout de projets avec prévisualisation de l'image
