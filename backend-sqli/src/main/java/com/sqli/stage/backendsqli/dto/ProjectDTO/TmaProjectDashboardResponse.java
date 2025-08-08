package com.sqli.stage.backendsqli.dto.ProjectDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TmaProjectDashboardResponse {
    private Integer projectId;
    private String titre;
    private String clientName;
    private int totalTasks;
    private int completedTasks;
    private double completionRate;
    private String startDate;
    private String endDate;
}
