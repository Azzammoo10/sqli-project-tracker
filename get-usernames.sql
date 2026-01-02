-- Script pour récupérer tous les usernames créés
SELECT 
    id,
    nom,
    username,
    email,
    role,
    enabled
FROM users
ORDER BY role, id;
