package com.sqli.stage.backendsqli;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqli.stage.backendsqli.controller.AdminController;
import com.sqli.stage.backendsqli.dto.*;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.TypeDepartment;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests complets pour AdminController
 * Couvre tous les endpoints et scénarios d'administration
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests AdminController - Gestion des Utilisateurs")
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        objectMapper = new ObjectMapper();
    }

    // ========================================
    // TESTS CRÉATION UTILISATEUR
    // ========================================

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
                .jobTitle("Développeur")
                .department(TypeDepartment.DEVELOPPEMENT)
                .build();

        UserResponse response = UserResponse.builder()
                .id(1)
                .username("test.user")
                .email("test@example.com")
                .role(Role.DEVELOPPEUR)
                .nom("Test")
                .jobTitle("Développeur")
                .department(TypeDepartment.DEVELOPPEMENT)
                .enabled(true)
                .build();

        when(adminService.createUser(any(CreateUserRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("test.user"))
                .andExpect(jsonPath("$.role").value("DEVELOPPEUR"));

        verify(adminService).createUser(any(CreateUserRequest.class));
    }

    @Test
    @DisplayName("❌ Créer un utilisateur avec données invalides")
    @WithMockUser(roles = "ADMIN")
    void createUser_InvalidData() throws Exception {
        // Arrange
        CreateUserRequest request = CreateUserRequest.builder()
                .nom("") // Nom vide
                .email("invalid-email") // Email invalide
                .motDePasse("") // Mot de passe vide
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("❌ Créer un utilisateur avec email déjà existant")
    @WithMockUser(roles = "ADMIN")
    void createUser_EmailAlreadyExists() throws Exception {
        // Arrange
        CreateUserRequest request = CreateUserRequest.builder()
                .nom("Test")
                .email("existing@example.com")
                .motDePasse("password123")
                .role(Role.DEVELOPPEUR)
                .build();

        when(adminService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new EmailAlreadyExistsException("Email déjà existant"));

        // Act & Assert
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    // ========================================
    // TESTS RÉCUPÉRATION UTILISATEURS
    // ========================================

    @Test
    @DisplayName("✅ Récupérer tous les utilisateurs")
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_Success() throws Exception {
        // Arrange
        List<UserResponse> users = Arrays.asList(
                UserResponse.builder().id(1).username("admin").role(Role.ADMIN).build(),
                UserResponse.builder().id(2).username("chef").role(Role.CHEF_DE_PROJET).build(),
                UserResponse.builder().id(3).username("dev").role(Role.DEVELOPPEUR).build()
        );

        when(adminService.getAllUsers()).thenReturn(users);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].username").value("admin"))
                .andExpect(jsonPath("$[1].username").value("chef"))
                .andExpect(jsonPath("$[2].username").value("dev"));

        verify(adminService).getAllUsers();
    }

    @Test
    @DisplayName("✅ Récupérer un utilisateur par ID")
    @WithMockUser(roles = "ADMIN")
    void getUserById_Success() throws Exception {
        // Arrange
        UserResponse user = UserResponse.builder()
                .id(1)
                .username("test.user")
                .email("test@example.com")
                .role(Role.DEVELOPPEUR)
                .build();

        when(adminService.getUserById(1)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("test.user"));

        verify(adminService).getUserById(1);
    }

    @Test
    @DisplayName("❌ Récupérer un utilisateur inexistant")
    @WithMockUser(roles = "ADMIN")
    void getUserById_NotFound() throws Exception {
        // Arrange
        when(adminService.getUserById(999)).thenThrow(new ResourceNotFoundException("Utilisateur non trouvé"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("✅ Récupérer les utilisateurs par rôle")
    @WithMockUser(roles = "ADMIN")
    void getUsersByRole_Success() throws Exception {
        // Arrange
        List<UserResponse> developers = Arrays.asList(
                UserResponse.builder().id(1).username("dev1").role(Role.DEVELOPPEUR).build(),
                UserResponse.builder().id(2).username("dev2").role(Role.DEVELOPPEUR).build()
        );

        when(adminService.getAllUsers()).thenReturn(developers);

        // Act & Assert
        mockMvc.perform(get("/api/admin/users/by-role/DEVELOPPEUR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("DEVELOPPEUR"))
                .andExpect(jsonPath("$[1].role").value("DEVELOPPEUR"));
    }

    // ========================================
    // TESTS MISE À JOUR UTILISATEUR
    // ========================================

    @Test
    @DisplayName("✅ Mettre à jour un utilisateur avec succès")
    @WithMockUser(roles = "ADMIN")
    void updateUser_Success() throws Exception {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@example.com");
        request.setDepartment(TypeDepartment.MANAGEMENT);
        request.setJobTitle("Manager");
        request.setEnabled(false);

        UserResponse response = UserResponse.builder()
                .id(1)
                .username("test.user")
                .email("updated@example.com")
                .department(TypeDepartment.MANAGEMENT)
                .jobTitle("Manager")
                .enabled(false)
                .build();

        when(adminService.updateUser(1, request)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"))
                .andExpect(jsonPath("$.department").value("MANAGEMENT"))
                .andExpect(jsonPath("$.enabled").value(false));

        verify(adminService).updateUser(1, request);
    }

    @Test
    @DisplayName("✅ Assigner un rôle à un utilisateur")
    @WithMockUser(roles = "ADMIN")
    void assignRole_Success() throws Exception {
        // Arrange
        UserResponse response = UserResponse.builder()
                .id(1)
                .username("test.user")
                .role(Role.CHEF_DE_PROJET)
                .build();

        when(adminService.assignRole(1, Role.CHEF_DE_PROJET)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1/role")
                        .param("role", "CHEF_DE_PROJET"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CHEF_DE_PROJET"));

        verify(adminService).assignRole(1, Role.CHEF_DE_PROJET);
    }

    // ========================================
    // TESTS ACTIVATION/DÉSACTIVATION
    // ========================================

    @Test
    @DisplayName("✅ Désactiver un utilisateur")
    @WithMockUser(roles = "ADMIN")
    void disableUser_Success() throws Exception {
        // Arrange
        UserResponse response = UserResponse.builder()
                .id(1)
                .username("test.user")
                .enabled(false)
                .build();

        when(adminService.disableUser(1)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        verify(adminService).disableUser(1);
    }

    @Test
    @DisplayName("✅ Activer un utilisateur")
    @WithMockUser(roles = "ADMIN")
    void enableUser_Success() throws Exception {
        // Arrange
        UserResponse response = UserResponse.builder()
                .id(1)
                .username("test.user")
                .enabled(true)
                .build();

        when(adminService.enableUser(1)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/admin/users/1/enable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));

        verify(adminService).enableUser(1);
    }

    // ========================================
    // TESTS SUPPRESSION
    // ========================================

    @Test
    @DisplayName("✅ Supprimer un utilisateur")
    @WithMockUser(roles = "ADMIN")
    void deleteUser_Success() throws Exception {
        // Arrange
        doNothing().when(adminService).deleteUser(1);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/users/1"))
                .andExpect(status().isNoContent());

        verify(adminService).deleteUser(1);
    }

    // ========================================
    // TESTS CRÉATION ADMIN
    // ========================================

    @Test
    @DisplayName("✅ Créer un nouvel administrateur")
    @WithMockUser(roles = "ADMIN")
    void createAdmin_Success() throws Exception {
        // Arrange
        CreateAdminDTO request = new CreateAdminDTO();
        request.setNom("New");
        request.setEmail("admin@example.com");
        request.setMotDePasse("admin123");

        UserResponse response = UserResponse.builder()
                .id(2)
                .username("new.admin")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .nom("New")
                .build();

        when(adminService.createNewAdmin(request)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/admin/users/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("new.admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(adminService).createNewAdmin(request);
    }

    // ========================================
    // TESTS SÉCURITÉ ET AUTORISATION
    // ========================================

    @Test
    @DisplayName("❌ Accès refusé sans rôle ADMIN")
    void accessDenied_WithoutAdminRole() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("❌ Accès refusé avec rôle insuffisant")
    @WithMockUser(roles = "DEVELOPPEUR")
    void accessDenied_InsufficientRole() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    // ========================================
    // TESTS VALIDATION ET ERREURS
    // ========================================

    @Test
    @DisplayName("❌ Validation des champs obligatoires")
    @WithMockUser(roles = "ADMIN")
    void validation_RequiredFields() throws Exception {
        // Arrange - Créer une requête sans champs obligatoires
        CreateUserRequest request = CreateUserRequest.builder()
                .nom("") // Nom vide
                .email("") // Email vide
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("❌ Gestion des erreurs de service")
    @WithMockUser(roles = "ADMIN")
    void serviceError_Handling() throws Exception {
        // Arrange
        when(adminService.getAllUsers()).thenThrow(new RuntimeException("Erreur interne"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isInternalServerError());
    }
}
