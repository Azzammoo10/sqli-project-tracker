package com.sqli.stage.backendsqli.dto;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.TypeDepartment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private int id;
    private String username;
    private String email;
    private String nom;
    private Role role;
    private String jobTitle;
    private TypeDepartment department;
    private String phone;
}
