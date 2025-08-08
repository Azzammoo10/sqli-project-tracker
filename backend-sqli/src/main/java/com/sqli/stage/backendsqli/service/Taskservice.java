package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.TaskDTO.TaskFilterRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskRequest;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskResponse;
import com.sqli.stage.backendsqli.dto.TaskDTO.TaskProgressResponse;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface Taskservice {
    TaskResponse createTask(TaskRequest request);
    TaskResponse updateTask(int id, TaskRequest request);
    void deleteTask(int id);
    TaskResponse getTaskById(int id);
    List<TaskResponse> searchTasksByKeyword(String keyword);
    List<TaskResponse> getAllTasks();
    List<TaskResponse> getTasksByProject(int projectId);
    List<TaskResponse> getTasksByUser(int developpeurId);
    Map<StatutTache, Long> getTaskStats();
    List<TaskResponse> getLateTasks();
    Long countTasksByProject(int projectId);
    List<TaskResponse> getTasksByStatus(StatutTache status);
    List<TaskResponse> getTasksForCurrentUser();
    List<TaskResponse> getPlanningForCurrentUser();
    Map<StatutTache, Long> getWorkloadForCurrentUser(); // déplacer dans un futur AnalyticsService
    public Page<TaskResponse> getAllTasksPaged(Pageable pageable);
    List<TaskResponse> filterTasks(TaskFilterRequest filter);
    public TaskResponse markTaskAsFinished(int taskId);
    public TaskResponse markTaskAsInProgress(int taskId);



    // new Fonctionnaliter  ----------------------------------
    TaskProgressResponse getProgressByProject(int projectId);
    public TaskResponse markTaskAsBlocked(int taskId);
}
