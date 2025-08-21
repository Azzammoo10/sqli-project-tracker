package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.DeveloperResponse;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    @Override
    public List<ProjectResponse> getClientProjects() {
        User currentClient = getCurrentClient();
        List<Project> projects = projetRepository.findByClientId(currentClient.getId());
        return projects.stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getClientProject(Integer id) {
        User currentClient = getCurrentClient();
        Project project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet non trouvé avec ID : " + id));
        
        // Vérifier que le projet appartient bien au client connecté
        if (!project.getClient().getId().equals(currentClient.getId())) {
            throw new ResourceNotFoundException("Accès non autorisé à ce projet");
        }
        
        return mapToProjectResponse(project);
    }

    @Override
    public Map<String, Object> getClientDashboardStats() {
        User currentClient = getCurrentClient();
        List<Project> projects = projetRepository.findByClientId(currentClient.getId());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", projects.size());
        stats.put("activeProjects", projects.stream()
                .filter(p -> p.getStatut().toString().equals("EN_COURS"))
                .count());
        stats.put("completedProjects", projects.stream()
                .filter(p -> p.getStatut().toString().equals("TERMINE"))
                .count());
        
        // Calculer les statistiques des tâches
        int totalTasks = 0;
        int completedTasks = 0;
        int inProgressTasks = 0;
        int overdueTasks = 0;
        
        for (Project project : projects) {
            if (project.getTasks() != null) {
                totalTasks += project.getTasks().size();
                for (Task task : project.getTasks()) {
                    if (task.getStatut().toString().equals("TERMINE")) {
                        completedTasks++;
                    } else if (task.getStatut().toString().equals("EN_COURS")) {
                        inProgressTasks++;
                    }
                    if (task.getDateFin() != null && task.getDateFin().isBefore(LocalDate.now()) 
                        && !task.getStatut().toString().equals("TERMINE")) {
                        overdueTasks++;
                    }
                }
            }
        }
        
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("inProgressTasks", inProgressTasks);
        stats.put("overdueTasks", overdueTasks);
        
        // Calculer la progression moyenne
        double averageProgress = projects.stream()
                .mapToDouble(p -> p.getProgression() != null ? p.getProgression().doubleValue() : 0.0)
                .average()
                .orElse(0.0);
        stats.put("averageProgress", Math.round(averageProgress));
        
        // Compter les développeurs uniques
        Set<Integer> uniqueDevelopers = projects.stream()
                .filter(p -> p.getDeveloppeurs() != null)
                .flatMap(p -> p.getDeveloppeurs().stream())
                .map(User::getId)
                .collect(Collectors.toSet());
        stats.put("totalDevelopers", uniqueDevelopers.size());
        
        return stats;
    }

    @Override
    public List<Map<String, Object>> getProjectTimeline() {
        User currentClient = getCurrentClient();
        List<Project> projects = projetRepository.findByClientId(currentClient.getId());
        
        return projects.stream()
                .sorted(Comparator.comparing(Project::getDateDebut))
                .map(project -> {
                    Map<String, Object> timelineItem = new HashMap<>();
                    timelineItem.put("id", project.getId());
                    timelineItem.put("titre", project.getTitre());
                    timelineItem.put("progression", project.getProgression() != null ? project.getProgression().doubleValue() : 0.0);
                    timelineItem.put("dateDebut", project.getDateDebut() != null ? project.getDateDebut().toString() : "");
                    timelineItem.put("dateFin", project.getDateFin() != null ? project.getDateFin().toString() : "");
                    timelineItem.put("statut", project.getStatut() != null ? project.getStatut().toString() : "");
                    timelineItem.put("type", project.getType() != null ? project.getType().toString() : "");
                    return timelineItem;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getOverdueTasks() {
        User currentClient = getCurrentClient();
        List<Project> projects = projetRepository.findByClientId(currentClient.getId());
        
        List<Map<String, Object>> overdueTasks = new ArrayList<>();
        
        for (Project project : projects) {
            if (project.getTasks() != null) {
                for (Task task : project.getTasks()) {
                    if (task.getDateFin() != null && task.getDateFin().isBefore(LocalDate.now()) 
                        && !task.getStatut().toString().equals("TERMINE")) {
                        Map<String, Object> overdueTask = new HashMap<>();
                        overdueTask.put("id", task.getId());
                        overdueTask.put("titre", task.getTitre());
                        overdueTask.put("projectId", project.getId());
                        overdueTask.put("projectName", project.getTitre());
                        overdueTask.put("dateEcheance", task.getDateFin().toString());
                        overdueTask.put("statut", task.getStatut().toString());
                        overdueTask.put("daysOverdue", LocalDate.now().getDayOfYear() - task.getDateFin().getDayOfYear());
                        overdueTasks.add(overdueTask);
                    }
                }
            }
        }
        
        return overdueTasks;
    }

    @Override
    public List<Map<String, Object>> getRecentActivity() {
        User currentClient = getCurrentClient();
        List<Project> projects = projetRepository.findByClientId(currentClient.getId());
        
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Simuler des activités récentes basées sur les projets
        for (Project project : projects) {
            // Activité de création de projet
            Map<String, Object> creationActivity = new HashMap<>();
            creationActivity.put("id", "proj_" + project.getId() + "_created");
            creationActivity.put("type", "PROJECT_CREATED");
            creationActivity.put("description", "Projet '" + project.getTitre() + "' créé");
            creationActivity.put("timestamp", project.getDateDebut() != null ? project.getDateDebut().toString() : LocalDate.now().toString());
            creationActivity.put("projectId", project.getId());
            creationActivity.put("projectName", project.getTitre());
            activities.add(creationActivity);
            
            // Activité de mise à jour de progression
            if (project.getProgression() != null && project.getProgression().doubleValue() > 0) {
                Map<String, Object> progressActivity = new HashMap<>();
                progressActivity.put("id", "proj_" + project.getId() + "_progress");
                progressActivity.put("type", "PROJECT_UPDATED");
                progressActivity.put("description", "Progression mise à jour à " + Math.round(project.getProgression().doubleValue()) + "%");
                progressActivity.put("timestamp", LocalDate.now().toString());
                progressActivity.put("projectId", project.getId());
                progressActivity.put("projectName", project.getTitre());
                activities.add(progressActivity);
            }
            
            // Activités des tâches
            if (project.getTasks() != null) {
                for (Task task : project.getTasks()) {
                    if (task.getStatut().toString().equals("TERMINE")) {
                        Map<String, Object> taskActivity = new HashMap<>();
                        taskActivity.put("id", "task_" + task.getId() + "_completed");
                        taskActivity.put("type", "TASK_COMPLETED");
                        taskActivity.put("description", "Tâche '" + task.getTitre() + "' terminée");
                        taskActivity.put("timestamp", LocalDate.now().toString());
                        taskActivity.put("projectId", project.getId());
                        taskActivity.put("projectName", project.getTitre());
                        activities.add(taskActivity);
                    }
                }
            }
        }
        
        // Trier par timestamp (plus récent en premier) et limiter à 10 activités
        return activities.stream()
                .sorted((a, b) -> b.get("timestamp").toString().compareTo(a.get("timestamp").toString()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private User getCurrentClient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec username : " + username));
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setTitre(project.getTitre());
        response.setDescription(project.getDescription());
        response.setType(project.getType());
        response.setStatut(project.getStatut());
        response.setProgression(project.getProgression());
        response.setDateDebut(project.getDateDebut());
        response.setDateFin(project.getDateFin());
        response.setClientName(project.getClient() != null ? project.getClient().getNom() : "");
        response.setUuidPublic(project.getUuidPublic());
        response.setPublicLinkEnabled(project.isPublicLinkEnabled());
        
        // Mapper les développeurs
        if (project.getDeveloppeurs() != null) {
            response.setDeveloppeurs(project.getDeveloppeurs().stream()
                    .map(dev -> {
                        DeveloperResponse devInfo = new DeveloperResponse();
                        devInfo.setId(dev.getId());
                        devInfo.setUsername(dev.getUsername());
                        devInfo.setNom(dev.getNom());
                        devInfo.setEmail(dev.getEmail());
                        devInfo.setJobTitle(dev.getJobTitle());
                        return devInfo;
                    })
                    .collect(Collectors.toList()));
        }
        
        // Calculer les statistiques des tâches
        if (project.getTasks() != null) {
            response.setTotalTasks(project.getTasks().size());
            response.setCompletedTasks((int) project.getTasks().stream()
                    .filter(task -> task.getStatut() != null && task.getStatut().toString().equals("TERMINE"))
                    .count());
            response.setInProgressTasks((int) project.getTasks().stream()
                    .filter(task -> task.getStatut() != null && task.getStatut().toString().equals("EN_COURS"))
                    .count());
        }
        
        return response;
    }
}
