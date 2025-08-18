package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.AnalyticDTO.ChartData;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.ProgressResponse;
import com.sqli.stage.backendsqli.dto.AnalyticDTO.WorkloadResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.BuildProjectDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TeamDashboardResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.TmaProjectDashboardResponse;
import java.util.List;





public interface AnalyticsService {
    DashboardStatsResponse getDashboardStats();
    WorkloadResponse getWorkloadForUser(int userId);
    ProgressResponse getProjectProgress(int projectId);
    List<ChartData> getCompletionRateOverTime();
    List<TeamDashboardResponse> getTeamDashboard();
    List<TmaProjectDashboardResponse> getTmaDashboard();
}
