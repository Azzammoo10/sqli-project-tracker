package com.sqli.stage.backendsqli.dto.ProjectDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskresponseByProject;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Task;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
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

    @JsonIgnoreProperties("project") // sécurise le JSON
    private List<TaskresponseByProject> tasks;

}
