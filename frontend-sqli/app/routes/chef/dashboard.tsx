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
import { authService } from '~/services/api';
import { chefDashboardService } from '~/services/chefDashboardService';
import { projectService } from '~/services/projectService';
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
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const userData = await authService.getCurrentUser();
      setUser(userData);

      const dashboardData = await chefDashboardService.getFullDashboardData();

      setProjects(dashboardData.projects || []);
      console.log('Tâches reçues du backend:', dashboardData.tasks);
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
          {/* Bannière */}
            {/* Header harmonisé */}
            <div className="p-6">
                <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Dashboard Chef de Projet</h1>
                                <p className="text-white/90 text-lg">
                                    Bienvenue {user?.username?.toUpperCase()} — vue d'ensemble de vos projets
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
          Projets: <b>{stats?.totalProjects ?? 0}</b>
        </span>
                            <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
          Équipe: <b>{stats?.teamMembers ?? 0}</b>
        </span>
                            <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
          Tâches: <b>{stats?.totalTasks ?? 0}</b>
        </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Contenu */}
          <div className="max-w-7xl mx-auto px-6 pb-8 space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

              {/* Analytics - Carte cliquable */}
              <div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => navigate('/chef/analytics')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Analytics</p>
                    <p className="text-xs text-indigo-600 flex items-center gap-1 mt-1 group-hover:text-indigo-700">
                      <BarChart3 className="w-3 h-3" />
                      Voir les détails
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
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
                                             {projects.slice(0, 3).map((project) => (
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
                        .filter(t => t.priorite === 'ELEVEE' || t.priorite === 'CRITIQUE' || t.statut === 'NON_COMMENCE' || t.statut === 'EN_COURS' || t.statut === 'BLOQUE')
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Équipe améliorée */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
                    <button
                      onClick={() => navigate('/chef/team')}
                      className="text-sm text-[#4B2A7B] hover:text-[#5B3A8B] font-medium flex items-center gap-1"
                    >
                      Voir tout <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {team.length > 0 ? (
                    <div className="space-y-4">
                      {team.slice(0, 8).map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 border-2 text-sm font-semibold text-[#4B2A7B] grid place-items-center flex-shrink-0">
                            {m.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{m.username}</h4>
                            <p className="text-xs text-gray-600 mb-1">{m.jobTitle || m.role || 'Développeur'}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>📊 {m.assignedProjects || 0} projets</span>
                              {m.completedTasks !== undefined && m.pendingTasks !== undefined && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  m.assignedProjects > 0 ? 
                                    (m.completedTasks / (m.completedTasks + m.pendingTasks) * 100 >= 80 ? 'bg-green-100 text-green-800' :
                                     m.completedTasks / (m.completedTasks + m.pendingTasks) * 100 >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                     'bg-red-100 text-red-800') : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {m.assignedProjects > 0 ? Math.round(m.completedTasks / (m.completedTasks + m.pendingTasks) * 100) : 0}% complété
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
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

                                                           {/* Graphique en donut - Projets par type avec filtres */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Projets par type</h2>
                      <div className="flex gap-2">
                        {/* Filtres par type */}
                        <button
                          onClick={() => setSelectedType(null)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedType === null 
                              ? 'bg-[#4B2A7B] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={() => setSelectedType('TMA')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedType === 'TMA' 
                              ? 'bg-[#EC4899] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          TMA
                        </button>
                        <button
                          onClick={() => setSelectedType('Delivery')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedType === 'Delivery' 
                              ? 'bg-[#3B82F6] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Delivery
                        </button>
                        <button
                          onClick={() => setSelectedType('Interne')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedType === 'Interne' 
                              ? 'bg-[#F59E0B] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Interne
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {projects.length > 0 ? (
                      <div className="space-y-6">
                        {/* Graphique en donut avec onglets */}
                        <div className="flex justify-center mb-4">
                          <div className="flex bg-gray-100 rounded-lg p-1">
                            <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-white rounded-md shadow-sm">
                              Donut
                            </button>
                            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                              Pie
                            </button>
                          </div>
                        </div>
                        
                        {/* Graphique en donut */}
                        <div className="flex justify-center">
                          <div className="relative w-48 h-48">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              {(() => {
                                // Filtrer les projets selon le type sélectionné
                                let filteredProjects = projects;
                                if (selectedType) {
                                  filteredProjects = projects.filter(project => project.type === selectedType);
                                }
                                
                                // Filtrer uniquement les types de projet valides
                                const typeStats = filteredProjects.reduce((acc, project) => {
                                  const type = project.type;
                                  if (type === 'TMA' || type === 'Delivery' || type === 'Interne') {
                                    acc[type] = (acc[type] || 0) + 1;
                                  }
                                  return acc;
                                }, {} as Record<string, number>);
                                
                                const total = Object.values(typeStats).reduce((sum, count) => sum + count, 0);
                                let currentAngle = 0;
                                
                                // Couleurs spécifiques pour chaque type
                                const typeColors = {
                                  'TMA': '#EC4899',      // Rose
                                  'Delivery': '#3B82F6', // Bleu
                                  'Interne': '#F59E0B'   // Jaune
                                };
                                
                                return Object.entries(typeStats).map(([type, count]) => {
                                  const percentage = (count / total) * 100;
                                  const angle = (percentage / 100) * 360;
                                  const startAngle = currentAngle;
                                  const endAngle = currentAngle + angle;
                                  
                                  const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                                  const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                                  const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                                  const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                                  
                                  const largeArcFlag = angle > 180 ? 1 : 0;
                                  
                                  const pathData = [
                                    `M 50 50`,
                                    `L ${x1} ${y1}`,
                                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                    'Z'
                                  ].join(' ');
                                  
                                  currentAngle += angle;
                                  
                                  return (
                                    <path
                                      key={type}
                                      d={pathData}
                                      fill={typeColors[type as keyof typeof typeColors]}
                                      className="transition-all duration-300 hover:opacity-80"
                                    />
                                  );
                                });
                              })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                  {selectedType 
                                    ? projects.filter(p => p.type === selectedType).length 
                                    : projects.length
                                  }
                                </div>
                                <div className="text-xs text-gray-600">
                                  {selectedType ? `projets ${selectedType}` : 'projets'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Légende horizontale avec compteurs */}
                        <div className="flex justify-center space-x-6">
                          {(() => {
                            const typeStats = projects.reduce((acc, project) => {
                              const type = project.type;
                              if (type === 'TMA' || type === 'Delivery' || type === 'Interne') {
                                acc[type] = (acc[type] || 0) + 1;
                              }
                              return acc;
                            }, {} as Record<string, number>);
                            
                            const total = Object.values(typeStats).reduce((sum, count) => sum + count, 0);
                            const typeColors = {
                              'TMA': '#EC4899',
                              'Delivery': '#3B82F6',
                              'Interne': '#F59E0B'
                            };
                            
                            return Object.entries(typeStats).map(([type, count]) => (
                              <div key={type} className="flex items-center gap-2">
                                <div 
                                  className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                                    selectedType === type ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                  }`}
                                  style={{ backgroundColor: typeColors[type as keyof typeof typeColors] }}
                                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                                  title={`Cliquer pour filtrer par ${type}`}
                                />
                                <span className="text-sm font-medium text-gray-900">{type}</span>
                                <span className="text-xs text-gray-500">({count})</span>
                              </div>
                            ));
                          })()}
                        </div>
                        
                        {/* Liste des projets filtrés */}
                        {selectedType && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Projets {selectedType} ({projects.filter(p => p.type === selectedType).length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {projects
                                .filter(project => project.type === selectedType)
                                .map(project => (
                                  <div key={project.id} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700 truncate">{project.titre}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      project.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                                      project.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {project.statut}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
                        <p className="text-gray-600">Créez votre premier projet pour voir les statistiques</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Section Analytics dédiée */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Analytics & Rapports</h2>
                  <button
                    onClick={() => navigate('/chef/analytics')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors text-sm font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Voir Analytics
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Carte Analytics rapide */}
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Vue d'ensemble</h3>
                    <p className="text-sm text-gray-600">Métriques globales et KPIs</p>
                  </div>

                  {/* Carte Projets par type */}
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Projets par type</h3>
                    <p className="text-sm text-gray-600">TMA, Delivery, Interne</p>
                  </div>

                  {/* Carte Équipe */}
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Performance équipe</h3>
                    <p className="text-sm text-gray-600">Productivité et métriques</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Accédez à des analyses détaillées et des rapports avancés
                  </p>
                  <button
                    onClick={() => navigate('/chef/analytics')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4B2A7B] to-[#5B3A8B] text-white rounded-lg hover:from-[#5B3A8B] hover:to-[#6B4A9B] transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Accéder aux Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
