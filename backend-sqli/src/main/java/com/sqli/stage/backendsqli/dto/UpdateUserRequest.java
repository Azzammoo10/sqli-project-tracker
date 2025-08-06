package com.sqli.stage.backendsqli.dto;

import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.validation.StrongPassword;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String nom;
    private String username;
    private String email;

    @StrongPassword
    private String motDePasse;
    private Role role;
}
