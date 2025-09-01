package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginResponse;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.security.TokenBlacklist;
import com.sqli.stage.backendsqli.service.AuthService;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklist tokenBlacklist;
    private final HistoriqueService  logService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = authService.extractTokenFromHeader(request);
        tokenBlacklist.blacklistToken(token);

        String username = authService.extractUsernameFromToken(token); // Crée cette méthode dans ton AuthService
        Integer UserId = authService.extractIdUserFromToken(token);

        logService.logAction(new LogRequest(
                TypeOperation.LOGOUT,
                "Déconnexion réussie de " + username,
                UserId,
                EntityName.AUTHENTICATION
        ));

        return ResponseEntity.ok().build();
    }

    private final UserRepository userRepository; // ✅ au lieu de userService

    // AuthController.java
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + auth.getName()));
        return ResponseEntity.ok(UserResponse.from(user));
    }




}
