package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.ContactRequest;
import com.sqli.stage.backendsqli.dto.ContactResponse;
import com.sqli.stage.backendsqli.entity.Enums.ContactType;
import com.sqli.stage.backendsqli.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    // Créer une nouvelle demande de contact
    @PostMapping("/send")
    public ResponseEntity<ContactResponse> sendContact(@Valid @RequestBody ContactRequest request) {
        ContactResponse response = contactService.createContact(request);
        return ResponseEntity.ok(response);
    }

    // Récupérer tous les contacts (admin seulement)
    @GetMapping
    public ResponseEntity<List<ContactResponse>> getAllContacts() {
        List<ContactResponse> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    // Récupérer un contact par ID
    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        ContactResponse contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }

    // Marquer un contact comme traité
    @PutMapping("/{id}/process")
    public ResponseEntity<ContactResponse> markAsProcessed(@PathVariable Long id) {
        ContactResponse contact = contactService.markAsProcessed(id);
        return ResponseEntity.ok(contact);
    }

    // Récupérer les contacts non traités
    @GetMapping("/unprocessed")
    public ResponseEntity<List<ContactResponse>> getUnprocessedContacts() {
        List<ContactResponse> contacts = contactService.getUnprocessedContacts();
        return ResponseEntity.ok(contacts);
    }

    // Récupérer les contacts par type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ContactResponse>> getContactsByType(@PathVariable ContactType type) {
        List<ContactResponse> contacts = contactService.getContactsByType(type);
        return ResponseEntity.ok(contacts);
    }

    // Récupérer les types de contact disponibles
    @GetMapping("/types")
    public ResponseEntity<List<ContactType>> getAvailableContactTypes() {
        List<ContactType> types = contactService.getAvailableContactTypes();
        return ResponseEntity.ok(types);
    }
}
