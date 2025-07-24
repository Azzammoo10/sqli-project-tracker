package com.sqli.stage.backendsqli.dto.ProjectDTO;

import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import lombok.*;

import java.time.LocalDate;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailsResponse {
    private int id;
    private String titre;
    private String description;
    private String clientName;
    private String chefDeProjet;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutProjet statut;
    private boolean isPublicLinkEnabled;
    private String uuidPublic;

    //private List<TaskResponse> tasks; // 👈 Optionnel à intégrer plus tard
}
