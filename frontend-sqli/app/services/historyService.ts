// app/services/historyService.ts
import apiClient from './api';

// Types alignés sur le backend (Enums sérialisés en string)
export type TypeOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | string;
export type EntityName    = 'USER' | 'PROJECT' | 'TASK' | string;

// ↘ correspond EXACTEMENT à LogResponse du backend
export interface HistoryEntry {
  action: TypeOperation;
  dateHeure: string;           // LocalDateTime -> string
  description: string;
  entityId: number;
  entityName: EntityName;
  userNom: string;
  userUsername: string;
}

// Endpoints REST exposés par HistoriqueController (/api/historique/**)
export const historyService = {
  // liste complète (non paginée) triée côté back
  getAllHistory: async (): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get('/historique/all');
    return Array.isArray(data) ? data : [];
  },

  getByAction: async (action: TypeOperation): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get(`/historique/action/${action}`);
    return data;
  },

  getByEntity: async (entity: EntityName): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get(`/historique/entity/${entity}`);
    return data;
  },

  getByUser: async (userId: number): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get(`/historique/user/${userId}`);
    return data;
  },

  getByDateRange: async (startISO: string, endISO: string): Promise<HistoryEntry[]> => {
    const { data } = await apiClient.get(`/historique/date`, {
      params: { start: startISO, end: endISO },
    });
    return data;
  },
};
