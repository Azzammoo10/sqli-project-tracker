package com.sqli.stage.backendsqli.dto.ProjectDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BuildProjectDashboardResponse {
    private int projectId;
    private String titre;
    private double completionRate;
    private int totalTasks;
    private int completedTasks;
}
