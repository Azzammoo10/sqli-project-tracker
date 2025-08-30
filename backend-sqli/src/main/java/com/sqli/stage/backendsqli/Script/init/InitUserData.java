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
            System.out.println("🚀 INITIALISATION DE LA BASE DE DONNÉES - CRÉATION DES UTILISATEURS");
            System.out.println("================================================================");
            
            // Créer un seul utilisateur admin avec un nom simple pour un username prévisible
            createUser("Admin", "admin@sqli.com", "Admin123!", "Administrateur Système", Role.ADMIN, TypeDepartment.MANAGEMENT, "+212600000000");
            
            // Créer 2 chefs de projet
            System.out.println("\n👔 CRÉATION DES CHEFS DE PROJET");
            System.out.println("--------------------------------");
            createUser("Taha Zouane", "taha.zouane@sqli.com", "Chef123!", "Chef de Projet Senior", Role.CHEF_DE_PROJET, TypeDepartment.DEVELOPPEMENT, "+212600000001");
            createUser("Amine Hamouti", "amine.hamouti@sqli.com", "Chef123!", "Chef de Projet", Role.CHEF_DE_PROJET, TypeDepartment.DEVELOPPEMENT, "+212600000002");
            
            // Créer 4 développeurs
            System.out.println("\n💻 CRÉATION DES DÉVELOPPEURS");
            System.out.println("-----------------------------");
            createUser("Wassim Dahib", "wassim.dahib@sqli.com", "Dev123!", "Développeur Full Stack", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000003");
            createUser("Ahmed Qadir", "ahmed.qadir@sqli.com", "Dev123!", "Développeur Backend", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000004");
            createUser("Mouad Khamlishi", "mouad.khamlishi@sqli.com", "Dev123!", "Développeur Frontend", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000005");
            createUser("Youssef Benali", "youssef.benali@sqli.com", "Dev123!", "Développeur Mobile", Role.DEVELOPPEUR, TypeDepartment.DEVELOPPEMENT, "+212600000006");
            
            // Créer 3 clients
            System.out.println("\n👤 CRÉATION DES CLIENTS");
            System.out.println("------------------------");
            createUser("Fatima Alami", "fatima.alami@entreprise.com", "Client123!", "Directrice Marketing", Role.CLIENT, TypeDepartment.EXTERNE, "+212600000007");
            createUser("Karim Bennani", "karim.bennani@startup.com", "Client123!", "Fondateur", Role.CLIENT, TypeDepartment.MANAGEMENT, "+212600000008");
            createUser("Amina Tazi", "amina.tazi@consulting.com", "Client123!", "Consultante IT", Role.CLIENT, TypeDepartment.EXTERNE, "+212600000009");
            
            System.out.println("\n✅ INITIALISATION TERMINÉE AVEC SUCCÈS !");
            System.out.println("==========================================");
            System.out.println("📊 RÉSUMÉ :");
            System.out.println("   • 1 Administrateur");
            System.out.println("   • 2 Chefs de Projet");
            System.out.println("   • 4 Développeurs");
            System.out.println("   • 3 Clients");
            System.out.println("   • Total : 10 utilisateurs créés");
            System.out.println("\n🔐 MOT DE PASSE PAR DÉFAUT :");
            System.out.println("   • Admin : Admin123!");
            System.out.println("   • Chefs : Chef123!");
            System.out.println("   • Développeurs : Dev123!");
            System.out.println("   • Clients : Client123!");
            System.out.println("\n⚠️  IMPORTANT : Changez les mots de passe après la première connexion !");
        }
    }

    private void createUser(String nom, String email, String motDePasse, String jobTitle, Role role, TypeDepartment department, String phone) {
        User user = new User();
        user.setNom(nom);
        user.setEmail(email);
        user.setUsername(generateUsername(nom, role)); // Username généré automatiquement
        user.setMotDePasse(passwordEncoder.encode(motDePasse));
        user.setJobTitle(jobTitle);
        user.setRole(role);
        user.setDepartment(department);
        user.setPhone(phone);
        user.setEnabled(true);
        
        userRepository.save(user);
        
        System.out.println("✅ " + role + " créé : " + nom);
        System.out.println("   Username: " + user.getUsername());
        System.out.println("   Email: " + email);
        System.out.println("   Mot de passe: " + motDePasse);
        System.out.println("   Département: " + department);
    }

    private String generateUsername(String nom, Role role) {
        String cleanNom = Normalizer.normalize(nom.split(" ")[0], Normalizer.Form.NFD) // Prendre le premier mot seulement
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

        return cleanNom + "." + roleCode + "-Sqli." + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}

