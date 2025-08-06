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

            createUser("Abdelouahed DEBBAGH", "abdou.d@rfcdigital.com", "Abdelouahed!2025", Role.CHEF_DE_PROJET, TypeDepartment.EXTERNE);
            createUser("Ayoub El Manssouri", "Ayoub.elmansouri@gmail.com", "Ayoub!2025", Role.DEVELOPPEUR);
            createUser("Mustapha KHALKI", "Mustapha@rfcdigital.dev", "Mustapha!2025", Role.DEVELOPPEUR);
            createUser("Chafia HASSOUD", "chafia.hassoud01@gmail.com", "Chafia!2025", Role.ADMIN);
            createUser("Achraf ALAMI", "achraf.a@rfcdigital.dev", "Achraf!2025", Role.DEVELOPPEUR);
            createUser("Salma ELGMIRI", "salma.e@rfcdigital.dev", "Salma!2025", Role.DEVELOPPEUR);
            createUser("Soukaina BOUGUIRI", "administratif@rfcdigital.com", "Soukaina!2025", Role.ADMIN);
            createUser("Abdoulkader", "abdoukadriadamou75@gmail.com", "Abdoulkader!2025", Role.DEVELOPPEUR);
            createUser("Ex dev interne", "ex.dev@rfc-digital.com", "Ex!2025", Role.CLIENT);
            createUser("Zakaria BENMOUMEN", "zakaria@rfcdigital.com", "Zakaria!2025", Role.ADMIN);
            createUser("Youssef BASSOU", "youssef.b@rfcdigital.com", "Youssef!2025", Role.CHEF_DE_PROJET);
            createUser("Imad Ghssisse EXT", "mohibimaddev@gmail.com", "Imad!2025", Role.CLIENT);
            createUser("Imane ACHKOUNE", "imane.a@rfcdigital.com", "Imane!2025", Role.CHEF_DE_PROJET);
            createUser("Imane ACHOUALE", "imane.achoual@rfcdigital.dev", "Imane!2025", Role.DEVELOPPEUR);
            createUser("Amine AKERMOUD", "amine.akermoud@rfcdigital.dev", "Amine!2025", Role.DEVELOPPEUR);
            createUser("Abdarazak Laanaya EXT", "laanayabdrazak@gmail.com", "Abdarazak!2025", Role.CLIENT);
            createUser("Mohamed OUBAKHAYI", "mohamed.o@rfcdigital.com", "Mohamed!2025", Role.ADMIN);
            createUser("Ayoub SABI", "Ayoub.sabi.dev@gmail.com", "Ayoub!2025", Role.DEVELOPPEUR);
            createUser("Hicham SOUFIANI", "Hicham.s@rfcdigital.com", "Hicham!2025", Role.CHEF_DE_PROJET);
            createUser("Mohamed Aherdane EXT", "mohamed.aherdane@waveagency.fr", "Mohamed!2025", Role.CLIENT);
            createUser("Mohamed TBARKA", "simo.tbarka@gmail.com", "Mohamed!2025", Role.DEVELOPPEUR);
            createUser("Abdeslam BOUGAA", "Abdo.bougaa@gmail.com", "Abdeslam!2025", Role.CLIENT);
            createUser("Aya OUAHI", "ayaouahi99@gmail.com", "Aya!2025", Role.STAGIAIRE);
            createUser("Mohamed AZZAM", "azzam.moo@gmail.com", "azzam!2025", Role.STAGIAIRE);
            createUser("Mohamed MAKKAOUI", "makkaoui@rfcdigital.dev", "Mohamed!2025", Role.DEVELOPPEUR);
            createUser("Anass AIT BELARBI", "anassaitbelarbi7@gmail.com", "Anass!2025", Role.CLIENT);
            createUser("Yasser El Mimouni", "elmimouni.yasser@gmail.com", "Yasser!2025", Role.CLIENT);
            }
    }



    private void createUser(String nom, String email, String motDePasse,String jobTitle, Role role,TypeDepartment department,String phone) {
        User user = new User();
        user.setNom(nom);
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(motDePasse));
        user.setJobTitle(jobTitle);
        user.setRole(role);
        user.setDepartment(department);
        user.setPhone(phone);
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
