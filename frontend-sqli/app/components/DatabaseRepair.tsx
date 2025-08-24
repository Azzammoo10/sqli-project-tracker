import { useState } from 'react';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface RepairResult {
  repairedProjects?: number;
  repairedTasks?: number;
  message?: string;
  error?: string;
  timestamp?: number;
}

export default function DatabaseRepair() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);

  const handleRepair = async () => {
    setIsRepairing(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/admin/repair-database', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (data.error) {
        toast.error(`Erreur: ${data.error}`);
      } else {
        toast.success('Base de données réparée avec succès !');
      }
    } catch (error: any) {
      console.error('Erreur lors de la réparation:', error);
      setResult({ error: error.message });
      toast.error('Erreur lors de la réparation de la base de données');
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Settings className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Réparation de la base de données</h3>
          <p className="text-sm text-gray-600">Nettoyer les références corrompues après suppression d'utilisateurs</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Attention</p>
              <p className="text-yellow-700">
                Cette opération nettoie les références aux utilisateurs supprimés dans les projets et tâches.
                Utilisez cette fonction si vous rencontrez des erreurs liées aux données corrompues.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRepair}
          disabled={isRepairing}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 
                     text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isRepairing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Réparation en cours...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Réparer la base de données
            </>
          )}
        </button>

        {result && (
          <div className={`rounded-lg p-4 ${
            result.error 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.error ? (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              <div className="text-sm">
                {result.error ? (
                  <div>
                    <p className="font-medium text-red-800">Erreur</p>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-green-800">Réparation terminée</p>
                    <p className="text-green-700">{result.message}</p>
                    {(result.repairedProjects || result.repairedTasks) && (
                      <ul className="mt-2 space-y-1 text-green-600">
                        {result.repairedProjects ? (
                          <li>• {result.repairedProjects} projet(s) réparé(s)</li>
                        ) : null}
                        {result.repairedTasks ? (
                          <li>• {result.repairedTasks} tâche(s) réparée(s)</li>
                        ) : null}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
