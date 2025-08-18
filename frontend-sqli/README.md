# SQLI Digital Experience - Frontend

Application React moderne pour la gestion de projet en temps réel avec authentification JWT et interface administrateur complète.

## 🚀 Technologies

- **React 18** avec React Router v7
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Vite** pour le build et le développement
- **Axios** pour les appels API
- **React Hot Toast** pour les notifications
- **Lucide React** pour les icônes

## 📁 Structure du Projet

```
frontend-sqli/
├── app/
│   ├── assets/
│   │   └── images/
│   │       ├── SQLI-LOGO.png
│   │       ├── undraw_secure.svg
│   │       └── undraw_server-cluster_7ugi.svg
│   ├── components/
│   │   ├── NavAdmin.tsx
│   │   ├── NavChef.tsx
│   │   ├── NavDev.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Toaster.tsx
│   ├── routes/
│   │   ├── auth/
│   │   │   └── login.tsx
│   │   ├── contact/
│   │   │   └── admin.tsx
│   │   ├── admin/
│   │   │   ├── dashboard.tsx
│   │   │   ├── users.tsx
│   │   │   ├── users/
│   │   │   │   └── create.tsx
│   │   │   ├── projects.tsx
│   │   │   └── history.tsx
│   │   ├── chef/
│   │   │   └── dashboard.tsx
│   │   ├── dev/
│   │   │   └── dashboard.tsx
│   │   ├── client/
│   │   │   └── dashboard.tsx
│   │   ├── home.tsx
│   │   ├── dashboard.tsx
│   │   └── 404.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── userService.ts
│   │   ├── projectService.ts
│   │   ├── historyService.ts
│   │   └── dashboardService.ts
│   ├── types/
│   │   └── images.d.ts
│   ├── root.tsx
│   └── routes.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Thème et Design

- **Couleur principale** : `#4B2A7B` (violet SQLI)
- **Design moderne** avec gradients et ombres
- **Interface responsive** pour tous les écrans
- **Navigation intuitive** avec sidebar

## 🔐 Authentification

### Fonctionnalités
- **Login sécurisé** avec JWT
- **Redirection automatique** selon le rôle utilisateur
- **Protection des routes** avec `ProtectedRoute`
- **Gestion des tokens** automatique
- **Déconnexion** avec blacklist des tokens

### Rôles Supportés
- `ADMIN` → Dashboard administrateur
- `CHEF_DE_PROJET` → Dashboard chef de projet
- `DEVELOPPEUR` → Dashboard développeur
- `CLIENT` → Dashboard client

## 👨‍💼 Interface Administrateur

### 🏠 Dashboard Principal
- **KPIs dynamiques** : Total projets, utilisateurs, activité récente
- **Graphiques** : Répartition par rôle, types de projets
- **Activité récente** : Dernières actions du système
- **Données temps réel** depuis l'API backend

### 👥 Gestion des Utilisateurs (`/admin/users`)
- **Liste complète** des utilisateurs avec pagination
- **Recherche avancée** par nom, email, rôle
- **Actions CRUD** : Créer, modifier, supprimer, activer/désactiver
- **Filtres par rôle** et statut
- **Interface de création** d'utilisateur

### 📁 Gestion des Projets (`/admin/projects`)
- **Vue d'ensemble** de tous les projets
- **Recherche** par titre, description, type, statut
- **Gestion des statuts** : En cours, Terminé, En attente, Annulé
- **Barres de progression** visuelles
- **Gestion des liens publics** avec QR codes
- **Assignation d'équipe** aux projets

### 📊 Historique des Actions (`/admin/history`)
- **Traçabilité complète** de toutes les actions
- **Filtrage** par entité, action, utilisateur
- **Recherche** dans les détails
- **Export** en CSV et JSON
- **Pagination** pour les gros volumes

### 🔧 Fonctionnalités Avancées
- **Notifications toast** pour toutes les actions
- **Gestion d'erreurs** robuste
- **Loading states** avec spinners
- **Responsive design** mobile-first
- **Accessibilité** avec ARIA labels

## 🌐 API Integration

### Services Implémentés
- **`authService`** : Authentification et gestion des tokens
- **`userService`** : CRUD utilisateurs, statistiques
- **`projectService`** : CRUD projets, assignation équipe
- **`historyService`** : Historique, export, filtrage
- **`dashboardService`** : Données pour les KPIs

### Endpoints Utilisés
```typescript
// Authentification
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

// Utilisateurs
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
PATCH /api/admin/users/:id/toggle-status
GET /api/admin/users/stats

// Projets
GET /api/admin/projects
POST /api/admin/projects
PUT /api/admin/projects/:id
DELETE /api/admin/projects/:id
POST /api/admin/projects/:id/assign-developers
POST /api/admin/projects/:id/toggle-public-link

// Historique
GET /api/admin/history
GET /api/admin/history/stats
GET /api/admin/history/export
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- Backend Spring Boot démarré sur `http://localhost:8080`

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd frontend-sqli

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Variables d'Environnement
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🧪 Test de l'Interface

### 1. Connexion Admin
```bash
Username: admin.adm-IT6245
Password: [votre mot de passe]
```

### 2. Navigation
- **Dashboard** : Vue d'ensemble avec KPIs
- **All users** : Gestion des utilisateurs
- **Projets** : Gestion des projets
- **Historique** : Traçabilité des actions

### 3. Fonctionnalités à Tester
- ✅ Création d'utilisateur
- ✅ Modification de statut utilisateur
- ✅ Recherche et filtrage
- ✅ Pagination
- ✅ Export de données
- ✅ Gestion des projets
- ✅ Navigation responsive

## 🔧 Configuration Backend

Assurez-vous que votre backend Spring Boot expose les endpoints suivants :

```java
// Controllers requis
@RestController @RequestMapping("/api/auth") // AuthController
@RestController @RequestMapping("/api/admin/users") // UserController
@RestController @RequestMapping("/api/admin/projects") // ProjectController
@RestController @RequestMapping("/api/admin/history") // HistoryController
```

## 📱 Responsive Design

- **Desktop** : Sidebar fixe avec navigation complète
- **Tablet** : Sidebar collapsible
- **Mobile** : Navigation hamburger avec overlay

## 🎯 Prochaines Étapes

- [ ] Implémentation des dashboards Chef de Projet
- [ ] Implémentation des dashboards Développeur
- [ ] Implémentation des dashboards Client
- [ ] Graphiques interactifs avec Chart.js
- [ ] Notifications temps réel avec WebSocket
- [ ] Tests unitaires et d'intégration
- [ ] Optimisation des performances

## 🐛 Débogage

### Problèmes Courants
1. **Erreur CORS** : Vérifier la configuration backend
2. **Token expiré** : Redirection automatique vers login
3. **API non disponible** : Vérifier que le backend est démarré
4. **Erreur de build** : Vérifier les types TypeScript

### Logs de Debug
```typescript
// Activer les logs dans la console
console.log('API Response:', response);
console.log('User Role:', user.role);
console.log('Current Route:', location.pathname);
```

## 📄 Licence

Projet interne SQLI - Tous droits réservés

---

**Développé avec ❤️ pour SQLI Digital Experience**
