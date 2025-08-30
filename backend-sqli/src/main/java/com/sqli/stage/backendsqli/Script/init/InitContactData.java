//package com.sqli.stage.backendsqli.Script.init;
//
//import com.sqli.stage.backendsqli.entity.Contact;
//import com.sqli.stage.backendsqli.entity.Enums.ContactType;
//import com.sqli.stage.backendsqli.repository.ContactRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//
//import jakarta.annotation.PostConstruct;
//import java.time.LocalDateTime;
//
//@Component
//@RequiredArgsConstructor
//public class InitContactData {
//
//    private final ContactRepository contactRepository;
//
//    @PostConstruct
//    public void initContacts() {
//        if (contactRepository.count() > 0) return;
//
//        System.out.println("📞 INITIALISATION DES DEMANDES DE CONTACT");
//        System.out.println("=========================================");
//
//        // Créer des demandes de contact variées
//        createContact("jean.dupont", "jean.dupont@entreprise.com", ContactType.DEMANDE_FONCTIONNALITE,
//            "Bonjour, nous souhaiterions obtenir un devis pour le développement d'une application mobile de gestion de stock.");
//
//        createContact("marie.martin", "marie.martin@startup.com", ContactType.PROBLEME_CONNEXION,
//            "Problème de connexion à l'application web. Impossible de se connecter depuis hier.");
//
//        createContact("pierre.durand", "pierre.durand@tech-ai.com", ContactType.DEMANDE_ACCES,
//            "Nous cherchons un partenaire technique pour développer une solution innovante dans le domaine de l'IA.");
//
//        createContact("sophie.bernard", "sophie.bernard@consulting.com", ContactType.AUTRE,
//            "Pouvez-vous me donner plus d'informations sur vos services de maintenance TMA ?");
//
//        createContact("lucas.moreau", "lucas.moreau@client.com", ContactType.BUG_APPLICATION,
//            "Le projet livré ne correspond pas exactement aux spécifications initiales. Nous demandons des corrections.");
//
//        createContact("emma.roux", "emma.roux@formation.com", ContactType.DEMANDE_FONCTIONNALITE,
//            "Nous aimerions organiser une formation sur Spring Boot pour notre équipe de développeurs.");
//
//        System.out.println("\n✅ INITIALISATION DES CONTACTS TERMINÉE !");
//        System.out.println("==========================================");
//        System.out.println("📊 RÉSUMÉ :");
//        System.out.println("   • 6 demandes de contact créées");
//        System.out.println("   • Types variés : Fonctionnalité, Connexion, Accès, Autre, Bug, Formation");
//        System.out.println("   • Toutes les demandes sont en statut 'NON TRAITÉ'");
//        System.out.println("   • Données réalistes avec usernames et emails");
//    }
//
//    private void createContact(String username, String email, ContactType type, String description) {
//
//        Contact contact = new Contact(username, email, type, description);
//        contactRepository.save(contact);
//
//        System.out.println("✅ Contact créé: " + username);
//        System.out.println("   Type: " + type.getDescription());
//        System.out.println("   Email: " + email);
//        System.out.println("   Description: " + description.substring(0, Math.min(50, description.length())) + "...");
//    }
//}
