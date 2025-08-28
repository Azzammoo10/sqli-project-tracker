package com.sqli.stage.backendsqli;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqli.stage.backendsqli.controller.TaskController;
import com.sqli.stage.backendsqli.controller.ProjetController;
import com.sqli.stage.backendsqli.dto.ProjectDTO.*;
import com.sqli.stage.backendsqli.dto.TaskDTO.*;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.service.Taskservice;
import com.sqli.stage.backendsqli.service.ProjetService;
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

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests complets pour les contrôleurs Développeur
 * Couvre Task et Projet pour le rôle DEVELOPPEUR
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Développeur - Gestion des Tâches et Projets")
class DeveloperControllerTest {

    @Mock
    private Taskservice taskService;

    @Mock
    private ProjetService projetService;

    @InjectMocks
    private TaskController taskController;

    @InjectMocks
    private ProjetController projetController;

    private MockMvc taskMockMvc;
    private MockMvc projetMockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        taskMockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
        projetMockMvc = MockMvcBuilders.standaloneSetup(projetController).build();
        objectMapper = new ObjectMapper();
    }

    // ========================================
    // TESTS TASK CONTROLLER - DÉVELOPPEUR
    // ========================================

    @Test
    @DisplayName("✅ Récupérer les tâches assignées au développeur")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getAssignedTasks_Success() throws Exception {
        // Arrange
        List<TaskResponse> tasks = Arrays.asList(
                createTaskResponse(1, "Tâche 1", "Description de la tâche 1", StatutTache.NON_COMMENCE, Priorite.CRITIQUE),
                createTaskResponse(2, "Tâche 2", "Description de la tâche 2", StatutTache.EN_COURS, Priorite.MOYENNE)
        );

        when(taskService.getTasksForCurrentUser()).thenReturn(tasks);

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/my-tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].titre").value("Tâche 1"))
                .andExpect(jsonPath("$[0].statut").value("NON_COMMENCE"))
                .andExpect(jsonPath("$[0].priorite").value("CRITIQUE"))
                .andExpect(jsonPath("$[1].titre").value("Tâche 2"))
                .andExpect(jsonPath("$[1].statut").value("EN_COURS"));

        verify(taskService).getTasksForCurrentUser();
    }

    @Test
    @DisplayName("✅ Mettre à jour le statut d'une tâche")
    @WithMockUser(roles = "DEVELOPPEUR")
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

        when(taskService.updateTask(1, any(TaskRequest.class))).thenReturn(response);

        // Act & Assert
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        verify(taskService).updateTask(1, any(TaskRequest.class));
    }

    @Test
    @DisplayName("✅ Marquer une tâche comme terminée")
    @WithMockUser(roles = "DEVELOPPEUR")
    void completeTask_Success() throws Exception {
        // Arrange
        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitre("Tâche Terminée");
        updateRequest.setDescription("Description terminée");
        updateRequest.setStatut(StatutTache.TERMINE);
        updateRequest.setPriorite(Priorite.MOYENNE);
        updateRequest.setDateDebut(LocalDate.now());
        updateRequest.setDateFin(LocalDate.now().plusDays(7));
        updateRequest.setProjectId(1);
        updateRequest.setDeveloppeurId(2);
        updateRequest.setPlannedHours(8);

        TaskResponse response = createTaskResponse(1, "Tâche Terminée", "Description terminée", StatutTache.TERMINE, Priorite.MOYENNE);

        when(taskService.updateTask(1, any(TaskRequest.class))).thenReturn(response);

        // Act & Assert
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("TERMINE"));

        verify(taskService).updateTask(1, any(TaskRequest.class));
    }

    @Test
    @DisplayName("✅ Récupérer les détails d'une tâche")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getTaskDetails_Success() throws Exception {
        // Arrange
        TaskResponse task = createTaskResponse(1, "Tâche Détaillée", "Description complète de la tâche", StatutTache.EN_COURS, Priorite.CRITIQUE);

        when(taskService.getTaskById(1)).thenReturn(task);

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titre").value("Tâche Détaillée"))
                .andExpect(jsonPath("$.description").value("Description complète de la tâche"))
                .andExpect(jsonPath("$.priorite").value("CRITIQUE"));

        verify(taskService).getTaskById(1);
    }

    @Test
    @DisplayName("✅ Récupérer les tâches par statut")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getTasksByStatus_Success() throws Exception {
        // Arrange
        List<TaskResponse> tasks = Arrays.asList(
                createTaskResponse(1, "Tâche À Faire", "Description 1", StatutTache.NON_COMMENCE, Priorite.MOYENNE),
                createTaskResponse(2, "Tâche En Cours", "Description 2", StatutTache.EN_COURS, Priorite.MOYENNE)
        );

        when(taskService.getTasksByStatus(StatutTache.NON_COMMENCE)).thenReturn(tasks);

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/status/NON_COMMENCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].statut").value("NON_COMMENCE"))
                .andExpect(jsonPath("$[1].statut").value("EN_COURS"));

        verify(taskService).getTasksByStatus(StatutTache.NON_COMMENCE);
    }

    // ========================================
    // TESTS PROJET CONTROLLER - DÉVELOPPEUR
    // ========================================

    @Test
    @DisplayName("✅ Récupérer les projets du développeur")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getMyProjects_Success() throws Exception {
        // Arrange
        List<ProjectResponse> projects = Arrays.asList(
                createProjectResponse(1, "Projet A", "Description du projet A", StatutProjet.EN_COURS, 60.0),
                createProjectResponse(2, "Projet B", "Description du projet B", StatutProjet.TERMINE, 100.0)
        );

        when(projetService.getProjectsForCurrentUser()).thenReturn(projects);

        // Act & Assert
        projetMockMvc.perform(get("/api/projects/my-projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].titre").value("Projet A"))
                .andExpect(jsonPath("$[0].statut").value("EN_COURS"))
                .andExpect(jsonPath("$[0].progression").value(60.0))
                .andExpect(jsonPath("$[1].titre").value("Projet B"))
                .andExpect(jsonPath("$[1].statut").value("TERMINE"));

        verify(projetService).getProjectsForCurrentUser();
    }

    @Test
    @DisplayName("✅ Récupérer les détails d'un projet")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getProjectDetails_Success() throws Exception {
        // Arrange
        ProjectResponse project = createProjectResponse(1, "Projet Détaillé", "Description complète du projet", StatutProjet.EN_COURS, 75.0);
        project.setType(TypeProjet.Delivery);

        when(projetService.getProjectById(1)).thenReturn(project);

        // Act & Assert
        projetMockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titre").value("Projet Détaillé"))
                .andExpect(jsonPath("$.description").value("Description complète du projet"))
                .andExpect(jsonPath("$.progression").value(75.0));

        verify(projetService).getProjectById(1);
    }

    // ========================================
    // TESTS SÉCURITÉ ET AUTORISATION
    // ========================================

    @Test
    @DisplayName("❌ Accès refusé sans rôle DEVELOPPEUR")
    void accessDenied_WithoutDeveloperRole() throws Exception {
        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/my-tasks"))
                .andExpect(status().isForbidden());

        projetMockMvc.perform(get("/api/projects/my-projects"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("❌ Accès refusé avec rôle insuffisant")
    @WithMockUser(roles = "CLIENT")
    void accessDenied_InsufficientRole() throws Exception {
        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/my-tasks"))
                .andExpect(status().isForbidden());
    }

    // ========================================
    // TESTS VALIDATION ET ERREURS
    // ========================================

    @Test
    @DisplayName("❌ Validation des champs obligatoires pour mise à jour tâche")
    @WithMockUser(roles = "DEVELOPPEUR")
    void validation_TaskUpdateRequiredFields() throws Exception {
        // Arrange - Créer une requête sans champs obligatoires
        TaskRequest request = new TaskRequest();
        // Pas de statut défini

        // Act & Assert
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("❌ Gestion des erreurs de service")
    @WithMockUser(roles = "DEVELOPPEUR")
    void serviceError_Handling() throws Exception {
        // Arrange
        when(taskService.getTasksForCurrentUser()).thenThrow(new RuntimeException("Erreur interne"));

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/my-tasks"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("❌ Tâche non trouvée")
    @WithMockUser(roles = "DEVELOPPEUR")
    void taskNotFound_Handling() throws Exception {
        // Arrange
        when(taskService.getTaskById(999)).thenThrow(new RuntimeException("Tâche non trouvée"));

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isInternalServerError());
    }

    // ========================================
    // TESTS SCÉNARIOS MÉTIER
    // ========================================

    @Test
    @DisplayName("✅ Workflow complet : Tâche NON_COMMENCE → EN_COURS → TERMINE")
    @WithMockUser(roles = "DEVELOPPEUR")
    void completeTaskWorkflow_Success() throws Exception {
        // Arrange - Étape 1: Récupérer la tâche
        TaskResponse initialTask = createTaskResponse(1, "Tâche Workflow", "Description workflow", StatutTache.NON_COMMENCE, Priorite.MOYENNE);

        when(taskService.getTaskById(1)).thenReturn(initialTask);

        // Act & Assert - Étape 1: Vérifier l'état initial
        taskMockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("NON_COMMENCE"));

        // Arrange - Étape 2: Mettre en cours
        TaskRequest startRequest = new TaskRequest();
        startRequest.setTitre("Tâche Workflow");
        startRequest.setDescription("Description workflow");
        startRequest.setStatut(StatutTache.EN_COURS);
        startRequest.setPriorite(Priorite.MOYENNE);
        startRequest.setDateDebut(LocalDate.now());
        startRequest.setDateFin(LocalDate.now().plusDays(7));
        startRequest.setProjectId(1);
        startRequest.setDeveloppeurId(2);
        startRequest.setPlannedHours(8);

        TaskResponse inProgressTask = createTaskResponse(1, "Tâche Workflow", "Description workflow", StatutTache.EN_COURS, Priorite.MOYENNE);

        when(taskService.updateTask(1, any(TaskRequest.class))).thenReturn(inProgressTask);

        // Act & Assert - Étape 2: Mettre en cours
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        // Arrange - Étape 3: Terminer
        TaskRequest completeRequest = new TaskRequest();
        completeRequest.setTitre("Tâche Workflow");
        completeRequest.setDescription("Description workflow");
        completeRequest.setStatut(StatutTache.TERMINE);
        completeRequest.setPriorite(Priorite.MOYENNE);
        completeRequest.setDateDebut(LocalDate.now());
        completeRequest.setDateFin(LocalDate.now().plusDays(7));
        completeRequest.setProjectId(1);
        completeRequest.setDeveloppeurId(2);
        completeRequest.setPlannedHours(8);

        TaskResponse completedTask = createTaskResponse(1, "Tâche Workflow", "Description workflow", StatutTache.TERMINE, Priorite.MOYENNE);

        when(taskService.updateTask(1, any(TaskRequest.class))).thenReturn(completedTask);

        // Act & Assert - Étape 3: Terminer
        taskMockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("TERMINE"));

        // Vérifications
        verify(taskService, times(1)).getTaskById(1);
        verify(taskService, times(2)).updateTask(eq(1), any(TaskRequest.class));
    }

    @Test
    @DisplayName("✅ Récupérer les tâches urgentes (priorité CRITIQUE)")
    @WithMockUser(roles = "DEVELOPPEUR")
    void getHighPriorityTasks_Success() throws Exception {
        // Arrange
        List<TaskResponse> urgentTasks = Arrays.asList(
                createTaskResponse(1, "Tâche Urgente 1", "Description urgente 1", StatutTache.NON_COMMENCE, Priorite.CRITIQUE),
                createTaskResponse(2, "Tâche Urgente 2", "Description urgente 2", StatutTache.EN_COURS, Priorite.CRITIQUE)
        );

        when(taskService.getTasksByStatus(StatutTache.NON_COMMENCE)).thenReturn(urgentTasks);

        // Act & Assert
        taskMockMvc.perform(get("/api/tasks/status/NON_COMMENCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].priorite").value("CRITIQUE"))
                .andExpect(jsonPath("$[0].titre").value("Tâche Urgente 1"))
                .andExpect(jsonPath("$[1].priorite").value("CRITIQUE"))
                .andExpect(jsonPath("$[1].titre").value("Tâche Urgente 2"));

        verify(taskService).getTasksByStatus(StatutTache.NON_COMMENCE);
    }

    // ========================================
    // MÉTHODES UTILITAIRES POUR CRÉER LES OBJETS
    // ========================================

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

    private ProjectResponse createProjectResponse(int id, String titre, String description, StatutProjet statut, double progression) {
        ProjectResponse response = new ProjectResponse();
        response.setId(id);
        response.setTitre(titre);
        response.setDescription(description);
        response.setStatut(statut);
        response.setProgression(java.math.BigDecimal.valueOf(progression));
        response.setClientName("Client Test");
        response.setDateDebut(LocalDate.now());
        response.setDateFin(LocalDate.now().plusMonths(3));
        response.setType(TypeProjet.Delivery);
        return response;
    }
}
