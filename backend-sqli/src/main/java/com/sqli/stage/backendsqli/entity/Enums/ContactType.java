package com.sqli.stage.backendsqli.entity.Enums;

public enum ContactType {
    MOT_DE_PASSE_OUBLIE("Mot de passe oublié"),
    COMPTE_BLOQUE("Compte bloqué"),
    PROBLEME_CONNEXION("Problème de connexion"),
    DEMANDE_ACCES("Demande d'accès"),
    BUG_APPLICATION("Bug dans l'application"),
    DEMANDE_FONCTIONNALITE("Demande de nouvelle fonctionnalité"),
    PROBLEME_PERFORMANCE("Problème de performance"),
    AUTRE("Autre");

    private final String description;

    ContactType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
