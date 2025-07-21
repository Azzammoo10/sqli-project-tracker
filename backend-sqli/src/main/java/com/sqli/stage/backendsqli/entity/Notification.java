package com.sqli.stage.backendsqli.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private LocalDate dateEnvoi;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
