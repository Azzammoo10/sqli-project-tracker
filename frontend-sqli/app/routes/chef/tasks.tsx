import { useEffect, useState, useMemo } from 'react';
import { Activity, Plus, Search, RotateCcw, ClipboardList, Trash2, Pencil, AlertTriangle, X, Calendar, User, FolderOpen, Clock, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '~/services/api';
import { taskService } from '~/services/taskService';
import toast from 'react-hot-toast';

export default function ChefTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

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

  const resetAll = () => {
    setQ('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

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
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      toast.success('Tâche supprimée avec succès');
      closeDeleteModal();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la tâche');
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Calcul des métriques
  const metrics = useMemo(() => {
    const total = tasks.length;
    const enCours = tasks.filter(t => t.statut === 'EN_COURS').length;
    const termine = tasks.filter(t => t.statut === 'TERMINE').length;
    const bloque = tasks.filter(t => t.statut === 'BLOQUE').length;
    const nonCommence = tasks.filter(t => t.statut === 'NON_COMMENCE').length;
    
    const prioriteElevee = tasks.filter(t => t.priorite === 'ELEVEE' || t.priorite === 'CRITIQUE').length;
    
    return { total, enCours, termine, bloque, nonCommence, prioriteElevee };
  }, [tasks]);

  const filtered = useMemo(() => {
    let filteredTasks = tasks;
    
    // Filtre par recherche
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      filteredTasks = filteredTasks.filter(t => {
        const inTitre = (t.titre ?? '').toLowerCase().includes(k);
        const inProj = (t.projectTitre ?? '').toLowerCase().includes(k);
        const inDev = (t.developpeurUsername ?? '').toLowerCase().includes(k);
        const inStat = (t.statut ?? '').toLowerCase().includes(k);
        return inTitre || inProj || inDev || inStat;
      });
    }
    
    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filteredTasks = filteredTasks.filter(t => t.statut === statusFilter);
    }
    
    // Filtre par priorité
    if (priorityFilter !== 'ALL') {
      filteredTasks = filteredTasks.filter(t => t.priorite === priorityFilter);
    }
    
    return filteredTasks;
  }, [q, statusFilter, priorityFilter, tasks]);

  // Composant pour les badges de statut
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      'NON_COMMENCE': { label: 'Non commencé', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      'EN_COURS': { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'BLOQUE': { label: 'Bloqué', color: 'bg-red-100 text-red-800 border-red-200' },
      'TERMINE': { label: 'Terminé', color: 'bg-green-100 text-green-800 border-green-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['NON_COMMENCE'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Composant pour les badges de priorité
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const priorityConfig = {
      'BASSE': { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
      'MOYENNE': { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
      'ELEVEE': { label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
      'CRITIQUE': { label: 'Critique', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MOYENNE'];
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

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
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          {/* Bannière */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Gestion des Tâches</h1>
                      <p className="text-white/90 text-lg">Suivi et organisation des tâches de l'équipe</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate('/chef/tasks/create')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Créer une tâche
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">En cours</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.enCours}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Terminées</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.termine}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bloquées</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.bloque}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-600">{metrics.nonCommence}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priorité haute</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.prioriteElevee}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outils de filtrage */}
          <div className="px-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white
                               text-gray-900 placeholder:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="NON_COMMENCE">Non commencé</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="BLOQUE">Bloqué</option>
                  <option value="TERMINE">Terminé</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                >
                  <option value="ALL">Toutes les priorités</option>
                  <option value="BASSE">Basse</option>
                  <option value="MOYENNE">Moyenne</option>
                  <option value="ELEVEE">Élevée</option>
                  <option value="CRITIQUE">Critique</option>
                </select>
                
                {(q || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tableau des tâches */}
          <div className="px-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Tâche</th>
                      <th className="px-6 py-4 font-semibold">Projet</th>
                      <th className="px-6 py-4 font-semibold">Développeur</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 font-semibold">Priorité</th>
                      <th className="px-6 py-4 font-semibold">Dates</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{t.titre}</div>
                            {t.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                                {t.description}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{t.projectTitre ?? '—'}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{t.developpeurUsername ?? '—'}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <StatusBadge status={t.statut} />
                        </td>
                        
                        <td className="px-6 py-4">
                          <PriorityBadge priority={t.priorite} />
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>Début: {t.dateDebut ? new Date(t.dateDebut).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Target className="w-3 h-3" />
                              <span>Fin: {t.dateFin ? new Date(t.dateFin).toLocaleDateString() : '—'}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/chef/tasks/${t.id}/edit`)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                              title="Modifier la tâche"
                            >
                              <Pencil className="w-3 h-3" />
                              Modifier
                            </button>

                            <button
                              onClick={() => openDeleteModal(t)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                              title="Supprimer la tâche"
                            >
                              <Trash2 className="w-3 h-3" />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-6 py-12 text-center text-gray-600" colSpan={7}>
                          <div className="flex flex-col items-center gap-3">
                            <ClipboardList className="w-12 h-12 text-gray-300" />
                            <div>
                              <p className="text-lg font-medium text-gray-900">Aucune tâche trouvée</p>
                              <p className="text-sm text-gray-500">
                                {q || statusFilter !== 'ALL' || priorityFilter !== 'ALL' 
                                  ? 'Essayez de modifier vos filtres de recherche' 
                                  : 'Commencez par créer votre première tâche'}
                              </p>
                            </div>
                            {!q && statusFilter === 'ALL' && priorityFilter === 'ALL' && (
                              <button
                                onClick={() => navigate('/chef/tasks/create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Créer une tâche
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Résumé des résultats */}
              {filtered.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Affichage de <strong>{filtered.length}</strong> tâche{filtered.length > 1 ? 's' : ''} sur <strong>{tasks.length}</strong>
                    </span>
                    <span>
                      {q && `Résultats pour "${q}"`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={closeDeleteModal} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
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
                <button onClick={closeDeleteModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-2">Êtes-vous sûr de vouloir supprimer la tâche :</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{taskToDelete?.titre}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Projet: {taskToDelete?.projectTitre ?? '—'} | Développeur: {taskToDelete?.developpeurUsername ?? '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                <button onClick={closeDeleteModal} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
