import { useEffect, useState, useMemo } from 'react';
import { Activity, Plus, Search, RotateCcw, ClipboardList, Trash2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

export default function ChefTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const navigate = useNavigate();

  // 🔎 petite recherche locale (pas d'impact service)
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const data = await taskService.getAll();
        setTasks(data ?? []);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des tâches');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetAll = () => setQ('');

  const openDeleteModal = (task: any) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setDeletingTaskId(taskToDelete.id);
      await taskService.delete(taskToDelete.id);
      
      // Mettre à jour la liste locale
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      
      toast.success('Tâche supprimée avec succès');
      closeDeleteModal();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la tâche');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return tasks;
    return tasks.filter(t => {
      const inTitre = (t.titre ?? '').toLowerCase().includes(k);
      const inProj  = (t.projectTitre ?? '').toLowerCase().includes(k);
      const inDev   = (t.developpeurUsername ?? '').toLowerCase().includes(k);
      const inStat  = (t.statut ?? '').toLowerCase().includes(k);
      return inTitre || inProj || inDev || inStat;
    });
  }, [q, tasks]);

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
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={user} />
        <div className="flex-1 overflow-auto">
          {/* Bannière harmonisée */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background:
                      'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)'
                  }}
                />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-white/90" />
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Tâches</h1>
                      <p className="text-white/85">Suivi des tâches et affectations</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{tasks.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichées: <b>{filtered.length}</b>
                    </span>
                    <button
                      onClick={() => navigate('/chef/tasks/create')}
                      className="text-sm bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full"
                    >
                      <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Créer tâche</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outils (recherche simple) */}
          <div className="px-6">
            <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher… (titre, projet, développeur, statut)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white
                               text-gray-900 placeholder:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                  />
                </div>
                {(q) && (
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-black"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="h-4 w-4" /> Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Tableau avec colonne Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3">Titre</th>
                      <th className="px-6 py-3">Projet</th>
                      <th className="px-6 py-3">Développeur</th>
                      <th className="px-6 py-3">Statut</th>
                      <th className="px-6 py-3">Début</th>
                      <th className="px-6 py-3">Fin</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-sm text-gray-900">{t.titre}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{t.projectTitre ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{t.developpeurUsername ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{t.statut}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {t.dateDebut ? new Date(t.dateDebut).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {t.dateFin ? new Date(t.dateFin).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <button
                            onClick={() => openDeleteModal(t)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                            title="Supprimer la tâche"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-6 py-12 text-center text-gray-600" colSpan={7}>
                          Aucune tâche à afficher. Modifiez la recherche.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay avec animation */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeDeleteModal}
            />
            
            {/* Modal avec animation */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                    <p className="text-sm text-gray-500">Cette action est irréversible</p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer la tâche :
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{taskToDelete?.titre}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Projet: {taskToDelete?.projectTitre ?? '—'} | 
                    Développeur: {taskToDelete?.developpeurUsername ?? '—'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={deletingTaskId === taskToDelete?.id}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {deletingTaskId === taskToDelete?.id ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
