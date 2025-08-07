package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ProjectDTO.*;
import com.sqli.stage.backendsqli.service.ProjetService;
import com.sqli.stage.backendsqli.utils.QRCodeGenerator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.ui.Model;
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
        ProjectResponse response = projetService.createProject(request);
        log.info("Projet créé avec succès avec l'ID : {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable int id, @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projetService.updateProject(id, request);
        log.info("Projet avec l'ID : {} modifié avec succès", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> deleteProject(@PathVariable int id) {
        projetService.deleteProject(id);
        log.info("Projet avec l'ID : {} supprimé avec succès", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailsResponse> getProjectById(@PathVariable int id) {
        ProjectDetailsResponse response = projetService.getDetailedProject(id);
        log.info("Détails du projet avec l'ID : {} récupérés avec succès", id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DE_PROJET')")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<ProjectResponse> projects = projetService.getAllProjects();
        log.info("Tous les projets récupérés avec succès. Nombre total : {}", projects.size());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/chef")
    public ResponseEntity<List<ProjectResponse>> getProjectsByChef(@RequestParam String username) {
        List<ProjectResponse> projects = projetService.getProjectsByChef(username);
        log.info("Projets récupérés avec succès pour le chef : {}", username);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/client")
    public ResponseEntity<List<ProjectResponse>> getProjectsByClient(@RequestParam String username) {
        List<ProjectResponse> projects = projetService.getProjectsByClient(username);
        log.info("Projets récupérés avec succès pour le client : {}", username);
        return ResponseEntity.ok(projects);
    }

    @PutMapping("/{id}/toggle-public")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> togglePublicLink(@PathVariable int id) {
        ProjectResponse response = projetService.togglePublicLink(id);
        log.info("État du lien public changé avec succès pour le projet avec l'ID : {}", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/{uuid}")
    public ResponseEntity<ProjectResponse> getProjectByUuid(@PathVariable String uuid) {
        ProjectResponse response = projetService.getProjectByUuid(uuid);
        log.info("Projet public récupéré avec succès avec le UUID : {}", uuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_DE_PROJET')")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = projetService.getProjectStats();
        log.info("Statistiques du tableau de bord récupérées avec succès");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> search(@RequestParam String keyword) {
        List<ProjectResponse> results = projetService.searchProjectsByKeyword(keyword);
        log.info("Recherche terminée. Nombre de projets trouvés pour le mot-clé '{}': {}", keyword, results.size());
        return ResponseEntity.ok(results);
    }

    @PutMapping("/{projectId}/assign-developers")
    public ResponseEntity<?> assignDevelopers(
            @PathVariable int projectId,
            @RequestBody DeveloperAssignmentRequest request) {
        projetService.assignUsersToProject(projectId, request.getDeveloperIds());
        return ResponseEntity.ok().build();
    }



    @Value("${app.base-url}")
    private String baseUrl;

    public String generatePublicUrl(String uuid) {
        return baseUrl + "/api/projects/public/" + uuid + "/view";
    }

    @GetMapping("/public/{uuid}/qrcode")
    public ResponseEntity<byte[]> getProjectQrCode(@PathVariable String uuid) {
        ProjectResponse project = projetService.getProjectByUuid(uuid);

        if (!project.isPublicLinkEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String url = generatePublicUrl(project.getUuidPublic());

        try {
            byte[] qrCode = QRCodeGenerator.generateQRCodeImage(url, 300, 300);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCode);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }




}

