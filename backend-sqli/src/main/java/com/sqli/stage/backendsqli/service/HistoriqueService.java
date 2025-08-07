package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogFilterRequest;
import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogResponse;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import com.sqli.stage.backendsqli.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public interface HistoriqueService  {
    LogResponse logAction(LogRequest request);
    LogResponse logAction(LogRequest request, User user);
    List<LogResponse> getAllLogs(); // Tous les logs triés par date desc
    List<LogResponse> getLogsByAction(TypeOperation action);
    List<LogResponse> getLogsByEntity(EntityName entity);
    List<LogResponse> getLogsByUser(int userId);
    List<LogResponse> getLogsBetweenDates(LocalDateTime start, LocalDateTime end);


    // new fonctionnaliter
    List<LogResponse> getLogsByUserAndEntity(int userId, EntityName entity);
    List<LogResponse> getLogsFiltered(LogFilterRequest filter);
}
