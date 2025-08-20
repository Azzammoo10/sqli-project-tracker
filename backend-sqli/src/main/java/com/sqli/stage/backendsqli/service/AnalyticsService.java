package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.BuildProjectDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TeamDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TmaProjectDashboardResponse;
import java.util.List;
import java.util.Map;

public interface AnalyticsService {
    // Méthodes existantes
    DashboardStatsResponse getDashboardStats();
    WorkloadResponse getWorkloadForUser(int userId);
    ProgressResponse getProjectProgress(int projectId);
    List<ChartData> getCompletionRateOverTime();
    List<TeamDashboardResponse> getTeamDashboard();
    List<TmaProjectDashboardResponse> getTmaDashboard();
    
    // Nouvelles méthodes pour le dashboard chef de projet
    Map<String, Object> getChefDashboardStats();
    List<Map<String, Object>> getRecentActivity();
    List<ProgressResponse> getProjectProgress();
    List<ChartData> getTaskStatusDistribution();
    List<WorkloadResponse> getWorkloadAnalysis();
    List<Map<String, Object>> getTeamOverview();
    List<Map<String, Object>> getDetailedTeamOverview();
    List<Map<String, Object>> getUpcomingDeadlines(int days);
    Map<String, Object> getTeamPerformance();
    List<Map<String, Object>> getOverdueProjects();
    List<Map<String, Object>> getOverdueTasks();
    List<ChartData> getCompletionRateData();
    List<Map<String, Object>> getBuildProjects();
    List<Map<String, Object>> getDashboardTeam();
}
