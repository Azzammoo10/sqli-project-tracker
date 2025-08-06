package com.sqli.stage.backendsqli.dto.TaskDTO;

import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    private String titre;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutTache statut;
    private Integer projectId;
    private Integer developpeurId;
}

