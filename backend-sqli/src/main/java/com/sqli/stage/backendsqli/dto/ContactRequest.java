package com.sqli.stage.backendsqli.dto;

import com.sqli.stage.backendsqli.entity.Enums.ContactType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContactRequest {
    
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    private String username;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotNull(message = "Le type de réclamation est obligatoire")
    private ContactType type;
    
    @NotBlank(message = "La description est obligatoire")
    private String description;
}
