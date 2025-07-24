package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectRequest;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.service.ProjetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjetController {

    private final ProjetService projetService;

    @PostMapping()
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        log.info("On démarre la création d'un nouveau projet avec les infos : {}", request);
        ProjectResponse response = projetService.createProject(request);
        log.info("Projet créé avec succès avec l'ID : {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable int id, @Valid @RequestBody ProjectRequest request) {
        log.info("On modifie le projet avec l'ID : {} avec les nouvelles infos : {}", id, request);
        ProjectResponse response = projetService.updateProject(id, request);
        log.info("Projet avec l'ID : {} modifié avec succès", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> deleteProject(@PathVariable int id) {
        log.info("On supprime le projet avec l'ID : {}", id);
        projetService.deleteProject(id);
        log.info("Projet avec l'ID : {} supprimé avec succès", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable int id) {
        log.info("On récupère les détails du projet avec l'ID : {}", id);
        ProjectResponse response = projetService.getProjectById(id);
        log.info("Détails du projet avec l'ID : {} récupérés avec succès", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        log.info("On récupère tous les projets");
        List<ProjectResponse> projects = projetService.getAllProjects();
        log.info("Tous les projets récupérés avec succès. Nombre total : {}", projects.size());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/chef")
    public ResponseEntity<List<ProjectResponse>> getProjectsByChef(@RequestParam String username) {
        log.info("On récupère les projets du chef avec l'utilisateur : {}", username);
        List<ProjectResponse> projects = projetService.getProjectsByChef(username);
        log.info("Projets récupérés avec succès pour le chef : {}", username);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/client")
    public ResponseEntity<List<ProjectResponse>> getProjectsByClient(@RequestParam String username) {
        log.info("On récupère les projets du client avec l'utilisateur : {}", username);
        List<ProjectResponse> projects = projetService.getProjectsByClient(username);
        log.info("Projets récupérés avec succès pour le client : {}", username);
        return ResponseEntity.ok(projects);
    }

    @PutMapping("/{id}/toggle-public")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> togglePublicLink(@PathVariable int id) {
        log.info("On change l'état du lien public pour le projet avec l'ID : {}", id);
        ProjectResponse response = projetService.togglePublicLink(id);
        log.info("État du lien public changé avec succès pour le projet avec l'ID : {}", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/{uuid}")
    public ResponseEntity<ProjectResponse> getProjectByUuid(@PathVariable String uuid) {
        log.info("On récupère le projet public avec le UUID : {}", uuid);
        ProjectResponse response = projetService.getProjectByUuid(uuid);
        log.info("Projet public récupéré avec succès avec le UUID : {}", uuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_DE_PROJET')")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        log.info("On récupère les statistiques du tableau de bord");
        DashboardStatsResponse stats = projetService.getProjectStats();
        log.info("Statistiques du tableau de bord récupérées avec succès");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> search(@RequestParam String keyword) {
        log.info("On recherche des projets avec le mot-clé : {}", keyword);
        List<ProjectResponse> results = projetService.searchProjectsByKeyword(keyword);
        log.info("Recherche terminée. Nombre de projets trouvés pour le mot-clé '{}': {}", keyword, results.size());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/public")
    public ResponseEntity<List<ProjectResponse>> getAllPublicProjects() {
        log.info("On récupère tous les projets publics");
        List<ProjectResponse> projects = projetService.getAllPublicProjects();
        log.info("Projets publics récupérés avec succès. Nombre total : {}", projects.size());
        return ResponseEntity.ok(projects);
    }
}

