package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.TaskDTO.*;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.service.Taskservice;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final Taskservice taskService;

    // Endpoint pour obtenir les tâches prioritaires du chef de projet
    @GetMapping("/chef/priority")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<TaskResponse>> getPriorityTasks() {
        // Pour l'instant, retourner toutes les tâches
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Endpoint pour obtenir les tâches en retard
    @GetMapping("/chef/overdue")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks() {
        return ResponseEntity.ok(taskService.getLateTasks());
    }

    // Endpoint pour obtenir toutes les tâches
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DE_PROJET', 'DEVELOPPEUR')")
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Endpoint pour obtenir les tâches de l'utilisateur connecté
    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('CHEF_DE_PROJET', 'DEVELOPPEUR')")
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        return ResponseEntity.ok(taskService.getTasksForCurrentUser());
    }

    // Endpoint pour obtenir une tâche par ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable int id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Endpoint pour créer une tâche
    @PostMapping
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    // Endpoint pour mettre à jour une tâche
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable int id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    // Endpoint pour supprimer une tâche
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> deleteTask(@PathVariable int id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint pour obtenir les tâches par projet
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable int projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    // Endpoint pour obtenir les tâches par développeur
    @GetMapping("/developer/{developerId}")
    public ResponseEntity<List<TaskResponse>> getTasksByDeveloper(@PathVariable int developerId) {
        return ResponseEntity.ok(taskService.getTasksByUser(developerId));
    }

    // Endpoint pour obtenir les tâches par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(@PathVariable StatutTache status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    // Endpoint pour filtrer les tâches
    @PostMapping("/filter")
    public ResponseEntity<List<TaskResponse>> filterTasks(@RequestBody TaskFilterRequest request) {
        return ResponseEntity.ok(taskService.filterTasks(request));
    }

    // Endpoint pour obtenir les statistiques des tâches
    @GetMapping("/stats")
    public ResponseEntity<Map<StatutTache, Long>> getTaskStats() {
        return ResponseEntity.ok(taskService.getTaskStats());
    }

    // Endpoint pour obtenir la progression des tâches
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getTaskProgress() {
        // Pour l'instant, retourner un objet vide
        return ResponseEntity.ok(Map.of());
    }

    // Endpoint pour obtenir les tâches par projet avec réponse détaillée
    @GetMapping("/project/{projectId}/detailed")
    public ResponseEntity<List<TaskResponse>> getTasksByProjectDetailed(@PathVariable int projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    // Endpoint pour assigner une tâche à un développeur
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<TaskResponse> assignTask(@PathVariable int id, @RequestParam int developerId) {
        // Pour l'instant, retourner la tâche sans modification
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Endpoint pour changer le statut d'une tâche
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CHEF_DE_PROJET', 'DEVELOPPEUR')")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable int id, @RequestParam StatutTache status) {
        TaskResponse task;
        switch (status) {
            case TERMINE:
                task = taskService.markTaskAsFinished(id);
                break;
            case EN_COURS:
                task = taskService.markTaskAsInProgress(id);
                break;
            case BLOQUE:
                task = taskService.markTaskAsBlocked(id);
                break;
            default:
                task = taskService.getTaskById(id);
        }
        return ResponseEntity.ok(task);
    }

    // Endpoint pour mettre à jour les heures effectives
    @PutMapping("/{id}/hours")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<TaskResponse> updateTaskHours(@PathVariable int id, @RequestParam double hours) {
        TaskResponse task = taskService.updateTaskHours(id, hours);
        return ResponseEntity.ok(task);
    }

    // Endpoint pour démarrer le timer d'une tâche
    @PostMapping("/{id}/timer/start")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<Map<String, Object>> startTaskTimer(@PathVariable int id) {
        Map<String, Object> response = taskService.startTaskTimer(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint pour arrêter le timer d'une tâche
    @PostMapping("/{id}/timer/stop")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<Map<String, Object>> stopTaskTimer(@PathVariable int id) {
        Map<String, Object> response = taskService.stopTaskTimer(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint pour obtenir le statut du timer d'une tâche
    @GetMapping("/{id}/timer/status")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<Map<String, Object>> getTaskTimerStatus(@PathVariable int id) {
        Map<String, Object> response = taskService.getTaskTimerStatus(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint pour obtenir le planning de l'utilisateur actuel
    @GetMapping("/me/planning")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<List<TaskResponse>> getMyPlanning() {
        return ResponseEntity.ok(taskService.getPlanningForCurrentUser());
    }

    // Endpoint pour obtenir la charge de travail de l'utilisateur actuel
    @GetMapping("/me/workload")
    @PreAuthorize("hasRole('DEVELOPPEUR')")
    public ResponseEntity<Map<StatutTache, Long>> getMyWorkload() {
        return ResponseEntity.ok(taskService.getWorkloadForCurrentUser());
    }

    // Endpoint pour rechercher des tâches
    @GetMapping("/search")
    public ResponseEntity<List<TaskResponse>> searchTasks(@RequestParam String keyword) {
        return ResponseEntity.ok(taskService.searchTasksByKeyword(keyword));
    }

    // Endpoint pour obtenir la progression d'un projet
    @GetMapping("/project/{projectId}/progress")
    public ResponseEntity<TaskProgressResponse> getProjectProgress(@PathVariable int projectId) {
        return ResponseEntity.ok(taskService.getProgressByProject(projectId));
    }

    // Endpoint pour obtenir les tâches paginées
    @GetMapping("/paged")
    public ResponseEntity<Map<String, Object>> getTasksPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Pour l'instant, retourner toutes les tâches
        List<TaskResponse> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(Map.of(
            "content", tasks,
            "totalElements", tasks.size(),
            "totalPages", 1,
            "currentPage", 0
        ));
    }
}