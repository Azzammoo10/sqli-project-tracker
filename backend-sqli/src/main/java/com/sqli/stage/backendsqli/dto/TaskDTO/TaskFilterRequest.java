package com.sqli.stage.backendsqli.dto.TaskDTO;

import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterRequest {
    private Integer projectId;
    private Integer developpeurId;
    private StatutTache statut;
    private LocalDate dateDebutMin;
    private LocalDate dateDebutMax;
    private LocalDate dateFinMin;
    private LocalDate dateFinMax;
    private String keyword;
    private Integer page = 0;         // pour pagination
    private Integer size = 10;        // pour pagination
}
