package com.sqli.stage.backendsqli.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Enums.TypeProjet;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "projects") // ou "project_project" si tu veux mapper la table PostgreSQL existante
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Lié à l'accès public
    private String uuidPublic;

    private boolean isPublicLinkEnabled;

    @Column(name = "name")
    private String titre; // correspond à `name` dans la table PostgreSQL

    private String description; // optionnel si tu veux enrichir le modèle

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private TypeProjet type; // basé sur les valeurs : "TMA", "Delivery", "Interne"

    @Column(name = "state")
    @Enumerated(EnumType.STRING)
    private StatutProjet statut; // basé sur les valeurs : "open", "done", etc.

    @Column(precision = 5, scale = 2)
    private BigDecimal progression; // correspond à `progress` (NUMERIC)

    @Column(name = "start_date")
    private LocalDate dateDebut;

    // Champ non présent dans la BDD PostgreSQL brute, mais utile
    private LocalDate dateFin;

    // Le client qui a demandé le projet
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    // Créateur du projet (par défaut le chef de projet)
    @ManyToOne
    private User createdBy;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("project")
    private List<Task> tasks;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "project_developpeurs",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "developpeur_id")
    )
    @JsonIgnoreProperties({"tasks", "role", "motDePasse", "projects"})
    private List<User> developpeurs;

}