package com.sqli.stage.backendsqli.controller;


import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogResponse;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/historique")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class HistoriqueController {

    private final HistoriqueService historiqueService;

    @GetMapping("/all")
    public ResponseEntity<List<LogResponse>> getAllLogs() {
        List<LogResponse> logs = historiqueService.getAllLogs();
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }


    @GetMapping("/action/{action}")
    public ResponseEntity<List<LogResponse>> getByAction(@PathVariable TypeOperation action) {
        List<LogResponse> logs = historiqueService.getLogsByAction(action);
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }


    @GetMapping("/entity/{entity}")
    public ResponseEntity<List<LogResponse>> getByEntity(@PathVariable EntityName entity) {
        return historiqueService.getLogsByEntity(entity).isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(historiqueService.getLogsByEntity(entity));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<LogResponse>> getByUser(@PathVariable int id) {
        return historiqueService.getLogsByUser(id).isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(historiqueService.getLogsByUser(id));

    }

    @GetMapping("/date")
    public ResponseEntity<List<LogResponse>> getByDateRange(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<LogResponse> logs = historiqueService.getLogsBetweenDates(start, end);
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }


}
