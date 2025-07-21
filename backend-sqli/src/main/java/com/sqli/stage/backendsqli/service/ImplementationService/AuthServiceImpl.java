package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.LoginDTO.LoginRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginResponse;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.security.JwtUtil;
import com.sqli.stage.backendsqli.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Nom d'utilisateur incorrect"));

        if (!user.getMotDePasse().equals(request.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new LoginResponse("Connexion réussie", token, user.getUsername(), user.getRole().name());
    }
}
