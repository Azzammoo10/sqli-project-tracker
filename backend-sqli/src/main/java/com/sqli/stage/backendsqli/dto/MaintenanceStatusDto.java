package com.sqli.stage.backendsqli.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceStatusDto {
    private boolean enabled;
    private String message;
    private LocalDateTime startedAt;
    private LocalDateTime updatedAt;
}

