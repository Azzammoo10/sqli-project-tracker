package com.sqli.stage.backendsqli;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sqli.stage.backendsqli.controller.AnalyticsController;
import com.sqli.stage.backendsqli.controller.ProjetController;
import com.sqli.stage.backendsqli.controller.TaskController;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.*;
import com.sqli.stage.backendsqli.dto.ProjectDTO.*;
import com.sqli.stage.backendsqli.dto.TaskDTO.*;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import com.sqli.stage.backendsqli.service.ProjetService;
import com.sqli.stage.backendsqli.service.Taskservice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests complets pour les contrôleurs Chef de Projet
 * Couvre Analytics, Projet et Task pour le rôle CHEF_DE_PROJET
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Chef de Projet - Gestion des Projets et Tâches")
class ChefProjetControllerTest {

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private ProjetService projetService;

    @Mock
    private Taskservice taskService;

    @InjectMocks
    private AnalyticsController analyticsController;

    @InjectMocks
    private ProjetController projetController;

    @InjectMocks
    private TaskController taskController;

    private MockMvc analyticsMockMvc;
    private MockMvc projetMockMvc;
    private MockMvc taskMockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        analyticsMockMvc = MockMvcBuilders.standaloneSetup(analyticsController).build();
        projetMockMvc = MockMvcBuilders.standaloneSetup(projetController).build();
        taskMockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    // ========================================
    // TESTS ANALYTICS CONTROLLER
    // ========================================

    @Test
    @DisplayName("✅ Récupérer les statistiques du dashboard chef")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getChefDashboardStats_Success() throws Exception {
        // Arrange
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", 5);
        stats.put("activeProjects", 3);
        stats.put("completedProjects", 2);
        stats.put("totalTasks", 25);
        stats.put("pendingTasks", 8);

        when(analyticsService.getChefDashboardStats()).thenReturn(stats);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProjects").value(5))
                .andExpect(jsonPath("$.activeProjects").value(3))
                .andExpect(jsonPath("$.totalTasks").value(25));

        verify(analyticsService).getChefDashboardStats();
    }

    @Test
    @DisplayName("✅ Récupérer l'activité récente")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getRecentActivity_Success() throws Exception {
        // Arrange
        List<Map<String, Object>> activities = Arrays.asList(
                Map.of("type", "TASK_CREATED", "description", "Nouvelle tâche créée", "date", "2024-01-15"),
                Map.of("type", "PROJECT_UPDATED", "description", "Projet mis à jour", "date", "2024-01-14")
        );

        when(analyticsService.getRecentActivity()).thenReturn(activities);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/recent-activity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].type").value("TASK_CREATED"))
                .andExpect(jsonPath("$[1].type").value("PROJECT_UPDATED"));

        verify(analyticsService).getRecentActivity();
    }

    @Test
    @DisplayName("✅ Récupérer la progression des projets")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getProjectProgress_Success() throws Exception {
        // Arrange
        List<ProgressResponse> progress = Arrays.asList(
                ProgressResponse.builder()
                        .titre("Projet A")
                        .completionPercentage(75.0)
                        .statut("EN_COURS")
                        .build(),
                ProgressResponse.builder()
                        .titre("Projet B")
                        .completionPercentage(100.0)
                        .statut("TERMINE")
                        .build()
        );

        when(analyticsService.getProjectProgress()).thenReturn(progress);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/project-progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].titre").value("Projet A"))
                .andExpect(jsonPath("$[0].completionPercentage").value(75.0));

        verify(analyticsService).getProjectProgress();
    }

    @Test
    @DisplayName("✅ Récupérer la répartition des statuts de tâches")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getTaskStatusDistribution_Success() throws Exception {
        // Arrange
        List<ChartData> distribution = Arrays.asList(
                ChartData.builder()
                        .label("À faire")
                        .value(10)
                        .build(),
                ChartData.builder()
                        .label("En cours")
                        .value(15)
                        .build(),
                ChartData.builder()
                        .label("Terminé")
                        .value(20)
                        .build()
        );

        when(analyticsService.getTaskStatusDistribution()).thenReturn(distribution);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/task-status-distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].label").value("À faire"))
                .andExpect(jsonPath("$[0].value").value(10));

        verify(analyticsService).getTaskStatusDistribution();
    }

    @Test
    @DisplayName("✅ Récupérer l'analyse de charge de travail")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getWorkloadAnalysis_Success() throws Exception {
        // Arrange
        List<WorkloadResponse> workload = Arrays.asList(
                WorkloadResponse.builder()
                        .userId(1)
                        .assignedTasks(5)
                        .completedTasks(3)
                        .inProgressTasks(2)
                        .blockedTasks(0)
                        .build(),
                WorkloadResponse.builder()
                        .userId(2)
                        .assignedTasks(3)
                        .completedTasks(2)
                        .inProgressTasks(1)
                        .blockedTasks(0)
                        .build()
        );

        when(analyticsService.getWorkloadAnalysis()).thenReturn(workload);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/workload-analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[0].assignedTasks").value(5));

        verify(analyticsService).getWorkloadAnalysis();
    }

    @Test
    @DisplayName("✅ Récupérer l'aperçu de l'équipe")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getTeamOverview_Success() throws Exception {
        // Arrange
        List<Map<String, Object>> team = Arrays.asList(
                Map.of("name", "Dev 1", "role", "DEVELOPPEUR", "availability", 90),
                Map.of("name", "Dev 2", "role", "DEVELOPPEUR", "availability", 75)
        );

        when(analyticsService.getTeamOverview()).thenReturn(team);

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/team-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Dev 1"))
                .andExpect(jsonPath("$[0].role").value("DEVELOPPEUR"));

        verify(analyticsService).getTeamOverview();
    }

    // ========================================
    // TESTS PROJET CONTROLLER
    // ========================================

    @Test
    @Disabled("Requires Spring Security context for Authentication - tested in IntegrationTest")
    @DisplayName("✅ Récupérer les projets du chef")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getProjectsByChef_Success() throws Exception {
        // Arrange
        List<ProjectResponse> projects = Arrays.asList(
                createProjectResponse(1, "Projet A", "Description du projet A", StatutProjet.EN_COURS, 75.0),
                createProjectResponse(2, "Projet B", "Description du projet B", StatutProjet.TERMINE, 100.0)
        );

        when(projetService.getProjectsByChef(anyString())).thenReturn(projects);

        // Act & Assert
        projetMockMvc.perform(get("/api/projects/chef/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].titre").value("Projet A"))
                .andExpect(jsonPath("$[0].statut").value("EN_COURS"))
                .andExpect(jsonPath("$[1].titre").value("Projet B"))
                .andExpect(jsonPath("$[1].statut").value("TERMINE"));

        verify(projetService).getProjectsByChef(anyString());
    }

    @Test
    @DisplayName("✅ Créer un nouveau projet")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void createProject_Success() throws Exception {
        // Arrange
        ProjectRequest request = new ProjectRequest();
        request.setTitre("Nouveau Projet");
        request.setDescription("Description du nouveau projet");
        request.setType(TypeProjet.Delivery);
        request.setDateDebut(LocalDate.now());
        request.setDateFin(LocalDate.now().plusMonths(3));
        request.setClientId(1);
        request.setStatut(StatutProjet.EN_COURS);

        ProjectResponse response = createProjectResponse(1, "Nouveau Projet", "Description du nouveau projet", StatutProjet.EN_COURS, 0.0);
        response.setType(TypeProjet.Delivery);

        when(projetService.createProject(any(ProjectRequest.class))).thenReturn(response);

        // Act & Assert
        projetMockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titre").value("Nouveau Projet"))
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        verify(projetService).createProject(any(ProjectRequest.class));
    }

    @Test
    @DisplayName("✅ Récupérer les statistiques des projets")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getProjectStats_Success() throws Exception {
        // Arrange
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalProjects(10)
                .activeProjects(5)
                .completedProjects(3)
                .lateProjects(2)
                .build();

        when(projetService.getProjectStats()).thenReturn(stats);

        // Act & Assert
        projetMockMvc.perform(get("/api/projects/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProjects").value(10))
                .andExpect(jsonPath("$.activeProjects").value(5))
                .andExpect(jsonPath("$.completedProjects").value(3));

        verify(projetService).getProjectStats();
    }

    // ========================================
    // TESTS TASK CONTROLLER
    // ========================================

    @Test
    @DisplayName("✅ Créer une nouvelle tâche")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void createTask_Success() throws Exception {
        // Arrange
        TaskRequest request = TaskRequest.builder()
                .titre("Nouvelle Tâche")
                .description("Description de la tâche")
                .priorite(Priorite.MOYENNE)
                .dateDebut(LocalDate.now())
                .dateFin(LocalDate.now().plusDays(7))
                .projectId(1)
                .developpeurId(2)
                .statut(StatutTache.NON_COMMENCE)
                .plannedHours(8)
                .build();

        TaskResponse response = createTaskResponse(1, "Nouvelle Tâche", "Description de la tâche", StatutTache.NON_COMMENCE, Priorite.MOYENNE);

        when(taskService.createTask(any(TaskRequest.class))).thenReturn(response);

        // Act & Assert
        taskMockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titre").value("Nouvelle Tâche"))
                .andExpect(jsonPath("$.statut").value("NON_COMMENCE"));

        verify(taskService).createTask(any(TaskRequest.class));
    }

    @Test
    @DisplayName("✅ Mettre à jour le statut d'une tâche")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void updateTaskStatus_Success() throws Exception {
        // Arrange
        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitre("Tâche Mise à Jour");
        updateRequest.setDescription("Description mise à jour");
        updateRequest.setStatut(StatutTache.EN_COURS);
        updateRequest.setPriorite(Priorite.MOYENNE);
        updateRequest.setDateDebut(LocalDate.now());
        updateRequest.setDateFin(LocalDate.now().plusDays(7));
        updateRequest.setProjectId(1);
        updateRequest.setDeveloppeurId(2);
        updateRequest.setPlannedHours(8);

        TaskResponse response = createTaskResponse(1, "Tâche Mise à Jour", "Description mise à jour", StatutTache.EN_COURS, Priorite.MOYENNE);

        when(taskService.updateTask(eq(1), any(TaskRequest.class))).thenReturn(response);

        // Act & Assert
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        verify(taskService).updateTask(eq(1), any(TaskRequest.class));
    }

    @Test
    @DisplayName("✅ Récupérer les tâches d'un projet")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void getTasksByProject_Success() throws Exception {
        // Arrange
        List<TaskResponse> tasks = Arrays.asList(
                createTaskResponse(1, "Tâche 1", "Description 1", StatutTache.NON_COMMENCE, Priorite.CRITIQUE),
                createTaskResponse(2, "Tâche 2", "Description 2", StatutTache.EN_COURS, Priorite.MOYENNE)
        );

        when(taskService.getTasksByProject(1)).thenReturn(tasks);

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].titre").value("Tâche 1"))
                .andExpect(jsonPath("$[0].priorite").value("CRITIQUE"))
                .andExpect(jsonPath("$[1].titre").value("Tâche 2"))
                .andExpect(jsonPath("$[1].statut").value("EN_COURS"));

        verify(taskService).getTasksByProject(1);
    }

    // ========================================
    // TESTS SÉCURITÉ ET AUTORISATION
    // ========================================

    @Test
    @Disabled("Requires Spring Security context - tested in IntegrationTest")
    @DisplayName("❌ Accès refusé sans rôle CHEF_DE_PROJET")
    void accessDenied_WithoutChefRole() throws Exception {
        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isForbidden());

        projetMockMvc.perform(get("/api/projects/chef/overview"))
                .andExpect(status().isForbidden());

        taskMockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @Disabled("Requires Spring Security context - tested in IntegrationTest")
    @DisplayName("❌ Accès refusé avec rôle insuffisant")
    @WithMockUser(roles = "DEVELOPPEUR")
    void accessDenied_InsufficientRole() throws Exception {
        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isForbidden());
    }

    // ========================================
    // TESTS VALIDATION ET ERREURS
    // ========================================

    @Test
    @Disabled("Requires Spring validation context - tested in IntegrationTest")
    @DisplayName("❌ Validation des champs obligatoires pour projet")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void validation_ProjectRequiredFields() throws Exception {
        // Arrange - Créer une requête sans champs obligatoires
        ProjectRequest request = new ProjectRequest();
        request.setTitre(""); // Titre vide
        request.setDescription(""); // Description vide

        // Act & Assert
        projetMockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Disabled("Requires Spring validation context - tested in IntegrationTest")
    @DisplayName("❌ Validation des champs obligatoires pour tâche")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void validation_TaskRequiredFields() throws Exception {
        // Arrange - Créer une requête sans champs obligatoires
        TaskRequest request = TaskRequest.builder()
                .titre("") // Titre vide
                .description("") // Description vide
                .build();

        // Act & Assert
        taskMockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Disabled("Requires GlobalExceptionHandler - tested in IntegrationTest")
    @DisplayName("❌ Gestion des erreurs de service")
    @WithMockUser(roles = "CHEF_DE_PROJET")
    void serviceError_Handling() throws Exception {
        // Arrange
        when(analyticsService.getChefDashboardStats()).thenThrow(new RuntimeException("Erreur interne"));

        // Act & Assert
        analyticsMockMvc.perform(get("/api/analytics/chef/dashboard-stats"))
                .andExpect(status().isInternalServerError());
    }

    // ========================================
    // MÉTHODES UTILITAIRES POUR CRÉER LES OBJETS
    // ========================================

    private ProjectResponse createProjectResponse(int id, String titre, String description, StatutProjet statut, double progression) {
        ProjectResponse response = new ProjectResponse();
        response.setId(id);
        response.setTitre(titre);
        response.setDescription(description);
        response.setStatut(statut);
        response.setProgression(BigDecimal.valueOf(progression));
        response.setClientName("Client Test");
        response.setDateDebut(LocalDate.now());
        response.setDateFin(LocalDate.now().plusMonths(3));
        response.setType(TypeProjet.Delivery);
        return response;
    }

    private TaskResponse createTaskResponse(int id, String titre, String description, StatutTache statut, Priorite priorite) {
        TaskResponse response = new TaskResponse();
        response.setId(id);
        response.setTitre(titre);
        response.setDescription(description);
        response.setStatut(statut);
        response.setPriorite(priorite);
        response.setDateDebut(LocalDate.now());
        response.setDateFin(LocalDate.now().plusDays(7));
        response.setProjectTitre("Projet Test");
        response.setDeveloppeurUsername("dev.test");
        return response;
    }
}
