package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    // Récupérer tous les projets du client connecté
    @GetMapping("/projects")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<ProjectResponse>> getClientProjects() {
        List<ProjectResponse> projects = clientService.getClientProjects();
        return ResponseEntity.ok(projects);
    }

    // Récupérer un projet spécifique du client
    @GetMapping("/projects/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProjectResponse> getClientProject(@PathVariable Integer id) {
        ProjectResponse project = clientService.getClientProject(id);
        return ResponseEntity.ok(project);
    }

    // Récupérer les statistiques du dashboard client
    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Map<String, Object>> getClientDashboardStats() {
        Map<String, Object> stats = clientService.getClientDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // Récupérer la timeline des projets
    @GetMapping("/project-timeline")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getProjectTimeline() {
        List<Map<String, Object>> timeline = clientService.getProjectTimeline();
        return ResponseEntity.ok(timeline);
    }

    // Récupérer les tâches en retard
    @GetMapping("/overdue-tasks")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getOverdueTasks() {
        List<Map<String, Object>> overdueTasks = clientService.getOverdueTasks();
        return ResponseEntity.ok(overdueTasks);
    }

    // Récupérer les activités récentes
    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        List<Map<String, Object>> activities = clientService.getRecentActivity();
        return ResponseEntity.ok(activities);
    }
}
