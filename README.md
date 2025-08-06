# 🔷 Portail Intelligent de Suivi des Projets Clients

Bienvenue sur le portail intelligent de suivi des projets clients, développé pour SQLI Rabat et RFC Digital Rabat. Ce projet vise à faciliter la gestion, la collaboration et le suivi des projets clients grâce à une application web moderne, sécurisée et automatisée.

---

## 👥 Collaboration

- **Auteurs** : [Mohamed AZZAM](https://github.com/Azzammoo10) & [Aya Ouahi](https://github.com/Ayaaa9)
- **Entreprise** : SQLI Rabat & RFC Digital Rabat
- **Date** : Août 2025

---

## 📌 Objectif

Développer un portail web intelligent permettant aux chefs de projets, développeurs et clients de collaborer efficacement, tout en assurant la sécurité, la traçabilité et l’automatisation des tâches clés.

---

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

1. **Authentification & Sécurité**
   - Connexion via JWT Token (`/api/auth/login`)
   - Déconnexion avec Token Blacklist (`/api/auth/logout`)
   - Validation de mot de passe fort (`@StrongPassword`)
   - Génération automatique de `username` unique (`nom.sqli-XXXX`)
   - Protection des routes selon les rôles (`ADMIN`, `CHEF_DE_PROJET`, etc.)

2. **Gestion des utilisateurs (admin)**
   - CRUD utilisateurs
   - Affectation des rôles : `ADMIN`, `CHEF_DE_PROJET`, `DEVELOPPEUR`, `CLIENT`
   - Activation / Désactivation de compte

3. **Gestion des projets**
   - CRUD projets
   - Affectation client & chef de projet
   - Génération de lien public (UUID)
   - Visualisation publique via HTML (`public-project.html`)

4. **Gestion des tâches**
   - Création, affectation, modification de tâches
   - Statuts : `TODO`, `EN_COURS`, `TERMINEE`
   - Visualisation par projet, développeur ou statut

5. **Audit & Historique**
   - Traçage des actions sensibles (login, logout, création, suppression...)
   - Filtrage par utilisateur, date, type d’opération ou entité
   - Accessible uniquement par les admins

6. **Utilitaires**
   - Swagger pour test d’API
   - QR Code généré automatiquement pour les projets publics (en cours)

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

## 🚪 Accès API & Swagger

- **Swagger UI** : [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **JWT Token** : à passer dans `Authorization: Bearer <token>`

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
| Tests unitaires          | ❌ Non fait | À prévoir avant déploiement                            |

---

## 💡 Fonctionnalités à venir

- Matching IA : développeur <-> tâche selon compétences (`Skill`, `MatchingScore`)
- Dashboard analytique pour suivi des projets
- Export PDF des fiches projets et rapports de tâches
- Notifications WebSocket
- Historique de sécurité (tentatives ratées, changement mdp...)
- CI/CD GitHub Actions + déploiement Azure

---

## 🧑‍💻 Auteurs

- [Mohamed AZZAM](https://github.com/Azzammoo10)
- [Aya Ouahi](https://github.com/Ayaaa9)
- Stage de fin d'année : SQLI + RFC Digital
- Technologies maîtrisées : Java, Spring Boot, PostgreSQL, React.js

---

## 🔖 Licence

Projet réalisé dans le cadre d’un Projet de Fin d’Année. Réutilisation académique permise avec attribution.

---

## 📬 Contact

Pour toute question ou suggestion, n’hésitez pas à contacter les auteurs via leurs profils GitHub respectifs.


