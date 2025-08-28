# 🧪 Tests Java - Backend SQLI

Ce document explique l'utilisation des tests Java unitaires et d'intégration créés pour le backend SQLI.

## 📋 **Vue d'ensemble des Tests**

### **Tests Unitaires (MockMvc)**
- **`AdminControllerTest.java`** - Tests du contrôleur Admin
- **`ChefProjetControllerTest.java`** - Tests du contrôleur Chef de Projet
- **`DeveloperControllerTest.java`** - Tests du contrôleur Développeur

### **Tests d'Intégration**
- **`IntegrationTest.java`** - Tests d'intégration complets

## 🚀 **Exécution des Tests**

### **1. Prérequis**
```bash
# Vérifier que Java 17+ est installé
java -version

# Vérifier que Maven est installé
mvn -version
```

### **2. Exécuter tous les tests**
```bash
cd backend-sqli
mvn test
```

### **3. Exécuter un test spécifique**
```bash
# Test Admin uniquement
mvn test -Dtest=AdminControllerTest

# Test Chef de Projet uniquement
mvn test -Dtest=ChefProjetControllerTest

# Test Développeur uniquement
mvn test -Dtest=DeveloperControllerTest

# Test d'intégration uniquement
mvn test -Dtest=IntegrationTest
```

### **4. Exécuter avec rapport détaillé**
```bash
mvn test -Dtest=AdminControllerTest -Dsurefire.useFile=false
```

## 🔧 **Configuration des Tests**

### **Fichier de Configuration**
- **`application-test.properties`** - Configuration spécifique aux tests
- Base de données H2 en mémoire
- Logs détaillés activés
- Ports dynamiques

### **Dépendances Maven**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

## 📊 **Structure des Tests**

### **1. Tests Admin (`AdminControllerTest.java`)**
```java
@DisplayName("Tests AdminController - Gestion des Utilisateurs")
class AdminControllerTest {
    // Tests CRUD utilisateurs
    // Tests de sécurité et autorisation
    // Tests de validation
}
```

**Endpoints testés :**
- `POST /api/admin/users` - Créer un utilisateur
- `GET /api/admin/users` - Lister tous les utilisateurs
- `GET /api/admin/users/{id}` - Récupérer un utilisateur
- `PUT /api/admin/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `PUT /api/admin/users/{id}/role` - Assigner un rôle
- `PUT /api/admin/users/{id}/disable` - Désactiver un utilisateur
- `PUT /api/admin/users/{id}/enable` - Activer un utilisateur

### **2. Tests Chef de Projet (`ChefProjetControllerTest.java`)**
```java
@DisplayName("Tests Chef de Projet - Gestion des Projets et Tâches")
class ChefProjetControllerTest {
    // Tests Analytics
    // Tests Projets
    // Tests Tâches
}
```

**Endpoints testés :**
- **Analytics :**
  - `GET /api/analytics/chef/dashboard-stats`
  - `GET /api/analytics/chef/recent-activity`
  - `GET /api/analytics/chef/project-progress`
  - `GET /api/analytics/chef/task-status-distribution`
  - `GET /api/analytics/chef/workload-analysis`
  - `GET /api/analytics/chef/team-overview`

- **Projets :**
  - `GET /api/projects/chef/overview`
  - `POST /api/projects`
  - `GET /api/projects/stats`

- **Tâches :**
  - `POST /api/tasks`
  - `PUT /api/tasks/{id}`
  - `GET /api/tasks/project/{id}`

### **3. Tests Développeur (`DeveloperControllerTest.java`)**
```java
@DisplayName("Tests Développeur - Gestion des Tâches et Projets")
class DeveloperControllerTest {
    // Tests Tâches
    // Tests Projets
    // Tests Workflows
}
```

**Endpoints testés :**
- **Tâches :**
  - `GET /api/tasks/my-tasks`
  - `PUT /api/tasks/{id}/status`
  - `GET /api/tasks/{id}`
  - `GET /api/tasks/status/{status}`

- **Projets :**
  - `GET /api/projects/my-projects`
  - `GET /api/projects/{id}`

### **4. Tests d'Intégration (`IntegrationTest.java`)**
```java
@DisplayName("Tests d'Intégration - Endpoints et Sécurité")
class IntegrationTest {
    // Tests de contexte Spring
    // Tests de sécurité
    // Tests de performance
    // Tests de robustesse
}
```

**Aspects testés :**
- ✅ Contexte Spring se charge correctement
- ✅ Endpoints accessibles selon les rôles
- ✅ Configuration CORS active
- ✅ Gestion des erreurs (404, 405)
- ✅ En-têtes de sécurité
- ✅ Performance et charge
- ✅ Robustesse (caractères spéciaux, injections)

## 🛡️ **Tests de Sécurité**

### **Annotations de Sécurité**
```java
@WithMockUser(roles = "ADMIN")        // Utilisateur avec rôle ADMIN
@WithMockUser(roles = "CHEF_DE_PROJET") // Utilisateur avec rôle CHEF_DE_PROJET
@WithMockUser(roles = "DEVELOPPEUR")   // Utilisateur avec rôle DEVELOPPEUR
```

### **Scénarios de Test**
- ❌ Accès refusé sans authentification
- ❌ Accès refusé avec rôle insuffisant
- ✅ Accès autorisé avec le bon rôle

## 📝 **Exemples de Tests**

### **Test de Création d'Utilisateur**
```java
@Test
@DisplayName("✅ Créer un utilisateur avec succès")
@WithMockUser(roles = "ADMIN")
void createUser_Success() throws Exception {
    // Arrange
    CreateUserRequest request = CreateUserRequest.builder()
            .nom("Test")
            .email("test@example.com")
            .motDePasse("password123")
            .role(Role.DEVELOPPEUR)
            .build();

    // Act & Assert
    mockMvc.perform(post("/api/admin/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("test.user"));
}
```

### **Test de Validation**
```java
@Test
@DisplayName("❌ Créer un utilisateur avec données invalides")
@WithMockUser(roles = "ADMIN")
void createUser_InvalidData() throws Exception {
    // Arrange
    CreateUserRequest request = CreateUserRequest.builder()
            .nom("") // Nom vide
            .email("invalid-email") // Email invalide
            .build();

    // Act & Assert
    mockMvc.perform(post("/api/admin/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
}
```

## 🔍 **Débogage des Tests**

### **1. Logs Détaillés**
```bash
mvn test -Dlogging.level.com.sqli.stage.backendsqli=DEBUG
```

### **2. Test en Mode Debug**
```bash
mvn test -Dmaven.surefire.debug
```

### **3. Exécution d'un Test Spécifique**
```bash
mvn test -Dtest=AdminControllerTest#createUser_Success
```

### **4. Rapport de Couverture**
```bash
mvn test jacoco:report
```

## 📈 **Métriques et Rapports**

### **Rapport Surefire**
- Généré automatiquement dans `target/surefire-reports/`
- Détails sur les tests passés/échoués
- Temps d'exécution

### **Rapport JaCoCo (Couverture)**
- Généré dans `target/site/jacoco/`
- Pourcentage de couverture de code
- Lignes couvertes/non couvertes

## 🚨 **Résolution des Problèmes Courants**

### **1. Erreur de Connexion Base de Données**
```bash
# Vérifier que H2 est dans les dépendances
# Vérifier application-test.properties
```

### **2. Erreur de Sécurité**
```bash
# Vérifier les annotations @WithMockUser
# Vérifier la configuration Spring Security
```

### **3. Erreur de Mock**
```bash
# Vérifier les imports Mockito
# Vérifier la configuration @Mock et @InjectMocks
```

## 📚 **Bonnes Pratiques**

### **1. Nommage des Tests**
```java
@Test
@DisplayName("✅ [Action] [Condition] - [Résultat Attendu]")
void action_Condition_ExpectedResult() throws Exception {
    // Test implementation
}
```

### **2. Structure AAA (Arrange-Act-Assert)**
```java
@Test
void testMethod() throws Exception {
    // Arrange - Préparer les données
    when(service.method()).thenReturn(result);
    
    // Act - Exécuter l'action
    mockMvc.perform(get("/endpoint"));
    
    // Assert - Vérifier le résultat
    .andExpect(status().isOk());
}
```

### **3. Vérification des Mocks**
```java
verify(service).method(); // Vérifier que la méthode a été appelée
verify(service, times(2)).method(); // Vérifier le nombre d'appels
```

## 🔄 **Maintenance des Tests**

### **1. Ajouter de Nouveaux Tests**
```java
@Test
@DisplayName("✅ Nouveau scénario")
void newScenario_Success() throws Exception {
    // Implementation
}
```

### **2. Mettre à Jour les Tests Existants**
- Adapter aux changements d'API
- Mettre à jour les DTOs
- Ajuster les assertions

### **3. Nettoyer les Tests**
```bash
mvn clean test
```

## 📞 **Support et Contact**

Pour toute question sur les tests :
1. Vérifier la documentation Spring Boot Testing
2. Consulter les logs de test
3. Vérifier la configuration des DTOs et services

---

**🎯 Objectif :** Assurer la qualité et la fiabilité du backend SQLI grâce à une couverture de tests complète et maintenable.
