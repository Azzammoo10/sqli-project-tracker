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
  // Nouveaux champs pour la compatibilité avec le backend
  project?: {
    id: number;
    titre: string;
    description?: string;
  };
  developpeur?: {
    id: number;
    username: string;
    email?: string;
  };
  progression?: number;
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
    const { data } = await apiClient.get('/tasks');
    return data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },

  createTask: async (payload: TaskCreatePayload): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', payload);
    return data;
  },

  update: async (id: number, payload: Partial<TaskCreatePayload>): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  getByProject: async (projectId: number): Promise<Task[]> => {
    const { data } = await apiClient.get(`/tasks/project/${projectId}`);
    return data;
  },

  getByUser: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks/my-tasks');
    return data;
  },

  updateStatus: async (id: number, status: string): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}/status?status=${status}`);
    return data;
  },

  assignTask: async (id: number, developerId: number): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}/assign?developerId=${developerId}`);
    return data;
  },

  updateHours: async (id: number, hours: number): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}/hours?hours=${hours}`);
    return data;
  },

  // Timer functionality
  startTimer: async (id: number): Promise<any> => {
    const { data } = await apiClient.post(`/tasks/${id}/timer/start`);
    return data;
  },

  stopTimer: async (id: number): Promise<any> => {
    const { data } = await apiClient.post(`/tasks/${id}/timer/stop`);
    return data;
  },

  getTimerStatus: async (id: number): Promise<any> => {
    const { data } = await apiClient.get(`/tasks/${id}/timer/status`);
    return data;
  },

  getStats: async (): Promise<any> => {
    const { data } = await apiClient.get('/tasks/stats');
    return data;
  },

  // Nouvelles méthodes pour le dashboard développeur
  getTasksForCurrentUser: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks/my-tasks');
    return data;
  },

  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}/status?status=${status}`);
    return data;
  },

  search: async (keyword: string): Promise<Task[]> => {
    const { data } = await apiClient.get(`/tasks/search?keyword=${encodeURIComponent(keyword)}`);
    return data;
  },

  filter: async (filters: any): Promise<Task[]> => {
    const { data } = await apiClient.post('/tasks/filter', filters);
    return data;
  }
};

export default taskService;


