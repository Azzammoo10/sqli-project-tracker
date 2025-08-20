package com.sqli.stage.backendsqli.repository;

import com.sqli.stage.backendsqli.entity.Enums.Priorite;
import com.sqli.stage.backendsqli.entity.Enums.StatutTache;
import com.sqli.stage.backendsqli.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByDeveloppeurId(int developpeurId);
    List<Task> findByProjectCreatedById(Integer chefProjetId);
    List<Task> findByProjectId(int projectId);

    List<Task> findByStatut(StatutTache statut);
    Long countByProjectId(int projectId);

    List<Task> findByPriorite(Priorite priorite);

    List<Task> findByTitreContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titre, String description);
    List<Task> findByDateFinBeforeAndStatutNot(LocalDate date, StatutTache statutExclu);

    int countByDateDebut(LocalDate date);

    int countByDeveloppeurId(int developpeurId);

    int countByDeveloppeurIdAndStatut(int developpeurId, StatutTache statut);

    int countByProjectIdAndStatut(int projectId, StatutTache statut);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.statut = 'TERMINE' AND YEAR(t.dateFin) = :year AND MONTH(t.dateFin) = :month")
    int countCompletedTasksInMonth(@Param("year") int year, @Param("month") int month);

    boolean existsByProjectIdAndTitreIgnoreCase(Integer id, String trim);

    // Nouvelles méthodes pour les analytics du chef de projet
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id IN :projectIds")
    Long countByProjectIdIn(@Param("projectIds") List<Integer> projectIds);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id IN :projectIds AND t.statut = :statut")
    Long countByProjectIdInAndStatut(@Param("projectIds") List<Integer> projectIds, @Param("statut") StatutTache statut);

    @Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds")
    List<Task> findByProjectIdIn(@Param("projectIds") List<Integer> projectIds);
    
    // Nouvelles méthodes pour compter les tâches par développeur ET par projet
    @Query("SELECT COUNT(t) FROM Task t WHERE t.developpeur.id = :developpeurId AND t.project.id IN :projectIds")
    int countByDeveloppeurIdAndProjectIdIn(@Param("developpeurId") int developpeurId, @Param("projectIds") List<Integer> projectIds);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.developpeur.id = :developpeurId AND t.project.id IN :projectIds AND t.statut = :statut")
    int countByDeveloppeurIdAndProjectIdInAndStatut(@Param("developpeurId") int developpeurId, @Param("projectIds") List<Integer> projectIds, @Param("statut") StatutTache statut);
}
