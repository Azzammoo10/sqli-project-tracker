import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity,
  Plus,
  RefreshCw,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import { chefDashboardService } from '../../services/chefDashboardService';
import { projectService } from '../../services/projectService';
import type {
  DashboardStats,
  ProjectOverview as Project,
  TaskOverview as Task,
  TeamMemberOverview as TeamMember,
  ChartData,
  RecentActivity
} from '../../types/dashboard';
import toast from 'react-hot-toast';

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projectProgress, setProjectProgress] = useState<ChartData[]>([]);
  const [taskStatus, setTaskStatus] = useState<ChartData[]>([]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const userData = await authService.getCurrentUser();
      setUser(userData);

      const dashboardData = await chefDashboardService.getFullDashboardData();

      setProjects(dashboardData.projects || []);
      setTasks(dashboardData.tasks || []);
      setTeam(dashboardData.team || []);
      setRecentActivity(dashboardData.activity || []);

      if (dashboardData.progress) {
        const progressData: ChartData[] = dashboardData.progress.map((item: any) => ({
          label: item.titre || item.label,
          value: item.progression || item.value,
          color: item.color || '#4B2A7B'
        }));
        setProjectProgress(progressData);
      }

      if (dashboardData.taskDistribution) {
        const taskData: ChartData[] = dashboardData.taskDistribution.map((item: any) => ({
          label: item.status || item.label,
          value: item.count || item.value,
          color: item.color || '#4B2A7B'
        }));
        setTaskStatus(taskData);
      }

      const calculatedStats: DashboardStats = {
        totalProjects: dashboardData.stats?.totalProjects || 0,
        activeProjects: dashboardData.stats?.activeProjects || 0,
        completedProjects: dashboardData.stats?.completedProjects || 0,
        overdueProjects: dashboardData.stats?.overdueProjects || 0,
        totalTasks: dashboardData.stats?.totalTasks || 0,
        completedTasks: dashboardData.stats?.completedTasks || 0,
        pendingTasks: dashboardData.stats?.pendingTasks || 0,
        teamMembers: dashboardData.stats?.teamMembers || 0,
        averageCompletionRate: dashboardData.stats?.averageCompletionRate || 0
      };
      setStats(calculatedStats);
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

  const handleRecomputeProgress = async () => {
    try {
      toast.loading('Recalcul de la progression...');
      await projectService.recomputeAllProgress();
      toast.dismiss();
      toast.success('Progression mise à jour');
      await loadDashboardData();
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors du recalcul de la progression');
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HAUTE': return 'bg-red-100 text-red-800';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800';
      case 'BASSE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_COURS': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'TERMINEE': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'BLOQUEE': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
        <div className="flex h-screen bg-gray-50">
          <NavChef user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
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
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          {/* Banner harmonisée */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{ background: 'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)' }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
                  <p className="text-white/85">
                    Bienvenue, {user?.username} • {new Date().toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={loadDashboardData}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4" /> Actualiser
                  </button>
                  <button
                    onClick={handleRecomputeProgress}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
                  >
                    <Zap className="w-4 h-4" /> Recalculer
                  </button>
                  <button
                    onClick={() => navigate('/chef/projects/create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-[#4B2A7B] hover:bg-white/90"
                  >
                    <Plus className="w-4 h-4" /> Nouveau projet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="max-w-7xl mx-auto px-6 pb-8 space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Projets actifs */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projets actifs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {stats?.totalProjects || 0} au total
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Tâches en cours */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tâches en cours</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.pendingTasks || 0}</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3" />
                      {stats?.totalTasks || 0} tâches
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Taux de réussite */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.averageCompletionRate || 0}%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <Target className="w-3 h-3" />
                      Objectif: 85%
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Équipe */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Équipe</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.teamMembers || 0}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
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

            {/* Grille principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projets en cours */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Projets en cours</h2>
                    <button
                      onClick={() => navigate('/chef/projects')}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium flex items-center gap-1"
                    >
                      Voir tout <ChevronRight className="w-4 h-4" />
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

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{project.developpeurs?.length || 0} développeurs</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {project.dateFin ? formatDate(project.dateFin) : 'Non définie'}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-medium">{project.progression || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#4B2A7B] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progression || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {project.developpeurs?.slice(0, 3).map((dev) => (
                                <div
                                  key={dev.id}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 border text-xs font-semibold text-[#4B2A7B] grid place-items-center"
                                >
                                  {dev.username.slice(0, 2).toUpperCase()}
                                </div>
                              ))}
                              {project.developpeurs && project.developpeurs.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                                  +{project.developpeurs.length - 3}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/chef/projects/${project.id}`)}
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet en cours</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre premier projet</p>
                      <button
                        onClick={() => navigate('/chef/projects/create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Créer un projet
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tâches prioritaires */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tâches prioritaires</h2>
                    <button
                      onClick={() => navigate('/chef/tasks')}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium flex items-center gap-1"
                    >
                      Voir tout <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks
                        .filter(t => t.priorite === 'HAUTE' || t.statut === 'EN_ATTENTE')
                        .slice(0, 6)
                        .map((task) => (
                          <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.titre}</h4>
                              {getStatusIcon(task.statut)}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priorite)}`}>
                                {task.priorite}
                              </span>
                              <span className="text-xs text-gray-500">
                                {task.dateFin ? formatDate(task.dateFin) : 'Non définie'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{task.developpeur?.username || 'Non assigné'}</span>
                              <span className="text-xs text-gray-500">{task.project?.titre || 'Projet inconnu'}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche prioritaire</h3>
                      <p className="text-gray-600">Toutes les tâches sont à jour</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deuxième rangée */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Équipe */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
                </div>
                <div className="p-6">
                  {team.length > 0 ? (
                    <div className="space-y-4">
                      {team.slice(0, 6).map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 border text-xs font-semibold text-[#4B2A7B] grid place-items-center">
                            {m.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{m.username}</h4>
                            <p className="text-xs text-gray-600">{m.jobTitle || m.role || 'Développeur'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{m.assignedProjects || 0}</div>
                            <div className="text-xs text-gray-600">projets</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre d'équipe</h3>
                      <p className="text-gray-600">Ajoutez des développeurs à vos projets</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progression des projets */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Progression des projets</h2>
                </div>
                <div className="p-6">
                  {projectProgress.length > 0 ? (
                    <div className="space-y-4">
                      {projectProgress.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 truncate">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
                      <p className="text-gray-600">Les données de progression apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
                </div>
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 6).map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#4B2A7B] mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 line-clamp-2">{a.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {a.timestamp
                                ? new Date(a.timestamp).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
                      <p className="text-gray-600">L'activité récente apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
