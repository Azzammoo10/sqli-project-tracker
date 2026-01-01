
package com.sqli.stage.backendsqli.Script.init;

import com.sqli.stage.backendsqli.entity.*;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class InitProjectData {

    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @PostConstruct
    public void initProjects() {
        if (projetRepository.count() > 0) return;

        // Vérifier si les utilisateurs requis existent
        if (userRepository.count() < 10) {
            System.out.println("⏭️ SKIP: Pas assez d'utilisateurs pour initialiser les projets de démo");
            System.out.println("   (Minimum 10 utilisateurs requis, " + userRepository.count() + " trouvés)");
            return;
        }

        // Vérifier si les utilisateurs spécifiques existent
        if (userRepository.findById(2).isEmpty()) {
            System.out.println("⏭️ SKIP: Utilisateur ID 2 (Taha Chef) non trouvé - initialisation des projets ignorée");
            return;
        }

        System.out.println("🚀 INITIALISATION DES PROJETS ET TÂCHES");
        System.out.println("========================================");

        // Récupérer les utilisateurs par rôle
        User tahaChef = userRepository.findById(2).orElseThrow(() -> new RuntimeException("Taha Chef non trouvé"));
        User amineChef = userRepository.findById(3).orElseThrow(() -> new RuntimeException("Amine Chef non trouvé"));
        User wassimDev = userRepository.findById(4).orElseThrow(() -> new RuntimeException("Wassim Dev non trouvé"));
        User ahmedDev = userRepository.findById(5).orElseThrow(() -> new RuntimeException("Ahmed Dev non trouvé"));
        User mouadDev = userRepository.findById(6).orElseThrow(() -> new RuntimeException("Mouad Dev non trouvé"));
        User youssefDev = userRepository.findById(7).orElseThrow(() -> new RuntimeException("Youssef Dev non trouvé"));
        User fatimaClient = userRepository.findById(8).orElseThrow(() -> new RuntimeException("Fatima Client non trouvé"));
        User karimClient = userRepository.findById(9).orElseThrow(() -> new RuntimeException("Karim Client non trouvé"));
        User aminaClient = userRepository.findById(10).orElseThrow(() -> new RuntimeException("Amina Client non trouvé"));

        // Créer les projets
        System.out.println("\n📋 CRÉATION DES PROJETS");
        System.out.println("------------------------");

        Project projetAlpha = createProject("Projet Alpha", "Développement d'une API REST moderne avec Spring Boot et React",
            true, TypeProjet.Delivery, StatutProjet.EN_COURS,
            LocalDate.of(2025, 8, 1), LocalDate.of(2025, 9, 30),
            fatimaClient, tahaChef, Arrays.asList(wassimDev, ahmedDev));

        Project projetBeta = createProject("Projet Beta", "Refonte complète du portail client avec nouvelle interface utilisateur",
            false, TypeProjet.Interne, StatutProjet.EN_COURS,
            LocalDate.of(2025, 8, 5), LocalDate.of(2025, 10, 15),
            karimClient, amineChef, Arrays.asList(mouadDev, youssefDev));

        Project projetGamma = createProject("Projet Gamma", "Maintenance TMA et améliorations du système existant",
            true, TypeProjet.TMA, StatutProjet.EN_COURS,
            LocalDate.of(2025, 8, 10), LocalDate.of(2025, 11, 10),
            aminaClient, tahaChef, Arrays.asList(wassimDev, mouadDev));

        Project projetDelta = createProject("Projet Delta", "POC microservices et architecture distribuée",
            true, TypeProjet.Interne, StatutProjet.EN_COURS,
            LocalDate.of(2025, 7, 15), LocalDate.of(2025, 9, 15),
            fatimaClient, amineChef, Arrays.asList(ahmedDev, youssefDev));

        // Créer les tâches pour chaque projet
        System.out.println("\n✅ CRÉATION DES TÂCHES");
        System.out.println("----------------------");

        createTasksForProject(projetAlpha, Arrays.asList(tahaChef, wassimDev, ahmedDev));
        createTasksForProject(projetBeta, Arrays.asList(amineChef, mouadDev, youssefDev));
        createTasksForProject(projetGamma, Arrays.asList(tahaChef, wassimDev, mouadDev));
        createTasksForProject(projetDelta, Arrays.asList(amineChef, ahmedDev, youssefDev));

        System.out.println("\n🎯 INITIALISATION TERMINÉE AVEC SUCCÈS !");
        System.out.println("=========================================");
        System.out.println("📊 RÉSUMÉ :");
        System.out.println("   • 4 Projets créés");
        System.out.println("   • 16 Tâches créées (4 par projet)");
        System.out.println("   • 2 Chefs de projet assignés");
        System.out.println("   • 4 Développeurs répartis sur les projets");
        System.out.println("   • 3 Clients avec projets variés");
    }

    private Project createProject(String titre, String description, boolean publicLink, TypeProjet type, 
                                StatutProjet statut, LocalDate dateDebut, LocalDate dateFin, 
                                User client, User createdBy, List<User> developpeurs) {
        
        Project project = new Project();
        project.setTitre(titre);
        project.setDescription(description);
        project.setUuidPublic(generateShortHexUUID());
        project.setPublicLinkEnabled(publicLink);
        project.setType(type);
        project.setStatut(statut);
        project.setDateDebut(dateDebut);
        project.setDateFin(dateFin);
        project.setClient(client);
        project.setCreatedBy(createdBy);
        project.setProgression(BigDecimal.valueOf(25.0)); // Progression initiale
        
        // Sauvegarder le projet d'abord sans les développeurs
        Project savedProject = projetRepository.save(project);
        
        // Maintenant ajouter les développeurs et sauvegarder à nouveau
        savedProject.setDeveloppeurs(developpeurs);
        savedProject = projetRepository.save(savedProject);
        
        System.out.println("✅ Projet créé: " + titre);
        System.out.println("   Client: " + client.getNom());
        System.out.println("   Chef: " + createdBy.getNom());
        System.out.println("   Développeurs: " + developpeurs.size());
        
        return savedProject;
    }

    private void createTasksForProject(Project project, List<User> developpeurs) {
        String[] taskTitles = {
            "Analyse des besoins et spécifications",
            "Conception technique et architecture",
            "Développement et implémentation",
            "Tests et validation"
        };
        
        String[] taskDescriptions = {
            "Étudier les besoins utilisateur et définir les spécifications fonctionnelles et techniques",
            "Concevoir l'architecture du système, les modèles de données et les interfaces",
            "Implémenter les fonctionnalités selon les spécifications et la conception",
            "Effectuer les tests unitaires, d'intégration et de validation utilisateur"
        };
        
        StatutTache[] taskStatuses = {
            StatutTache.TERMINE,
            StatutTache.EN_COURS,
            StatutTache.EN_COURS,
            StatutTache.NON_COMMENCE
        };
        
        Priorite[] taskPriorities = {
            Priorite.ELEVEE,
            Priorite.CRITIQUE,
            Priorite.MOYENNE,
            Priorite.BASSE
        };
        
        for (int i = 0; i < taskTitles.length; i++) {
            Task task = new Task();
            task.setTitre(taskTitles[i]);
            task.setDescription(taskDescriptions[i]);
            task.setDateDebut(project.getDateDebut().plusDays(i * 7)); // Espacer les tâches
            task.setDateFin(project.getDateDebut().plusDays((i + 1) * 7));
            task.setStatut(taskStatuses[i]);
            task.setPriorite(taskPriorities[i]);
            task.setProject(project);
            task.setDeveloppeur(developpeurs.get(i % developpeurs.size())); // Répartir les tâches
            task.setPlannedHours(8 + (i * 4)); // 8h, 12h, 16h, 20h
            task.setEffectiveHours(StatutTache.TERMINE.equals(task.getStatut()) ? task.getPlannedHours() : 0);
            task.setRemainingHours(StatutTache.TERMINE.equals(task.getStatut()) ? 0 : task.getPlannedHours());
            
            taskRepository.save(task);
            
            System.out.println("   📝 Tâche: " + taskTitles[i] + " → " + task.getDeveloppeur().getNom());
        }
    }

    private String generateShortHexUUID() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}

