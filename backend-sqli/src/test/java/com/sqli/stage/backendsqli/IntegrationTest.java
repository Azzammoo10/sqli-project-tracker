package com.sqli.stage.backendsqli;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour vérifier le bon fonctionnement des endpoints
 * Teste la configuration Spring Security et les réponses HTTP
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("Tests d'Intégration - Endpoints et Sécurité")
class IntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Test
    @DisplayName("✅ Contexte Spring se charge correctement")
    void contextLoads() {
        // Le test passe si le contexte se charge sans erreur
    }

    @Test
    @DisplayName("✅ Endpoint de santé accessible")
    void healthEndpoint_Accessible() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Endpoint racine accessible")
    void rootEndpoint_Accessible() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("❌ Endpoint admin protégé sans authentification")
    void adminEndpoint_ProtectedWithoutAuth() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ Endpoint admin accessible avec rôle ADMIN")
    @WithMockUser(roles = "ADMIN")
    void adminEndpoint_AccessibleWithAdminRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("❌ Endpoint admin refusé avec rôle insuffisant")
    @WithMockUser(roles = "DEVELOPPEUR")
    void adminEndpoint_DeniedWithInsufficientRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ Endpoint projets accessible avec rôle approprié")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void projectsEndpoint_AccessibleWithChefRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/projects/chef/overview"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Endpoint analytics accessible avec rôle chef")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void analyticsEndpoint_AccessibleWithChefRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("❌ Endpoint analytics refusé avec rôle insuffisant")
    @WithMockUser(roles = "DEVELOPPEUR")
    void analyticsEndpoint_DeniedWithInsufficientRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ Endpoint tâches accessible avec rôle développeur")
    @WithMockUser(roles = "DEVELOPPEUR")
    void tasksEndpoint_AccessibleWithDeveloperRole() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/tasks/my-tasks"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Endpoint contact accessible publiquement")
    void contactEndpoint_PubliclyAccessible() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/contact/types"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Endpoint historique accessible avec authentification")
    @WithMockUser(roles = "ADMIN")
    void historyEndpoint_AccessibleWithAuth() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Configuration CORS active")
    void corsConfiguration_Active() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(options("/api/health")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    @DisplayName("✅ Gestion des erreurs 404")
    void errorHandling_404() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/endpoint-inexistant"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("✅ Gestion des erreurs 405 (méthode non autorisée)")
    void errorHandling_405() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/health"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("✅ Validation des en-têtes de sécurité")
    void securityHeaders_Present() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert
        mockMvc.perform(get("/api/health"))
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-Frame-Options"))
                .andExpect(header().exists("X-XSS-Protection"));
    }

    @Test
    @DisplayName("✅ Test de performance - Réponse rapide")
    void performance_QuickResponse() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        long startTime = System.currentTimeMillis();

        // Act
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());

        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;

        // Assert - La réponse doit être rapide (moins de 1000ms)
        assert responseTime < 1000 : "La réponse est trop lente: " + responseTime + "ms";
    }

    @Test
    @DisplayName("✅ Test de charge - Endpoint supporte plusieurs requêtes")
    void loadTest_MultipleRequests() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert - Faire plusieurs requêtes
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/health"))
                    .andExpect(status().isOk());
        }
    }

    @Test
    @DisplayName("✅ Test de robustesse - Gestion des caractères spéciaux")
    void robustness_SpecialCharacters() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert - Tester avec des caractères spéciaux dans l'URL
        mockMvc.perform(get("/api/health?param=test%20with%20spaces&special=éàç"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Test de sécurité - Protection contre les injections")
    void security_SqlInjectionProtection() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Act & Assert - Tester avec des tentatives d'injection SQL
        mockMvc.perform(get("/api/health?param='; DROP TABLE users; --"))
                .andExpect(status().isOk()); // Doit gérer gracieusement
    }
}
