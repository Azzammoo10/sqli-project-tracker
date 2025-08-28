import { useState } from 'react';
import { Wrench, Power, AlertTriangle } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import type { MaintenanceToggleRequest } from '../services/maintenanceService';
import toast from 'react-hot-toast';

interface MaintenanceControlProps {
  currentStatus: boolean;
  onStatusChange: () => void;
}

export default function MaintenanceControl({ currentStatus, onStatusChange }: MaintenanceControlProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const toggleMaintenance = async () => {
    if (loading) return;

    const newStatus = !currentStatus;
    const request: MaintenanceToggleRequest = {
      enabled: newStatus,
      message: message || undefined
    };

    try {
      setLoading(true);
      await maintenanceService.toggleMaintenance(request);
      
      toast.success(
        newStatus 
          ? 'Mode maintenance activé avec succès' 
          : 'Mode maintenance désactivé avec succès'
      );
      
      onStatusChange();
      setMessage('');
    } catch (error) {
      console.error('Erreur lors du toggle de maintenance:', error);
      toast.error('Erreur lors de la modification du mode maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <Wrench className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">
          Contrôle de Maintenance
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${currentStatus ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            Statut actuel: {currentStatus ? 'Maintenance activée' : 'Service normal'}
          </span>
        </div>
        
        {currentStatus && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800 font-medium">
                Le site est actuellement en maintenance
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="maintenance-message" className="block text-sm font-medium text-gray-700 mb-2">
            Message de maintenance (optionnel)
          </label>
          <textarea
            id="maintenance-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message à afficher aux utilisateurs..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={toggleMaintenance}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentStatus
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          ) : (
            <Power className="w-5 h-5 mr-2" />
          )}
          {currentStatus ? 'Désactiver la maintenance' : 'Activer la maintenance'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Seuls les administrateurs peuvent contrôler le mode maintenance</p>
        <p>• Les utilisateurs non-admin seront redirigés vers la page de maintenance</p>
        <p>• Les endpoints d'authentification restent accessibles</p>
      </div>
    </div>
  );
}
