package com.sqli.stage.backendsqli.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.TypeDepartment;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="Username",unique = true, nullable = false)
    private String username;

    private String nom;

    @Column(name = "work_email", unique = true, nullable = false)
    private String email;


    private String motDePasse;

    private String jobTitle;

    @Enumerated(EnumType.STRING)
    private TypeDepartment department;    // Adapté à partir de hr_employee
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    @ManyToMany(mappedBy = "developpeurs")
    private List<Project> projects;


    @Column(name = "actif_dans_projet")
    private boolean actifDansProjet = false;



    @OneToMany(mappedBy = "developpeur", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    private List<AccountAnalyticLine> analyticLines = new ArrayList<>();
}
