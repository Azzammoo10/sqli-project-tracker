package com.sqli.stage.backendsqli.Script.init;

import com.sqli.stage.backendsqli.entity.*;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class InitProjectData {

    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void initProjects() {
        if (projetRepository.count() > 0) return;

        create("Projet Alpha", "Développement d’une API REST",  true, TypeProjet.Delivery, StatutProjet.EN_COURS, d(2025, 8, 1), d(2025, 9, 30), 5, 1);
        create("Projet Beta", "Refonte d’un portail client",  false, TypeProjet.Interne, StatutProjet.EN_COURS, d(2025, 8, 5), d(2025, 10, 15), 6, 1);
        create("Projet Gamma", "Maintenance TMA",  true, TypeProjet.TMA, StatutProjet.EN_COURS, d(2025, 8, 10), d(2025, 11, 10), 6, 1);
        create("Projet Delta", "Poc microservices", true, TypeProjet.Interne, StatutProjet.EN_COURS, d(2025, 7, 15), d(2025, 9, 15), 5, 1);
    }

    private void create(String titre, String desc, boolean pub, TypeProjet type, StatutProjet statut, LocalDate debut, LocalDate fin, int clientId, int creatorId) {
        User client = userRepository.findById(clientId).orElseThrow(() -> new RuntimeException("Client introuvable"));
        User creator = userRepository.findById(creatorId).orElseThrow(() -> new RuntimeException("Créateur introuvable"));
        creator.setActifDansProjet(true);

        Project p = new Project();
        p.setTitre(titre);
        p.setDescription(desc);
        p.setUuidPublic(generateShortHexUUID());
        p.setPublicLinkEnabled(pub);
        p.setType(type);
        p.setStatut(statut);
        p.setDateDebut(debut);
        p.setDateFin(fin);
        p.setClient(client);
        p.setCreatedBy(creator);
        projetRepository.save(p);
    }

    private String generateShortHexUUID() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }


    private LocalDate d(int y, int m, int d) {
        return LocalDate.of(y, m, d);
    }
}
