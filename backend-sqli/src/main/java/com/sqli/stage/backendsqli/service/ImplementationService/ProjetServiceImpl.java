package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectDetailsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectRequest;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.AccessdeniedException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;


import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ProjetServiceImpl implements ProjetService {

    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;

    @Override
    public ProjectResponse createProject(ProjectRequest request) {
        String username = getCurrentUser().getUsername();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID " + request.getClientId()));


        Project project = new Project();
        project.setTitre(request.getTitre());
        project.setDescription(request.getDescription());
        project.setClient(client);
        project.setDateDebut(request.getDateDebut());
        project.setDateFin(request.getDateFin());
        project.setStatut(request.getStatut());
        project.setUuidPublic(UUID.randomUUID().toString());
        project.setPublicLinkEnabled(false);
        project.setCreatedBy(currentUser);

        Project savedProject = projetRepository.save(project);
        return mapToResponse(savedProject);

    }

    public ProjectResponse updateProject(int id, ProjectRequest request) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));


        if (request.getTitre() != null) { project.setTitre(request.getTitre()); }
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getClientId() != null) {
            User client = userRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
            project.setClient(client);
        }
        if (request.getDateDebut() != null) project.setDateDebut(request.getDateDebut());
        if (request.getDateFin() != null) project.setDateFin(request.getDateFin());
        if (request.getStatut() != null) { project.setStatut(request.getStatut()); }

        Project updatedProject = projetRepository.save(project);

        return mapToResponse(updatedProject);
    }


    @Override
    public void deleteProject(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() ->  new ResourceNotFoundException("Projet Introuvable avec ID :" + id));

        if(!project.getCreatedBy().getUsername().equals(getCurrentUser().getUsername())) {
            throw new AccessdeniedException("Vous n'avez pas les droits pour modifier ce projet");
        }
        projetRepository.deleteById(id);
    }


    @Override
    public ProjectResponse getProjectById(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));
        return mapToResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {

        List<Project> projects = projetRepository.findAll();

        return projects.stream()
                .map(this::mapToResponse) // méthode de mapping personnalisée
                .collect(Collectors.toList());
    }


    @Override
    public List<ProjectResponse> getProjectsByChef(String username) {
        return projetRepository.findByCreatedByUsername(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<ProjectResponse> getProjectsByClient(String username) {
        User client = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec username : " + username));

        List<Project> projects = projetRepository.findByClientId(client.getId());
        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectByUuid(String uuid) {
        Project project = projetRepository.findByUuidPublic(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec UUID : " + uuid));
        return mapToResponse(project);
    }

    @Override
    public ProjectResponse togglePublicLink(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec ID : " + id));
        project.setPublicLinkEnabled(!project.isPublicLinkEnabled());
        projetRepository.save(project);
        return mapToResponse(project);
    }


    @Override
    public ProjectDetailsResponse getDetailedProject(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec ID : " + id));

        return new ProjectDetailsResponse(
                project.getId(),
                project.getTitre(),
                project.getDescription(),
                project.getClient().getNom(),
                project.getCreatedBy().getNom(),
                project.getDateDebut(),
                project.getDateFin(),
                project.getStatut(),
                project.isPublicLinkEnabled(),
                project.getUuidPublic()
                //project.getTasks()
        );
    }


    @Override
    public DashboardStatsResponse getProjectStats() {
        long totalProjects = projetRepository.count();
        long activeProjects = projetRepository.findByStatut(StatutProjet.EN_COURS).size();
        long completedProjects = projetRepository.findByStatut(StatutProjet.TERMINE).size();
        long lateProjects = projetRepository.findAll().stream()
                .filter(p -> p.getDateFin().isBefore(LocalDate.now()) && p.getStatut() != StatutProjet.TERMINE)
                .count();

        return new DashboardStatsResponse(
                totalProjects,
                activeProjects,
                completedProjects,
                lateProjects
        );
    }

    @Override
    public List<ProjectResponse> searchProjectsByKeyword(String keyword) {
        return projetRepository.findByTitreContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> getAllPublicProjects() {
        return projetRepository.findByIsPublicLinkEnabledTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }


    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitre(),
                project.getDescription(),
                project.getClient().getNom(),
                project.getDateDebut(),
                project.getDateFin(),
                project.getStatut(),
                project.isPublicLinkEnabled(),
                project.getUuidPublic());
    }
}
