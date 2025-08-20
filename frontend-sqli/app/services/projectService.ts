// app/services/projectService.ts
import apiClient from './api';

export interface Project {
  id: number;
  titre: string;
  description: string;
  type: 'TMA' | 'Delivery' | 'Interne';
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE' | 'ANNULE';
  progression: number; // 0..100
  dateDebut: string;
  dateFin?: string;
  clientName?: string; // Ancien champ pour compatibilité
  client?: { 
    id: number; 
    username: string; 
    nom: string; 
    email: string; 
  };
  createdBy?: { id: number; username: string; email: string };
  developpeurs?: Array<{ 
    id: number; 
    username: string; 
    nom: string; 
    email: string; 
  }>;
  tasks?: Array<{ id: number; titre: string; statut: string }>;
  uuidPublic?: string;
  publicLinkEnabled?: boolean;
  // Statistiques des tâches (ajoutées par le backend)
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
}

export interface CreateProjectRequest {
    titre: string;
    description: string;            // tu la valides required dans le form, donc mets-la required ici
    type: Project['type'];
    dateDebut: string;
    dateFin?: string;
    clientId: number;
    developpeurIds: number[];       // <-- requis (tableau vide si aucun)
}


export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  statut?: Project['statut'];
  progression?: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  lateProjects: number;
}

export const projectService = {
  // ADMIN & CHEF (selon @PreAuthorize côté BE)
  getAllProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects');
    return data;
  },

  // CHEF
  getProjectsByChef: async (username?: string): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects/chef/overview');
    return data;
  },

  // CLIENT
  getProjectsByClient: async (username: string): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects/client', { params: { username } });
    return data;
  },

  // DÉVELOPPEUR - Projets assignés à l'utilisateur connecté
  getProjectsForCurrentUser: async (): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects/my-projects');
    return data;
  },

  // DÉVELOPPEUR - Alias pour la compatibilité
  getProjectsByDeveloper: async (): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects/my-projects');
    return data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  createProject: async (payload: CreateProjectRequest): Promise<Project> => {
    const { data } = await apiClient.post('/projects', payload);
    return data;
  },

  updateProject: async (id: number, payload: UpdateProjectRequest): Promise<Project> => {
    const { data } = await apiClient.put(`/projects/${id}`, payload);
    return data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  assignDevelopers: async (projectId: number, developerIds: number[]) => {
    // ton BE attend PUT /projects/{id}/assign-developers avec body { developerIds }
    const { data } = await apiClient.put(`/projects/${projectId}/assign-developers`, developerIds);
    return data as Project;
  },

  recomputeProgress: async (projectId: number) => {
    const { data } = await apiClient.patch(`/projects/${projectId}/progress/recompute`);
    return data as number; // renvoie BigDecimal côté BE
  },

  // Nouvelle méthode pour recalculer la progression de tous les projets
  recomputeAllProgress: async () => {
    const { data } = await apiClient.post('/projects/recompute-all-progress');
    return data;
  },

  getProjectStats: async (): Promise<ProjectStats> => {
    const { data } = await apiClient.get('/projects/stats');
    return data;
  },

  searchProjects: async (keyword: string): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects/search', { params: { q: keyword } });
    return data;
  },

  togglePublicLink: async (projectId: number): Promise<Project> => {
    const { data } = await apiClient.put(`/projects/${projectId}/toggle-public`);
    return data;
  },
};
export default projectService;
