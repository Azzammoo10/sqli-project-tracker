import apiClient from './api';

// Shape aligned to backend TaskResponse
export type Task = {
  id: number;
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut: 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
  priorite?: string;
  plannedHours?: number;
  effectiveHours?: number;
  remainingHours?: number;
  developpeurUsername?: string;
  projectTitre?: string;
};

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/task');
    return data;
  },
  getByProject: async (projectId: number): Promise<Task[]> => {
    const { data } = await apiClient.get(`/task/project/${projectId}`);
    return data;
  },
  getStats: async (): Promise<Record<string, number>> => {
    const { data } = await apiClient.get('/task/stats');
    return data;
  },
  getLate: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/task/late');
    return data;
  },
};

export default taskService;


