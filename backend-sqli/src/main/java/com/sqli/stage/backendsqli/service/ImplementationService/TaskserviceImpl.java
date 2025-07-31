package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.TaskDTO.TaskFilterRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.AccessdeniedException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.Taskservice;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TaskserviceImpl implements Taskservice {

    private final UserRepository userRepository;
    private final TaskRepository taskRepoistory;
    private final ProjetRepository projetRepository;

    @Override
    public TaskResponse createTask(TaskRequest request) {
        User chefProjet = getCurrentUser();

        if(chefProjet.getRole() != Role.CHEF_DE_PROJET){
            throw new AccessdeniedException("Seuls les chefs de projet peuvent créer des tâches");
        }
        User devellopeur = userRepository.findById(request.getDeveloppeurId())
                .orElseThrow(() -> new ResourceNotFoundException("Développeur non trouvé"));

        Project projet = projetRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));

        if(projet.getCreatedBy().getId() != chefProjet.getId()){
            throw new AccessdeniedException("Vous ne pouvez pas créer une tâche sur un projet que vous n'avez pas créé.");
        }
        if(devellopeur.getRole() != Role.DEVELOPPEUR){
            throw new IllegalArgumentException("Seuls les développeurs peuvent recevoir des tâches");
        }
        if (!projet.getDeveloppeurs().contains(devellopeur)) {
            throw new AccessdeniedException("Ce développeur n’est pas affecté à ce projet.");
        }



        Task task = new Task();
        task.setTitre(request.getTitre());
        task.setDescription(request.getDescription());
        task.setDateDebut(request.getDateDebut());
        task.setDateFin(request.getDateFin());
        task.setStatut(request.getStatut());
        task.setDeveloppeur(devellopeur);
        task.setProject(projet);
        Task savedTask = taskRepoistory.save(task);

        return mapToReponse(savedTask);
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
    public List<TaskResponse> getTasksByProject(int projectId) {
        return taskRepoistory.findByProjectId(projectId).stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByDeveloper(int developpeurId) {
        return taskRepoistory.findByDeveloppeurId(developpeurId).stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public Map<StatutTache, Long> getTaskStats() {
        return taskRepoistory.findAll().stream()
                .collect(Collectors.groupingBy(Task::getStatut, Collectors.counting()));
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


    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    private TaskResponse mapToReponse(Task task){
        return new TaskResponse(
                task.getId(),
                task.getTitre(),
                task.getDescription(),
                task.getDateDebut(),
                task.getDateFin(),
                task.getStatut(),
                task.getDeveloppeur().getUsername(),
                task.getProject().getTitre()
        );
    }

}
