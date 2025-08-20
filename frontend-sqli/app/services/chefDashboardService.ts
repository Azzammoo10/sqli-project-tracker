import apiClient from './api';
import type {
  DashboardStats as ChefDashboardStats,
  ProjectOverview,
  TaskOverview,
  TeamMemberOverview,
  RecentActivity,
  ProjectProgress,
  TaskStatusDistribution,
  WorkloadAnalysis
} from '../types/dashboard';

// Service pour le dashboard chef de projet
export const chefDashboardService = {
  // Récupérer les statistiques principales du dashboard
  getDashboardStats: async (): Promise<ChefDashboardStats> => {
    try {
      const response = await apiClient.get('/analytics/chef/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overdueProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        teamMembers: 0,
        averageCompletionRate: 0,
        monthlyGrowth: 0,
        weeklyTasksCompleted: 0,
        upcomingDeadlines: 0
      };
    }
  },

  // Récupérer les projets du chef de projet
  getProjectsOverview: async (): Promise<ProjectOverview[]> => {
    try {
      const response = await apiClient.get('/projects/chef/overview');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  },

  // Récupérer les tâches prioritaires
  getPriorityTasks: async (): Promise<TaskOverview[]> => {
    try {
      const response = await apiClient.get('/tasks/chef/priority');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      return [];
    }
  },

  // Récupérer l'équipe du chef de projet
  getTeamOverview: async (): Promise<TeamMemberOverview[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/team-overview');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'équipe:', error);
      return [];
    }
  },

  // Récupérer l'équipe détaillée du chef de projet
  getDetailedTeamOverview: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/detailed-team-overview');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'équipe détaillée:', error);
      return [];
    }
  },

  // Récupérer l'activité récente
  getRecentActivity: async (): Promise<RecentActivity[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error);
      return [];
    }
  },

  // Récupérer la progression des projets
  getProjectProgress: async (): Promise<ProjectProgress[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/project-progress');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      return [];
    }
  },

  // Récupérer la répartition des statuts de tâches
  getTaskStatusDistribution: async (): Promise<TaskStatusDistribution[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/task-status-distribution');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la répartition:', error);
      return [];
    }
  },

  // Récupérer l'analyse de charge de travail
  getWorkloadAnalysis: async (): Promise<WorkloadAnalysis[]> => {
    try {
      const response = await apiClient.get('/analytics/chef/workload-analysis');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'analyse de charge:', error);
      return [];
    }
  },

  // Récupérer toutes les données du dashboard en une seule fois
  getFullDashboardData: async () => {
    try {
      const [
        stats,
        projects,
        tasks,
        team,
        activity,
        progress,
        taskDistribution,
        workload
      ] = await Promise.all([
        chefDashboardService.getDashboardStats(),
        chefDashboardService.getProjectsOverview(),
        chefDashboardService.getPriorityTasks(),
        chefDashboardService.getTeamOverview(),
        chefDashboardService.getRecentActivity(),
        chefDashboardService.getProjectProgress(),
        chefDashboardService.getTaskStatusDistribution(),
        chefDashboardService.getWorkloadAnalysis()
      ]);

      return {
        stats,
        projects,
        tasks,
        team,
        activity,
        progress,
        taskDistribution,
        workload
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données complètes:', error);
      throw error;
    }
  },

  // Récupérer les projets en retard
  getOverdueProjects: async (): Promise<ProjectOverview[]> => {
    try {
      const response = await apiClient.get('/projects/chef/overdue');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets en retard:', error);
      return [];
    }
  },

  // Récupérer les tâches en retard
  getOverdueTasks: async (): Promise<TaskOverview[]> => {
    try {
      const response = await apiClient.get('/tasks/chef/overdue');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches en retard:', error);
      return [];
    }
  },

  // Récupérer les échéances à venir
  getUpcomingDeadlines: async (days: number = 7): Promise<Array<ProjectOverview | TaskOverview>> => {
    try {
      const response = await apiClient.get(`/analytics/chef/upcoming-deadlines?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des échéances:', error);
      return [];
    }
  },

  // Récupérer les statistiques de performance de l'équipe
  getTeamPerformance: async (): Promise<{
    averageTaskCompletionTime: number;
    onTimeDeliveryRate: number;
    teamProductivity: number;
    topPerformers: Array<{ username: string; performance: number }>;
  }> => {
    try {
      const response = await apiClient.get('/analytics/chef/team-performance');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la performance:', error);
      return {
        averageTaskCompletionTime: 0,
        onTimeDeliveryRate: 0,
        teamProductivity: 0,
        topPerformers: []
      };
    }
  }
};
