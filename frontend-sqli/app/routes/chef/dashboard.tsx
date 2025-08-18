import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, FolderOpen, Users, Plus } from 'lucide-react';
import NavChef from '../../components/NavChef';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { projectService, type Project } from '../../services/projectService';
import { dashboardService } from '../../services/dashboardService';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [buildProjects, setBuildProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        const [s, build, teamDash, trendData, chefProjects, allTasks, tStats] = await Promise.all([
          projectService.getProjectStats(),
          fetch('http://localhost:8080/api/analytics/projects/build', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
          fetch('http://localhost:8080/api/analytics/dashboard/team', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
          dashboardService.getTrendData(),
          projectService.getProjectsByChef(),
          taskService.getAll(),
          taskService.getStats(),
        ]);
        setStats(s);
        setBuildProjects(build);
        setTeam(teamDash);
        setTrend(trendData);
        setRecentProjects((chefProjects ?? []).slice(0, 4));
        setTasks((allTasks ?? []).slice(0, 5));
        setTaskStats(tStats ?? {});
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex h-screen">
          <NavChef user={user} onLogout={handleLogout} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
              <p className="text-gray-600">Chargement du dashboard...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome {user?.username?.toUpperCase()} 👋</h1>
                <p className="text-gray-600">Suivi centralisé des projets, tâches et utilisateurs</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/chef/projects/create')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-md hover:bg-[#5B3A8B]"><Plus className="w-4 h-4"/>Créer un projet</button>
                <button onClick={() => navigate('/chef/tasks')} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800">Créer une tâche</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Projets Totaux</span>
                  <FolderOpen className="w-4 h-4 text-[#4B2A7B]" />
                </div>
                <div className="text-2xl font-semibold">{stats?.totalProjects ?? '—'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Projets Actifs</span>
                  <BarChart3 className="w-4 h-4 text-[#4B2A7B]" />
                </div>
                <div className="text-2xl font-semibold">{stats?.activeProjects ?? '—'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Terminés</span>
                  <ClipboardList className="w-4 h-4 text-[#4B2A7B]" />
                </div>
                <div className="text-2xl font-semibold">{stats?.completedProjects ?? '—'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">En Retard</span>
                  <Activity className="w-4 h-4 text-[#4B2A7B]" />
                </div>
                <div className="text-2xl font-semibold">{stats?.lateProjects ?? '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Projets récents</h2>
                  <button onClick={() => navigate('/chef/projects')} className="text-sm text-[#4B2A7B] hover:underline">Voir tout</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                  {recentProjects.length === 0 && <p className="text-gray-500">Aucun projet</p>}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Projets Build (suivi)</h2>
                <div className="space-y-3">
                  {buildProjects?.slice(0, 6).map((p: any) => (
                    <div key={p.projectId} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{p.titre}</div>
                        <div className="text-xs text-gray-500">{p.completedTasks}/{p.totalTasks} tâches</div>
                      </div>
                      <div className="w-40">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#4B2A7B]" style={{ width: `${Math.round(p.completionRate)}%` }} />
                        </div>
                        <div className="text-xs text-right text-gray-600">{Math.round(p.completionRate)}%</div>
                      </div>
                    </div>
                  ))}
                  {(!buildProjects || buildProjects.length === 0) && (
                    <p className="text-gray-500">Aucun projet build disponible.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Équipe</h2>
                <div className="space-y-3">
                  {team?.slice(0, 8).map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                          {m.username?.slice(0,2)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{m.username}</div>
                          <div className="text-xs text-gray-500">{m.role ?? 'Développeur'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {m.assignedProjects ?? 0} projets
                      </div>
                    </div>
                  ))}
                  {(!team || team.length === 0) && (
                    <p className="text-gray-500">Aucun membre d'équipe.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Tâches Développeur</h2>
                  <button onClick={() => navigate('/chef/tasks')} className="text-sm text-[#4B2A7B] hover:underline">Voir tout</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 text-left text-sm text-black">
                      <tr>
                        <th className="px-4 py-3 font-medium">Développeur</th>
                        <th className="px-4 py-3 font-medium">Tâche</th>
                        <th className="px-4 py-3 font-medium">Projet</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium">Échéance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tasks.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-black">{t.developpeurUsername ?? '—'}</td>
                          <td className="px-4 py-3 text-black">{t.titre}</td>
                          <td className="px-4 py-3 text-black">{t.projectTitre ?? '—'}</td>
                          <td className="px-4 py-3 text-black">{t.statut}</td>
                          <td className="px-4 py-3 text-black">{t.dateFin ? new Date(t.dateFin).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                      {tasks.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-black">Aucune tâche</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Progression des tâches terminées</h2>
                <TrendChart data={trend} />
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Répartition des tâches par statut</h3>
                  <StatusDistribution data={taskStats} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function TrendChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="h-40 flex items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 bg-[#E9D8FD] relative" style={{ height: `${Math.min(100, Math.max(0, d.value))}%` }}>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-600">{d.value}</span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusDistribution({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => Number(v || 0)));
  return (
    <div className="h-40 flex items-end gap-2">
      {entries.map(([label, value]) => (
        <div key={label} className="flex-1 bg-[#E9D8FD] relative" style={{ height: `${(Number(value) / max) * 100}%` }}>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-600">{value}</span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusMap: Record<Project['statut'], string> = {
    EN_COURS: 'bg-emerald-50 text-emerald-700',
    TERMINE: 'bg-violet-50 text-violet-700',
    EN_ATTENTE: 'bg-amber-50 text-amber-700',
    ANNULE: 'bg-rose-50 text-rose-700',
  };
  const typeMap: Record<Project['type'], string> = {
    Delivery: 'bg-indigo-50 text-indigo-700',
    TMA: 'bg-blue-50 text-blue-700',
    Interne: 'bg-gray-100 text-gray-800',
  };
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[project.statut]}`}>{
          { EN_COURS: 'EN_COURS', TERMINE: 'TERMINE', EN_ATTENTE: 'EN_ATTENTE', ANNULE: 'ANNULE' }[project.statut]
        }</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-2">{project.titre}</div>
      <div className="text-xs text-gray-500 mb-3">Client: {project.client?.username ?? '—'}</div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2.5 py-1 rounded-full font-medium ${typeMap[project.type]}`}>{project.type}</span>
        {project.developpeurs?.slice(0,2).map(d => (
          <span key={d.id} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">{d.username}</span>
        ))}
      </div>
    </div>
  );
}
