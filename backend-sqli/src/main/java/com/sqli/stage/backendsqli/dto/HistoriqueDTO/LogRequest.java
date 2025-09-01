package com.sqli.stage.backendsqli.dto.HistoriqueDTO;

import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogRequest {

    private TypeOperation action;

    private String description;

    private Integer entityId;
    private EntityName entityName;
}
