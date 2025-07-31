package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.ProjectDTO.DashboardStatsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectDetailsResponse;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectRequest;
import com.sqli.stage.backendsqli.dto.ProjectDTO.ProjectResponse;

import java.util.List;

public interface ProjetService {
    ProjectResponse createProject(ProjectRequest request);
    ProjectResponse updateProject(int id, ProjectRequest request);
    void deleteProject(int id);
    ProjectResponse getProjectById(int id);
    List<ProjectResponse> getAllProjects();
    List<ProjectResponse> getProjectsByChef(String username);
    List<ProjectResponse> getProjectsByClient(String username);
    ProjectResponse getProjectByUuid(String uuid);
    ProjectResponse togglePublicLink(int id); // activer/désactiver le lien public
    ProjectDetailsResponse getDetailedProject(int id);
    DashboardStatsResponse getProjectStats();
    List<ProjectResponse> searchProjectsByKeyword(String keyword);
    List<ProjectResponse> getAllPublicProjects();
    void assignDevelopersToProject(int projectId, List<Integer> developerIds);
}
