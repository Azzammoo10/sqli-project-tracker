package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ProjetRepository projectRepository;
    private final TaskRepository taskRepository;

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
        return ResponseEntity.ok(analyticsService.getDetailedTeamOverview());
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
