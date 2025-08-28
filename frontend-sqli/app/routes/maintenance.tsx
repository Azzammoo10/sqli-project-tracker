import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, RefreshCw, Home } from 'lucide-react';

interface MaintenanceStatus {
  enabled: boolean;
  message?: string;
  startedAt?: string;
  updatedAt?: string;
}

export default function MaintenancePage() {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/maintenance/status');
      const status = await response.json();
      setMaintenanceStatus(status);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
    
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkMaintenanceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maintenance en cours
          </h1>
          <p className="text-gray-600">
            Nous effectuons actuellement des améliorations sur notre plateforme
          </p>
        </div>

        {/* Message de maintenance */}
        {maintenanceStatus?.message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              {maintenanceStatus.message}
            </p>
          </div>
        )}

        {/* Informations de timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {maintenanceStatus?.startedAt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Début de maintenance</span>
              </div>
              <p className="text-gray-600 text-sm">
                {formatDate(maintenanceStatus.startedAt)}
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <RefreshCw className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Dernière vérification</span>
            </div>
            <p className="text-gray-600 text-sm">
              {lastCheck.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={checkMaintenanceStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Vérifier le statut
          </button>
          
          <Link
            to="/auth/login"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à la connexion
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Nous nous excusons pour la gêne occasionnée. 
            La maintenance est nécessaire pour améliorer votre expérience.
          </p>
        </div>
      </div>
    </div>
  );
}

