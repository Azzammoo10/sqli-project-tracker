package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;

import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ProjetRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Endpoint pour les statistiques du dashboard chef de projet
    @GetMapping("/chef/dashboard-stats")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> getChefDashboardStats() {
        return ResponseEntity.ok(analyticsService.getChefDashboardStats());
    }

    // Endpoint pour l'activité récente
    @GetMapping("/chef/recent-activity")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        return ResponseEntity.ok(analyticsService.getRecentActivity());
    }

    // Endpoint pour la progression des projets
    @GetMapping("/chef/project-progress")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<ProgressResponse>> getProjectProgress() {
        return ResponseEntity.ok(analyticsService.getProjectProgress());
    }

    // Endpoint pour la répartition des statuts de tâches
    @GetMapping("/chef/task-status-distribution")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<ChartData>> getTaskStatusDistribution() {
        return ResponseEntity.ok(analyticsService.getTaskStatusDistribution());
    }

    // Endpoint pour l'analyse de charge de travail
    @GetMapping("/chef/workload-analysis")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<WorkloadResponse>> getWorkloadAnalysis() {
        return ResponseEntity.ok(analyticsService.getWorkloadAnalysis());
    }

    // Endpoint pour l'équipe du chef de projet
    @GetMapping("/chef/team-overview")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getTeamOverview() {
        return ResponseEntity.ok(analyticsService.getTeamOverview());
    }

    // Endpoint pour l'équipe détaillée du chef de projet
    @GetMapping("/chef/detailed-team-overview")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getDetailedTeamOverview() {
        try {
            System.out.println("=== CONTROLLER: Appel getDetailedTeamOverview ===");
            List<Map<String, Object>> result = analyticsService.getDetailedTeamOverview();
            System.out.println("=== CONTROLLER: Résultat obtenu, taille: " + result.size() + " ===");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("=== CONTROLLER: Erreur dans getDetailedTeamOverview: " + e.getMessage() + " ===");
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Endpoint pour réparer les données corrompues
    @PostMapping("/admin/repair-database")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> repairDatabase() {
        try {
            System.out.println("=== REPAIR DATABASE: Début de la réparation ===");
            
            Map<String, Object> repairResult = new HashMap<>();
            int repairedProjects = 0;
            int repairedTasks = 0;
            
            // 1. Nettoyer les références aux utilisateurs supprimés dans les projets
            List<Project> allProjects = projectRepository.findAll();
            for (Project project : allProjects) {
                if (project.getDeveloppeurs() != null) {
                    // Filtrer les développeurs qui n'existent plus ou sont désactivés
                    List<User> validDevelopers = project.getDeveloppeurs().stream()
                        .filter(dev -> dev != null && dev.getId() != null)
                        .collect(Collectors.toList());
                    
                    if (validDevelopers.size() != project.getDeveloppeurs().size()) {
                        project.setDeveloppeurs(validDevelopers);
                        projectRepository.save(project);
                        repairedProjects++;
                        System.out.println("Projet réparé: " + project.getTitre());
                    }
                }
            }
            
            // 2. Nettoyer les tâches avec des références invalides
            List<Task> allTasks = taskRepository.findAll();
            for (Task task : allTasks) {
                boolean needsRepair = false;
                
                if (task.getDeveloppeur() != null && task.getDeveloppeur().getId() == null) {
                    task.setDeveloppeur(null);
                    needsRepair = true;
                }
                
                if (needsRepair) {
                    taskRepository.save(task);
                    repairedTasks++;
                    System.out.println("Tâche réparée: " + task.getTitre());
                }
            }
            
            repairResult.put("repairedProjects", repairedProjects);
            repairResult.put("repairedTasks", repairedTasks);
            repairResult.put("message", "Base de données réparée avec succès");
            repairResult.put("timestamp", System.currentTimeMillis());
            
            System.out.println("=== REPAIR DATABASE: Réparation terminée ===");
            return ResponseEntity.ok(repairResult);
            
        } catch (Exception e) {
            System.out.println("=== REPAIR DATABASE: Erreur: " + e.getMessage() + " ===");
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    // Endpoint de debug pour diagnostiquer le problème d'équipe
    @GetMapping("/chef/debug-team")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> debugTeam() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = auth.getName();
            
            System.out.println("=== DEBUG TEAM: Utilisateur connecté: " + currentUsername + " ===");
            
            // Vérifier les projets créés par ce chef
            List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
            System.out.println("=== DEBUG TEAM: Projets trouvés: " + chefProjects.size() + " ===");
            
            // Détails des projets
            List<Map<String, Object>> projectDetails = chefProjects.stream().map(p -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", p.getId());
                detail.put("titre", p.getTitre());
                detail.put("createdBy", p.getCreatedBy() != null ? p.getCreatedBy().getUsername() : "null");
                detail.put("developpeurs", p.getDeveloppeurs() != null ? 
                    p.getDeveloppeurs().stream().map(u -> u.getUsername() + "(" + u.getRole() + ")").collect(Collectors.joining(", ")) : 
                    "aucun");
                return detail;
            }).collect(Collectors.toList());
            
            // Vérifier tous les projets dans la base
            List<Project> allProjects = projectRepository.findAll();
            List<Map<String, Object>> allProjectDetails = allProjects.stream().map(p -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", p.getId());
                detail.put("titre", p.getTitre());
                detail.put("createdBy", p.getCreatedBy() != null ? p.getCreatedBy().getUsername() : "null");
                detail.put("developpeurs", p.getDeveloppeurs() != null ? 
                    p.getDeveloppeurs().stream().map(u -> u.getUsername() + "(" + u.getRole() + ")").collect(Collectors.joining(", ")) : 
                    "aucun");
                return detail;
            }).collect(Collectors.toList());
            
            // Vérifier les utilisateurs avec le rôle DEVELOPPEUR
            List<User> developers = userRepository.findByRole(Role.DEVELOPPEUR);
            List<Map<String, Object>> developerDetails = developers.stream().map(d -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", d.getId());
                detail.put("username", d.getUsername());
                detail.put("enabled", d.isEnabled());
                detail.put("role", d.getRole().toString());
                return detail;
            }).collect(Collectors.toList());
            
            // NOUVEAU: Debug détaillé de getDetailedTeamOverview
            System.out.println("=== DEBUG TEAM: Test de getDetailedTeamOverview ===");
            List<Map<String, Object>> detailedTeam = analyticsService.getDetailedTeamOverview();
            System.out.println("=== DEBUG TEAM: Résultat getDetailedTeamOverview: " + detailedTeam.size() + " ===");
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("currentUsername", currentUsername);
            debugInfo.put("chefProjects", projectDetails);
            debugInfo.put("allProjects", allProjectDetails);
            debugInfo.put("developers", developerDetails);
            debugInfo.put("detailedTeamSize", detailedTeam.size());
            debugInfo.put("detailedTeamResult", detailedTeam);
            debugInfo.put("message", "Debug terminé");
            debugInfo.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            System.out.println("=== DEBUG TEAM: Erreur: " + e.getMessage() + " ===");
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    // Endpoint de test public pour diagnostiquer la base de données
    @GetMapping("/public/test-database")
    public ResponseEntity<Map<String, Object>> testDatabase() {
        try {
            System.out.println("=== TEST DATABASE: Vérification de la base de données ===");
            
            Map<String, Object> testResult = new HashMap<>();
            
            // 1. Compter tous les utilisateurs
            long totalUsers = userRepository.count();
            testResult.put("totalUsers", totalUsers);
            System.out.println("Total utilisateurs: " + totalUsers);
            
            // 2. Compter tous les projets
            long totalProjects = projectRepository.count();
            testResult.put("totalProjects", totalProjects);
            System.out.println("Total projets: " + totalProjects);
            
            // 3. Compter toutes les tâches
            long totalTasks = taskRepository.count();
            testResult.put("totalTasks", totalTasks);
            System.out.println("Total tâches: " + totalTasks);
            
            // 4. Vérifier les projets avec des développeurs
            List<Project> projectsWithDevs = projectRepository.findAll().stream()
                .filter(p -> p.getDeveloppeurs() != null && !p.getDeveloppeurs().isEmpty())
                .collect(Collectors.toList());
            testResult.put("projectsWithDevelopers", projectsWithDevs.size());
            System.out.println("Projets avec développeurs: " + projectsWithDevs.size());
            
            // 5. Détails des projets avec développeurs
            List<Map<String, Object>> projectDetails = projectsWithDevs.stream().map(p -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", p.getId());
                detail.put("titre", p.getTitre());
                detail.put("createdBy", p.getCreatedBy() != null ? p.getCreatedBy().getUsername() : "null");
                detail.put("developpeurs", p.getDeveloppeurs().stream()
                    .map(u -> u.getUsername() + "(" + u.getRole() + ")")
                    .collect(Collectors.joining(", ")));
                return detail;
            }).collect(Collectors.toList());
            testResult.put("projectDetails", projectDetails);
            
            // 6. Vérifier les utilisateurs avec rôle CHEF_DE_PROJET
            List<User> chefs = userRepository.findByRole(Role.CHEF_DE_PROJET);
            testResult.put("totalChefs", chefs.size());
            testResult.put("chefUsernames", chefs.stream().map(User::getUsername).collect(Collectors.toList()));
            System.out.println("Chefs de projet: " + chefs.size());
            
            // 7. Vérifier les utilisateurs avec rôle DEVELOPPEUR
            List<User> developers = userRepository.findByRole(Role.DEVELOPPEUR);
            testResult.put("totalDevelopers", developers.size());
            testResult.put("developerUsernames", developers.stream().map(User::getUsername).collect(Collectors.toList()));
            System.out.println("Développeurs: " + developers.size());
            
            testResult.put("message", "Test de base de données terminé");
            testResult.put("timestamp", System.currentTimeMillis());
            
            System.out.println("=== TEST DATABASE: Test terminé ===");
            return ResponseEntity.ok(testResult);
            
        } catch (Exception e) {
            System.out.println("=== TEST DATABASE: Erreur: " + e.getMessage() + " ===");
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    // Endpoint pour les échéances à venir
    @GetMapping("/chef/upcoming-deadlines")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingDeadlines(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(analyticsService.getUpcomingDeadlines(days));
    }

    // Endpoint pour la performance de l'équipe
    @GetMapping("/chef/team-performance")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> getTeamPerformance() {
        return ResponseEntity.ok(analyticsService.getTeamPerformance());
    }

    // Endpoint pour les projets en retard
    @GetMapping("/chef/overdue-projects")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getOverdueProjects() {
        return ResponseEntity.ok(analyticsService.getOverdueProjects());
    }

    // Endpoint pour les tâches en retard
    @GetMapping("/chef/overdue-tasks")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getOverdueTasks() {
        return ResponseEntity.ok(analyticsService.getOverdueTasks());
    }

    // Endpoint pour les données de tendance (completion rate)
    @GetMapping("/completion-rate")
    public ResponseEntity<List<ChartData>> getCompletionRate() {
        return ResponseEntity.ok(analyticsService.getCompletionRateData());
    }

    // Endpoint pour les projets build (existant)
    @GetMapping("/projects/build")
    public ResponseEntity<List<Map<String, Object>>> getBuildProjects() {
        return ResponseEntity.ok(analyticsService.getBuildProjects());
    }

    // Endpoint pour le dashboard équipe (existant)
    @GetMapping("/dashboard/team")
    public ResponseEntity<List<Map<String, Object>>> getDashboardTeam() {
        return ResponseEntity.ok(analyticsService.getDashboardTeam());
    }

    @GetMapping("/chef/debug-data")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> getDebugData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Map<String, Object> debugData = new HashMap<>();
        debugData.put("currentUser", username);
        
        // Récupérer les projets du chef connecté
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(username);
        debugData.put("totalProjects", chefProjects.size());
        debugData.put("projects", chefProjects.stream().map(p -> Map.of(
            "id", p.getId(),
            "titre", p.getTitre(),
            "statut", p.getStatut(),
            "progression", p.getProgression()
        )).collect(Collectors.toList()));
        
        // Récupérer toutes les tâches de ces projets
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        if (!projectIds.isEmpty()) {
            List<Task> allTasks = taskRepository.findByProjectIdIn(projectIds);
            debugData.put("totalTasks", allTasks.size());
            debugData.put("tasks", allTasks.stream().map(t -> Map.of(
                "id", t.getId(),
                "titre", t.getTitre(),
                "statut", t.getStatut(),
                "projectId", t.getProject().getId()
            )).collect(Collectors.toList()));
            
            // Compter par statut
            Map<StatutTache, Long> taskStatusCount = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getStatut, Collectors.counting()));
            debugData.put("taskStatusCount", taskStatusCount);
        } else {
            debugData.put("totalTasks", 0);
            debugData.put("tasks", new ArrayList<>());
            debugData.put("taskStatusCount", new HashMap<>());
        }
        
        return ResponseEntity.ok(debugData);
    }
}
