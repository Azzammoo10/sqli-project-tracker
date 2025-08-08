package com.sqli.stage.backendsqli.dto.ProjectDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamDashboardResponse {
    private int userId;
    private String fullName;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int blockedTasks;
    private double completionRate;
}
