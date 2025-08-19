import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Play,
  Pause,
  Square,
  Activity,
  Target,
  TrendingUp,
  FolderOpen,
  Settings,
  RefreshCw
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavDev from '../../components/NavDev';
import { authService } from '../../services/api';
import { taskService, type Task } from '../../services/taskService';
import { projectService, type Project } from '../../services/projectService';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number;
  username: string;
  role: string;
  currentTask?: string;
}

export default function DevDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Chargement des données
  useEffect(() => {
    loadDashboardData();
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
        const userData = await authService.getCurrentUser();
        setUser(userData);

      // Charger les tâches du développeur
      const userTasks = await taskService.getByUser();
      setTasks(userTasks);

      // Charger les projets assignés
      const userProjects = await projectService.getProjectsForCurrentUser();
      setProjects(userProjects);

      // Pour l'instant, simuler les membres d'équipe
      // TODO: Implémenter l'endpoint pour récupérer les membres d'équipe
      setTeamMembers([
        { id: 1, username: 'Alice Dev', role: 'Développeur', currentTask: 'Implémenter JWT' },
        { id: 2, username: 'Bob Dev', role: 'Développeur', currentTask: 'Tests unitaires' },
        { id: 3, username: 'Charlie Dev', role: 'Développeur', currentTask: 'Documentation' }
      ]);

      } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement des données');
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

  const startTimer = async (taskId: number) => {
    try {
      setActiveTimer(taskId);
      setTimerSeconds(0);
      toast.success('Timer démarré');
    } catch (error) {
      toast.error('Erreur lors du démarrage du timer');
    }
  };

  const stopTimer = async (taskId: number) => {
    try {
      setActiveTimer(null);
      const hoursSpent = timerSeconds / 3600; // convertir en heures
      
      // Mettre à jour les heures effectives
      await taskService.updateHours(taskId, hoursSpent);
      
      toast.success(`Timer arrêté. Temps enregistré: ${formatTime(timerSeconds)}`);
      setTimerSeconds(0);
      
      // Recharger les données
      await loadDashboardData();
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
      case 'TERMINE': return 'bg-green-100 text-green-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'BLOQUE': return 'bg-red-100 text-red-800';
      case 'NON_COMMENCE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ELEVEE': return 'bg-red-100 text-red-800';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800';
      case 'BASSE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

    if (loading) {
      return (
      <ProtectedRoute allowedRoles={['DEVELOPPEUR']}>
        <div className="flex h-screen bg-gray-50">
          <NavDev user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {user?.username} • Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadDashboardData}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dev/settings')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tâches Assignées</p>
                    <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3" />
                      {tasks.filter(t => t.statut === 'EN_COURS').length} en cours
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
                    <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <Target className="w-3 h-3" />
                      Moyenne: {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progression, 0) / projects.length) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Équipe</p>
                    <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      Développeurs actifs
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mes Tâches */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Mes Tâches</h2>
                    <button
                      onClick={() => navigate('/dev/tasks')}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium"
                    >
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{task.titre}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.statut)}`}>
                                {task.statut}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priorite || '')}`}>
                                {task.priorite || 'Non définie'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Projet:</span> {task.projectTitre}
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.dateFin ? formatDate(task.dateFin) : 'Non définie'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Heures:</span> {task.effectiveHours || 0}h / {task.plannedHours}h
                            </div>
                            {activeTimer === task.id && (
                              <div className="text-sm font-mono text-[#4B2A7B]">
                                {formatTime(timerSeconds)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {activeTimer === task.id ? (
                                <button
                                  onClick={() => stopTimer(task.id)}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                >
                                  <Square className="w-3 h-3" />
                                  Stop
                                </button>
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
                            <button
                              onClick={() => navigate(`/dev/tasks/${task.id}`)}
                              className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium"
                            >
                              Détails
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche assignée</h3>
                      <p className="text-gray-600">Vous n'avez pas encore de tâches assignées</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mes Projets */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Mes Projets</h2>
                    <button
                      onClick={() => navigate('/dev/projects')}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium"
                    >
                      Voir tout
                    </button>
                  </div>
                </div>
          <div className="p-6">
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{project.titre}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                              project.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.statut}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-medium">{project.progression}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#4B2A7B] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progression}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Échéance: {project.dateFin ? formatDate(project.dateFin) : 'Non définie'}
                            </div>
                            <button
                              onClick={() => navigate(`/dev/projects/${project.id}`)}
                              className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium"
                            >
                              Détails
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet assigné</h3>
                      <p className="text-gray-600">Vous n'êtes pas encore assigné à des projets</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mon Équipe</h2>
              </div>
              <div className="p-6">
                {teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-medium">
                          {member.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{member.username}</h4>
                          <p className="text-xs text-gray-600">{member.role}</p>
                          {member.currentTask && (
                            <p className="text-xs text-[#4B2A7B] mt-1">
                              <Activity className="w-3 h-3 inline mr-1" />
                              {member.currentTask}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre d'équipe</h3>
                    <p className="text-gray-600">Vous travaillez seul pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
