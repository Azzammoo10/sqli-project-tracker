package com.sqli.stage.backendsqli.dto.ProjectDTO;

import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long lateProjects;
}

