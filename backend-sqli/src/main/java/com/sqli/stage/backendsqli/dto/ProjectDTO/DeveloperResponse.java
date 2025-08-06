package com.sqli.stage.backendsqli.dto.ProjectDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeveloperResponse {
    private String nom;
    private String email;
    private String username;
}

