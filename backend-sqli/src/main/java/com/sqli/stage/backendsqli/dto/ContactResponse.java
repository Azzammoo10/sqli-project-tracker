package com.sqli.stage.backendsqli.dto;

import com.sqli.stage.backendsqli.entity.Contact;
import com.sqli.stage.backendsqli.entity.Enums.ContactType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContactResponse {
    
    private Long id;
    private String username;
    private String email;
    private ContactType type;
    private String description;
    private LocalDateTime dateCreation;
    private boolean traite;
    private LocalDateTime dateTraitement;
    
    public static ContactResponse from(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setId(contact.getId());
        response.setUsername(contact.getUsername());
        response.setEmail(contact.getEmail());
        response.setType(contact.getType());
        response.setDescription(contact.getDescription());
        response.setDateCreation(contact.getDateCreation());
        response.setTraite(contact.isTraite());
        response.setDateTraitement(contact.getDateTraitement());
        return response;
    }
}
