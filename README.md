🔷 Portail Intelligent de Suivi des Projets Clients

👥 Collaboration

Réalisé par : Mohamed AZZAM & Aya OUAHI

Entreprise : SQLI Rabat en collaboration avec RFC Digital Rabat

Date : Août 2025
--




📌 Objectif du Projet
--
Développer un portail web intelligent pour assurer le suivi des projets clients chez SQLI/RFC Digital. L'application permet aux chefs de projets, développeurs et clients de collaborer efficacement tout en assurant la sécurité, la traçabilité et l’automatisation des tâches clés.




## 📄 Technologies utilisées

| Domaine               | Technologie                   |
| --------------------- | ----------------------------- |
| Langage               | Java 17                       |
| Framework principal   | Spring Boot 3.x               |
| ORM / Base de données | JPA / Hibernate + PostgreSQL  |
| Authentification      | Spring Security + JWT         |
| Tests API             | Postman                       |
| Documentation API     | Swagger UI                    |
| Autres                | Lombok, Maven, Devtools, etc. |

---

## 🔢 Fonctionnalités principales

### 1. 🔐 Authentification et sécurité JWT

* Connexion via JWT Token (`/api/auth/login`)
* Déconnexion avec Token Blacklist (`/api/auth/logout`)
* Validation de mot de passe fort `@StrongPassword`
* Génération automatique de `username` unique (`nom.sqli-XXXX`)
* Protection des routes selon les rôles (admin, chef de projet, etc.)

### 2. 💼 Gestion des utilisateurs (admin uniquement)

* Création, mise à jour, suppression d’utilisateurs
* Affectation des rôles : `ADMIN`, `CHEF_DE_PROJET`, `DEVELOPPEUR`, `CLIENT`
* Activation / Désactivation de compte

### 3. 📅 Gestion des projets

* CRUD des projets
* Affectation à un client et à un chef de projet
* Génération de lien public (UUID)
* Visualisation d’un projet public via HTML (`public-project.html`)

### 4. 📆 Tâches (Tasks)

* Création, affectation, modification de tâches liées à un projet
* Statuts : `TODO`, `EN_COURS`, `TERMINEE`
* Visualisation des tâches par projet, développeur, ou statut

### 5. 🕵️ Audit & Historique (Log)

* Traçage de toutes les actions sensibles (login, logout, création, suppression...)
* Filtrage par utilisateur, date, type d’opération ou entité
* Accessible uniquement par les admins

### 6. 🔹 Utilitaires

* Swagger pour test d’API
* QR Code généré automatiquement pour les projets publics (en cours)

---

## 📁 Structure du projet backend

```
backend-sqli/
├── config/                # Configs de sécurité, Swagger
├── controller/            # Endpoints REST
├── dto/                   # Data Transfer Objects
├── entity/                # Entités JPA (User, Project, Task, ...)
├── exception/             # Gestion centralisée des erreurs
├── repository/            # Interfaces JpaRepository
├── security/              # JWT, TokenBlacklist, filtres
├── service/               # Logique métier
├── utils/                 # QR Code, UserDetails, helpers
├── validation/            # Annotation et validator pour mot de passe fort
└── resources/
    └── templates/         # Fichier HTML pour affichage public
```

---

## 🚪 Accès Swagger / API

* Swagger UI : [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
* JWT Token à passer dans `Authorization: Bearer <token>`

---

## 🌟 État d’avancement (Août 2025)

| Module                   | Statut     | Détails                                                |
| ------------------------ | ---------- | ------------------------------------------------------ |
| Authentification / JWT   | ✅ Terminé  | Login, Logout, Blacklist, validation mot de passe fort |
| Gestion des utilisateurs | ✅ Terminé  | CRUD admin uniquement                                  |
| Gestion des projets      | ✅ Terminé  | CRUD + lien public UUID + HTML public                  |
| Tâches                   | ✅ Terminé  | CRUD, assignation, recherche, filtre                   |
| Historique / Logs        | ✅ Terminé  | Logs déconnexion, création, suppression...             |
| Swagger UI               | ✅ Terminé  | Visualisation et test des endpoints                    |
| QR Code                  | ⏳ En cours | Génération de QR code projet public                    |
| Tests unitaires          | ❌ Non fait | à prévoir si nécessaire avant déploiement              |

---

## 💡 Fonctionnalités prévues

* Matching IA : développeur <-> tâche selon compétences (entités `Skill`, `MatchingScore`)
* Dashboard analytique pour suivi des projets
* Export PDF des fiches projets et rapports de tâches
* Intégration de notifications WebSocket
* Historique de sécurité (tentatives ratées, changement mdp...)
* CI/CD GitHub Actions + déploiement Azure (production)

---

## 👨‍💼 Auteurs

* 👤 Nom : [Mohamed AZZAM](https://github.com/Azzammoo10)
* 👤 Nom : [Aya Ouahi](https://github.com/Ayaaa9)
* 🏢 Stage de fin d'année : SQLI  + RFC Digital
* ✨ Technologies maîtrisées : Java, Spring Boot, PostgreSQL, React.js


---

## 🔖 Licence

Ce projet est développé dans le cadre d’un Projet de Fin D'annes. Toute réutilisation à des fins académiques est permise avec attribution.


