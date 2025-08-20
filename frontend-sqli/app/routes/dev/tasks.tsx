import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Timer,
  PlayCircle,
  PauseCircle,
  ChevronDown,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  User,
  Target,
  TrendingUp
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { taskService, type Task } from '../../services/taskService';
import toast from 'react-hot-toast';

interface TaskWithTimer extends Task {
  isRunning?: boolean;
  elapsedTime?: number;
  timerInterval?: NodeJS.Timeout;
}

export default function DevTasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskWithTimer[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithTimer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => { 
    loadTasks(); 
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter(t => t.statut === statusFilter);
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      const userTasks = await taskService.getTasksForCurrentUser();
      // Initialiser le timer pour chaque tâche
      const tasksWithTimer = userTasks.map(task => ({
        ...task,
        isRunning: false,
        elapsedTime: 0
      }));
      setTasks(tasksWithTimer);
      setFilteredTasks(tasksWithTimer);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TERMINE': return 'bg-green-50 text-green-700 border-green-200';
      case 'BLOQUE': return 'bg-red-50 text-red-700 border-red-200';
      case 'NON_COMMENCE': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_COURS': return <Clock className="w-4 h-4" />;
      case 'TERMINE': return <CheckCircle className="w-4 h-4" />;
      case 'BLOQUE': return <AlertTriangle className="w-4 h-4" />;
      case 'NON_COMMENCE': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'ELEVEE': return 'bg-red-100 text-red-700 border-red-200';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BASSE': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Nouvelle fonction pour changer le statut manuellement
  const changeTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      // Arrêter le timer si la tâche était en cours
      if (newStatus !== 'EN_COURS') {
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId && task.timerInterval) {
            clearInterval(task.timerInterval);
            return {
              ...task,
              isRunning: false,
              timerInterval: undefined
            };
          }
          return task;
        }));
      }

      // Si on remet une tâche terminée en cours, réinitialiser le timer
      if (newStatus === 'EN_COURS') {
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              isRunning: false,
              elapsedTime: 0,
              timerInterval: undefined
            };
          }
          return task;
        }));
      }

      // Mettre à jour le statut côté backend
      await taskService.updateTaskStatus(taskId, newStatus);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            statut: newStatus,
            isRunning: newStatus === 'EN_COURS'
          };
        }
        return task;
      }));

      toast.success(`Statut changé vers ${getStatusLabel(newStatus)}`);
      setEditingTaskId(null); // Fermer l'édition
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NON_COMMENCE': return 'Non commencé';
      case 'EN_COURS': return 'En cours';
      case 'BLOQUE': return 'Bloqué';
      case 'TERMINE': return 'Terminé';
      default: return status;
    }
  };

  const startTask = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      
      // Si la tâche est en NON_COMMENCE ou TERMINE, changer automatiquement le statut vers EN_COURS
      if (task && (task.statut === 'NON_COMMENCE' || task.statut === 'TERMINE')) {
        await changeTaskStatus(taskId, 'EN_COURS');
        // Attendre un peu pour que le changement de statut soit appliqué
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mettre à jour l'état local pour démarrer le timer
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            isRunning: true
          };
        }
        return task;
      }));

      // Démarrer le timer
      const interval = setInterval(() => {
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId && task.isRunning) {
            return {
              ...task,
              elapsedTime: (task.elapsedTime || 0) + 1
            };
          }
          return task;
        }));
      }, 1000);

      // Stocker l'interval dans la tâche
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, timerInterval: interval };
        }
        return task;
      }));

      toast.success('Tâche démarrée !');
    } catch (error: any) {
      console.error('Erreur lors du démarrage de la tâche:', error);
      toast.error('Erreur lors du démarrage de la tâche');
    }
  };

  const stopTask = async (taskId: number) => {
    try {
      // Arrêter le timer
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId && task.timerInterval) {
          clearInterval(task.timerInterval);
          return {
            ...task,
            isRunning: false,
            timerInterval: undefined
          };
        }
        return task;
      }));

      // Sauvegarder le temps écoulé (ici vous pourriez l'envoyer au backend)
      const task = tasks.find(t => t.id === taskId);
      if (task && task.elapsedTime) {
        console.log(`Temps écoulé pour la tâche ${taskId}: ${formatTime(task.elapsedTime)}`);
        // TODO: Envoyer le temps au backend
      }

      toast.success('Tâche arrêtée !');
    } catch (error: any) {
      console.error('Erreur lors de l\'arrêt de la tâche:', error);
      toast.error('Erreur lors de l\'arrêt de la tâche');
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      // Arrêter le timer s'il est en cours
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId && task.timerInterval) {
          clearInterval(task.timerInterval);
          return {
            ...task,
            isRunning: false,
            timerInterval: undefined
          };
        }
        return task;
      }));

      // Changer le statut vers TERMINE
      await changeTaskStatus(taskId, 'TERMINE');
      
      toast.success('Tâche marquée comme terminée !');
    } catch (error: any) {
      console.error('Erreur lors de la finalisation de la tâche:', error);
      toast.error('Erreur lors de la finalisation de la tâche');
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Non définie';

  const getProgressPercentage = (task: TaskWithTimer) => {
    if (task.statut === 'TERMINE') return 100;
    if (task.statut === 'EN_COURS') return 50;
    if (task.statut === 'BLOQUE') return 25;
    return 0;
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
          {/* Header professionnel */}
          <div className="bg-white border-b border-gray-200 px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mes Tâches</h1>
                  <p className="text-gray-600 mt-1">Gérez vos tâches et suivez votre productivité</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadTasks}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Filtres améliorés */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-800"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-800"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="NON_COMMENCE">Non commencé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="BLOQUE">Bloqué</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''}
                  </span>
                  {(searchTerm || statusFilter) && (
                    <button
                      onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Liste des tâches améliorée */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* En-tête de la tâche */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{task.titre}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.statut)}`}>
                              {getStatusLabel(task.statut)}
                            </span>
                            {task.priorite && (
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priorite)}`}>
                                {task.priorite}
                              </span>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>
                          )}

                          {/* Métadonnées de la tâche */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Échéance: {formatDate(task.dateFin)}</span>
                            </div>
                            {task.project && (
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-400" />
                                <span>{task.project.titre}</span>
                              </div>
                            )}
                            {task.plannedHours && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{task.plannedHours}h prévues</span>
                              </div>
                            )}
                            {task.effectiveHours && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <span>{task.effectiveHours}h effectuées</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium text-gray-900">{getProgressPercentage(task)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getProgressPercentage(task) >= 100 ? 'bg-green-500' : 'bg-[#4B2A7B]'
                            }`}
                            style={{ width: `${getProgressPercentage(task)}%` }}
                          />
                        </div>
                      </div>

                      {/* Timer et actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Timer affiché */}
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                            <Timer className="w-5 h-5 text-[#4B2A7B]" />
                            <span className="font-mono text-lg font-semibold text-[#4B2A7B]">
                              {formatTime(task.elapsedTime || 0)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {task.isRunning ? 'En cours...' : 'Arrêté'}
                            </span>
                          </div>

                          {/* Statut de la tâche */}
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.statut)}
                            <span className="text-sm text-gray-600">
                              {getStatusLabel(task.statut)}
                            </span>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-3">
                          {task.statut === 'NON_COMMENCE' && (
                            <button
                              onClick={() => startTask(task.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <Play className="w-4 h-4" />
                              Démarrer
                            </button>
                          )}

                          {task.statut === 'EN_COURS' && !task.isRunning && (
                            <button
                              onClick={() => startTask(task.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <Play className="w-4 h-4" />
                              Démarrer
                            </button>
                          )}

                          {task.statut === 'EN_COURS' && task.isRunning && (
                            <>
                              <button
                                onClick={() => stopTask(task.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                              >
                                <Square className="w-4 h-4" />
                                Arrêter
                              </button>
                              <button
                                onClick={() => completeTask(task.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors font-medium"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Terminer
                              </button>
                            </>
                          )}

                          {task.statut === 'TERMINE' && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                              ✓ Terminée
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section de changement de statut - Améliorée */}
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">Statut :</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.statut)}`}>
                            {getStatusLabel(task.statut)}
                          </span>
                        </div>
                        
                        {task.statut !== 'TERMINE' ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Changer vers :</span>
                            <div className="flex gap-2">
                              {['NON_COMMENCE', 'EN_COURS', 'BLOQUE'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => changeTaskStatus(task.id, status)}
                                  disabled={status === task.statut}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    status === task.statut
                                      ? 'bg-[#4B2A7B] text-white cursor-default'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#4B2A7B]'
                                  }`}
                                >
                                  {getStatusLabel(status)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Reprendre la tâche :</span>
                            <button
                              onClick={() => changeTaskStatus(task.id, 'EN_COURS')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
                            >
                              Remettre en cours
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <Timer className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {searchTerm || statusFilter ? 'Aucune tâche trouvée' : 'Aucune tâche assignée'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter
                    ? 'Essayez de modifier vos filtres de recherche pour trouver ce que vous cherchez.'
                    : "Vous n'avez pas encore de tâches assignées. Contactez votre chef de projet pour commencer à travailler."}
                </p>
                {(searchTerm || statusFilter) && (
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors font-medium"
                  >
                    <Filter className="w-4 h-4" />
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
