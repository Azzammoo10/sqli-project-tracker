package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// ✅ Sert à charger l'utilisateur par son username (requis par Spring Security)
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Récupère le User depuis la base et le convertit en UserDetails
    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getMotDePasse()) // ⚠️ à encoder
                .roles(user.getRole().name())
                .build();
    }
}





