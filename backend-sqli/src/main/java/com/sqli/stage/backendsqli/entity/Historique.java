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
public class Historique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Type d'action réalisée : CREATE, UPDATE, DELETE, LOGIN, etc.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeOperation action;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime dateHeure;

    // Description lisible de l'action
    @Column(length = 1000)
    private String description;

    // ID de l'entité affectée (ex: project.id, task.id, etc.)
    @Column(name = "entity_id", nullable = false)
    private Integer entityId;

    // Nom de l'entité affectée (ex: "PROJECT", "TASK", "USER")
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_name", nullable = false)
    private EntityName entityName;

    // Optionnel : ancienne valeur de l'objet (avant modification)
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    // Optionnel : nouvelle valeur de l'objet (après modification)
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    // L'utilisateur qui a effectué l'action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
