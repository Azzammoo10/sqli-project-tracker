package com.sqli.stage.backendsqli.entity.Enums;

import lombok.Getter;

@Getter
public enum Priorite {
    BASSE(1),
    MOYENNE(2),
    ELEVEE(3),
    CRITIQUE(4);

    private final int niveau;

    Priorite(int niveau) {
        this.niveau = niveau;
    }

}

