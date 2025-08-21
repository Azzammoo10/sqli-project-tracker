import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Activity, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  BarChart3,
  Eye,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { authService } from '~/services/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavClient from '../../components/NavClient';
import { clientService, type ClientProject, type ClientDashboardStats } from '~/services/clientService';
import ProjectQRCode from '../../components/ProjectQRCode';
import toast from 'react-hot-toast';

/* -------------------------------- Helpers -------------------------------- */

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ');

const formatDate = (date?: string) => {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'EN_COURS': return <Clock className="h-4 w-4" />;
    case 'TERMINE': return <CheckCircle className="h-4 w-4" />;
    case 'EN_ATTENTE': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'EN_COURS': return 'En cours';
    case 'TERMINE': return 'Terminé';
    case 'EN_ATTENTE': return 'En attente';
    case 'ANNULE': return 'Annulé';
    default: return status;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'TMA': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Interne': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/* ------------------------------ Components ----------------------------- */

function StatCard({ 
  icon, 
  title, 
  value, 
  change, 
  color, 
  description 
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} border`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
          {value}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
      
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium">
          {change}
        </p>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ClientProject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
            {project.titre}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
              {getStatusIcon(project.statut)}
              <span className="ml-1">{getStatusLabel(project.statut)}</span>
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(project.type)}`}>
              {project.type}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(project.dateDebut)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.developpeurs?.length || 0} développeur{project.developpeurs?.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {project.totalTasks || 0} tâche{project.totalTasks !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-gray-900">{project.progression}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progression}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Link
            to={`/client/projects/${project.id}`}
            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ 
  title, 
  subtitle, 
  children, 
  right, 
  className 
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8">
      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200" />
      <div className="flex-1">
        <div className="p-6">
          <div className="relative rounded-xl h-28 shadow-lg bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] animate-pulse" />
        </div>
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white border border-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-52 bg-white border border-gray-200 rounded-lg animate-pulse" />
              <div className="h-52 bg-white border border-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Main component ----------------------------- */

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Chargement initial
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
                 const results = await Promise.allSettled([
           authService.getCurrentUser(),
           clientService.getClientProjects(),
           clientService.getClientDashboardStats(),
           clientService.getRecentActivity(),
         ]);

         if (cancelled) return;

         const [userData, projectsData, statsData, activitiesData] = results;

         if (userData.status === 'fulfilled') setUser(userData.value);
         if (projectsData.status === 'fulfilled') setProjects(projectsData.value);
         if (statsData.status === 'fulfilled') setStats(statsData.value);
         if (activitiesData.status === 'fulfilled') setActivities(activitiesData.value);
        
        // Initialiser le projet sélectionné avec le premier projet
        if (projectsData.status === 'fulfilled' && projectsData.value.length > 0) {
          setSelectedProjectId(projectsData.value[0].id);
        }
      } catch (e) {
        toast.error('Erreur lors du chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const refreshDashboard = async () => {
    const tId = toast.loading('Actualisation...');
    try {
             const results = await Promise.allSettled([
         clientService.getClientProjects(),
         clientService.getClientDashboardStats(),
         clientService.getRecentActivity(),
       ]);
       const [projectsData, statsData, activitiesData] = results;

       if (projectsData.status === 'fulfilled') setProjects(projectsData.value);
       if (statsData.status === 'fulfilled') setStats(statsData.value);
       if (activitiesData.status === 'fulfilled') setActivities(activitiesData.value);

      toast.success('Dashboard actualisé', { id: tId });
    } catch {
      toast.error("Erreur lors de l'actualisation", { id: tId });
    }
  };

  // Stats par défaut (fallback)
  const displayStats: ClientDashboardStats = useMemo(() => {
    if (stats) return stats;

    const total = projects.length;
    const active = projects.filter((p) => p.statut === 'EN_COURS').length;
    const done = projects.filter((p) => p.statut === 'TERMINE').length;
    const totalTasks = projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0);
    const completedTasks = projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0);
    const inProgressTasks = projects.reduce((sum, p) => sum + (p.inProgressTasks || 0), 0);
    const devCount = new Set(projects.flatMap((p) => p.developpeurs?.map((d) => d.id) || [])).size;
    const averageProgress =
      total > 0 ? Math.round(projects.reduce((s, p) => s + (p.progression || 0), 0) / total) : 0;

    return {
      totalProjects: total,
      activeProjects: active,
      completedProjects: done,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks: 0,
      totalDevelopers: devCount,
      averageProgress,
    };
  }, [stats, projects]);

  if (loading) return <Skeleton />;

  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <div className="flex h-screen bg-gray-100">
        <NavClient user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          {/* ----- Header élégant ----- */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-lg bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{
                  background:
                    'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)',
                }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">Tableau de bord</h1>
                  <p className="text-white/85 text-sm">
                    Bonjour, <strong>{user?.username || '—'}</strong> — {displayStats.totalProjects} projets
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={refreshDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-white transition"
                    aria-label="Actualiser le tableau de bord"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                  </button>
                  <button
                    onClick={() => navigate('/client/settings')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 text-sm rounded-md hover:bg-gray-50 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ----- Contenu principal ----- */}
          <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* ===== SECTION 1: Statistiques clés ===== */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Vue d'ensemble
                </h2>
                <p className="text-gray-600">Statistiques globales de vos projets et équipes</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<FolderOpen className="h-6 w-6" />}
                  title="Projets totaux"
                  value={displayStats.totalProjects}
                  change={`${displayStats.activeProjects} en cours`}
                  color="blue"
                  description="Nombre total de vos projets"
                />
                <StatCard
                  icon={<TrendingUp className="h-6 w-6" />}
                  title="Progression moyenne"
                  value={`${displayStats.averageProgress}%`}
                  change={`${displayStats.completedProjects} terminés`}
                  color="green"
                  description="Progression globale de vos projets"
                />
                <StatCard
                  icon={<Users className="h-6 w-6" />}
                  title="Équipe"
                  value={displayStats.totalDevelopers}
                  change={`${displayStats.totalTasks} tâches`}
                  color="purple"
                  description="Développeurs sur vos projets"
                />
                <StatCard
                  icon={<Clock className="h-6 w-6" />}
                  title="Tâches en cours"
                  value={displayStats.inProgressTasks}
                  change={`${displayStats.completedTasks} terminées`}
                  color="orange"
                  description="Tâches actuellement en cours"
                />
              </div>
            </section>

            {/* ===== SECTION 2: Projets et activités ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne principale - Projets */}
              <div className="lg:col-span-2 space-y-6">
                <SectionCard
                  title="Mes projets"
                  subtitle="Vue d'ensemble des projets en cours et terminés"
                  right={
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Total : <strong>{displayStats.totalProjects}</strong>
                      </span>
                      <Link
                        to="/client/projects"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
                      >
                        Voir tous
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  }
                >
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                      {projects.length > 4 && (
                        <div className="pt-4 border-t border-gray-100 text-center">
                          <Link
                            to="/client/projects"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Voir {projects.length - 4} autres projets →
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState text="Aucun projet pour le moment." />
                  )}
                </SectionCard>
              </div>

                             {/* Sidebar - Activités et QR Code */}
               <div className="space-y-6">

                {/* Activités récentes */}
                <SectionCard 
                  title="📋 Activités récentes"
                  subtitle="Dernières actions sur vos projets"
                >
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="text-lg" aria-hidden>
                            {a.type === 'PROJECT_CREATED'
                              ? '📁'
                              : a.type === 'PROJECT_UPDATED'
                                ? '✏️'
                                : a.type === 'TASK_COMPLETED'
                                  ? '✅'
                                  : '🔄'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{a.description}</p>
                            <p className="text-xs text-gray-500">{a.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Aucune activité récente." />
                  )}
                </SectionCard>

                {/* QR Code du projet sélectionné */}
                {projects.length > 0 && selectedProjectId && (
                  <SectionCard 
                    title="📱 QR Code du projet"
                    subtitle="Scannez pour accéder au projet depuis votre mobile"
                  >
                    <div className="space-y-4">
                      {/* Sélecteur de projet */}
                      <div>
                        <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
                          Choisir un projet
                        </label>
                        <select
                          id="project-select"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
                        >
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.titre} ({getStatusLabel(project.statut)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* QR Code */}
                      <div className="text-center">
                        <img 
                          src={`/api/qrcode/project/${selectedProjectId}?projectName=${encodeURIComponent(projects.find(p => p.id === selectedProjectId)?.titre || '')}`}
                          alt={`QR Code pour ${projects.find(p => p.id === selectedProjectId)?.titre}`}
                          className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-lg shadow-sm"
                          onError={(e) => {
                            console.error('❌ Erreur chargement QR Code:', e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-sm text-gray-600 mt-3">
                          Scannez ce QR code avec votre téléphone pour accéder directement au projet
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          <QrCode className="w-4 h-4 inline mr-1" />
                          Accès mobile optimisé
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
