package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Integer> {
}
