package com.sqli.stage.backendsqli.dto;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.TypeDepartment;
import com.sqli.stage.backendsqli.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private int id;
    private String username;
    private String email;
    private String nom;
    private Role role;
    private String jobTitle;
    private TypeDepartment department;
    private String phone;
    private boolean enabled;


    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nom(user.getNom())
                .role(user.getRole())
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .enabled(user.isEnabled())
                .build();
    }
}
