package com.sqli.stage.backendsqli.Script;

import com.sqli.stage.backendsqli.dto.CreateUserRequest;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CreateAdmin implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) {
        try {
            // Vérifier si l'admin existe déjà
            String adminEmail = "azzam.moo@sqli.com";
            if (userService.existsByEmail(adminEmail)) {
                System.out.println("🔁 Admin déjà existant : " + adminEmail);
                return;
            }

            CreateUserRequest adminRequest = new CreateUserRequest();
            adminRequest.setNom("AZZAM");
            adminRequest.setEmail(adminEmail);
            adminRequest.setMotDePasse("azerty1234"); // sera hashé dans le service
            adminRequest.setRole("ADMIN");

            UserResponse response = userService.createUser(adminRequest);
            System.out.println("✅ Admin créé avec succès : " + response.getUsername());
        } catch (Exception e) {
            System.out.println("⚠️ Erreur lors de la création de l'admin : " + e.getMessage());
        }
    }
}
