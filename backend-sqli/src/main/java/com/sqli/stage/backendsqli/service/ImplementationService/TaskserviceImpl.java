package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskFilterRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskProgressResponse;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.AccessdeniedException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import com.sqli.stage.backendsqli.service.ProjetService;
import com.sqli.stage.backendsqli.service.Taskservice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

@RequiredArgsConstructor
@Service
public class TaskserviceImpl implements Taskservice {

    private final UserRepository userRepository;
    private final TaskRepository taskRepoistory;
    private final ProjetRepository projetRepository;
    private final HistoriqueService historiqueService;
    private final ProjetService projetService;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User current = getCurrentUser();

        // Autorisations
        if (current.getRole() != Role.CHEF_DE_PROJET && current.getRole() != Role.ADMIN) {
            throw new AccessdeniedException("Seuls les chefs de projet ou admin peuvent créer des tâches.");
        }

        // Entrées requises
        if (request.getProjectId() == null || request.getDeveloppeurId() == null) {
            throw new IllegalArgumentException("Projet et développeur sont requis.");
        }
        if (request.getDateDebut() == null || request.getDateFin() == null) {
            throw new IllegalArgumentException("Les dates de début et fin sont requises.");
        }
        if (request.getDateFin().isBefore(request.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure ou égale à la date de début.");
        }

        // Récup entités
        User developpeur = userRepository.findById(request.getDeveloppeurId())
                .orElseThrow(() -> new ResourceNotFoundException("Développeur non trouvé"));
        Project projet = projetRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));

        // Vérifier ownership / responsabilité
        // (préférable à createdBy: chefDeProjet est plus métier)
        if (current.getRole() != Role.ADMIN) {
            if (projet.getCreatedBy() == null || !projet.getCreatedBy().getId().equals(current.getId())) {
                throw new AccessdeniedException("Vous n'êtes pas le chef du projet.");
            }
        }

        // Statut projet
        if (projet.getStatut() == StatutProjet.TERMINE) {
            throw new IllegalStateException("Impossible de créer une tâche sur un projet terminé.");
        }

        // Rôle dev
        if (developpeur.getRole() != Role.DEVELOPPEUR) {
            throw new IllegalArgumentException("Seuls les développeurs peuvent recevoir des tâches.");
        }
        if (!developpeur.isEnabled()) {
            throw new IllegalStateException("Le développeur n'est pas actif.");
        }

        // Unicité titre dans le projet (optionnel mais utile)
        if (taskRepoistory.existsByProjectIdAndTitreIgnoreCase(projet.getId(), request.getTitre().trim())) {
            throw new IllegalArgumentException("Une tâche avec ce titre existe déjà sur ce projet.");
        }

        // Associer dev au projet si pas présent (et persister l'association)
        if (!projet.getDeveloppeurs().contains(developpeur)) {
            projet.getDeveloppeurs().add(developpeur);
            projetRepository.save(projet);
        }

        // Heures
        Integer planned = request.getPlannedHours() != null ? Math.max(0, request.getPlannedHours()) : 0;
        Integer effective = 0; // à la création
        Integer remaining = Math.max(0, planned - effective);

        // Valeurs par défaut
        StatutTache statut = request.getStatut() != null ? request.getStatut() : StatutTache.NON_COMMENCE;

        // Création
        Task task = new Task();
        task.setTitre(request.getTitre().trim());
        task.setDescription(request.getDescription());
        task.setDateDebut(request.getDateDebut());
        task.setDateFin(request.getDateFin());
        task.setStatut(statut);
        task.setPriorite(request.getPriorite());
        task.setPlannedHours(planned);
        task.setEffectiveHours(effective);
        task.setRemainingHours(remaining);
        task.setDeveloppeur(developpeur);
        task.setProject(projet);

        Task saved = taskRepoistory.save(task);

        // Log après succès
        historiqueService.logAction(new LogRequest(
                TypeOperation.CREATION,
                "Création tâche '" + saved.getTitre() + "' (ID " + saved.getId() + ")",
                saved.getId(),
                EntityName.TASK
        ));

        return mapToReponse(saved);
    }



    @Override
    public TaskResponse updateTask(int id, TaskRequest request) {
        Task task = taskRepoistory.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("task introuvable avec l'id : " + id));
        if(task.getProject().getCreatedBy().getId() != getCurrentUser().getId()){
            throw new AccessdeniedException("Vous n'avez pas les droits de mise a jour pour cette task");
        }

        if(request.getTitre() != null) task.setTitre(request.getTitre());
        if(request.getDescription() != null) task.setDescription(request.getDescription());
        if(request.getDateDebut() != null) task.setDateDebut(request.getDateDebut());
        if(request.getDateFin() != null) task.setDateFin(request.getDateFin());
        if(request.getStatut() != null) task.setStatut(request.getStatut());
        if(request.getDeveloppeurId() != null){
            User dev = userRepository.findById(request.getDeveloppeurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec ID " + request.getDeveloppeurId()));

            if (dev.getRole() != Role.DEVELOPPEUR) {
                throw new IllegalArgumentException("L'utilisateur assigné n'est pas un développeur.");
            }

            task.setDeveloppeur(dev);
        }
        Task updatedTask = taskRepoistory.save(task);

        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.MODIFICATION);
        logRequest.setDescription("Création du tache '" + updatedTask.getTitre() + "' (ID: " + updatedTask.getId() + ") par " + getCurrentUser().getUsername());
        logRequest.setEntityId(updatedTask.getId());
        logRequest.setEntityName(EntityName.TASK);
        historiqueService.logAction(logRequest);

        // ⬇️ Mise à jour immédiate de la progression projet
        projetService.updateProjectProgress(updatedTask.getProject().getId());

        return mapToReponse(updatedTask);
    }



    @Override
    public void deleteTask(int id) {
        Task task = taskRepoistory.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("task introuvable avec l'id : " + id));

        if(task.getProject().getCreatedBy().getId() != getCurrentUser().getId()){
            throw new AccessdeniedException("Vous n'avez pas les droits de mise a jour pour cette task");
        }
        taskRepoistory.deleteById(id);

        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.SUPPRESSION);
        logRequest.setDescription("Création du tache '" + task.getTitre() + "' (ID: " + task.getId() + ") par " + getCurrentUser().getUsername());
        logRequest.setEntityId(task.getId());
        logRequest.setEntityName(EntityName.TASK);
        historiqueService.logAction(logRequest);
    }

    @Override
    public TaskResponse getTaskById(int id) {
        Task task = taskRepoistory.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("task introuvable avec l'id : " + id));
        return mapToReponse(task);
    }

    @Override
    public List<TaskResponse> searchTasksByKeyword(String keyword) {
        List<Task> tasks = taskRepoistory.findByTitreContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
        return tasks.stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getAllTasks() {
        User currentUser = getCurrentUser();
        Role role = currentUser.getRole();
        List<Task> tasks;

        switch (role) {
            case ADMIN -> tasks = taskRepoistory.findAll();
            case CHEF_DE_PROJET -> tasks = taskRepoistory.findByProjectCreatedById(currentUser.getId());
            case DEVELOPPEUR -> tasks = taskRepoistory.findByDeveloppeurId(currentUser.getId());
            default -> throw new AccessdeniedException("Vous n'avez pas l'autorisation de consulter les tâches.");
        }

        return tasks.stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getPriorityTasksForChef() {
        String currentUsername = getCurrentUser().getUsername();
        User currentChef = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Chef de projet non trouvé"));
        
        // Récupérer les projets du chef connecté
        List<Project> chefProjects = projetRepository.findByCreatedByUsername(currentUsername);
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        
        System.out.println("=== DEBUG: getPriorityTasksForChef ===");
        System.out.println("Chef connecté: " + currentUsername);
        System.out.println("Projets du chef: " + chefProjects.size());
        System.out.println("Project IDs: " + projectIds);
        
        if (projectIds.isEmpty()) {
            System.out.println("Aucun projet trouvé pour le chef");
            return new ArrayList<>();
        }
        
        // Récupérer toutes les tâches des projets du chef
        List<Task> allTasks = taskRepoistory.findByProjectIdIn(projectIds);
        System.out.println("Total des tâches trouvées: " + allTasks.size());
        
        // Afficher les détails de chaque tâche pour debug
        allTasks.forEach(task -> {
            System.out.println("Tâche: " + task.getTitre() + 
                             " | Priorité: " + task.getPriorite() + 
                             " | Statut: " + task.getStatut() + 
                             " | Projet: " + task.getProject().getTitre());
        });
        
        // Filtrer les tâches prioritaires avec une logique plus large
        List<Task> priorityTasks = allTasks.stream()
                .filter(task -> {
                    // Priorité élevée ou critique
                    boolean isHighPriority = task.getPriorite() == com.sqli.stage.backendsqli.entity.Enums.Priorite.ELEVEE || 
                                          task.getPriorite() == com.sqli.stage.backendsqli.entity.Enums.Priorite.CRITIQUE;
                    
                    // Statut qui nécessite attention
                    boolean needsAttention = task.getStatut() == StatutTache.NON_COMMENCE || 
                                          task.getStatut() == StatutTache.EN_COURS || 
                                          task.getStatut() == StatutTache.BLOQUE;
                    
                    // Tâches en retard (date de fin dépassée)
                    boolean isOverdue = task.getDateFin() != null && 
                                      task.getDateFin().isBefore(java.time.LocalDate.now()) && 
                                      task.getStatut() != StatutTache.TERMINE;
                    
                    return isHighPriority || needsAttention || isOverdue;
                })
                .sorted(Comparator.comparing(Task::getPriorite, Comparator.reverseOrder())
                        .thenComparing(Task::getDateFin))
                .collect(Collectors.toList());
        
        System.out.println("Tâches prioritaires filtrées: " + priorityTasks.size());
        priorityTasks.forEach(task -> {
            System.out.println("Tâche prioritaire: " + task.getTitre() + 
                             " | Priorité: " + task.getPriorite() + 
                             " | Statut: " + task.getStatut());
        });
        
        return priorityTasks.stream()
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<TaskResponse> getTasksByProject(int projectId) {
        return taskRepoistory.findByProjectId(projectId).stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByUser(int developpeurId) {
        return taskRepoistory.findByDeveloppeurId(developpeurId).stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public Map<StatutTache, Long> getTaskStats() {
        User currentUser = getCurrentUser();
        List<Task> source = switch (currentUser.getRole()) {
            case ADMIN -> taskRepoistory.findAll();
            case CHEF_DE_PROJET -> taskRepoistory.findByProjectCreatedById(currentUser.getId());
            case DEVELOPPEUR -> taskRepoistory.findByDeveloppeurId(currentUser.getId());
            default -> List.of();
        };
        return source.stream().collect(Collectors.groupingBy(Task::getStatut, Collectors.counting()));
    }


    @Override
    public List<TaskResponse> getLateTasks() {
        LocalDate today = LocalDate.now();
        List<Task> lateTasks = taskRepoistory.findByDateFinBeforeAndStatutNot(today, StatutTache.TERMINE);
        return lateTasks.stream().map(this::mapToReponse).collect(Collectors.toList());
    }


    @Override
    public Long countTasksByProject(int projectId) {
        return taskRepoistory.countByProjectId(projectId);
    }


    @Override
    public List<TaskResponse> getTasksByStatus(StatutTache status) {
        return taskRepoistory.findByStatut(status).stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksForCurrentUser() {
        User currentUser = getCurrentUser();

        return taskRepoistory.findByDeveloppeurId(currentUser.getId()).stream()
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<TaskResponse> getPlanningForCurrentUser() {
        User currentUser = getCurrentUser();

        return taskRepoistory.findByDeveloppeurId(currentUser.getId()).stream()
                .sorted(Comparator.comparing(Task::getDateDebut))
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }



    @Override
    public Map<StatutTache, Long> getWorkloadForCurrentUser() {
        User currentUser = getCurrentUser();

        return taskRepoistory.findByDeveloppeurId(currentUser.getId()).stream()
                .collect(Collectors.groupingBy(Task::getStatut, Collectors.counting()));
    }

    @Override
    public Page<TaskResponse> getAllTasksPaged(Pageable pageable) {
        return taskRepoistory.findAll(pageable)
                .map(this::mapToReponse);
    }

    @Override
    public List<TaskResponse> filterTasks(TaskFilterRequest filter) {
        return taskRepoistory.findAll().stream()

                .filter(task -> filter.getProjectId() == null ||
                        task.getProject().getId().equals(filter.getProjectId()))

                .filter(task -> filter.getDeveloppeurId() == null ||
                        task.getDeveloppeur().getId() == filter.getDeveloppeurId())

                .filter(task -> filter.getStatut() == null ||
                        task.getStatut() == filter.getStatut())

                .filter(task -> filter.getKeyword() == null ||
                        task.getTitre().toLowerCase().contains(filter.getKeyword().toLowerCase()) ||
                        task.getDescription().toLowerCase().contains(filter.getKeyword().toLowerCase()))

                .filter(task -> filter.getDateDebutMin() == null ||
                        !task.getDateDebut().isBefore(filter.getDateDebutMin()))
                .filter(task -> filter.getDateDebutMax() == null ||
                        !task.getDateDebut().isAfter(filter.getDateDebutMax()))

                .filter(task -> filter.getDateFinMin() == null ||
                        !task.getDateFin().isBefore(filter.getDateFinMin()))

                .filter(task -> filter.getDateFinMax() == null ||
                        !task.getDateFin().isAfter(filter.getDateFinMax()))

                .map(this::mapToReponse)

                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse markTaskAsFinished(int taskId) {
        User current = getCurrentUser();

        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // (Optionnel) sécurité: seul le dev assigné ou le chef de projet peut clôturer
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à clôturer cette tâche.");
        }

        // déjà terminé ? on sort idempotent
        if (task.getStatut() == StatutTache.TERMINE) {
            return mapToReponse(task);
        }

        task.setStatut(StatutTache.TERMINE);
        taskRepoistory.save(task);

        // ⬇️ Mise à jour immédiate de la progression projet
        projetService.updateProjectProgress(task.getProject().getId());

        // (Optionnel) log + notif
        //logDone(task);
        // notificationService.notifyProjectProgressUpdated(task.getProject().getId());

        return mapToReponse(task);
    }
        @Override
    public TaskResponse markTaskAsInProgress(int taskId) {
            User current = getCurrentUser();

            Task task = taskRepoistory.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

            // (Optionnel) sécurité: seul le dev assigné ou le chef de projet peut clôturer
            if (!task.getDeveloppeur().getId().equals(current.getId())) {
                throw new AccessdeniedException("Non autorisé à clôturer cette tâche.");
            }

            // déjà terminé ? on sort idempotent
            if (task.getStatut() == StatutTache.EN_COURS) {
                return mapToReponse(task);
            }

            task.setStatut(StatutTache.EN_COURS);
            taskRepoistory.save(task);

            // ⬇️ Mise à jour immédiate de la progression projet
            projetService.updateProjectProgress(task.getProject().getId());

            // (Optionnel) log + notif
            //logDone(task);
            // notificationService.notifyProjectProgressUpdated(task.getProject().getId());

            return mapToReponse(task);
    }

    @Override
    public TaskProgressResponse getProgressByProject(int projectId) {
        Project project = projetRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));
        
        long totalTasks = taskRepoistory.countByProjectId(projectId);
        long completedTasks = taskRepoistory.countByProjectIdAndStatut(projectId, StatutTache.TERMINE);
        long inProgressTasks = taskRepoistory.countByProjectIdAndStatut(projectId, StatutTache.EN_COURS);
        long blockedTasks = taskRepoistory.countByProjectIdAndStatut(projectId, StatutTache.BLOQUE);
        
        double completionPercentage = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;
        
        return TaskProgressResponse.builder()
                .projectId(projectId)
                .projectTitre(project.getTitre())
                .completionPercentage(completionPercentage)
                .completedTasks((int) completedTasks)
                .totalTasks((int) totalTasks)
                .inProgressTasks((int) inProgressTasks)
                .blockedTasks((int) blockedTasks)
                .build();
    }

    @Override
    public TaskResponse markTaskAsBlocked(int taskId) {
        User current = getCurrentUser();

        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // (Optionnel) sécurité: seul le dev assigné ou le chef de projet peut bloquer
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à bloquer cette tâche.");
        }

        // déjà bloquée ? on sort idempotent
        if (task.getStatut() == StatutTache.BLOQUE) {
            return mapToReponse(task);
        }

        task.setStatut(StatutTache.BLOQUE);
        taskRepoistory.save(task);

        // ⬇️ Mise à jour immédiate de la progression projet
        projetService.updateProjectProgress(task.getProject().getId());

        return mapToReponse(task);
    }

    // Timer functionality
    @Override
    public TaskResponse updateTaskHours(int taskId, double hours) {
        User current = getCurrentUser();
        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // Vérifier que l'utilisateur est le développeur assigné
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à modifier cette tâche.");
        }

        // Mettre à jour les heures effectives
        int currentEffectiveHours = task.getEffectiveHours() != null ? task.getEffectiveHours() : 0;
        int newEffectiveHours = currentEffectiveHours + (int) Math.round(hours);
        task.setEffectiveHours(newEffectiveHours);

        // Mettre à jour les heures restantes
        int plannedHours = task.getPlannedHours() != null ? task.getPlannedHours() : 0;
        int remainingHours = Math.max(0, plannedHours - newEffectiveHours);
        task.setRemainingHours(remainingHours);

        Task savedTask = taskRepoistory.save(task);

        // Log de l'action
        historiqueService.logAction(new LogRequest(
                TypeOperation.MODIFICATION,
                "Mise à jour des heures effectives pour la tâche '" + savedTask.getTitre() + "' (ID " + savedTask.getId() + ") par " + current.getUsername(),
                savedTask.getId(),
                EntityName.TASK
        ));

        return mapToReponse(savedTask);
    }

    @Override
    public Map<String, Object> startTaskTimer(int taskId) {
        User current = getCurrentUser();
        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // Vérifier que l'utilisateur est le développeur assigné
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à démarrer le timer pour cette tâche.");
        }

        // Pour l'instant, on simule le timer côté backend
        // Dans une vraie implémentation, on stockerait le timestamp de début en base
        Map<String, Object> response = new HashMap<>();
        response.put("taskId", taskId);
        response.put("status", "started");
        response.put("startTime", System.currentTimeMillis());
        response.put("message", "Timer démarré pour la tâche: " + task.getTitre());

        return response;
    }

    @Override
    public Map<String, Object> stopTaskTimer(int taskId) {
        User current = getCurrentUser();
        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // Vérifier que l'utilisateur est le développeur assigné
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à arrêter le timer pour cette tâche.");
        }

        // Pour l'instant, on simule l'arrêt du timer
        // Dans une vraie implémentation, on calculerait le temps écoulé
        Map<String, Object> response = new HashMap<>();
        response.put("taskId", taskId);
        response.put("status", "stopped");
        response.put("stopTime", System.currentTimeMillis());
        response.put("message", "Timer arrêté pour la tâche: " + task.getTitre());

        return response;
    }

    @Override
    public Map<String, Object> getTaskTimerStatus(int taskId) {
        User current = getCurrentUser();
        Task task = taskRepoistory.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        // Vérifier que l'utilisateur est le développeur assigné
        if (!task.getDeveloppeur().getId().equals(current.getId())) {
            throw new AccessdeniedException("Non autorisé à consulter le timer de cette tâche.");
        }

        // Pour l'instant, on retourne un statut par défaut
        Map<String, Object> response = new HashMap<>();
        response.put("taskId", taskId);
        response.put("isRunning", false);
        response.put("elapsedTime", 0);
        response.put("message", "Statut du timer pour la tâche: " + task.getTitre());

        return response;
    }


    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    private TaskResponse mapToReponse(Task task){
        String devUsername = task.getDeveloppeur() != null ? task.getDeveloppeur().getUsername() : null;
        String projectTitre = task.getProject() != null ? task.getProject().getTitre() : null;
        
        // Créer les objets complets
        TaskResponse.ProjectInfo projectInfo = null;
        if (task.getProject() != null) {
            projectInfo = new TaskResponse.ProjectInfo(
                task.getProject().getId(),
                task.getProject().getTitre(),
                task.getProject().getDescription()
            );
        }
        
        TaskResponse.DeveloperInfo developerInfo = null;
        if (task.getDeveloppeur() != null) {
            developerInfo = new TaskResponse.DeveloperInfo(
                task.getDeveloppeur().getId(),
                task.getDeveloppeur().getUsername(),
                task.getDeveloppeur().getEmail()
            );
        }
        
        return new TaskResponse(
                task.getId(),
                task.getTitre(),
                task.getDescription(),
                task.getDateDebut(),
                task.getDateFin(),
                task.getStatut(),
                task.getPriorite(),
                task.getPlannedHours(),
                task.getEffectiveHours(),
                task.getRemainingHours(),
                devUsername,
                projectTitre,
                projectInfo,
                developerInfo
        );
    }

}
