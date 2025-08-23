package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.ContactRequest;
import com.sqli.stage.backendsqli.dto.ContactResponse;
import com.sqli.stage.backendsqli.entity.Enums.ContactType;

import java.util.List;

public interface ContactService {
    
    // Créer une nouvelle demande de contact
    ContactResponse createContact(ContactRequest request);
    
    // Récupérer tous les contacts
    List<ContactResponse> getAllContacts();
    
    // Récupérer un contact par ID
    ContactResponse getContactById(Long id);
    
    // Marquer un contact comme traité
    ContactResponse markAsProcessed(Long id);
    
    // Récupérer les contacts non traités
    List<ContactResponse> getUnprocessedContacts();
    
    // Récupérer les contacts par type
    List<ContactResponse> getContactsByType(ContactType type);
    
    // Récupérer les types de contact disponibles
    List<ContactType> getAvailableContactTypes();
    
    // Valider que l'utilisateur existe
    boolean validateUserExists(String username, String email);
}
