package com.sqli.stage.backendsqli.entity;

import com.sqli.stage.backendsqli.entity.Enums.ContactType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(nullable = false)
    private boolean traite = false;

    private LocalDateTime dateTraitement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Constructeur pour créer un contact sans user (pour les utilisateurs non connectés)
    public Contact(String username, String email, ContactType type, String description) {
        this.username = username;
        this.email = email;
        this.type = type;
        this.description = description;
        this.dateCreation = LocalDateTime.now();
        this.traite = false;
    }
}
