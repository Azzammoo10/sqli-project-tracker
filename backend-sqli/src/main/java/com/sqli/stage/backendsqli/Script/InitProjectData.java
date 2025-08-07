package com.sqli.stage.backendsqli.Script;

import com.sqli.stage.backendsqli.entity.*;
import com.sqli.stage.backendsqli.entity.Enums.*;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class InitProjectData {

    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void initProjects() {
        if (projetRepository.count() > 0) return;

        create("BOA CRM", "Projet BOA CRM pour le client BOA", "09603b51", false, TypeProjet.Delivery,  StatutProjet.EN_COURS, d(2025,7,15), d(2025,12,28), 1, 6);
        create("INEOS / CYBERFORCES", "Projet INEOS / CYBERFORCES pour le client CYBERFORCES", "f87559a7", true, TypeProjet.Delivery,  StatutProjet.EN_COURS, d(2025,7,9), d(2025,10,19), 4, 2);
        create("RFC-ORGA", "Projet RFC-ORGA pour le client RFC Digital", "c0d78d64", true, TypeProjet.Interne,  StatutProjet.EN_COURS, d(2025,8,13), d(2025,11,13), 2, 4);
        create("RECETTE ODOO", "Projet RECETTE ODOO pour le client RFC Digital", "26dfe761", true, TypeProjet.Interne,  StatutProjet.EN_COURS, d(2025,7,7), d(2025,9,18), 3, 1);
        create("SOCLE RFC DIGITAL - WAVE", "Projet SOCLE RFC DIGITAL - WAVE pour le client RFC Digital", "05c66d98", true, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,1), d(2025,11,21), 2, 5);
        create("RFC-FORMATION", "Projet RFC-FORMATION pour le client RFC Digital", "c5bbb2f9", true, TypeProjet.Interne,  StatutProjet.EN_COURS, d(2025,6,8), d(2025,10,11), 2, 5);
        create("SAMSIC > WEBAPP intérimaire", "Projet SAMSIC > WEBAPP intérimaire pour le client SAMSIC MEDICAL", "f53f0f0a", false, TypeProjet.Delivery,  StatutProjet.EN_COURS, d(2025,7,10), d(2025,11,10), 4, 3);
        create("Mobilize-Fs-Espace Client V2", "Projet Mobilize-Fs-Espace Client V2 pour le client Mobilize FS", "75605293", true, TypeProjet.Delivery,  StatutProjet.EN_COURS, d(2025,5,10), d(2025,10,11), 3, 4);
        create("Geely Ticketing", "Projet Geely Ticketing pour le client BAMOTORS", "e8e215f1", false, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,2), d(2025,9,21), 1, 3);
        create("DNA-ETHICS", "Projet DNA-ETHICS pour le client DNA-ethics", "e4690ecb", true, TypeProjet.Delivery,  StatutProjet.EN_COURS, d(2025,5,1), d(2025,10,23), 2, 4);
        create("MANDOEO", "Projet MANDOEO pour le client MANDATE", "11d52930", false, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,8), d(2025,9,20), 3, 3);
        create("TMA MAMDA SEL", "Projet TMA MAMDA SEL pour le client MAMDA MCMA", "7718a3be", true, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,14), d(2025,10,12), 4, 6);
        create("GEELY SW MA", "Projet GEELY SW MA pour le client BAMOTORS", "5f1a6499", false, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,5), d(2025,9,24), 1, 1);
        create("TMA- CKG Liv@Sset", "Projet TMA- CKG Liv@Sset pour le client CDG Capital Gestion", "f7ba3efe", false, TypeProjet.TMA,  StatutProjet.EN_COURS, d(2025,8,12), d(2025,9,26), 1, 2);
    }

    private void create(String titre, String desc, String uuid, boolean pub, TypeProjet type, StatutProjet statut, LocalDate debut, LocalDate fin, int clientId, int creatorId) {
        User client = userRepository.findById(clientId).orElseThrow();
        User creator = userRepository.findById(creatorId).orElseThrow();
        creator.setActifDansProjet(true);

        Project p = new Project();
        p.setTitre(titre);
        p.setDescription(desc);
        p.setUuidPublic(uuid);
        p.setPublicLinkEnabled(pub);
        p.setType(type);
        p.setStatut(statut);
        p.setDateDebut(debut);
        p.setDateFin(fin);
        p.setClient(client);
        p.setCreatedBy(creator);
        projetRepository.save(p);
    }

    private LocalDate d(int y, int m, int d) {
        return LocalDate.of(y, m, d);
    }
}