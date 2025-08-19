import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  Filter,
  Search,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { taskService, type Task } from '../../services/taskService';
import toast from 'react-hot-toast';

export default function DevTasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  useEffect(() => {
    loadTasks();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer !== null) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Filter effect
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectTitre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(task => task.statut === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(task => task.priorite === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);

      const userTasks = await taskService.getByUser();
      setTasks(userTasks);
    } catch (error: any) {
      console.error('Erreur lors du chargement des tâches:', error);
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Statut mis à jour');
      await loadTasks();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const startTimer = async (taskId: number) => {
    try {
      setActiveTimer(taskId);
      setTimerSeconds(0);
      await taskService.startTimer(taskId);
      toast.success('Timer démarré');
    } catch (error) {
      toast.error('Erreur lors du démarrage du timer');
    }
  };

  const stopTimer = async (taskId: number) => {
    try {
      setActiveTimer(null);
      const hoursSpent = timerSeconds / 3600;
      
      await taskService.stopTimer(taskId);
      await taskService.updateHours(taskId, hoursSpent);
      
      toast.success(`Timer arrêté. Temps enregistré: ${formatTime(timerSeconds)}`);
      setTimerSeconds(0);
      await loadTasks();
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt du timer');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BLOQUE': return 'bg-red-100 text-red-800 border-red-200';
      case 'NON_COMMENCE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ELEVEE': return 'bg-red-100 text-red-800 border-red-200';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BASSE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dateFin: string, statut: string) => {
    if (statut === 'TERMINE') return false;
    return new Date(dateFin) < new Date();
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
        <div className="flex h-screen bg-gray-50">
          <NavDev user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
      <div className="flex h-screen bg-gray-50">
        <NavDev user={user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
                <p className="text-sm text-gray-600">
                  Gérez vos tâches assignées et suivez votre progression
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadTasks}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="NON_COMMENCE">Non commencé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="BLOQUE">Bloqué</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <AlertCircle className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                  >
                    <option value="">Toutes les priorités</option>
                    <option value="ELEVEE">Élevée</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="BASSE">Basse</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      isOverdue(task.dateFin, task.statut) ? 'border-l-4 border-l-red-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.titre}</h3>
                          {isOverdue(task.dateFin, task.statut) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              En retard
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Échéance: {formatDate(task.dateFin)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {task.effectiveHours || 0}h / {task.plannedHours}h
                            </span>
                          </div>
                          <div className="text-[#4B2A7B] font-medium">
                            Projet: {task.projectTitre}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.statut)}`}>
                          {task.statut}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priorite)}`}>
                          {task.priorite}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Timer */}
                        <div className="flex items-center gap-2">
                          {activeTimer === task.id ? (
                            <>
                              <div className="text-sm font-mono text-[#4B2A7B] bg-[#4B2A7B]/10 px-3 py-1 rounded">
                                {formatTime(timerSeconds)}
                              </div>
                              <button
                                onClick={() => stopTimer(task.id)}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                <Square className="w-3 h-3" />
                                Stop
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Start
                            </button>
                          )}
                        </div>

                        {/* Status Actions */}
                        {task.statut !== 'TERMINE' && (
                          <div className="flex items-center gap-2">
                            {task.statut === 'NON_COMMENCE' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'EN_COURS')}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                              >
                                Commencer
                              </button>
                            )}
                            {task.statut === 'EN_COURS' && (
                              <>
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'TERMINE')}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                >
                                  Terminer
                                </button>
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'BLOQUE')}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                >
                                  Bloquer
                                </button>
                              </>
                            )}
                            {task.statut === 'BLOQUE' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'EN_COURS')}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                              >
                                Débloquer
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/dev/tasks/${task.id}`)}
                        className="inline-flex items-center gap-2 text-[#4B2A7B] hover:text-[#5B3A8B] font-medium text-sm"
                      >
                        Détails
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter || priorityFilter ? 'Aucune tâche trouvée' : 'Aucune tâche assignée'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter || priorityFilter 
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Vous n\'avez pas encore de tâches assignées'
                  }
                </p>
                {(searchTerm || statusFilter || priorityFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setPriorityFilter('');
                    }}
                    className="mt-4 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
