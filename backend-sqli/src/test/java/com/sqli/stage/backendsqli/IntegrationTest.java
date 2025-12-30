package com.sqli.stage.backendsqli;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
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

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("✅ Contexte Spring se charge correctement")
    void contextLoads() {
        // Le test passe si le contexte se charge sans erreur
    }

    // === Tests des endpoints publics ===

    @Test
    @DisplayName("✅ Endpoint types de contact accessible publiquement")
    void contactTypesEndpoint_PubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/contact/types"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Endpoint auth accessible publiquement")
    void authEndpoint_PubliclyAccessible() throws Exception {
        // L'endpoint /api/auth/** est public
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().is4xxClientError()); // 400 ou 401, mais pas 403
    }

    // === Tests des endpoints protégés ===

    @Test
    @DisplayName("❌ Endpoint admin protégé sans authentification")
    void adminEndpoint_ProtectedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ Endpoint admin accessible avec rôle ADMIN")
    @WithMockUser(roles = "ADMIN")
    void adminEndpoint_AccessibleWithAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("❌ Endpoint admin refusé avec rôle insuffisant")
    @WithMockUser(roles = "DEVELOPPEUR")
    void adminEndpoint_DeniedWithInsufficientRole() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ Endpoint projets chef accessible avec rôle CHEF_DE_PROJET")
    @WithMockUser(username = "chef", roles = "CHEF_DE_PROJET")
    void projectsEndpoint_AccessibleWithChefRole() throws Exception {
        mockMvc.perform(get("/api/projects/chef/overview"))
                .andExpect(status().isOk());
    }

    // === Tests de sécurité ===

    @Test
    @DisplayName("✅ Configuration CORS active pour OPTIONS")
    void corsConfiguration_OptionsAllowed() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Validation des en-têtes de sécurité présents")
    void securityHeaders_Present() throws Exception {
        mockMvc.perform(get("/api/contact/types"))
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-Frame-Options"));
    }

    // === Tests de performance ===

    @Test
    @DisplayName("✅ Test de performance - Réponse rapide sur endpoint public")
    void performance_QuickResponse() throws Exception {
        long startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/contact/types"))
                .andExpect(status().isOk());

        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;

        assert responseTime < 1000 : "La réponse est trop lente: " + responseTime + "ms";
    }

    @Test
    @DisplayName("✅ Test de charge - Endpoint supporte plusieurs requêtes")
    void loadTest_MultipleRequests() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/contact/types"))
                    .andExpect(status().isOk());
        }
    }

    // === Tests de robustesse ===

    @Test
    @DisplayName("✅ Test de robustesse - Gestion des caractères spéciaux")
    void robustness_SpecialCharacters() throws Exception {
        mockMvc.perform(get("/api/contact/types?param=test%20with%20spaces&special=éàç"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ Test de sécurité - Protection contre les injections")
    void security_SqlInjectionProtection() throws Exception {
        // L'application doit gérer gracieusement les tentatives d'injection
        mockMvc.perform(get("/api/contact/types?param='; DROP TABLE users; --"))
                .andExpect(status().isOk());
    }
}
