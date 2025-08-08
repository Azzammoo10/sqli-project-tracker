package com.sqli.stage.backendsqli.Script.init;

import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.Enums.TypeDepartment;
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
            createUser("Alice Manager", "alice.manager@demo.com", "Alice123!", "Chef de projet", Role.CHEF_DE_PROJET, TypeDepartment.MANAGEMENT, "+212600000001");
            createUser("Bob Dev", "bob.dev@demo.com", "Bob123!", "Dev Fullstack", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000002");
            createUser("Charlie Dev", "charlie.dev@demo.com", "Charlie123!", "Dev Backend", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000003");
            createUser("David Admin", "david.admin@demo.com", "David123!", "Admin système", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212600000004");
            createUser("Eva Client", "eva.client@external.com", "Eva123!", null, Role.CLIENT, TypeDepartment.EXTERNE, "+212600000005");
            createUser("Fay Client", "fay.client@external.com", "Fay123!", null, Role.CLIENT, TypeDepartment.EXTERNE, "+212600000006");
        }
    }

    private void createUser(String nom, String email, String motDePasse, String jobTitle, Role role, TypeDepartment department, String phone) {
        User user = new User();
        user.setNom(nom);
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(motDePasse));
        user.setJobTitle(jobTitle);
        user.setRole(role);
        user.setDepartment(department);
        user.setPhone(phone);
        user.setEnabled(true);
        user.setUsername(generateUsername(nom, role));
        userRepository.save(user);
    }

    private String generateUsername(String nom, Role role) {
        String cleanNom = Normalizer.normalize(nom.split(" ")[1], Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-zA-Z]", "")
                .toLowerCase();

        String roleCode = switch (role) {
            case CHEF_DE_PROJET -> "cp";
            case DEVELOPPEUR -> "dev";
            case ADMIN -> "adm";
            case CLIENT -> "cli";
            case STAGIAIRE -> "stg";
            default -> "usr";
        };

        return cleanNom + "." + roleCode + "-IT" + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}

