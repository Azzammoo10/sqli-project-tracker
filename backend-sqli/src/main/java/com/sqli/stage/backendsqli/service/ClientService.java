package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;

import java.util.List;
import java.util.Map;

public interface ClientService {
    
    // Récupérer tous les projets du client connecté
    List<ProjectResponse> getClientProjects();
    
    // Récupérer un projet spécifique du client
    ProjectResponse getClientProject(Integer id);
    
    // Récupérer les statistiques du dashboard client
    Map<String, Object> getClientDashboardStats();
    
    // Récupérer la timeline des projets
    List<Map<String, Object>> getProjectTimeline();
    
    // Récupérer les tâches en retard
    List<Map<String, Object>> getOverdueTasks();
    
    // Récupérer les activités récentes
    List<Map<String, Object>> getRecentActivity();
}
