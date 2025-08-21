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
import java.util.ArrayList;
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
            System.out.println("=== Création avec développeurs ===");
            System.out.println("DeveloppeurIds reçus: " + request.getDeveloppeurIds());
            
            List<User> developers = userRepository.findAllById(request.getDeveloppeurIds()).stream()
                    .filter(user -> user.getRole() == Role.DEVELOPPEUR)
                    .toList();

            System.out.println("Développeurs trouvés: " + developers.size());

            developers.forEach(dev -> dev.setActifDansProjet(true));
            userRepository.saveAll(developers);

            if (developers.isEmpty()) {
                throw new ResourceNotFoundException("Aucun développeur valide trouvé dans la liste fournie");
            }

            // Initialiser la liste des développeurs pour un nouveau projet
            project.setDeveloppeurs(new ArrayList<>(developers));
            System.out.println("Liste des développeurs initialisée: " + project.getDeveloppeurs().size());
        } else {
            System.out.println("=== Création sans développeurs ===");
            // Initialiser avec une liste vide si aucun développeur n'est spécifié
            project.setDeveloppeurs(new ArrayList<>());
            System.out.println("Liste vide des développeurs initialisée");
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
        System.out.println("=== DEBUG: updateProject(" + id + ") ===");
        System.out.println("Request developpeurIds: " + request.getDeveloppeurIds());
        
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));

        System.out.println("Projet trouvé: " + project.getTitre());
        System.out.println("Developpeurs actuels: " + (project.getDeveloppeurs() != null ? project.getDeveloppeurs().size() : "null"));

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
        if (request.getDeveloppeurIds() != null) {
            System.out.println("=== Mise à jour des développeurs ===");
            System.out.println("DeveloppeurIds reçus: " + request.getDeveloppeurIds());
            
            // Gérer la mise à jour des développeurs de manière sûre
            if (request.getDeveloppeurIds().isEmpty()) {
                System.out.println("Liste des développeurs vide - suppression de tous les développeurs");
                // Créer une nouvelle liste vide
                project.setDeveloppeurs(new ArrayList<>());
                System.out.println("Nouvelle liste vide créée");
            } else {
                System.out.println("Mise à jour avec " + request.getDeveloppeurIds().size() + " développeurs");
                // Récupérer les nouveaux développeurs
                List<User> newDeveloppeurs = userRepository.findAllById(request.getDeveloppeurIds()).stream()
                        .filter(user -> user.getRole() == Role.DEVELOPPEUR)
                        .toList();
                
                System.out.println("Développeurs trouvés: " + newDeveloppeurs.size());
                
                // Créer une nouvelle liste avec les développeurs
                project.setDeveloppeurs(new ArrayList<>(newDeveloppeurs));
                System.out.println("Développeurs mis à jour: " + project.getDeveloppeurs().size());
            }
        }
        if (request.getProgression() != null) project.setProgression(request.getProgression());

        System.out.println("=== Sauvegarde du projet ===");
        System.out.println("Développeurs avant sauvegarde: " + (project.getDeveloppeurs() != null ? project.getDeveloppeurs().size() : "null"));
        
        Project updatedProject = projetRepository.save(project);
        
        System.out.println("Projet sauvegardé avec succès");
        System.out.println("Développeurs après sauvegarde: " + (updatedProject.getDeveloppeurs() != null ? updatedProject.getDeveloppeurs().size() : "null"));

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
        System.out.println("=== DEBUG: getProjectById(" + id + ") ===");
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet Introuvable avec ID :" + id));
        
        System.out.println("Projet trouvé: " + project.getTitre());
        System.out.println("Developpeurs dans le projet: " + (project.getDeveloppeurs() != null ? project.getDeveloppeurs().size() : "null"));
        System.out.println("Tasks dans le projet: " + (project.getTasks() != null ? project.getTasks().size() : "null"));
        
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

        // Créer une nouvelle liste avec les développeurs existants + nouveaux
        List<User> currentDevelopers = project.getDeveloppeurs() != null ? 
            new ArrayList<>(project.getDeveloppeurs()) : new ArrayList<>();
        
        // Gérer l'ajout de développeurs de manière sûre
        for (User dev : newDevelopers) {
            if (!currentDevelopers.contains(dev)) {
                currentDevelopers.add(dev);
            }
        }
        
        // Mettre à jour la liste des développeurs
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
        User currentUser = getCurrentUser();
        
        System.out.println("=== DEBUG: getProjectsForCurrentUser ===");
        System.out.println("Utilisateur connecté: " + currentUser.getUsername() + " (ID: " + currentUser.getId() + ")");
        System.out.println("Rôle: " + currentUser.getRole());
        
        switch (currentUser.getRole()) {
            case CHEF_DE_PROJET:
                // Retourner les projets créés par le chef de projet
                System.out.println("Mode CHEF_DE_PROJET - Recherche des projets créés par l'utilisateur");
                List<Project> chefProjects = projetRepository.findByCreatedByUsername(currentUser.getUsername());
                System.out.println("Projets trouvés pour le chef: " + chefProjects.size());
                return chefProjects.stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
                        
            case CLIENT:
                // Retourner les projets où l'utilisateur est le client
                System.out.println("Mode CLIENT - Recherche des projets où l'utilisateur est client");
                List<Project> clientProjects = projetRepository.findByClientId(currentUser.getId());
                System.out.println("Projets trouvés pour le client: " + clientProjects.size());
                return clientProjects.stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
                        
            case DEVELOPPEUR:
                // Retourner les projets où l'utilisateur est assigné comme développeur
                System.out.println("Mode DEVELOPPEUR - Recherche des projets assignés à l'utilisateur");
                List<Project> devProjects = projetRepository.findByDeveloppeurId(currentUser.getId());
                System.out.println("Projets trouvés pour le développeur: " + devProjects.size());
                devProjects.forEach(p -> System.out.println("  - " + p.getTitre() + " (ID: " + p.getId() + ")"));
                return devProjects.stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
                        
            case ADMIN:
                // L'admin voit tous les projets
                System.out.println("Mode ADMIN - Retour de tous les projets");
                List<Project> allProjects = projetRepository.findAll();
                System.out.println("Total des projets: " + allProjects.size());
                return allProjects.stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
                        
            default:
                System.out.println("Rôle non reconnu: " + currentUser.getRole());
                return List.of();
        }
    }


    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }


    public ProjectResponse mapToResponse(Project project) {
        System.out.println("=== DEBUG: mapToResponse pour projet " + project.getId() + " ===");
        System.out.println("Developpeurs dans le projet: " + (project.getDeveloppeurs() != null ? project.getDeveloppeurs().size() : "null"));
        if (project.getDeveloppeurs() != null) {
            project.getDeveloppeurs().forEach(dev -> 
                System.out.println("  - Dev: " + dev.getUsername() + " (ID: " + dev.getId() + ")")
            );
        }
        
        List<DeveloperResponse> developpeurList = project.getDeveloppeurs() == null ? List.of()
                : project.getDeveloppeurs().stream()
                .map(dev -> new DeveloperResponse(
                        dev.getId(),
                        dev.getNom(),
                        dev.getEmail(),
                        dev.getUsername(),
                        dev.getJobTitle()
                ))
                .toList();
        
        // Si aucun développeur assigné directement au projet, essayer de les récupérer via les tâches
        if (developpeurList.isEmpty() && project.getTasks() != null) {
            System.out.println("=== Récupération des développeurs via les tâches ===");
            developpeurList = project.getTasks().stream()
                    .filter(task -> task.getDeveloppeur() != null)
                    .map(task -> task.getDeveloppeur())
                    .distinct()
                    .map(dev -> new DeveloperResponse(
                            dev.getId(),
                            dev.getNom(),
                            dev.getEmail(),
                            dev.getUsername(),
                            dev.getJobTitle()
                    ))
                    .toList();
            System.out.println("Développeurs récupérés via les tâches: " + developpeurList.size());
        }
        
        System.out.println("DeveloppeurList mappée: " + developpeurList.size());
        developpeurList.forEach(dev -> 
            System.out.println("  - DevResponse: " + dev.getUsername() + " (ID: " + dev.getId() + ")")
        );

        // Client name null-safe
        String clientName = project.getClient() == null ? null : project.getClient().getNom();

        // Objet client complet
        ProjectResponse.ClientInfo clientInfo = null;
        if (project.getClient() != null) {
            clientInfo = new ProjectResponse.ClientInfo(
                project.getClient().getId(),
                project.getClient().getUsername(),
                project.getClient().getNom(),
                project.getClient().getEmail()
            );
        }

        // Type enum + label lisible
        TypeProjet type = project.getType(); // peut être null
        String typeLabel = null;
        if (type != null) {
            switch (type) {
                case Delivery -> typeLabel = "Delivery";
                case TMA      -> typeLabel = "TMA";
                case Interne  -> typeLabel = "Interne";
            }
        }

        // UUID : attention si tu ne renvoies que 8 chars, ajuste la validation du DTO
        String uuid = project.getUuidPublic();

        // Calculer les statistiques des tâches
        int totalTasks = 0;
        int completedTasks = 0;
        int inProgressTasks = 0;
        
        if (project.getTasks() != null && !project.getTasks().isEmpty()) {
            totalTasks = project.getTasks().size();
            completedTasks = (int) project.getTasks().stream()
                    .filter(task -> task.getStatut() == StatutTache.TERMINE)
                    .count();
            inProgressTasks = (int) project.getTasks().stream()
                    .filter(task -> task.getStatut() == StatutTache.EN_COURS)
                    .count();
        }

        // Calculer la progression basée sur les tâches terminées
        BigDecimal calculatedProgression = BigDecimal.ZERO;
        if (totalTasks > 0) {
            calculatedProgression = BigDecimal.valueOf((completedTasks * 100.0) / totalTasks);
        }
        
        // Si la progression stockée est différente de celle calculée, utiliser la calculée
        if (project.getProgression() == null || project.getProgression().compareTo(calculatedProgression) != 0) {
            System.out.println("=== Mise à jour de la progression ===");
            System.out.println("Progression stockée: " + project.getProgression());
            System.out.println("Progression calculée: " + calculatedProgression);
            System.out.println("Tâches totales: " + totalTasks + ", Terminées: " + completedTasks);
        }

        ProjectResponse resp = new ProjectResponse();
        resp.setId(project.getId());
        resp.setTitre(project.getTitre());
        resp.setDescription(project.getDescription());
        resp.setClientName(clientName);
        resp.setClient(clientInfo);
        resp.setType(type);
        resp.setTypeLabel(typeLabel);
        resp.setProgression(calculatedProgression); // Utiliser la progression calculée
        resp.setDateDebut(project.getDateDebut());
        resp.setDateFin(project.getDateFin());
        resp.setStatut(project.getStatut()); // enum StatutProjet directement si c'est voulu
        resp.setPublicLinkEnabled(project.isPublicLinkEnabled()); // champ renommé
        resp.setUuidPublic(uuid);
        resp.setDeveloppeurs(developpeurList);
        
        // Ajouter les statistiques des tâches
        resp.setTotalTasks(totalTasks);
        resp.setCompletedTasks(completedTasks);
        resp.setInProgressTasks(inProgressTasks);
        
        System.out.println("Response finale - Developpeurs: " + (resp.getDeveloppeurs() != null ? resp.getDeveloppeurs().size() : "null"));
        
        // Vérifier si les développeurs sont bien assignés via les tâches
        if ((resp.getDeveloppeurs() == null || resp.getDeveloppeurs().isEmpty()) && project.getTasks() != null) {
            System.out.println("=== ATTENTION: Aucun développeur assigné au projet, mais il y a des tâches ===");
            project.getTasks().forEach(task -> {
                if (task.getDeveloppeur() != null) {
                    System.out.println("  - Tâche '" + task.getTitre() + "' assignée à: " + task.getDeveloppeur().getUsername());
                }
            });
        }
        
        return resp;
    }

}

