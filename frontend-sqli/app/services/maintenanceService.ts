import apiClient from './api';

// Types
export type MaintenanceStatus = {
  enabled: boolean;
  message?: string;
  startedAt?: string;
  updatedAt?: string;
};

export type MaintenanceToggleRequest = {
  enabled: boolean;
  message?: string;
};

// Service
const maintenanceService = {
  getStatus: async (): Promise<MaintenanceStatus> => {
    const response = await apiClient.get('/maintenance/status');
    return response.data;
  },

  toggleMaintenance: async (request: MaintenanceToggleRequest): Promise<MaintenanceStatus> => {
    const response = await apiClient.post('/maintenance/toggle', request);
    return response.data;
  },

  isMaintenanceEnabled: async (): Promise<boolean> => {
    try {
      const status = await maintenanceService.getStatus();
      return status.enabled;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de maintenance:', error);
      return false;
    }
  }
};

export { maintenanceService };
