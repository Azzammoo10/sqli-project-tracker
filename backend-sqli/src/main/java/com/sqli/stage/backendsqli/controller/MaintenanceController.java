package com.sqli.stage.backendsqli.controller;

import com.sqli.stage.backendsqli.dto.MaintenanceStatusDto;
import com.sqli.stage.backendsqli.dto.MaintenanceToggleDto;
import com.sqli.stage.backendsqli.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@Slf4j
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/status")
    public ResponseEntity<MaintenanceStatusDto> getMaintenanceStatus() {
        log.debug("Maintenance status requested");
        MaintenanceStatusDto status = maintenanceService.getMaintenanceStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaintenanceStatusDto> toggleMaintenance(
            @RequestBody MaintenanceToggleDto toggleDto,
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("Maintenance toggle requested by user: {}", username);
        
        MaintenanceStatusDto result = maintenanceService.toggleMaintenance(toggleDto, username);
        return ResponseEntity.ok(result);
    }

    // Endpoint temporaire pour désactiver la maintenance
    @PostMapping("/disable")
    public ResponseEntity<MaintenanceStatusDto> disableMaintenance() {
        log.info("Disabling maintenance via temporary endpoint");
        
        MaintenanceToggleDto toggleDto = new MaintenanceToggleDto();
        toggleDto.setEnabled(false);
        toggleDto.setMessage("");
        
        MaintenanceStatusDto result = maintenanceService.toggleMaintenance(toggleDto, "system");
        return ResponseEntity.ok(result);
    }
}
