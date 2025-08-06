package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginResponse;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.InvalidTokenException;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.security.JwtUtil;
import com.sqli.stage.backendsqli.service.AuthService;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final HistoriqueService historiqueService;

    @Override
    public LoginResponse login(LoginRequest request) {
        System.out.println("Tentative de connexion pour : " + request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Nom d'utilisateur incorrect"));

        System.out.println("Utilisateur trouvé : " + user.getUsername());


        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(),user.getId());

        LogRequest logRequest = new LogRequest();
        logRequest.setAction(TypeOperation.LOGIN);
        logRequest.setDescription("Connexion réussie de " + user.getNom());
        logRequest.setEntityName(EntityName.AUTHENTICATION);
        logRequest.setEntityId(user.getId());
        historiqueService.logAction(logRequest, user);

        return new LoginResponse("Connexion réussie", token, user.getUsername(), user.getRole().name());
    }

    @Override
    public String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new InvalidTokenException("Token invalide ou manquant dans l'en-tête Authorization");
    }

    @Override
    public Integer extractIdUserFromToken(String token) {
        return jwtUtil.extractId(token);
    }

    @Override
    public String extractUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

}
