package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.ProjectDTO.*;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskresponseByProject;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.AccessdeniedException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import com.sqli.stage.backendsqli.service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;


import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ProjetServiceImpl implements ProjetService {

    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;
    private final TaskRepository taskRepository;
    @Autowired
    private HistoriqueService historiqueService;

    private String generateShortHexUUID() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

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
        project.setType(request.getType());
        project.setClient(client);
        project.setProgression(BigDecimal.ZERO);
        project.setDateDebut(request.getDateDebut());
        project.setDateFin(request.getDateFin());
        project.setStatut(request.getStatut());
        project.setUuidPublic(generateShortHexUUID());
        project.setPublicLinkEnabled(false);
        project.setCreatedBy(currentUser);

        if (request.getDeveloppeurIds() != null && !request.getDeveloppeurIds().isEmpty()) {
            List<User> developers = userRepository.findAllById(request.getDeveloppeurIds()).stream()
                    .filter(user -> user.getRole() == Role.DEVELOPPEUR)
                    .toList();

            developers.forEach(dev -> dev.setActifDansProjet(true));
            userRepository.saveAll(developers);

            if (developers.isEmpty()) {
                throw new ResourceNotFoundException("Aucun développeur valide trouvé dans la liste fournie");
            }

            project.setDeveloppeurs(developers);
        }


        Project savedProject = projetRepository.save(project);

        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.CREATION);
        logRequest.setDescription("Création du projet '" + savedProject.getTitre() + "' (ID: " + savedProject.getId() + ") par " + username);
        logRequest.setEntityId(project.getId());
        logRequest.setEntityName(EntityName.PROJECT);
        historiqueService.logAction(logRequest);

        return mapToResponse(savedProject);
    }


    public ProjectResponse updateProject(int id, ProjectRequest request) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));

        String username = getCurrentUser().getUsername();

        if (request.getTitre() != null) { project.setTitre(request.getTitre()); }
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getType() != null) project.setType(request.getType());
        if (request.getClientId() != null) {
            User client = userRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
            project.setClient(client);
        }
        if (request.getDateDebut() != null) project.setDateDebut(request.getDateDebut());
        if (request.getDateFin() != null) project.setDateFin(request.getDateFin());
        if (request.getStatut() != null) { project.setStatut(request.getStatut()); }
        if (request.getDeveloppeurIds() != null && !request.getDeveloppeurIds().isEmpty()) {
            List<User> developpeurs = userRepository.findAllById(request.getDeveloppeurIds()).stream()
                    .filter(user -> user.getRole() == Role.DEVELOPPEUR)
                    .toList();
            project.setDeveloppeurs(developpeurs);
        }
        if (request.getProgression() != null) project.setProgression(request.getProgression());

        Project updatedProject = projetRepository.save(project);

        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.MODIFICATION);
        logRequest.setDescription("Modification du projet '" + updatedProject.getTitre() + "' (ID: " + updatedProject.getId() + ") par " + username);
        logRequest.setEntityId(project.getId());
        logRequest.setEntityName(EntityName.PROJECT);
        historiqueService.logAction(logRequest);

        return mapToResponse(updatedProject);
    }


    @Override
    public void deleteProject(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() ->  new ResourceNotFoundException("Projet Introuvable avec ID :" + id));

        String username = getCurrentUser().getUsername();

        if(!project.getCreatedBy().getUsername().equals(getCurrentUser().getUsername())) {
            throw new AccessdeniedException("Vous n'avez pas les droits pour modifier ce projet");
        }
        projetRepository.deleteById(id);
        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.SUPPRESSION);
        logRequest.setDescription("Suppresion du projet '" + project.getTitre() + "' (ID: " + project.getId() + ") par " + username);
        logRequest.setEntityId(project.getId());
        logRequest.setEntityName(EntityName.PROJECT);
        historiqueService.logAction(logRequest);
    }


    @Override
    public ProjectResponse getProjectById(int id) {
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));
        return mapToResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        User currentUser = getCurrentUser();
        Role role = currentUser.getRole();
        List<Project> projects;

        switch (role) {
            case ADMIN -> projects = projetRepository.findAll();
            case CHEF_DE_PROJET -> projects = projetRepository.findByCreatedById(currentUser.getId());
            case DEVELOPPEUR -> projects = projetRepository.findByDeveloppeurId(currentUser.getId());
            default -> throw new AccessdeniedException("Vous n'avez pas l'autorisation de consulter les projets.");
        }

        return projects.stream().map(this::mapToResponse).collect(Collectors.toList());
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

        List<TaskresponseByProject> taskResponses = project.getTasks().stream()
                .map(task -> new TaskresponseByProject(
                        task.getTitre(),
                        task.getDescription(),
                        task.getDateDebut(),
                        task.getDateFin(),
                        task.getStatut(),
                        task.getDeveloppeur() != null ? task.getDeveloppeur().getUsername() : null
                ))
                .collect(Collectors.toList());

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
                project.getUuidPublic(),
                taskResponses
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

    private boolean isEligibleAsDeveloper(User user) {
        return user.getRole() == Role.DEVELOPPEUR || user.getRole() == Role.STAGIAIRE;
    }


    @Override
    public void assignUsersToProject(int projectId, List<Integer> developerIds) {
        Project project = projetRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec ID : " + projectId));

        if (developerIds == null || developerIds.isEmpty()) {
            throw new IllegalArgumentException("La liste des développeurs ne peut pas être vide");
        }

        List<User> newDevelopers = userRepository.findAllById(developerIds).stream()
                .filter(this::isEligibleAsDeveloper)
                .toList();

        if (newDevelopers.isEmpty()) {
            throw new ResourceNotFoundException("Aucun développeur valide trouvé dans la liste fournie");
        }

        List<User> currentDevelopers = project.getDeveloppeurs();
        for (User dev : newDevelopers) {
            if (!currentDevelopers.contains(dev)) {
                currentDevelopers.add(dev);
            }
        }

        project.setDeveloppeurs(currentDevelopers);
        projetRepository.save(project);
    }

    @Override
    public BigDecimal updateProjectProgress(Integer projectId) {
        long total = taskRepository.countByProjectId(projectId);
        BigDecimal progress = BigDecimal.ZERO;

        if (total > 0) {
            long done = taskRepository.countByProjectIdAndStatut(projectId, StatutTache.TERMINE);
            progress = BigDecimal
                    .valueOf(done * 100.0 / total)
                    .setScale(2, RoundingMode.HALF_UP);
            Project p = projetRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));

            p.setProgression(progress);

            if (done == total) {
                p.setStatut(StatutProjet.TERMINE);
            }else {
                p.setStatut(StatutProjet.EN_COURS);
            }
            projetRepository.save(p);

        }
        return progress;
    }

    @Override
    public List<ProjectSkillResponse> getRequiredSkillsForProject(int projectId) {
        return List.of();
    }

    @Override
    public void defineRequiredSkills(int projectId, List<SkillDTO> skills) {

    }

    @Override
    public List<ProjectResponse> getProjectsForCurrentUser() {
        return List.of();
    }


    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }


    public ProjectResponse mapToResponse(Project project) {
        List<DeveloperResponse> developpeurList = project.getDeveloppeurs().stream()
                .map(dev -> new DeveloperResponse(
                        dev.getNom(),
                        dev.getEmail(),
                        dev.getUsername()
                ))
                .collect(Collectors.toList());

        return new ProjectResponse(
                project.getId(),
                project.getTitre(),
                project.getDescription(),
                project.getClient().getNom(),
                project.getProgression(),
                project.getDateDebut(),
                project.getDateFin(),
                project.getStatut(),
                project.isPublicLinkEnabled(),
                project.getUuidPublic(),
                developpeurList
        );
    }

}
