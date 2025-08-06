package com.sqli.stage.backendsqli.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sqli.stage.backendsqli.entity.Enums.Priorite;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.sqli.stage.backendsqli.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    @NotBlank
    @Size(min = 3, max = 100)
    @Column(name = "name")
    private String titre;

    @Size(max = 500)
    private String description;

    @NotNull
    @FutureOrPresent
    private LocalDate dateDebut;

    @NotNull
    @Future
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private StatutTache statut; // correspond à `state`

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    @Column(precision = 5, scale = 2)
    private BigDecimal progression; // correspond à `progress` (NUMERIC)

    @Column(name = "planned_hours")
    private Integer plannedHours;

    @Column(name = "effective_hours")
    private Integer effectiveHours;

    @Column(name = "remaining_hours")
    private Integer remainingHours;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"tasks", "client", "createdBy"})
    private Project project;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "developpeur_id") // tu peux aussi mapper sur "assigned_to"
    private User developpeur;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<AccountAnalyticLine> pointages;
}

