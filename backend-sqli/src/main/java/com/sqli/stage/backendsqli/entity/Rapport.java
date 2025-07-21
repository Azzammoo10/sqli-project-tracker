package com.sqli.stage.backendsqli.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Rapport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateGeneration;

    private String contenu;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}

