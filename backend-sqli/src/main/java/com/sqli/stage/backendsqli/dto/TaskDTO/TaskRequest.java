package com.sqli.stage.backendsqli.dto.TaskDTO;

import com.sqli.stage.backendsqli.entity.Enums.Priorite;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TaskRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String titre;

    @Size(max = 500)
    private String description;

    @NotNull
    @FutureOrPresent
    private LocalDate dateDebut;

    @NotNull
    @Future
    private LocalDate dateFin;

    @NotNull
    private StatutTache statut;

    @NotNull
    private Integer projectId;

    @NotNull
    private Integer developpeurId;

    // ----- Nouveaux champs pour coller à la méthode -----

    @NotNull
    private Priorite priorite;

    // heures planifiées (obligatoire, base de calcul)
    @NotNull
    @Min(0)
    private Integer plannedHours;

    // optionnels: on met des défauts si null
    @Min(0)
    private Integer effectiveHours;        // défaut: 0

    @Min(0)
    private Integer remainingHours;        // défaut: plannedHours - effectiveHours

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00")
    private BigDecimal progression;        // défaut: calculée (effective/planned*100) ou 0 si planned=0
}


