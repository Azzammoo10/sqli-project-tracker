import apiClient from './api';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  lateProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  averageCompletionRate: number;
}

export interface ProjectOverview {
  id: number;
  titre: string;
  description: string;
  type: string;
  statut: string;
  progression: number;
  dateDebut: string;
  dateFin: string;
  client: { username: string; email: string };
  developpeurs: Array<{ id: number; username: string; role: string }>;
  tasks: Array<{ id: number; titre: string; statut: string; dateFin: string }>;
}

export interface TaskOverview {
  id: number;
  titre: string;
  description: string;
  statut: string;
  priorite: string;
  dateDebut: string;
  dateFin: string;
  developpeur: { username: string; email: string };
  project: { titre: string; id: number };
  plannedHours: number;
  effectiveHours: number;
}

export interface TeamMemberOverview {
  id: number;
  username: string;
  email: string;
  role: string;
  jobTitle: string;
  department: string;
  assignedProjects: number;
  completedTasks: number;
  pendingTasks: number;
  availability: number;
  workload: number;
  lastActivity: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  entityType: string;
  entityId: number;
  user: { username: string; id: number };
}

export interface ProjectProgress {
  projectId: number;
  titre: string;
  progression: number;
  completedTasks: number;
  totalTasks: number;
  color: string;
}

export interface TaskStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WorkloadAnalysis {
  memberId: number;
  username: string;
  currentWorkload: number;
  maxCapacity: number;
  utilization: number;
  projects: Array<{ id: number; titre: string; workload: number }>;
}

export const dashboardService = {
  // Méthodes pour le dashboard admin
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/analytics/overview');
    return data;
  },

  getTrendData: async (): Promise<Array<{ label: string; value: number }>> => {
    try {
      const { data } = await apiClient.get('/analytics/trend');
      return data;
    } catch {
      return [];
    }
  },

  getTeamDashboard: async () => {
    const { data } = await apiClient.get('/analytics/dashboard/team');
    return data;
  },

  getTmaDashboard: async () => {
    const { data } = await apiClient.get('/analytics/dashboard/tma');
    return data;
  },

  // Méthodes pour le dashboard chef de projet
  getChefDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/analytics/chef/dashboard-stats');
    return data;
  },

  getChefProjectsOverview: async (): Promise<ProjectOverview[]> => {
    const { data } = await apiClient.get('/projects/chef/overview');
    return data;
  },

  getChefPriorityTasks: async (): Promise<TaskOverview[]> => {
    const { data } = await apiClient.get('/tasks/chef/priority');
    return data;
  },

  getChefTeamOverview: async (): Promise<TeamMemberOverview[]> => {
    const { data } = await apiClient.get('/analytics/chef/team-overview');
    return data;
  },

  getChefRecentActivity: async (): Promise<RecentActivity[]> => {
    const { data } = await apiClient.get('/analytics/chef/recent-activity');
    return data;
  },

  getChefProjectProgress: async (): Promise<ProjectProgress[]> => {
    const { data } = await apiClient.get('/analytics/chef/project-progress');
    return data;
  },

  getChefTaskStatusDistribution: async (): Promise<TaskStatusDistribution[]> => {
    const { data } = await apiClient.get('/analytics/chef/task-status-distribution');
    return data;
  },

  getChefWorkloadAnalysis: async (): Promise<WorkloadAnalysis[]> => {
    const { data } = await apiClient.get('/analytics/chef/workload-analysis');
    return data;
  },

  getChefUpcomingDeadlines: async (days: number = 7): Promise<Array<ProjectOverview | TaskOverview>> => {
    const { data } = await apiClient.get(`/analytics/chef/upcoming-deadlines?days=${days}`);
    return data;
  },

  getChefTeamPerformance: async () => {
    const { data } = await apiClient.get('/analytics/chef/team-performance');
    return data;
  },

  getChefOverdueProjects: async (): Promise<ProjectOverview[]> => {
    const { data } = await apiClient.get('/projects/chef/overdue');
    return data;
  },

  getChefOverdueTasks: async (): Promise<TaskOverview[]> => {
    const { data } = await apiClient.get('/tasks/chef/overdue');
    return data;
  },

  getChefBuildProjects: async (): Promise<ProjectOverview[]> => {
    const { data } = await apiClient.get('/analytics/chef/build-projects');
    return data;
  },

  getChefDashboardTeam: async (): Promise<TeamMemberOverview[]> => {
    const { data } = await apiClient.get('/analytics/chef/dashboard-team');
    return data;
  }
};

export default dashboardService;
