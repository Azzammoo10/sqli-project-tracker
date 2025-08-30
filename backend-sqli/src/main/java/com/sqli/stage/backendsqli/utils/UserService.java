package com.sqli.stage.backendsqli.utils;

import com.sqli.stage.backendsqli.dto.CreateUserRequest;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;



    // Génère un username unique basé sur le nom
    private String generateUsername(String nom, String role) {
        int random = new Random().nextInt(9000) + 1000; // nombre entre 1000 et 9999
        String cleanNom = nom.trim().toLowerCase().replaceAll("\\s+", "");
        String cleanRole = role.trim().toUpperCase();

        return String.format("%s.sqli_%s-%d", cleanNom, cleanRole, random);
    }


    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }

        User user = new User();
        user.setNom("AZZAM");
        user.setEmail("azam.mo@gmail.com");
        user.setMotDePasse("test123");
        user.setRole(Role.ADMIN);
        user.setUsername(generateUsername("Azzam", "ADMIN"));
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        return UserResponse.from(savedUser);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
