import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  FolderOpen,
  Activity,
  BarChart3,
  Clock,
  UserCheck,
  Settings,
  History as HistoryIcon,
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '~/services/api';
import { userService } from '~/services/userService';
import { projectService } from '~/services/projectService';
import { historyService, type HistoryEntry } from '~/services/historyService';
import toast from 'react-hot-toast';

type UserLite = {
  id: number;
  username: string;
  email: string;
  role: string;
  actif?: boolean;
};

type ProjectStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  lateProjects?: number;
};

const pretty = (s?: string) =>
  (s ?? '')
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());

const chipAction = (a?: string) => {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold';
  switch (a) {
    case 'CREATE': return `${base} bg-green-100 text-green-700`;
    case 'UPDATE': return `${base} bg-blue-100 text-blue-700`;
    case 'DELETE': return `${base} bg-rose-100 text-rose-700`;
    case 'LOGIN':  return `${base} bg-purple-100 text-purple-700`;
    case 'LOGOUT': return `${base} bg-slate-100 text-slate-700`;
    default:       return `${base} bg-gray-100 text-gray-700`;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  const [users, setUsers] = useState<UserLite[]>([]);
  const [projStats, setProjStats] = useState<ProjectStats | null>(null);
  const [recent, setRecent] = useState<HistoryEntry[]>([]);

  // charge toutes les données du dashboard
  useEffect(() => {
    (async () => {
      try {
        const [u, usersList, proj, hist] = await Promise.all([
          authService.getCurrentUser(),
          userService.getAllUsers(),
          projectService.getProjectStats(),
          historyService.getAllHistory(),
        ]);

        setMe(u);
        setUsers(usersList as unknown as UserLite[]);
        setProjStats(proj as ProjectStats);

        // tri du plus récent -> plus ancien
        const sorted = (Array.isArray(hist) ? hist : [])
          .slice()
          .sort((a, b) => new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime());

        setRecent(sorted.slice(0, 8)); // 8 dernières actions
      } catch (e: any) {
        console.error(e);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.actif !== false).length; // par défaut actif si undefined
    const inactiveUsers = totalUsers - activeUsers;
    return { totalUsers, activeUsers, inactiveUsers };
  }, [users]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={me} onLogout={handleLogout} />
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={me} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
          {/* Header harmonisé */}
          <div className="p-6">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{
                  background: 'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)'
                }}
              />
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/15 grid place-items-center backdrop-blur">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard Administrateur</h1>
                    <p className="text-white/85">Bienvenue {me?.username?.toUpperCase()} — vue d’ensemble</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    Projets: <b>{projStats?.totalProjects ?? 0}</b>
                  </span>
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    Utilisateurs: <b>{totals.totalUsers}</b>
                  </span>
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    Actifs: <b>{totals.activeUsers}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 pb-10 space-y-6">
            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Total Projets</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {projStats?.totalProjects ?? 0}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {(projStats?.activeProjects ?? 0)} actifs
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center">
                    <FolderOpen className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Total Utilisateurs</div>
                    <div className="text-2xl font-semibold text-gray-900">{totals.totalUsers}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <UserCheck className="h-3.5 w-3.5" />
                      {totals.activeUsers} actifs
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center">
                    <Users className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Activité récente</div>
                    <div className="text-2xl font-semibold text-gray-900">{recent.length}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      Actions enregistrées
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center">
                    <BarChart3 className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Actions rapides */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Actions rapides</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="group p-4 border border-gray-200 rounded-xl bg-white hover:bg-violet-50/40 hover:border-[#4B2A7B] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center mb-2 group-hover:scale-105 transition">
                    <Users className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Gérer Utilisateurs</div>
                  <div className="text-xs text-gray-600">Créer, modifier, supprimer</div>
                </button>

                <button
                  onClick={() => navigate('/admin/projects')}
                  className="group p-4 border border-gray-200 rounded-xl bg-white hover:bg-violet-50/40 hover:border-[#4B2A7B] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center mb-2 group-hover:scale-105 transition">
                    <FolderOpen className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Gérer Projets</div>
                  <div className="text-xs text-gray-600">Créer, suivre, publier</div>
                </button>

                <button
                  onClick={() => navigate('/admin/history')}
                  className="group p-4 border border-gray-200 rounded-xl bg-white hover:bg-violet-50/40 hover:border-[#4B2A7B] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center mb-2 group-hover:scale-105 transition">
                    <HistoryIcon className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Historique</div>
                  <div className="text-xs text-gray-600">Dernières opérations</div>
                </button>

                <button
                  onClick={() => navigate('/admin/settings')}
                  className="group p-4 border border-gray-200 rounded-xl bg-white hover:bg-violet-50/40 hover:border-[#4B2A7B] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center mb-2 group-hover:scale-105 transition">
                    <Settings className="h-6 w-6 text-[#4B2A7B]" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Paramètres</div>
                  <div className="text-xs text-gray-600">Profil & préférences</div>
                </button>
              </div>
            </section>

            {/* Activité récente */}
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Activité récente</h3>
              </div>

              {recent.length === 0 ? (
                <div className="text-sm text-gray-600">Aucune activité pour le moment.</div>
              ) : (
                <div className="space-y-2">
                  {recent.map((e, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 flex items-start gap-3 hover:bg-gray-100 transition"
                    >
                      <div className="h-6 w-6 rounded-full bg-violet-100 text-[#4B2A7B] grid place-items-center shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={chipAction(e.action)}>{pretty(e.action)}</span>
                          <span className="text-xs text-gray-600">
                            {pretty(e.entityName)} • #{e.entityId}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {e.description || `${pretty(e.action)} ${pretty(e.entityName)} #${e.entityId}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(e.dateHeure).toLocaleString()}
                          {e.userUsername ? ` • par ${e.userUsername}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Petit footer info */}
            <div className="text-xs text-gray-500">
              Données mises à jour — {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
