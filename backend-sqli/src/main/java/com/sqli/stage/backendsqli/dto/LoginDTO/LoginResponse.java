package com.sqli.stage.backendsqli.dto.LoginDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String token;      // ✅ ajoute ce champ
    private String username;
    private String role;
}