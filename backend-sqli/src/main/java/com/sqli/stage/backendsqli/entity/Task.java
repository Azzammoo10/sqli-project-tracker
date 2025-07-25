package com.sqli.stage.backendsqli.entity;

import com.sqli.stage.backendsqli.entity.Enums.Priorite;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.sqli.stage.backendsqli.entity.User;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank @Size(min = 3, max = 100)
    private String titre;

    @NotBlank
    @Size(min = 5, max = 500)
    private String description;

    @NotNull @FutureOrPresent
    private LocalDate dateDebut;

    @NotNull
    @Future
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private StatutTache statut;

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    @Column(columnDefinition = "int default 0")
    private int progression;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "developpeur_id")
    private User developpeur;
}

