package com.sqli.stage.backendsqli.dto.TaskDTO;
import com.sqli.stage.backendsqli.entity.Enums.Priorite;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TaskResponse {
    private Integer id;
    private String titre;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutTache statut;
    private Priorite priorite;            // ajouté
    private Integer plannedHours;         // ajouté
    private Integer effectiveHours;       // ajouté
    private Integer remainingHours;       // ajouté
    private String developpeurUsername;
    private String projectTitre;
}