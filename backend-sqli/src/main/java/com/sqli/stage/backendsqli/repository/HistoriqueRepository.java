package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Integer> {
    
    @Query("SELECT h FROM Historique h WHERE h.user.id = :userId")
    List<Historique> findByUserId(@Param("userId") Integer userId);
}
