package com.sqli.stage.backendsqli.dto.TaskDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskProgressResponse {
    private int projectId;
    private String projectTitre;
    private double completionPercentage;
    private int completedTasks;
    private int totalTasks;
    private int inProgressTasks;
    private int blockedTasks;
}
