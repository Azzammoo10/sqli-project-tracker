//package com.sqli.stage.backendsqli.Script;
//import com.sqli.stage.backendsqli.entity.Enums.Role;
//import com.sqli.stage.backendsqli.entity.User;
//import com.sqli.stage.backendsqli.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//
//
//@Component
//@RequiredArgsConstructor
//public class InitUserData implements CommandLineRunner {
//
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) {
//        if (userRepository.count() == 0) {
//            createUser("Mohamed", "azzam.admin@sqli.com", "admin123", Role.ADMIN);
//            createUser("Ismail", "ismail.dev@sqli.com", "dev123", Role.DEVELOPPEUR);
//            createUser("Riyad", "riyad.dev@sqli.com", "dev123", Role.DEVELOPPEUR);
//            createUser("Khalid", "khalid.dev@sqli.com", "dev123", Role.DEVELOPPEUR);
//            createUser("Hamza", "hamza.cp@sqli.com", "cp123", Role.CHEF_DE_PROJET);
//            createUser("Karim", "karim.cp@sqli.com", "cp123", Role.CHEF_DE_PROJET);
//            createUser("Sami", "sami.cp@sqli.com", "cp123", Role.CHEF_DE_PROJET);
//            createUser("Client1", "client1@sqli.com", "client123", Role.CLIENT);
//            createUser("Client2", "client2@sqli.com", "client123", Role.CLIENT);
//            createUser("Client3", "client3@sqli.com", "client123", Role.CLIENT);
//        }
//    }
//
//    private void createUser(String nom, String email, String motDePasse, Role role) {
//        User user = new User();
//        user.setNom(nom);
//        user.setEmail(email);
//        user.setMotDePasse(passwordEncoder.encode(motDePasse));
//        user.setRole(role);
//        user.setEnabled(true);
//        user.setUsername(generateUsername(nom, role)); // assure-toi d’avoir cette méthode dans ton service
//        userRepository.save(user);
//    }
//
//    private String generateUsername(String nom, Role role) {
//        String prefix = switch (role) {
//            case ADMIN -> "adm";
//            case CLIENT -> "cli";
//            case DEVELOPPEUR -> "dev";
//            case CHEF_DE_PROJET -> "cp";
//            default -> "usr";
//        };
//
//        String clean = nom.toUpperCase().replaceAll("\\s+", "");
//        int random = (int) (Math.random() * 9000) + 1000;
//        return clean + "-" + prefix + "-sqli" + random;
//    }
//}
