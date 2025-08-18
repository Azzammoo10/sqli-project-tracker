import apiClient from './api';

// Types pour les données du dashboard
export interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  tasksToday: number;
  projectGrowth: string;
  userGrowth: string;
  taskGrowth: string;
}

export interface UserRoleStats {
  client: number;
  chefDeProjet: number;
  developpeur: number;
  stagiaire: number;
}

export interface LogsByEntity {
  PROJECT: number;
  TASK: number;
  USER: number;
  AUTH: number;
}

export interface ProjectTypeStats {
  TMA: number;
  Delivery: number;
  Interne: number;
}

export interface LogsByAction {
  Creation: number;
  Modification: number;
  Suppression: number;
  Login: number;
  Logout: number;
  'Assign task': number;
  'change status': number;
  'enable users': number;
  'Disable users': number;
}

export interface ChartData { label: string; value: number }

// Service pour le dashboard admin
export const dashboardService = {
  // Récupérer les statistiques principales
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/projects/stats');
    return response.data;
  },

  // Récupérer les utilisateurs par rôle
  getUsersByRole: async (): Promise<UserRoleStats> => {
    const response = await apiClient.get('/admin/users/by-role');
    return response.data;
  },

  // Récupérer les logs par entité
  getLogsByEntity: async (): Promise<LogsByEntity> => {
    const response = await apiClient.get('/admin/logs/by-entity');
    return response.data;
  },

  // Récupérer les types de projets
  getProjectTypes: async (): Promise<ProjectTypeStats> => {
    const response = await apiClient.get('/admin/projects/by-type');
    return response.data;
  },

  // Récupérer les logs par action
  getLogsByAction: async (): Promise<LogsByAction> => {
    const response = await apiClient.get('/admin/logs/by-action');
    return response.data;
  },

  // Récupérer les données pour le graphique de tendance
  getTrendData: async (): Promise<ChartData[]> => {
    const response = await apiClient.get('/analytics/completion-rate');
    return response.data;
  },

  // Récupérer les données complètes du dashboard
  getFullDashboardData: async () => {
    const [
      stats,
      userRoles,
      logsByEntity,
      projectTypes,
      logsByAction,
      trendData
    ] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getUsersByRole(),
      dashboardService.getLogsByEntity(),
      dashboardService.getProjectTypes(),
      dashboardService.getLogsByAction(),
      dashboardService.getTrendData()
    ]);

    return {
      stats,
      userRoles,
      logsByEntity,
      projectTypes,
      logsByAction,
      trendData
    };
  }
};
