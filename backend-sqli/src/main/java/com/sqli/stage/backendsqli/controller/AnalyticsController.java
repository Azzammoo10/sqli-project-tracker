package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.BuildProjectDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TeamDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TmaProjectDashboardResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import com.sqli.stage.backendsqli.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ProjetRepository projetRepository;
    private final TaskRepository taskRepository;


    @GetMapping("/overview")
    public ResponseEntity<DashboardStatsResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    // --- Chef de projet scoped KPIs ---
    @GetMapping("/chef/{username}/kpis")
    public ResponseEntity<DashboardStatsResponse> getChefKpis(@PathVariable String username) {
        // réutilise getDashboardStats pour l'instant; peut être affiné côté service si besoin de scoper
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/chef/{username}/task-status")
    public ResponseEntity<java.util.Map<com.sqli.stage.backendsqli.entity.Enums.StatutTache, Long>> getChefTaskStatus(@PathVariable String username) {
        // Pour l'instant, renvoie les stats globales via le service tasks (peut être spécialisé plus tard)
        return ResponseEntity.ok(analyticsService.getDashboardStats() != null
                ? taskRepository.findAll().stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                        com.sqli.stage.backendsqli.entity.Task::getStatut,
                        java.util.stream.Collectors.counting()
                    ))
                : java.util.Collections.emptyMap());
    }

    @GetMapping("/project-progress/{projectId}")
    public ResponseEntity<ProgressResponse> getProjectProgress(@PathVariable int projectId) {
        return ResponseEntity.ok(analyticsService.getProjectProgress(projectId));
    }

    @GetMapping("/workload/{userId}")
    public ResponseEntity<WorkloadResponse> getUserWorkload(@PathVariable int userId) {
        return ResponseEntity.ok(analyticsService.getWorkloadForUser(userId));
    }

    @GetMapping("/completion-rate")
    public ResponseEntity<List<ChartData>> getCompletionRate() {
        return ResponseEntity.ok(analyticsService.getCompletionRateOverTime());
    }

    @GetMapping("/projects/build")
    public ResponseEntity<List<BuildProjectDashboardResponse>> getBuildProjectsDashboard() {
        List<Project> projects = projetRepository.findBuildProjects();

        List<BuildProjectDashboardResponse> response = projects.stream().map(p -> {
            int total = taskRepository.countByProjectId(p.getId()).intValue();
            int done = taskRepository.countByProjectIdAndStatut(p.getId(), StatutTache.TERMINE);
            double rate = total > 0 ? (done * 100.0) / total : 0;

            return BuildProjectDashboardResponse.builder()
                    .projectId(p.getId())
                    .titre(p.getTitre())
                    .completionRate(rate)
                    .totalTasks(total)
                    .completedTasks(done)
                    .build();
        }).toList();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/dashboard/team")
    public ResponseEntity<List<TeamDashboardResponse>> getTeamDashboard() {
        return ResponseEntity.ok(analyticsService.getTeamDashboard());
    }


    @GetMapping("/projects/tma")
    public ResponseEntity<List<TmaProjectDashboardResponse>> getTmaProjectsDashboard() {
        return ResponseEntity.ok(analyticsService.getTmaDashboard());
    }


}
