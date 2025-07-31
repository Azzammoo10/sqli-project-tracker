package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjetRepository extends JpaRepository<Project,Integer> {
    Optional<Project> findById(Integer id);
    List<Project> findByCreatedByUsername(String username);
    List<Project> findByClientId(int clientId);
    Optional<Project> findByUuidPublic(String uuid);
    List<Project> findByStatut(StatutProjet statut);
    List<Project> findByTitreContainingIgnoreCase(String keyword);
    List<Project> findByIsPublicLinkEnabledTrue();
    List<Project> findByCreatedById(int id);

    @Query("SELECT p FROM Project p JOIN p.developpeurs d WHERE d.id = :devId")
    List<Project> findByDeveloppeurId(@Param("devId") int devId);


}
