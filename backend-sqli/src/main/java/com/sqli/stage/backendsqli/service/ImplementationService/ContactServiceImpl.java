package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.ContactRequest;
import com.sqli.stage.backendsqli.dto.ContactResponse;
import com.sqli.stage.backendsqli.entity.Contact;
import com.sqli.stage.backendsqli.entity.Enums.ContactType;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.exception.UserNotFoundException;
import com.sqli.stage.backendsqli.repository.ContactRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.ContactService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;


    @Override
    public ContactResponse createContact(ContactRequest request) {
        // Valider que l'utilisateur existe
        if (!validateUserExists(request.getUsername(), request.getEmail())) {
            throw new UserNotFoundException("Utilisateur non trouvé avec ce nom d'utilisateur et cet email");
        }

        // Créer le contact
        Contact contact = new Contact(
            request.getUsername(),
            request.getEmail(),
            request.getType(),
            request.getDescription()
        );

        // Essayer de lier à un utilisateur existant
        userRepository.findByUsername(request.getUsername())
            .ifPresent(contact::setUser);

        Contact savedContact = contactRepository.save(contact);
        

        
        return ContactResponse.from(savedContact);
    }

    @Override
    public List<ContactResponse> getAllContacts() {
        return contactRepository.findAll().stream()
            .map(ContactResponse::from)
            .collect(Collectors.toList());
    }

    @Override
    public ContactResponse getContactById(Long id) {
        Contact contact = contactRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Contact non trouvé avec l'ID: " + id));
        return ContactResponse.from(contact);
    }

    @Override
    public ContactResponse markAsProcessed(Long id) {
        Contact contact = contactRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Contact non trouvé avec l'ID: " + id));
        
        contact.setTraite(true);
        contact.setDateTraitement(LocalDateTime.now());
        
        Contact savedContact = contactRepository.save(contact);
        

        
        return ContactResponse.from(savedContact);
    }

    @Override
    public List<ContactResponse> getUnprocessedContacts() {
        return contactRepository.findByTraiteFalse().stream()
            .map(ContactResponse::from)
            .collect(Collectors.toList());
    }

    @Override
    public List<ContactResponse> getContactsByType(ContactType type) {
        return contactRepository.findByType(type).stream()
            .map(ContactResponse::from)
            .collect(Collectors.toList());
    }

    @Override
    public List<ContactType> getAvailableContactTypes() {
        return Arrays.asList(ContactType.values());
    }

    @Override
    public boolean validateUserExists(String username, String email) {
        // Vérifier que l'utilisateur existe avec ce username et cet email
        return userRepository.findByUsername(username)
            .map(user -> user.getEmail().equals(email))
            .orElse(false);
    }
}
