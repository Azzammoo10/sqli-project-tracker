package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    @Query("SELECT m FROM Maintenance m WHERE m.enabled = true ORDER BY m.updatedAt DESC LIMIT 1")
    Optional<Maintenance> findActiveMaintenance();

    @Query("SELECT COUNT(m) > 0 FROM Maintenance m WHERE m.enabled = true")
    boolean isMaintenanceEnabled();
}

