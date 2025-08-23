package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    // Trouver par username
    Optional<Contact> findByUsername(String username);
    
    // Trouver par email
    List<Contact> findByEmail(String email);
    
    // Trouver par type de contact
    List<Contact> findByType(com.sqli.stage.backendsqli.entity.Enums.ContactType type);
    
    // Trouver les contacts non traités
    List<Contact> findByTraiteFalse();
    
    // Trouver par username et email (pour validation)
    @Query("SELECT c FROM Contact c WHERE c.username = :username AND c.email = :email")
    Optional<Contact> findByUsernameAndEmail(@Param("username") String username, @Param("email") String email);
    
    // Trouver les contacts récents (derniers 30 jours)
    @Query("SELECT c FROM Contact c WHERE c.dateCreation >= :dateLimite ORDER BY c.dateCreation DESC")
    List<Contact> findRecentContacts(@Param("dateLimite") java.time.LocalDateTime dateLimite);
}
