package com.sqli.stage.backendsqli.entity;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name="Username",unique = true, nullable = false)
    private String username;

    private String nom;

    @Column(unique = true, nullable = false)
    private String email;

    private String motDePasse;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;


    @OneToMany(mappedBy = "developpeur", cascade = CascadeType.ALL)
    private List<Task> tasks;
}
