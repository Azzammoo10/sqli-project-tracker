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
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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


}
