package com.sqli.stage.backendsqli.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String uuidPublic;

    private boolean isPublicLinkEnabled;

    private String titre;
    private String description;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;


    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private StatutProjet statut;

    @ManyToOne
    private User createdBy;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("project")
    private List<Task> tasks;

    @ManyToMany
    @JoinTable(
            name = "project_developpeurs",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "developpeur_id")
    )
    @JsonIgnoreProperties({"tasks", "role", "motDePasse", "projects"})
    private List<User> developpeurs;


}