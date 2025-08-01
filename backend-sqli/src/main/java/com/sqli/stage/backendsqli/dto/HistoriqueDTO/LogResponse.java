package com.sqli.stage.backendsqli.dto.HistoriqueDTO;

import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogResponse {

    private TypeOperation action;
    private LocalDateTime dateHeure;

    private String description;

    private Integer entityId;
    private EntityName entityName;

    private String userNom;
    private String userUsername;
}
