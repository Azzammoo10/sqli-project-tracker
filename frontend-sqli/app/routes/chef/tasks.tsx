import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

export default function ChefTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const data = await taskService.getAll();
        setTasks(data);
      } catch (e) {
        toast.error('Erreur lors du chargement des tâches');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des tâches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tâches</h1>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 text-left text-sm text-black">
                  <tr>
                    <th className="px-4 py-3 font-medium">Titre</th>
                    <th className="px-4 py-3 font-medium">Projet</th>
                    <th className="px-4 py-3 font-medium">Développeur</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Début</th>
                    <th className="px-4 py-3 font-medium">Fin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-black">{t.titre}</td>
                      <td className="px-4 py-3 text-black">{t.projectTitre ?? '—'}</td>
                      <td className="px-4 py-3 text-black">{t.developpeurUsername ?? '—'}</td>
                      <td className="px-4 py-3 text-black">{t.statut}</td>
                      <td className="px-4 py-3 text-black">{t.dateDebut ? new Date(t.dateDebut).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-black">{t.dateFin ? new Date(t.dateFin).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td className="px-4 py-10 text-center text-black" colSpan={6}>Aucune tâche</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


