package com.sqli.stage.backendsqli.entity;

import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "history")
public class Historique  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private TypeOperation action;
    private LocalDateTime dateHeure;

    private String description;

    private Integer entityId;

    @Enumerated(EnumType.STRING)
    private EntityName entityName;

    @ManyToOne
    private User user;
}