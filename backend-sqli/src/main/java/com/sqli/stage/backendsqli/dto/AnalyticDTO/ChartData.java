package com.sqli.stage.backendsqli.dto.AnalyticDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChartData {
    private String label;
    private int value;
}
