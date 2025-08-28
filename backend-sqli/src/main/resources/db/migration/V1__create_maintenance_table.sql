-- Création de la table maintenance
CREATE TABLE IF NOT EXISTS maintenance (
    id BIGSERIAL PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    message VARCHAR(500),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_maintenance_enabled ON maintenance(enabled);
CREATE INDEX IF NOT EXISTS idx_maintenance_updated_at ON maintenance(updated_at);

-- Insertion d'un enregistrement par défaut (maintenance désactivée)
INSERT INTO maintenance (enabled, message, created_by) 
VALUES (FALSE, NULL, 'system')
ON CONFLICT DO NOTHING;

