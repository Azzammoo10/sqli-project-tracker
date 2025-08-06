package com.sqli.stage.backendsqli.dto.LoginDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String motDePasse;


}
