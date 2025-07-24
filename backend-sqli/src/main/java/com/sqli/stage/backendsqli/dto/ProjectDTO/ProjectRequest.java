package com.sqli.stage.backendsqli.dto.ProjectDTO;

import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    @NotNull(message = "L'identifiant du client est obligatoire")
    @Positive(message = "L'identifiant du client doit être un nombre positif")
    private Integer clientId;

    @NotNull(message = "La date de début est obligatoire")
    @PastOrPresent(message = "La date de début doit être une date passée ou la date actuelle")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @FutureOrPresent(message = "La date de fin doit être une date actuelle ou future")
    private LocalDate dateFin;

    @NotNull(message = "Le statut est obligatoire")
    private StatutProjet statut;
}