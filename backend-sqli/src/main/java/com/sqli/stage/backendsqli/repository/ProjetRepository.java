package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Enums.StatutProjet;
import com.sqli.stage.backendsqli.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetRepository extends JpaRepository<Project, Integer> {
    Optional<Project> findById(Integer id);
    List<Project> findByCreatedByUsername(String username);
    Optional<Project> findByUuidPublic(String uuid);
    List<Project> findByStatut(StatutProjet statut);
    List<Project> findByTitreContainingIgnoreCase(String keyword);
    List<Project> findByIsPublicLinkEnabledTrue();
    List<Project> findByCreatedById(int id);

    @Query("SELECT p FROM Project p WHERE p.client.id = :clientId")
    List<Project> findByClientId(@Param("clientId") Integer clientId);

    @Query("SELECT p FROM Project p JOIN p.developpeurs d WHERE d.id = :developpeurId")
    List<Project> findByDeveloppeurId(@Param("developpeurId") Integer developpeurId);

    @Query("SELECT p FROM Project p WHERE p.type = 'Delivery'")
    List<Project> findBuildProjects();

    @Query("SELECT p FROM Project p WHERE p.type = 'TMA'")
    List<Project> findTmaProjects();


}
