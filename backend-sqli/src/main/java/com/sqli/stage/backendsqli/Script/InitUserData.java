package com.sqli.stage.backendsqli.Script;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.concurrent.ThreadLocalRandom;


@Component
@RequiredArgsConstructor
public class InitUserData implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            createUser("Mohamed", "mohamed.azzam@outlook.com", "admin123", Role.ADMIN);
            createUser("Ismail", "ismail.benali@gmail.com", "dev123", Role.DEVELOPPEUR);
            createUser("Riyad", "riyad.elhaddad@proton.me", "dev123", Role.DEVELOPPEUR);
            createUser("Khalid", "khalid.mansouri@yahoo.fr", "dev123", Role.DEVELOPPEUR);
            createUser("Hamza", "hamza.bouzit@outlook.com", "cp123", Role.CHEF_DE_PROJET);
            createUser("Karim", "karim.dalimani@gmail.com", "cp123", Role.CHEF_DE_PROJET);
            createUser("Sami", "sami.hakim@proton.me", "cp123", Role.CHEF_DE_PROJET);
            createUser("Client1", "yasmine.bensaid@gmail.com", "client123", Role.CLIENT);
            createUser("Client2", "omar.aittaleb@outlook.com", "client123", Role.CLIENT);
            createUser("Client3", "fatima.ouahbi@yahoo.fr", "client123", Role.CLIENT);
        }
    }

    private void createUser(String nom, String email, String motDePasse, Role role) {
        User user = new User();
        user.setNom(nom);
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(motDePasse));
        user.setRole(role);
        user.setEnabled(true);
        user.setUsername(generateUsername(nom, role)); // assure-toi d’avoir cette méthode dans ton service
        userRepository.save(user);
    }

    private String generateUsername(String nom, Role role) {
        String username = "";
        int attempts = 0;
        do {
            // Normalisation pour retirer les accents
            String cleanNom = Normalizer.normalize(nom, Normalizer.Form.NFD)
                    .replaceAll("[^\\p{ASCII}]", "") // enlève les accents
                    .replaceAll("[^a-zA-Z]", "")     // garde uniquement lettres
                    .toLowerCase();

            String roleCode = switch (role) {
                case CHEF_DE_PROJET -> "cp";
                case DEVELOPPEUR -> "dev";
                case CLIENT -> "cli";
                case ADMIN -> "adm";
                default -> "usr";
            };

            int random = ThreadLocalRandom.current().nextInt(1000, 10000);
            username = cleanNom + "." + roleCode + "-sqli" + random;
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Impossible de générer un username unique");
            }
        }while (userRepository.findByUsername(username).isPresent());
        return username;
    }
}
