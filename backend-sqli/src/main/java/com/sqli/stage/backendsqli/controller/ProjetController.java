package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ProjectDTO.*;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.service.ProjetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjetController {

    private final ProjetService projetService;
    private final ProjetRepository projetRepository;

    // Endpoint pour obtenir les projets du chef de projet
    @GetMapping("/chef/overview")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<ProjectResponse>> getProjectsByChef() {
        // Récupérer le nom d'utilisateur connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        System.out.println("DEBUG: Username connecté: " + username); // Debug
        List<ProjectResponse> projects = projetService.getProjectsByChef(username);
        System.out.println("DEBUG: Nombre de projets trouvés: " + projects.size()); // Debug
        return ResponseEntity.ok(projects);
    }

    // Endpoint pour obtenir les projets de l'utilisateur connecté (selon son rôle)
    @GetMapping("/my-projects")
    @PreAuthorize("hasAnyRole('CHEF_DE_PROJET', 'DEVELOPPEUR', 'CLIENT', 'ADMIN')")
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        List<ProjectResponse> projects = projetService.getProjectsForCurrentUser();
        return ResponseEntity.ok(projects);
    }

    // Endpoint de debug pour vérifier les données
    @GetMapping("/debug/chef-projects")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> debugChefProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Récupérer tous les projets pour debug
        List<ProjectResponse> allProjects = projetService.getAllProjects();
        List<ProjectResponse> chefProjects = projetService.getProjectsByChef(username);
        
        Map<String, Object> debugInfo = Map.of(
            "connectedUsername", username,
            "totalProjects", allProjects.size(),
            "chefProjects", chefProjects.size(),
            "allProjects", allProjects.stream().map(p -> Map.of(
                "id", p.getId(),
                "titre", p.getTitre(),
                "clientName", p.getClientName(),
                "type", p.getType()
            )).toList()
        );
        
        return ResponseEntity.ok(debugInfo);
    }

    // Endpoint pour obtenir les projets en retard (simulation)
    @GetMapping("/chef/overdue")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<List<Map<String, Object>>> getOverdueProjects() {
        // Pour l'instant, retourner une liste vide
        return ResponseEntity.ok(List.of());
    }

    // Endpoint pour obtenir les statistiques des projets
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getProjectStats() {
        return ResponseEntity.ok(projetService.getProjectStats());
    }

    // Endpoint pour créer un projet
    @PostMapping
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projetService.createProject(request));
    }

    // Endpoint pour obtenir un projet par ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailsResponse> getProjectById(@PathVariable int id) {
        return ResponseEntity.ok(projetService.getDetailedProject(id));
    }

    // Endpoint pour mettre à jour un projet
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable int id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projetService.updateProject(id, request));
    }

    // Endpoint pour supprimer un projet
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> deleteProject(@PathVariable int id) {
        projetService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint pour assigner des développeurs à un projet
    @PostMapping("/{id}/assign-developers")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> assignDevelopers(@PathVariable int id, @RequestBody List<Integer> developerIds) {
        projetService.assignUsersToProject(id, developerIds);
        return ResponseEntity.ok().build();
    }

    // Endpoint pour obtenir les projets publics
    @GetMapping("/public/{uuid}")
    public ResponseEntity<ProjectResponse> getPublicProject(@PathVariable String uuid) {
        return ResponseEntity.ok(projetService.getProjectByUuid(uuid));
    }

    // Endpoint pour obtenir tous les projets (admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projetService.getAllProjects());
    }

    // Endpoint pour obtenir les projets par statut (simulation)
    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(@PathVariable StatutProjet status) {
        // Pour l'instant, retourner tous les projets
        return ResponseEntity.ok(projetService.getAllProjects());
    }

    // Endpoint pour obtenir les projets par type (simulation)
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByType(@PathVariable String type) {
        // Pour l'instant, retourner tous les projets
        return ResponseEntity.ok(projetService.getAllProjects());
    }

    // Endpoint pour rechercher des projets
    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> searchProjects(@RequestParam String q) {
        return ResponseEntity.ok(projetService.searchProjectsByKeyword(q));
    }

    // Endpoint pour obtenir le dashboard des projets
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getProjectDashboard() {
        return ResponseEntity.ok(projetService.getProjectStats());
    }

    // Endpoint pour obtenir les projets TMA (simulation)
    @GetMapping("/tma")
    public ResponseEntity<List<ProjectResponse>> getTmaProjects() {
        // Pour l'instant, retourner tous les projets
        return ResponseEntity.ok(projetService.getAllProjects());
    }

    // Endpoint pour obtenir les projets Build (simulation)
    @GetMapping("/build")
    public ResponseEntity<List<ProjectResponse>> getBuildProjects() {
        // Pour l'instant, retourner tous les projets
        return ResponseEntity.ok(projetService.getAllProjects());
    }

    // Endpoint pour obtenir l'équipe d'un projet (simulation)
    @GetMapping("/{id}/team")
    public ResponseEntity<Map<String, Object>> getProjectTeam(@PathVariable int id) {
        // Pour l'instant, retourner un objet vide
        return ResponseEntity.ok(Map.of());
    }

    // Endpoint pour obtenir les compétences d'un projet
    @GetMapping("/{id}/skills")
    public ResponseEntity<List<ProjectSkillResponse>> getProjectSkills(@PathVariable int id) {
        return ResponseEntity.ok(projetService.getRequiredSkillsForProject(id));
    }

    // Endpoint pour définir les compétences requises pour un projet
    @PostMapping("/{id}/skills")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Void> defineProjectSkills(@PathVariable int id, @RequestBody List<SkillDTO> skills) {
        projetService.defineRequiredSkills(id, skills);
        return ResponseEntity.ok().build();
    }

    // Endpoint pour activer/désactiver le lien public
    @PutMapping("/{id}/toggle-public")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<ProjectResponse> togglePublicLink(@PathVariable int id) {
        return ResponseEntity.ok(projetService.togglePublicLink(id));
    }

    // Endpoint pour mettre à jour la progression d'un projet
    @PatchMapping("/{id}/progress/recompute")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> recomputeProgress(@PathVariable int id) {
        var progress = projetService.updateProjectProgress(id);
        return ResponseEntity.ok(Map.of("progress", progress));
    }

    // Endpoint pour réinitialiser les projets (temporaire pour debug)
    @PostMapping("/reset-projects")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> resetProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Supprimer tous les projets existants
        projetRepository.deleteAll();
        
        // Recréer les projets avec le bon chef de projet
        // Cette logique devrait être dans le service, mais pour debug...
        
        Map<String, Object> result = Map.of(
            "message", "Projets réinitialisés",
            "username", username
        );
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recompute-all-progress")
    @PreAuthorize("hasRole('CHEF_DE_PROJET')")
    public ResponseEntity<Map<String, Object>> recomputeAllProjectProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Récupérer tous les projets du chef connecté
        List<Project> chefProjects = projetRepository.findByCreatedByUsername(username);
        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("totalProjects", chefProjects.size());
        
        List<Map<String, Object>> updatedProjects = new ArrayList<>();
        
        for (Project project : chefProjects) {
            // Recalculer la progression
            BigDecimal newProgress = projetService.updateProjectProgress(project.getId());
            
            Map<String, Object> projectUpdate = new HashMap<>();
            projectUpdate.put("projectId", project.getId());
            projectUpdate.put("titre", project.getTitre());
            projectUpdate.put("oldProgress", project.getProgression());
            projectUpdate.put("newProgress", newProgress);
            projectUpdate.put("statut", project.getStatut());
            
            updatedProjects.add(projectUpdate);
        }
        
        result.put("updatedProjects", updatedProjects);
        result.put("message", "Progression de tous les projets mise à jour");
        
        return ResponseEntity.ok(result);
    }
}

