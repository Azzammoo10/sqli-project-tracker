-- Script pour désactiver la maintenance
UPDATE maintenance SET enabled = false, ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE enabled = true;
    