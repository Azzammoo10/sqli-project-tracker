package com.sqli.stage.backendsqli.dto;

import com.sqli.stage.backendsqli.entity.Enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {
    private int id;
    private String nom;
    private String username;
    private String email;
    private String motDePasse;
    private Role role;
}
