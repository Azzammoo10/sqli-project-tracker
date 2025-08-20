package com.sqli.stage.backendsqli.dto.ProjectDTO;

import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Enums.TypeProjet; // <-- ajoute ton enum de type
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private int id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String clientName;

    // ✅ AJOUT : type enum + un label lisible pour l’UI
    private TypeProjet type;         // DELIVERY | TMA | INTERNE (selon ton enum)
    private String typeLabel;        // "Delivery" | "TMA" | "Interne"

    private BigDecimal progression;

    @NotNull(message = "La date de début est obligatoire")
    @PastOrPresent(message = "La date de début doit être une date passée ou actuelle")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @FutureOrPresent(message = "La date de fin doit être une date actuelle ou future")
    private LocalDate dateFin;

    @NotNull(message = "Le statut est obligatoire")
    private StatutProjet statut;

    // ✅ RENOMMER : éviter "isIsPublicLinkEnabled()" avec Lombok
    private boolean publicLinkEnabled;

    // ⚠️ ton JSON montre des UUID courts (8 chars). Au choix :
    // - soit tu envoies un vrai UUID 36 chars et tu gardes ce pattern
    // - soit tu adaptes le pattern à 8 chars (ou enlèves la contrainte)
    // @Pattern(regexp = "^[a-f0-9\\-]{36}$", message = "Le UUID public doit être un identifiant valide")
    // Exemple si tu gardes des 8 chars:
    // @Pattern(regexp = "^[a-f0-9]{8}$", message = "Le UUID public doit contenir 8 caractères hexadécimaux")
    private String uuidPublic;

    private List<DeveloperResponse> developpeurs;
    
    // Statistiques des tâches
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
}
