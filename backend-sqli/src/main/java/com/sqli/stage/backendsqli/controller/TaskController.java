package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.TaskDTO.TaskFilterRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.service.Taskservice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {
    private final Taskservice taskservice;

    @PostMapping()
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        TaskResponse response = taskservice.createTask(request);
        log.info("Tâche créée avec succès avec l'ID : {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable int id, @RequestBody TaskRequest request) {
        TaskResponse response = taskservice.updateTask(id, request);
        log.info("Tâche avec l'ID : {} modifiée avec succès", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> deleteTask(@PathVariable int id) {
        taskservice.deleteTask(id);
        log.info("Tâche avec l'ID : {} supprimée avec succès", id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable int id) {
        TaskResponse response = taskservice.getTaskById(id);
        log.info("Détails de la tâche avec l'ID : {} récupérés avec succès", id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search")
    public ResponseEntity<List<TaskResponse>> searchTasks(@RequestParam String keyword) {
        List<TaskResponse> response = taskservice.searchTasksByKeyword(keyword);
        log.info("Recherche des tâches effectuée avec succès pour le mot-clé '{}'. Nombre de résultats trouvés : {}", keyword, response.size());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DE_PROJET', 'DEVELOPPEUR')")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<TaskResponse> tasks = taskservice.getAllTasks();
        log.info("Récupération de toutes les tâches réussie. Nombre de tâches trouvées : {}", tasks.size());
        return ResponseEntity.ok(tasks);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable int projectId) {
        List<TaskResponse> responses = taskservice.getTasksByProject(projectId);
        log.info("Récupération des tâches pour le projet avec l'ID {} réussie. Nombre de tâches trouvées : {}", projectId, responses.size());
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    @GetMapping("/developer/{developpeurId}")
    public ResponseEntity<List<TaskResponse>> getTasksByDeveloper(@PathVariable int developpeurId) {
        List<TaskResponse> responses = taskservice.getTasksByDeveloper(developpeurId);
        log.info("Récupération des tâches pour le développeur avec l'ID {} réussie. Nombre de tâches trouvées : {}", developpeurId, responses.size());
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    @GetMapping("/stats")
    public ResponseEntity<Map<StatutTache, Long>> getTaskStats() {
        Map<StatutTache, Long> stats = taskservice.getTaskStats();
        log.info("Récupération des statistiques des tâches réussie. Détails : {}", stats);
        return ResponseEntity.ok(stats);
    }


    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    @GetMapping("/late")
    public ResponseEntity<List<TaskResponse>> getLateTasks() {
        List<TaskResponse> responses = taskservice.getLateTasks();
        log.info("Récupération des tâches en retard réussie. Nombre de tâches trouvées : {}", responses.size());
        return ResponseEntity.ok(responses);
    }


    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    @GetMapping("/count/{projectId}")
    public ResponseEntity<Long> countTasksByProject(@PathVariable int projectId) {
        Long count = taskservice.countTasksByProject(projectId);
        log.info("Nombre de tâches pour le projet avec l'ID {} récupéré avec succès : {}", projectId, count);
        return ResponseEntity.ok(count);
    }

    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(@PathVariable StatutTache status) {
        List<TaskResponse> responses = taskservice.getTasksByStatus(status);
        log.info("Récupération des tâches avec le statut '{}' réussie. Nombre de tâches trouvées : {}", status, responses.size());
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('DEVELOPPEUR')")
    @GetMapping("/me")
    public ResponseEntity<List<TaskResponse>> getTasksForCurrentUser() {
        List<TaskResponse> responses = taskservice.getTasksForCurrentUser();
        log.info("Récupération des tâches de l'utilisateur actuel réussie. Nombre de tâches trouvées : {}", responses.size());
        return ResponseEntity.ok(responses);
    }


    @PreAuthorize("hasRole('DEVELOPPEUR')")
    @GetMapping("/me/planning")
    public ResponseEntity<List<TaskResponse>> getPlanningForCurrentUser() {
        List<TaskResponse> responses = taskservice.getPlanningForCurrentUser();
        log.info("Récupération du planning pour l'utilisateur actuel réussie. Nombre de tâches trouvées : {}", responses.size());
        return ResponseEntity.ok(responses);
    }


    @PreAuthorize("hasRole('DEVELOPPEUR')")
    @GetMapping("/me/workload")
    public ResponseEntity<Map<StatutTache, Long>> getWorkloadForCurrentUser() {
        Map<StatutTache, Long> stats = taskservice.getWorkloadForCurrentUser();
        log.info("Récupération de la charge de travail pour l'utilisateur actuel réussie. Détails : {}", stats);
        return ResponseEntity.ok(stats);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/paged")
    public ResponseEntity<Page<TaskResponse>> getAllTasksPaged(Pageable pageable) {
        Page<TaskResponse> responses = taskservice.getAllTasksPaged(pageable);
        log.info("Récupération paginée des tâches réussie. Nombre total de pages : {}", responses.getTotalPages());
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/filter")
    public ResponseEntity<List<TaskResponse>> filterTasks(@RequestBody TaskFilterRequest filter) {
        List<TaskResponse> responses = taskservice.filterTasks(filter);
        log.info("Filtrage des tâches effectué avec succès. Critères : {}. Nombre de tâches trouvées : {}", filter, responses.size());
        return ResponseEntity.ok(responses);
    }
}