package com.sqli.stage.backendsqli.dto;

import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.validation.StrongPassword;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @StrongPassword
    private String motDePasse;

    private Role role;

    private String jobTitle;
    private String department;
    private String phone;
}

