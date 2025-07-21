package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.*;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Créer un utilisateur
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {

        return ResponseEntity.ok(adminService.createUser(request));

    }

    // Lister tous les utilisateurs
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Get user By ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    // Mettre à jour un utilisateur
    @PutMapping("/users/update/{id}")
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

        return ResponseEntity.ok(adminService.assignRoleToUser(id, role));

    }

    // Désactiver un utilisateur
    @PutMapping("/users/{id}/disable")
    public ResponseEntity<UserResponse> disableUser(@PathVariable int id) {

        return ResponseEntity.ok(adminService.disableUser(id));

    }
}
