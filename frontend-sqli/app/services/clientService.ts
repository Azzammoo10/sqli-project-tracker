// app/services/clientService.ts
import apiClient from './api';

export interface ClientProject {
  id: number;
  titre: string;
  description: string;
  type: 'TMA' | 'Delivery' | 'Interne';
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE' | 'ANNULE';
  progression: number; // 0..100
  dateDebut: string;
  dateFin?: string;
  createdBy?: { 
    id: number; 
    username: string; 
    email: string; 
    nom: string;
  };
  developpeurs?: Array<{ 
    id: number; 
    username: string; 
    nom: string; 
    email: string; 
    jobTitle?: string;
  }>;
  tasks?: Array<{ 
    id: number; 
    titre: string; 
    statut: string; 
    priorite?: string;
    dateEcheance?: string;
  }>;
  uuidPublic?: string;
  publicLinkEnabled?: boolean;
  // Statistiques des tâches
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  overdueTasks?: number;
}

export interface ClientDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalDevelopers: number;
  averageProgress: number;
}

export interface ProjectTimeline {
  id: number;
  titre: string;
  progression: number;
  dateDebut: string;
  dateFin?: string;
  statut: string;
  type: string;
}

export const clientService = {
  // Récupérer tous les projets du client connecté
  getClientProjects: async (): Promise<ClientProject[]> => {
    try {
      const { data } = await apiClient.get('/client/projects');
      console.log('📊 Projets client récupérés:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération projets client:', error);
      throw error;
    }
  },

  // Récupérer les statistiques du dashboard client
  getClientDashboardStats: async (): Promise<ClientDashboardStats> => {
    try {
      const { data } = await apiClient.get('/client/dashboard-stats');
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération stats client:', error);
      // Fallback: calculer les stats à partir des projets
      const projects = await clientService.getClientProjects();
      return clientService.calculateStatsFromProjects(projects);
    }
  },

  // Récupérer la timeline des projets
  getProjectTimeline: async (): Promise<ProjectTimeline[]> => {
    try {
      const { data } = await apiClient.get('/client/project-timeline');
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération timeline:', error);
      // Fallback: créer timeline à partir des projets
      const projects = await clientService.getClientProjects();
      return projects.map((p: ClientProject) => ({
        id: p.id,
        titre: p.titre,
        progression: p.progression,
        dateDebut: p.dateDebut,
        dateFin: p.dateFin,
        statut: p.statut,
        type: p.type
      }));
    }
  },

  // Récupérer les tâches en retard
  getOverdueTasks: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get('/client/overdue-tasks');
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération tâches en retard:', error);
      return [];
    }
  },

  // Récupérer les activités récentes
  getRecentActivity: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get('/client/recent-activity');
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération activités:', error);
      return [];
    }
  },

  // Calculer les stats à partir des projets (fallback)
  calculateStatsFromProjects: (projects: ClientProject[]): ClientDashboardStats => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.statut === 'EN_COURS').length;
    const completedProjects = projects.filter(p => p.statut === 'TERMINE').length;
    
    const totalTasks = projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0);
    const completedTasks = projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0);
    const inProgressTasks = projects.reduce((sum, p) => sum + (p.inProgressTasks || 0), 0);
    
    const totalDevelopers = new Set(
      projects.flatMap(p => p.developpeurs?.map(d => d.id) || [])
    ).size;
    
    const averageProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.progression, 0) / totalProjects 
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks: 0, // À calculer si possible
      totalDevelopers,
      averageProgress: Math.round(averageProgress)
    };
  }
};

export default clientService;
