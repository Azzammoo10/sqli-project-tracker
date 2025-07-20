package com.sqli.stage.backendsqli.entity;

import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import jakarta.persistence.*;
import lombok.*;
import com.sqli.stage.backendsqli.entity.User;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private StatutTache statut;

    @ManyToOne
    private Project project;

    @ManyToOne
    private User developpeur;
}
