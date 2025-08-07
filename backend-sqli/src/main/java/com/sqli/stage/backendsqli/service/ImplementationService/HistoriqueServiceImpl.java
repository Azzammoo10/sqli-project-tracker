package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogFilterRequest;
import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogResponse;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;
import com.sqli.stage.backendsqli.entity.Historique;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.AccessdeniedException;
import com.sqli.stage.backendsqli.repository.HistoriqueRepository;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class HistoriqueServiceImpl implements HistoriqueService {

    private final UserRepository userRepo;
    private final HistoriqueRepository historiqueRepo;

    @Override
    public LogResponse logAction(LogRequest request) {
        return logAction(request, getConnectedUser());
    }

    @Override
    public LogResponse logAction(LogRequest request, User user) {
        Historique log = new Historique();
        log.setAction(request.getAction());
        log.setDescription(request.getDescription());
        log.setEntityId(request.getEntityId());
        log.setEntityName(request.getEntityName());
        log.setDateHeure(LocalDateTime.now());
        log.setUser(user);

        Historique logsave = historiqueRepo.save(log);

        return mapToReponse(logsave);
    }

    @Override
    public List<LogResponse> getAllLogs() {
        return historiqueRepo.findAll().stream().map(this::mapToReponse).collect(Collectors.toList());
    }

    @Override
    public List<LogResponse> getLogsByAction(TypeOperation action) {
        return historiqueRepo.findAll().stream()
                .filter(h -> h.getAction() == action)
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LogResponse> getLogsByEntity(EntityName entity) {
        return historiqueRepo.findAll()
                .stream()
                .filter(h -> h.getEntityName() == entity)
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LogResponse> getLogsByUser(int userId) {
        return historiqueRepo.findAll()
                .stream()
                .filter(h -> h.getUser().getId() == userId)
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LogResponse> getLogsBetweenDates(LocalDateTime start, LocalDateTime end) {
        return historiqueRepo.findAll().stream()
                .filter(h -> !h.getDateHeure().isBefore(start) && !h.getDateHeure().isAfter(end))
                .map(this::mapToReponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LogResponse> getLogsByUserAndEntity(int userId, EntityName entity) {
        return List.of();
    }

    @Override
    public List<LogResponse> getLogsFiltered(LogFilterRequest filter) {
        return List.of();
    }


    private User getConnectedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new AccessdeniedException("Utilisateur introuvable"));
    }

    public LogResponse mapToReponse(Historique historique){
        return new LogResponse(
                historique.getAction(),
                historique.getDateHeure(),
                historique.getDescription(),
                historique.getEntityId(),
                historique.getEntityName(),
                historique.getUser().getNom(),
                historique.getUser().getUsername()

        );
    }
}

