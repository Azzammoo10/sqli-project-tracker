import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Users, CheckCircle2, PauseCircle, XCircle, Search, RotateCcw
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { authService } from '../../services/api';
import { chefDashboardService } from '../../services/chefDashboardService';
import toast from 'react-hot-toast';

interface TeamMember {
  userId: number;
  fullName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number; // 0..100
}

export default function ChefTeam() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [q, setQ] = useState(''); // 🔎 recherche locale simple (frontend only)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        
        // Utiliser le service du dashboard pour récupérer les données d'équipe
        const teamData = await chefDashboardService.getTeamOverview();
        
        // Transformer les données pour correspondre à l'interface TeamMember
        const transformedTeam = teamData.map((member: any) => ({
          userId: member.id,
          fullName: member.username,
          totalTasks: (member.completedTasks || 0) + (member.pendingTasks || 0),
          completedTasks: member.completedTasks || 0,
          inProgressTasks: member.pendingTasks || 0,
          blockedTasks: 0, // Pas de données pour les tâches bloquées pour l'instant
          completionRate: member.totalTasks > 0 ? (member.completedTasks / member.totalTasks) * 100 : 0
        }));
        
        setTeam(transformedTeam);
      } catch (e) {
        console.error('Erreur lors du chargement de l\'équipe:', e);
        toast.error("Erreur lors du chargement de l'équipe");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetSearch = () => setQ('');

  // ✅ Filtrage **frontend** sur les champs déjà présents
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return team;
    return team.filter(m =>
      (m.fullName ?? '').toLowerCase().includes(k)
      || String(m.totalTasks ?? '').includes(k)
      || String(m.completedTasks ?? '').includes(k)
      || String(m.inProgressTasks ?? '').includes(k)
      || String(m.blockedTasks ?? '').includes(k)
    );
  }, [q, team]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'équipe...</p>
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
                    <Users className="h-6 w-6 text-white/90" />
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Mon Équipe</h1>
                      <p className="text-white/85">Liste des développeurs et progression</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{team.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filtered.length}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outils : recherche locale + reset */}
          <div className="px-6">
            <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white
                               text-gray-900 placeholder:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                  />
                </div>
                {q && (
                  <button
                    onClick={resetSearch}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-950"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="h-4 w-4" /> Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Liste (design harmonisé) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y">
              {filtered.map((m) => (
                <div key={m.userId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4B2A7B] text-white flex items-center justify-center text-sm font-medium shadow-sm">
                      {m.fullName?.trim()?.slice(0, 2)?.toUpperCase() ?? '??'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{m.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {m.totalTasks} tâches • {Math.round(m.completionRate)}% complétées
                      </div>

                      {/* Barre de progression subtile */}
                      <div className="mt-1 h-2 w-44 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7E56D9]"
                          style={{ width: `${Math.min(100, Math.max(0, m.completionRate))}%` }}
                          aria-label={`Progression ${Math.round(m.completionRate)}%`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-700">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" /> {m.completedTasks}
                    </span>
                    <span className="flex items-center gap-1">
                      <PauseCircle className="w-3 h-3 text-amber-600" /> {m.inProgressTasks}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" /> {m.blockedTasks}
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {m.totalTasks}
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-10 text-center text-gray-500">Aucun membre</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
