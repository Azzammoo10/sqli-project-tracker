package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TeamDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TmaProjectDashboardResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.entity.User;
import java.util.Random;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ProjetRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long totalProjects = projectRepository.count();

        long activeProjects = projectRepository.findByStatut(StatutProjet.EN_COURS).size();
        long completedProjects = projectRepository.findByStatut(StatutProjet.TERMINE).size();

        LocalDate today = LocalDate.now();
        long lateProjects = projectRepository.findAll().stream()
                .filter(p -> p.getDateFin() != null)
                .filter(p -> p.getDateFin().isBefore(today))
                .filter(p -> p.getStatut() != StatutProjet.TERMINE)
                .count();

        long totalTasks = taskRepository.count();
        long todayTasks = taskRepository.countByDateDebut(today);

        return DashboardStatsResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .lateProjects(lateProjects)
                .build();
    }

    @Override
    public WorkloadResponse getWorkloadForUser(int userId) {
        int assigned = taskRepository.countByDeveloppeurId(userId);
        int completed = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.TERMINE);
        int inProgress = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.EN_COURS);
        int blocked = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.BLOQUE);

        return WorkloadResponse.builder()
                .userId(userId)
                .assignedTasks(assigned)
                .completedTasks(completed)
                .inProgressTasks(inProgress)
                .blockedTasks(blocked)
                .build();
    }

    @Override
    public ProgressResponse getProjectProgress(int projectId) {
        int total = Math.toIntExact(taskRepository.countByProjectId(projectId));
        int done = taskRepository.countByProjectIdAndStatut(projectId, StatutTache.TERMINE);
        double percent = total > 0 ? (done * 100.0) / total : 0;

        return ProgressResponse.builder()
                .projectId(projectId)
                .completionPercentage(percent)
                .build();
    }

    @Override
    public List<ChartData> getCompletionRateOverTime() {
        List<ChartData> data = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            int completed = taskRepository.countCompletedTasksInMonth(date.getYear(), date.getMonthValue());

            data.add(ChartData.builder()
                    .label(date.getMonth().name().substring(0, 3) + " " + date.getYear())
                    .value(completed)
                    .build());
        }

        return data;
    }

    @Override
    public List<TeamDashboardResponse> getTeamDashboard() {
        List<User> devs = userRepository.findByRole(Role.DEVELOPPEUR);
        List<TeamDashboardResponse> result = new ArrayList<>();

        for (User user : devs) {
            int userId = user.getId();
            int total = taskRepository.countByDeveloppeurId(userId);
            int completed = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.TERMINE);
            int inProgress = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.EN_COURS);
            int blocked = taskRepository.countByDeveloppeurIdAndStatut(userId, StatutTache.BLOQUE);

            double rate = total > 0 ? (completed * 100.0) / total : 0;

            result.add(TeamDashboardResponse.builder()
                    .userId(userId)
                    .fullName(user.getNom())
                    .totalTasks(total)
                    .completedTasks(completed)
                    .inProgressTasks(inProgress)
                    .blockedTasks(blocked)
                    .completionRate(rate)
                    .build());
        }

        return result;
    }

    @Override
    public List<TmaProjectDashboardResponse> getTmaDashboard() {
        List<Project> projects = projectRepository.findTmaProjects();
        List<TmaProjectDashboardResponse> result = new ArrayList<>();

        for (Project p : projects) {
            int total = Math.toIntExact(taskRepository.countByProjectId(p.getId()));
            int done = taskRepository.countByProjectIdAndStatut(p.getId(), StatutTache.TERMINE);
            double rate = total > 0 ? (done * 100.0) / total : 0;

            result.add(TmaProjectDashboardResponse.builder()
                    .projectId(p.getId())
                    .titre(p.getTitre())
                    .clientName(p.getClient() != null ? p.getClient().getNom() : "N/A")
                    .totalTasks(total)
                    .completedTasks(done)
                    .completionRate(rate)
                    .startDate(p.getDateDebut() != null ? p.getDateDebut().toString() : "N/A")
                    .endDate(p.getDateFin() != null ? p.getDateFin().toString() : "N/A")
                    .build());
        }

        return result;
    }

    // Nouvelles méthodes pour le dashboard chef de projet

    @Override
    public Map<String, Object> getChefDashboardStats() {
        // Récupérer le chef de projet connecté
        String currentUsername = getCurrentUsername();
        User currentChef = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Chef de projet non trouvé"));
        
        LocalDate today = LocalDate.now();
        
        // Filtrer les projets créés par ce chef de projet
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        long totalProjects = chefProjects.size();
        long activeProjects = chefProjects.stream()
                .filter(p -> p.getStatut() == StatutProjet.EN_COURS)
                .count();
        long completedProjects = chefProjects.stream()
                .filter(p -> p.getStatut() == StatutProjet.TERMINE)
                .count();
        long overdueProjects = chefProjects.stream()
                .filter(p -> p.getDateFin() != null && p.getDateFin().isBefore(today) && p.getStatut() != StatutProjet.TERMINE)
                .count();

        // Filtrer les tâches des projets de ce chef
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        long totalTasks = 0;
        long completedTasks = 0;
        long pendingTasks = 0;
        
        if (!projectIds.isEmpty()) {
            totalTasks = taskRepository.countByProjectIdIn(projectIds);
            completedTasks = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.TERMINE);
            pendingTasks = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.EN_COURS);
        }
        
        // Compter les développeurs assignés aux projets de ce chef
        Set<User> assignedDevelopers = new HashSet<>();
        for (Project project : chefProjects) {
            if (project.getDeveloppeurs() != null) {
                assignedDevelopers.addAll(project.getDeveloppeurs());
            }
        }
        long teamMembers = assignedDevelopers.size();
        
        // Calcul du taux de réussite moyen des projets de ce chef
        double averageCompletionRate = chefProjects.stream()
                .mapToDouble(p -> p.getProgression() != null ? p.getProgression().doubleValue() : 0.0)
                .average()
                .orElse(0.0);

        // Calcul de la croissance mensuelle (simulation basée sur les projets récents)
        double monthlyGrowth = chefProjects.stream()
                .filter(p -> p.getDateDebut() != null && p.getDateDebut().isAfter(today.minusMonths(1)))
                .count() * 10.0; // Simulation
        
        // Tâches complétées cette semaine (simulation)
        long weeklyTasksCompleted = completedTasks > 0 ? Math.min(completedTasks, 15) : 0;
        
        // Échéances à venir (7 jours) (simulation)
        long upcomingDeadlines = chefProjects.stream()
                .filter(p -> p.getDateFin() != null && 
                           p.getDateFin().isAfter(today) && 
                           p.getDateFin().isBefore(today.plusDays(7)))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("activeProjects", activeProjects);
        stats.put("completedProjects", completedProjects);
        stats.put("overdueProjects", overdueProjects);
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("teamMembers", teamMembers);
        stats.put("averageCompletionRate", Math.round(averageCompletionRate));
        stats.put("monthlyGrowth", Math.round(monthlyGrowth));
        stats.put("weeklyTasksCompleted", weeklyTasksCompleted);
        stats.put("upcomingDeadlines", upcomingDeadlines);

        return stats;
    }

    @Override
    public List<Map<String, Object>> getRecentActivity() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Ajouter des activités basées sur les projets récents
        for (Project project : chefProjects) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", project.getId());
            activity.put("type", "PROJECT");
            activity.put("description", "Projet '" + project.getTitre() + "' créé");
            activity.put("timestamp", LocalDateTime.now().minusDays(new Random().nextInt(7)).toString());
            activity.put("projectId", project.getId());
            activity.put("projectName", project.getTitre());
            activities.add(activity);
        }
        
        // Ajouter des activités basées sur les tâches récentes
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        if (!projectIds.isEmpty()) {
            List<Task> recentTasks = taskRepository.findByProjectIdIn(projectIds);
            for (Task task : recentTasks) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", task.getId());
                activity.put("type", "TASK");
                activity.put("description", "Tâche '" + task.getTitre() + "' créée dans le projet '" + task.getProject().getTitre() + "'");
                activity.put("timestamp", LocalDateTime.now().minusDays(new Random().nextInt(5)).toString());
                activity.put("projectId", task.getProject().getId());
                activity.put("projectName", task.getProject().getTitre());
                activity.put("taskId", task.getId());
                activity.put("taskName", task.getTitre());
                activities.add(activity);
            }
        }
        
        // Trier par timestamp (plus récent en premier) et limiter à 10
        activities.sort((a, b) -> b.get("timestamp").toString().compareTo(a.get("timestamp").toString()));
        return activities.stream().limit(10).collect(Collectors.toList());
    }

    @Override
    public List<ProgressResponse> getProjectProgress() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        return chefProjects.stream()
                .map(p -> {
                    double completionPercentage = p.getProgression() != null ? p.getProgression().doubleValue() : 0.0;
                    
                    // Utiliser le vrai statut de la base de données au lieu de le déduire
                    String statut = p.getStatut() != null ? p.getStatut().toString() : "EN_COURS";
                    
                    return ProgressResponse.builder()
                            .projectId(p.getId())
                            .titre(p.getTitre())
                            .statut(statut) // Utiliser le vrai statut de la base
                            .completionPercentage(completionPercentage)
                            .color("#4B2A7B")
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ChartData> getTaskStatusDistribution() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        
        if (projectIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        long nonCommence = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.NON_COMMENCE);
        long enCours = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.EN_COURS);
        long bloque = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.BLOQUE);
        long termine = taskRepository.countByProjectIdInAndStatut(projectIds, StatutTache.TERMINE);
        
        List<ChartData> data = new ArrayList<>();
        if (nonCommence > 0) data.add(ChartData.builder().label("Non commencé").value((int)nonCommence).color("#6B7280").build());
        if (enCours > 0) data.add(ChartData.builder().label("En cours").value((int)enCours).color("#3B82F6").build());
        if (bloque > 0) data.add(ChartData.builder().label("Bloqué").value((int)bloque).color("#EF4444").build());
        if (termine > 0) data.add(ChartData.builder().label("Terminé").value((int)termine).color("#10B981").build());
        
        return data;
    }

    @Override
    public List<WorkloadResponse> getWorkloadAnalysis() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        // Récupérer tous les développeurs assignés aux projets de ce chef
        Set<User> assignedDevelopers = new HashSet<>();
        for (Project project : chefProjects) {
            if (project.getDeveloppeurs() != null) {
                assignedDevelopers.addAll(project.getDeveloppeurs());
            }
        }
        
        return assignedDevelopers.stream()
                .map(dev -> {
                    int assigned = taskRepository.countByDeveloppeurId(dev.getId());
                    int completed = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.TERMINE);
                    int inProgress = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.EN_COURS);
                    int blocked = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.BLOQUE);
                    
                    return WorkloadResponse.builder()
                            .userId(dev.getId())
                            .assignedTasks(assigned)
                            .completedTasks(completed)
                            .inProgressTasks(inProgress)
                            .blockedTasks(blocked)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTeamOverview() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        // Récupérer tous les développeurs assignés aux projets de ce chef
        Set<User> assignedDevelopers = new HashSet<>();
        for (Project project : chefProjects) {
            if (project.getDeveloppeurs() != null) {
                assignedDevelopers.addAll(project.getDeveloppeurs());
            }
        }
        
        return assignedDevelopers.stream()
                .map(dev -> {
                    Map<String, Object> member = new HashMap<>();
                    member.put("id", dev.getId());
                    member.put("username", dev.getUsername());
                    member.put("email", dev.getEmail());
                    member.put("role", dev.getRole());
                    member.put("jobTitle", dev.getJobTitle());
                    member.put("department", dev.getDepartment());
                    
                    // Compter les projets assignés à ce développeur
                    long assignedProjects = chefProjects.stream()
                            .filter(p -> p.getDeveloppeurs() != null && p.getDeveloppeurs().contains(dev))
                            .count();
                    member.put("assignedProjects", assignedProjects);
                    
                    // Compter les tâches
                    int completedTasks = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.TERMINE);
                    int pendingTasks = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.EN_COURS);
                    member.put("completedTasks", completedTasks);
                    member.put("pendingTasks", pendingTasks);
                    
                    return member;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDetailedTeamOverview() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        System.out.println("=== DEBUG: getDetailedTeamOverview ===");
        System.out.println("Chef connecté: " + currentUsername);
        System.out.println("Projets du chef: " + chefProjects.size());
        
        // Récupérer tous les développeurs assignés aux projets de ce chef
        Set<User> assignedDevelopers = new HashSet<>();
        for (Project project : chefProjects) {
            if (project.getDeveloppeurs() != null) {
                System.out.println("Projet '" + project.getTitre() + "' (ID: " + project.getId() + ") - Développeurs: " + 
                                 project.getDeveloppeurs().stream().map(User::getUsername).collect(Collectors.joining(", ")));
                assignedDevelopers.addAll(project.getDeveloppeurs());
            }
        }
        
        System.out.println("Développeurs uniques trouvés: " + assignedDevelopers.size());
        
        return assignedDevelopers.stream()
                .map(dev -> {
                    System.out.println("--- Traitement développeur: " + dev.getUsername() + " (ID: " + dev.getId() + ") ---");
                    
                    Map<String, Object> member = new HashMap<>();
                    member.put("id", dev.getId());
                    member.put("username", dev.getUsername());
                    member.put("email", dev.getEmail());
                    member.put("role", dev.getRole());
                    member.put("jobTitle", dev.getJobTitle() != null ? dev.getJobTitle() : "Développeur");
                    member.put("department", dev.getDepartment() != null ? dev.getDepartment().toString() : "Développement");
                    member.put("phone", dev.getPhone());
                    member.put("enabled", dev.isEnabled());
                    member.put("actifDansProjet", dev.isActifDansProjet());
                    
                    // Compter les projets assignés à ce développeur
                    List<Project> userProjects = chefProjects.stream()
                            .filter(p -> p.getDeveloppeurs() != null && p.getDeveloppeurs().contains(dev))
                            .toList();
                    
                    System.out.println("Projets assignés à " + dev.getUsername() + ": " + userProjects.size());
                    userProjects.forEach(p -> System.out.println("  - " + p.getTitre() + " (ID: " + p.getId() + ")"));
                    
                    member.put("assignedProjects", userProjects.size());
                    
                    // Détails des projets assignés
                    List<Map<String, Object>> projectDetails = userProjects.stream()
                            .map(p -> {
                                Map<String, Object> project = new HashMap<>();
                                project.put("id", p.getId());
                                project.put("titre", p.getTitre());
                                project.put("progression", p.getProgression() != null ? p.getProgression() : 0);
                                project.put("statut", p.getStatut().toString());
                                project.put("dateDebut", p.getDateDebut() != null ? p.getDateDebut().toString() : null);
                                project.put("dateFin", p.getDateFin() != null ? p.getDateFin().toString() : null);
                                return project;
                            })
                            .toList();
                    member.put("projects", projectDetails);
                    
                    // Compter les tâches UNIQUEMENT des projets du chef connecté
                    List<Integer> projectIds = userProjects.stream().map(Project::getId).toList();
                    int totalTasks = 0;
                    int completedTasks = 0;
                    int inProgressTasks = 0;
                    int blockedTasks = 0;
                    int nonCommenceTasks = 0;
                    
                    System.out.println("Project IDs pour " + dev.getUsername() + ": " + projectIds);
                    
                    if (!projectIds.isEmpty()) {
                        try {
                            // Compter les tâches par statut pour les projets assignés à ce développeur
                            totalTasks = taskRepository.countByDeveloppeurIdAndProjectIdIn(dev.getId(), projectIds);
                            completedTasks = taskRepository.countByDeveloppeurIdAndProjectIdInAndStatut(dev.getId(), projectIds, StatutTache.TERMINE);
                            inProgressTasks = taskRepository.countByDeveloppeurIdAndProjectIdInAndStatut(dev.getId(), projectIds, StatutTache.EN_COURS);
                            blockedTasks = taskRepository.countByDeveloppeurIdAndProjectIdInAndStatut(dev.getId(), projectIds, StatutTache.BLOQUE);
                            nonCommenceTasks = taskRepository.countByDeveloppeurIdAndProjectIdInAndStatut(dev.getId(), projectIds, StatutTache.NON_COMMENCE);
                            
                            System.out.println("Méthodes repository appelées avec succès");
                        } catch (Exception e) {
                            System.out.println("Erreur avec les nouvelles méthodes repository: " + e.getMessage());
                            // Fallback: utiliser les anciennes méthodes
                            System.out.println("Utilisation du fallback...");
                            totalTasks = taskRepository.countByDeveloppeurId(dev.getId());
                            completedTasks = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.TERMINE);
                            inProgressTasks = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.EN_COURS);
                            blockedTasks = taskRepository.countByDeveloppeurIdAndStatut(dev.getId(), StatutTache.BLOQUE);
                            nonCommenceTasks = totalTasks - completedTasks - inProgressTasks - blockedTasks;
                            if (nonCommenceTasks < 0) nonCommenceTasks = 0;
                            
                            System.out.println("Fallback utilisé - Tâches globales pour " + dev.getUsername() + ": Total=" + totalTasks);
                        }
                    } else {
                        System.out.println("Aucun projet assigné à " + dev.getUsername());
                    }
                    
                    System.out.println("Tâches pour " + dev.getUsername() + " dans les projets du chef: Total=" + totalTasks + 
                                     ", Terminées=" + completedTasks + ", En cours=" + inProgressTasks + 
                                     ", Bloquées=" + blockedTasks + ", Non commencées=" + nonCommenceTasks);
                    
                    member.put("totalTasks", totalTasks);
                    member.put("completedTasks", completedTasks);
                    member.put("inProgressTasks", inProgressTasks);
                    member.put("blockedTasks", blockedTasks);
                    member.put("nonCommenceTasks", nonCommenceTasks);
                    
                    // Calculer le taux de completion
                    double completionRate = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0;
                    member.put("completionRate", Math.round(completionRate));
                    
                    // Calculer la charge de travail (basée sur les tâches en cours et bloquées)
                    // Charge = (tâches en cours + bloquées) / total * 100
                    double workload = 0.0;
                    if (totalTasks > 0) {
                        // Calcul basé sur les tâches actives (en cours + bloquées)
                        workload = ((inProgressTasks + blockedTasks) * 100.0) / totalTasks;
                        
                        // Si toutes les tâches sont terminées, charge = 0
                        if (completedTasks == totalTasks) {
                            workload = 0.0;
                        }
                        // Si toutes les tâches sont non commencées, charge = 0 (pas encore commencé)
                        else if (nonCommenceTasks == totalTasks) {
                            workload = 0.0;
                        }
                        // Limiter à 100%
                        workload = Math.min(workload, 100.0);
                    }
                    
                    System.out.println("Charge calculée pour " + dev.getUsername() + " (basée sur tâches non commencées): " + Math.round(workload) + "%");
                    
                    member.put("workload", Math.round(workload));
                    
                    // Calculer la disponibilité (inverse de la charge)
                    double availability = 100 - workload;
                    member.put("availability", Math.round(availability));
                    
                    // Dernière activité (basée sur la dernière tâche modifiée)
                    // Pour l'instant, on utilise la date de création de l'utilisateur
                    member.put("lastActivity", dev.getUsername()); // Placeholder
                    
                    return member;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getUpcomingDeadlines(int days) {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);
        
        return chefProjects.stream()
                .filter(p -> p.getDateFin() != null && 
                           p.getDateFin().isAfter(today) && 
                           p.getDateFin().isBefore(futureDate))
                .map(p -> {
                    Map<String, Object> deadline = new HashMap<>();
                    deadline.put("id", p.getId());
                    deadline.put("titre", p.getTitre());
                    deadline.put("dateFin", p.getDateFin().toString());
                    deadline.put("type", "project");
                    return deadline;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getTeamPerformance() {
        // Pour l'instant, retourner des données vides pour un nouveau chef de projet
        Map<String, Object> performance = new HashMap<>();
        performance.put("averageTaskCompletionTime", 0);
        performance.put("onTimeDeliveryRate", 0);
        performance.put("teamProductivity", 0);
        performance.put("topPerformers", new ArrayList<>());
        return performance;
    }

    @Override
    public List<Map<String, Object>> getOverdueProjects() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        LocalDate today = LocalDate.now();
        
        return chefProjects.stream()
                .filter(p -> p.getDateFin() != null && 
                           p.getDateFin().isBefore(today) && 
                           p.getStatut() != StatutProjet.TERMINE)
                .map(p -> {
                    Map<String, Object> overdue = new HashMap<>();
                    overdue.put("id", p.getId());
                    overdue.put("titre", p.getTitre());
                    overdue.put("dateFin", p.getDateFin().toString());
                    overdue.put("daysOverdue", today.toEpochDay() - p.getDateFin().toEpochDay());
                    return overdue;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getOverdueTasks() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        List<Integer> projectIds = chefProjects.stream().map(Project::getId).toList();
        LocalDate today = LocalDate.now();
        
        if (projectIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Cette méthode nécessiterait une requête personnalisée dans TaskRepository
        // Pour l'instant, retourner une liste vide
        return new ArrayList<>();
    }

    @Override
    public List<ChartData> getCompletionRateData() {
        return getCompletionRateOverTime();
    }

    @Override
    public List<Map<String, Object>> getBuildProjects() {
        String currentUsername = getCurrentUsername();
        List<Project> chefProjects = projectRepository.findByCreatedByUsername(currentUsername);
        
        return chefProjects.stream()
                .filter(p -> p.getType() == com.sqli.stage.backendsqli.entity.Enums.TypeProjet.Delivery)
                .map(p -> {
                    Map<String, Object> build = new HashMap<>();
                    build.put("projectId", p.getId());
                    build.put("titre", p.getTitre());
                    build.put("completionRate", p.getProgression() != null ? p.getProgression().doubleValue() : 0.0);
                    build.put("totalTasks", taskRepository.countByProjectId(p.getId()));
                    build.put("completedTasks", taskRepository.countByProjectIdAndStatut(p.getId(), StatutTache.TERMINE));
                    return build;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDashboardTeam() {
        return getTeamOverview();
    }

    private String getCurrentUsername() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
    }
}
