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

export type TaskCreatePayload = {
    titre: string;
    description?: string;
    dateDebut: string;    // format "YYYY-MM-DD"
    dateFin: string;      // format "YYYY-MM-DD"
    statut?: 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE'; // utilise NON_COMMENCE pour "à faire"
    priorite?: 'BASSE' | 'MOYENNE' | 'ELEVEE';
    plannedHours?: number;
    projectId: number;
    developpeurId: number;
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
    const { data } = await apiClient.get('/task/stats/me');
    return data;
  },
  getLate: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/task/late');
    return data;
  },
    create: async (payload: {
        titre: string;
        description: string | undefined;
        dateDebut: string;
        dateFin: string;
        statut: "A_FAIRE" | "EN_COURS" | "TERMINE";
        priorite: "BASSE" | "MOYENNE" | "HAUTE";
        plannedHours: number;
        projectId: number;
        developpeurId: number
    }): Promise<Task> => {
        const { data } = await apiClient.post('/task', payload);
        return data as Task;
    },
};

export default taskService;


