package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.*;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Créer un utilisateur
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));

    }

    // Lister tous les utilisateurs
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Exposer des listes par rôle (utilisables par Chef)
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_DE_PROJET')")
    @GetMapping("/users/by-role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable Role role) {
        // Réutilise le service existant: filtrage côté service ou ici si nécessaire
        List<UserResponse> all = adminService.getAllUsers();
        return ResponseEntity.ok(all.stream().filter(u -> u.getRole() == role).toList());
    }

    // Get user By ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    // Mettre à jour un utilisateur
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable int id,
                                                   @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));

    }

    // Supprimer un utilisateur
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {

        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();

    }

    // Affecter un rôle
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> assignRole(@PathVariable int id,
                                                   @RequestParam Role role) {

        return ResponseEntity.ok(adminService.assignRole(id, role));

    }

    // Désactiver un utilisateur
    @PutMapping("/users/{id}/disable")
    public ResponseEntity<UserResponse> disableUser(@PathVariable int id) {

        return ResponseEntity.ok(adminService.disableUser(id));

    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<UserResponse> enableUser(@PathVariable int id) {

        return ResponseEntity.ok(adminService.enableUser(id));

    }


    @PostMapping("/users/admin")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreateAdminDTO request){
        return ResponseEntity.ok(adminService.createNewAdmin(request));
    }
}
