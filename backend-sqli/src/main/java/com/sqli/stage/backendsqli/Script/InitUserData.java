package com.sqli.stage.backendsqli.Script;
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

            createUser("Abdelouahed DEBBAGH", "abdou.d@rfcdigital.com", "Abdelouahed!2025", "Chargé de projets TMA", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212 666-060312");
            createUser("Ayoub El Manssouri", "ayoub.elmansouri@gmail.com", "Ayoub!2025", null, Role.ADMIN, null, null);
            createUser("Mustapha KHALKI", "mustapha@rfcdigital.dev", "Mustapha!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Chafia HASSOUD", "chafia.hassoud01@gmail.com", "Chafia!2025", "Contrôleuse qualité et webmaster", Role.ADMIN, TypeDepartment.EXTERNE, null);
            createUser("Achraf ALAMI", "achraf.a@rfcdigital.dev", "Achraf!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, "+212 762-628323");
            createUser("Salma ELGMIRI", "salma.e@rfcdigital.dev", "Salma!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Soukaina BOUGUIRI", "administratif@rfcdigital.com", "Soukaina!2025", "Assistante administrative", Role.ADMIN, TypeDepartment.ADMINISTRATION, "+212 625-895494");
            createUser("Abdoulkader", "abdoukadriadamou75@gmail.com", "Abdoulkader!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Ex dev interne", "ex.dev@rfc-digital.com", "Ex!2025", null, Role.ADMIN, null, null);
                createUser("Zakaria BENMOUMEN", "zakaria@rfcdigital.com", "Zakaria!2025", "Directeur Général", Role.ADMIN, TypeDepartment.MANAGEMENT, "0661910256");
            createUser("Youssef BASSOU", "youssef.b@rfcdigital.com", "Youssef!2025", "Chargé de projets TMA", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212 661-388312");
            createUser("Imad Ghssisse EXT", "mohibimaddev@gmail.com", "Imad!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Imane ACHKOUNE", "imane.a@rfcdigital.com", "Imane!2025", "Chef de projet", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212 662-387174");
            createUser("Imane ACHOUALE", "imane.achoual@rfcdigital.dev", "Imane!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, "+212 662-439992");
            createUser("Amine AKERMOUD", "amine.akermoud@rfcdigital.dev", "Amine!2025", "Dev Fullstack", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, "+212 640-610184");
            createUser("Abdarazak Laanaya EXT", "laanayabdrazak@gmail.com", "Abdarazak!2025", null, Role.ADMIN, null, null);
            createUser("Mohamed OUBAKHAYI", "mohamed.o@rfcdigital.com", "Mohamed!2025", "CTO", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212 665-185390");
            createUser("Ayoub SABI", "ayoub.sabi.dev@gmail.com", "Ayoub!2025", null, Role.ADMIN, null, null);
            createUser("Hicham SOUFIANI", "hicham.s@rfcdigital.com", "Hicham!2025", "Chef de projet", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212 766-510077");
            createUser("Mohamed Aherdane EXT", "mohamed.aherdane@waveagency.fr", "Mohamed!2025", null, Role.ADMIN, null, null);
            createUser("Mohamed TBARKA", "simo.tbarka@gmail.com", "Mohamed!2025", "LEAD TEK", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Abdeslam BOUGAA", "Abdo.bougaa@gmail.com", "Abdeslam!2025", null, Role.ADMIN, null, null);
            createUser("Aya OUAHI", "ayaouahi99@gmail.com", "Aya!2025", "stagiaire", Role.ADMIN, TypeDepartment.DEVELOPPEMENT, null);
            createUser("Mohamed MAKKAOUI", "makkaoui@rfcdigital.dev", "Mohamed!2025", "Dev Fullstack", Role.ADMIN, null, null);
            createUser("Anass AIT BELARBI", "anassaitbelarbi7@gmail.com", "Anass!2025", null, Role.ADMIN, null, null);
            createUser("Yasser El Mimouni", "elmimouni.yasser@gmail.com", "Yasser!2025", null, Role.ADMIN, null, null);

        }
    }



    private void createUser(String nom, String email, String motDePasse,String jobTitle, Role role,TypeDepartment department,String phone) {
        User user = new User();
        Role inferredRole = inferRoleFromJobTitle(jobTitle);
        user.setNom(nom);
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(motDePasse));
        user.setJobTitle(jobTitle);
        user.setRole(inferredRole);
        user.setDepartment(department);
        user.setPhone(phone);
        user.setEnabled(true);
        user.setUsername(generateUsername(nom, role)); // assure-toi d’avoir cette méthode dans ton service
        userRepository.save(user);
    }

    public Role inferRoleFromJobTitle(String jobTitle) {
        if (jobTitle == null) return Role.DEVELOPPEUR;

        jobTitle = jobTitle.toLowerCase();

        if (jobTitle.contains("stagiaire")) return Role.STAGIAIRE;
        if (jobTitle.contains("chef") || jobTitle.contains("projet")) return Role.CHEF_DE_PROJET;
        if (jobTitle.contains("cto") || jobTitle.contains("directeur")) return Role.ADMIN;
        if (jobTitle.contains("fullstack") || jobTitle.contains("dev")) return Role.DEVELOPPEUR;

        return Role.DEVELOPPEUR;
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
                case STAGIAIRE -> "stg";
                default -> "usr";
            };

            int random = ThreadLocalRandom.current().nextInt(1000, 10000);
            username = cleanNom + "." + roleCode + "-IT" + random;
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Impossible de générer un username unique");
            }
        }while (userRepository.findByUsername(username).isPresent());
        return username;
    }
}
