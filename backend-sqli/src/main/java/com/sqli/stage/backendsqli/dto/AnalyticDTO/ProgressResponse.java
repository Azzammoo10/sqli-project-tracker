package com.sqli.stage.backendsqli.dto.AnalyticDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressResponse {
    private int projectId;
    private double completionPercentage;
}
