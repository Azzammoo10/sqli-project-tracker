# 🚀 Portail Intelligent de Suivi des Projets Clients - SQLI

<div align="center">

![SQLI Logo](frontend-sqli/app/assets/images/SQLI-LOGO.png)

**Portail web intelligent pour la gestion collaborative de projets clients**

*Développé pour SQLI Rabat & RFC Digital Rabat*

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-green.svg)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)](LICENSE)

</div>

---

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🖼️ Captures d'écran](#️-captures-décran)
- [🏗️ Architecture](#️-architecture)
- [⚡ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📊 API Documentation](#-api-documentation)
- [🤝 Contribution](#-contribution)
- [📞 Contact](#-contact)

---

## 🎯 Vue d'ensemble

Le **Portail Intelligent de Suivi des Projets Clients** est une application web moderne développée pour SQLI Rabat et RFC Digital Rabat. Cette plateforme facilite la gestion collaborative de projets en offrant des interfaces dédiées pour chaque rôle : Administrateurs, Chefs de Projet, Développeurs et Clients.

### 🎯 Objectifs
- ✅ **Gestion centralisée** des projets et équipes
- ✅ **Suivi en temps réel** de la progression
- ✅ **Interface intuitive** adaptée à chaque rôle
- ✅ **Sécurité renforcée** avec authentification JWT
- ✅ **Analytics avancées** avec graphiques interactifs
- ✅ **Responsive design** pour tous les appareils

### 👥 Équipe de Développement
- **[Mohamed AZZAM](https://github.com/Azzammoo10)** - Développeur Full Stack
- **[Aya Ouahi](https://github.com/Ayaaa9)** - Développeuse Full Stack

---

## 🖼️ Captures d'écran

### 🔐 Authentification

<div align="center">

#### Page de Connexion
![Login](Screen/Auth/login.png)

#### Contact Administrateur
![Contact Admin](Screen/Auth/Contact_admin.png)

</div>

### 👨‍💼 Dashboard Administrateur

<div align="center">

#### Vue d'ensemble
![Dashboard Admin](Screen/Admin/Dahboard.png)

#### Gestion des Utilisateurs
![Users Management](Screen/Admin/users.png)

#### Gestion des Projets
![Projects Management](Screen/Admin/projects.png)

#### Historique des Actions
![Logs](Screen/Admin/logs.png)

</div>

### 👨‍💻 Dashboard Chef de Projet

<div align="center">

#### Vue d'ensemble
![Chef Dashboard](Screen/Chef/dashboard.png)

#### Gestion des Projets
![Chef Projects](Screen/Chef/projetcs.png)

#### Gestion des Tâches
![Chef Tasks](Screen/Chef/tasks.png)

#### Gestion des Équipes
![Chef Teams](Screen/Chef/teams.png)

#### Analytics - État 1
![Analytics State 1](Screen/Chef/state1.png)

#### Analytics - État 2
![Analytics State 2](Screen/Chef/state2.png)

#### Analytics - État 3
![Analytics State 3](Screen/Chef/state3.png)

</div>

### 👨‍💼 Dashboard Développeur

<div align="center">

#### Vue d'ensemble
![Dev Dashboard](Screen/Dev/dashboard.png)

#### Gestion des Projets
![Dev Projects](Screen/Dev/projects.png)

#### Gestion des Tâches
![Dev Tasks](Screen/Dev/tasks.png)

#### Gestion des Équipes
![Dev Teams](Screen/Dev/teams.png)

</div>

### 👤 Dashboard Client

<div align="center">

#### Vue d'ensemble
![Client Dashboard](Screen/Cli/dashboard.png)

#### Liste des Projets
![Client Projects](Screen/Cli/projects.png)

</div>

---

## 🏗️ Architecture

### 🎯 Stack Technologique

| **Frontend** | **Backend** | **Base de Données** | **Outils** |
|--------------|-------------|---------------------|------------|
| React 19.1.0 | Spring Boot 3.5.3 | PostgreSQL 12+ | Maven |
| TypeScript | Java 17 | JPA/Hibernate | Vite |
| Tailwind CSS | Spring Security | Liquibase | Git |
| Chart.js | JWT | | Docker |

### 📁 Structure du Projet

```
stage-sqli/
├── 📁 backend-sqli/                 # Application Spring Boot
│   ├── 📁 src/main/java/
│   │   ├── 📁 config/              # Configuration (Security, CORS, Swagger)
│   │   ├── 📁 controller/          # Contrôleurs REST API
│   │   ├── 📁 dto/                 # Data Transfer Objects
│   │   ├── 📁 entity/              # Entités JPA
│   │   ├── 📁 repository/          # Interfaces JpaRepository
│   │   ├── 📁 security/            # JWT, TokenBlacklist
│   │   ├── 📁 service/             # Logique métier
│   │   └── 📁 utils/               # Utilitaires (QR Code, etc.)
│   ├── 📁 resources/
│   │   ├── application.properties  # Configuration DB
│   │   └── templates/              # Templates HTML
│   └── pom.xml                     # Dépendances Maven
│
├── 📁 frontend-sqli/               # Application React
│   ├── 📁 app/
│   │   ├── 📁 components/          # Composants réutilisables
│   │   ├── 📁 routes/              # Pages de l'application
│   │   ├── 📁 services/            # Services API
│   │   └── 📁 types/               # Types TypeScript
│   ├── 📁 public/                  # Assets statiques
│   └── package.json                # Dépendances npm
│
└── 📁 Screen/                      # Captures d'écran
    ├── 📁 Admin/                   # Screenshots Admin
    ├── 📁 Auth/                    # Screenshots Auth
    ├── 📁 Chef/                    # Screenshots Chef
    ├── 📁 Dev/                     # Screenshots Dev
    └── 📁 Cli/                     # Screenshots Client
```

---

## ⚡ Fonctionnalités

### 🔐 Système d'Authentification
- ✅ **Connexion sécurisée** avec JWT Token
- ✅ **Gestion des rôles** (ADMIN, CHEF_DE_PROJET, DEVELOPPEUR, CLIENT)
- ✅ **Validation des mots de passe** forts
- ✅ **Génération automatique** de noms d'utilisateur uniques
- ✅ **Protection des routes** selon les permissions

### 👨‍💼 Dashboard Administrateur
- ✅ **Gestion complète des utilisateurs** (CRUD)
- ✅ **Attribution et gestion des rôles**
- ✅ **Activation/Désactivation** de comptes
- ✅ **Statistiques système** et monitoring
- ✅ **Historique des actions** et audit trail
- ✅ **Interface intuitive** avec tableaux de données

### 👨‍💻 Dashboard Chef de Projet
- ✅ **Gestion des projets** (création, modification, suppression)
- ✅ **Affectation des développeurs** aux projets
- ✅ **Suivi de la progression** en temps réel
- ✅ **Gestion des tâches** et priorités
- ✅ **Analytics avancées** avec graphiques interactifs
- ✅ **Timeline des projets** et activités récentes
- ✅ **Gestion des équipes** et ressources

### 👨‍💼 Dashboard Développeur
- ✅ **Vue des projets assignés** avec progression
- ✅ **Gestion des tâches** (démarrer, arrêter, terminer)
- ✅ **Timer intégré** pour le suivi du temps
- ✅ **Statuts des tâches** (NON_COMMENCE, EN_COURS, TERMINE)
- ✅ **Interface intuitive** pour la gestion quotidienne
- ✅ **Suivi de la charge de travail**

### 👤 Dashboard Client
- ✅ **Vue d'ensemble** des projets avec statistiques
- ✅ **Suivi en temps réel** de la progression
- ✅ **Timeline des projets** et activités
- ✅ **Détails complets** des projets et équipes
- ✅ **Interface professionnelle** et responsive
- ✅ **Accès aux informations** pertinentes

### 📊 Analytics et Rapports
- ✅ **Graphiques interactifs** (Chart.js)
- ✅ **Statistiques des projets** par statut et type
- ✅ **Analyse de la progression** des projets
- ✅ **Statistiques des tâches** par statut
- ✅ **Analyse de la charge de travail** des développeurs
- ✅ **Données en temps réel** avec fallback intelligent

### 🔒 Sécurité et Audit
- ✅ **JWT avec expiration** et blacklist
- ✅ **Validation des mots de passe** forts
- ✅ **Protection CSRF** et CORS configuré
- ✅ **Gestion des rôles** granulaire
- ✅ **Audit trail** complet
- ✅ **Traçage des actions sensibles**

---

## 🚀 Installation

### 📋 Prérequis

- **Java** : 17 ou supérieur
- **Node.js** : 18+ et npm
- **PostgreSQL** : 12+
- **Maven** : 3.6+
- **Git** : Pour cloner le projet

### 🔧 Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/Azzammoo10/stage-sqli.git
cd stage-sqli

# 2. Configuration de la base de données
# Créer une base PostgreSQL et configurer application.properties

# 3. Démarrer le backend
cd backend-sqli
./mvnw spring-boot:run

# 4. Démarrer le frontend (nouveau terminal)
cd frontend-sqli
npm install
npm run dev
```

---

## 🔧 Configuration

### 🗄️ Base de Données

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sqli_portal
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 🔐 Configuration JWT

```properties
# application.properties
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000
```

### 🌐 Configuration Frontend

```typescript
// services/api.ts
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 📊 API Documentation

### 🔗 URLs d'accès

| **Service** | **URL** | **Description** |
|-------------|---------|-----------------|
| **Frontend** | http://localhost:5173 | Interface utilisateur |
| **Backend** | http://localhost:8080 | API REST |
| **Swagger UI** | http://localhost:8080/swagger-ui | Documentation API |

### 🔐 Authentification

```bash
# Login
POST /api/auth/login
{
  "username": "admin.sqli-0001",
  "password": "MotDePasse123!"
}

# Utilisation du token
Authorization: Bearer <jwt_token>
```

### 📋 Endpoints Principaux

| **Endpoint** | **Méthode** | **Description** |
|--------------|-------------|-----------------|
| `/api/auth/login` | POST | Connexion utilisateur |
| `/api/auth/logout` | POST | Déconnexion |
| `/api/users` | GET/POST | Gestion utilisateurs |
| `/api/projects` | GET/POST | Gestion projets |
| `/api/tasks` | GET/POST | Gestion tâches |
| `/api/analytics/*` | GET | Statistiques |

---

## 🤝 Contribution

### 📝 Standards de Code

- **Backend** : Java 17, Spring Boot, Maven
- **Frontend** : React 19, TypeScript, Tailwind CSS
- **Git** : Conventional Commits
- **Tests** : Coverage minimum 80%

### 🔄 Workflow de Contribution

1. **Fork** du projet
2. **Création** d'une branche feature
3. **Développement** et tests
4. **Pull Request** avec description détaillée
5. **Review** et merge



---

## 📞 Contact

### 👥 Équipe de Développement

| **Développeur** | **GitHub** | **Rôle** |
|-----------------|------------|----------|
| **Mohamed AZZAM** | [@Azzammoo10](https://github.com/Azzammoo10) | Full Stack Developer |
| **Aya Ouahi** | [@Ayaaa9](https://github.com/Ayaaa9) | Full Stack Developer |

### 📧 Informations de Contact

- **GitHub** : [@Azzammoo10](https://github.com/Azzammoo10), [@Ayaaa9](https://github.com/Ayaaa9)
- **Email** : Via profils GitHub
- **LinkedIn** : À venir

### 🏢 Entreprise

- **SQLI Rabat** & **RFC Digital Rabat**
- **Type** : Projet de Fin d'Année (Stage)
- **Date** : Août 2025

---

## 📈 Métriques du Projet

### 📊 Statistiques

| **Métrique** | **Valeur** |
|--------------|------------|
| **Lignes de code Backend** | ~15,000 |
| **Lignes de code Frontend** | ~25,000 |
| **Total lignes de code** | ~40,000 |
| **Endpoints API** | 50+ |
| **Composants React** | 30+ |
| **Pages** | 20+ |
| **Rôles utilisateur** | 4 |

### 🎯 Qualité

- **TypeScript** : 100% typé
- **Responsive** : 100% mobile-friendly
- **Accessibilité** : Conforme WCAG 2.1
- **Performance** : Lighthouse Score 95+

---

## 🔖 Licence

### 📄 Informations de Licence

- **Type** : Projet académique (Projet de Fin d'Année)
- **Réutilisation** : Permise avec attribution
- **Commercial** : Non autorisé sans accord

### ✅ Utilisation Autorisée

- **Études** : ✅ Autorisé
- **Portfolio** : ✅ Autorisé avec attribution
- **Commercial** : ❌ Non autorisé
- **Modification** : ✅ Autorisé avec attribution

---

<div align="center">

**🚀 Projet développé avec passion pour SQLI Rabat & RFC Digital Rabat**

*Dernière mise à jour : Août 2025 | Version : 1.0.0 | Statut : Production Ready*

</div>


