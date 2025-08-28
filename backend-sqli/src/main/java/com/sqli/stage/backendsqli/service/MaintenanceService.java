package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.MaintenanceStatusDto;
import com.sqli.stage.backendsqli.dto.MaintenanceToggleDto;
import com.sqli.stage.backendsqli.entity.Maintenance;
import com.sqli.stage.backendsqli.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceStatusDto getMaintenanceStatus() {
        Maintenance activeMaintenance = maintenanceRepository.findActiveMaintenance().orElse(null);
        
        if (activeMaintenance == null) {
            return MaintenanceStatusDto.builder()
                    .enabled(false)
                    .build();
        }

        return MaintenanceStatusDto.builder()
                .enabled(activeMaintenance.isEnabled())
                .message(activeMaintenance.getMessage())
                .startedAt(activeMaintenance.getStartedAt())
                .updatedAt(activeMaintenance.getUpdatedAt())
                .build();
    }

    @Transactional
    public MaintenanceStatusDto toggleMaintenance(MaintenanceToggleDto toggleDto, String username) {
        log.info("Maintenance toggle requested by {}: enabled={}, message={}", 
                username, toggleDto.isEnabled(), toggleDto.getMessage());

        if (toggleDto.isEnabled()) {
            // Désactiver toutes les maintenances actives
            maintenanceRepository.findAll().stream()
                    .filter(Maintenance::isEnabled)
                    .forEach(maintenance -> {
                        maintenance.setEnabled(false);
                        maintenance.setEndedAt(LocalDateTime.now());
                        maintenanceRepository.save(maintenance);
                    });

            // Créer une nouvelle maintenance active
            Maintenance newMaintenance = Maintenance.builder()
                    .enabled(true)
                    .message(toggleDto.getMessage())
                    .createdBy(username)
                    .startedAt(LocalDateTime.now())
                    .build();

            Maintenance saved = maintenanceRepository.save(newMaintenance);
            
            return MaintenanceStatusDto.builder()
                    .enabled(saved.isEnabled())
                    .message(saved.getMessage())
                    .startedAt(saved.getStartedAt())
                    .updatedAt(saved.getUpdatedAt())
                    .build();
        } else {
            // Désactiver la maintenance active
            maintenanceRepository.findActiveMaintenance().ifPresent(maintenance -> {
                maintenance.setEnabled(false);
                maintenance.setEndedAt(LocalDateTime.now());
                maintenanceRepository.save(maintenance);
            });

            return MaintenanceStatusDto.builder()
                    .enabled(false)
                    .build();
        }
    }

    public boolean isMaintenanceEnabled() {
        return maintenanceRepository.isMaintenanceEnabled();
    }
}

