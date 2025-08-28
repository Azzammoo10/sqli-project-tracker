import { useEffect, useState } from 'react';
import { maintenanceService } from '../services/maintenanceService';
import type { MaintenanceStatus } from '../services/maintenanceService';

export const useMaintenance = () => {
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const status = await maintenanceService.getStatus();
      setMaintenanceStatus(status);
      setIsMaintenanceEnabled(status.enabled);
    } catch (error) {
      console.error('Erreur lors de la vérification de maintenance:', error);
      setIsMaintenanceEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();

    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkMaintenanceStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isMaintenanceEnabled,
    maintenanceStatus,
    loading,
    checkMaintenanceStatus
  };
};
