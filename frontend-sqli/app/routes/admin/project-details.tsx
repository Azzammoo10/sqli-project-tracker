// app/routes/admin/project-details.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  FolderOpen,
  Link2,
  User,
  Users,
  BadgeCheck,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavAdmin from '../../components/NavAdmin';
import projectService, { type Project } from '../../services/projectService';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

/* -------------------------- Helpers UI & Data -------------------------- */

const pretty = (s?: string | null) =>
  (s ?? '').toString().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) || '—';

const safeClientName = (p: Project) =>
  (p as any).clientName || p.client?.username || '—';

const safeChefName = (p: Project) =>
  (p as any).chefUsername || p.createdBy?.username || '—';

const safeType = (p: Project) =>
  (p as any).typeLabel || (p as any).type || p.type || '—';

const normalizeStatus = (raw?: string) => {
  const v = (raw ?? '').toUpperCase();
  if (['EN_COURS', 'IN_PROGRESS'].includes(v)) return 'EN_COURS';
  if (['TERMINE', 'TERMINÉ', 'DONE'].includes(v)) return 'TERMINE';
  if (['EN_ATTENTE', 'PENDING'].includes(v)) return 'EN_ATTENTE';
  if (['ANNULE', 'ANNULÉ', 'CANCELED', 'CANCELLED'].includes(v)) return 'ANNULE';
  return 'UNKNOWN';
};

const statusBadge = (raw?: string) => {
  const s = normalizeStatus(raw);
  const map: Record<string, string> = {
    EN_COURS: 'bg-green-50 text-green-700',
    TERMINE: 'bg-purple-50 text-purple-700',
    EN_ATTENTE: 'bg-amber-50 text-amber-700',
    ANNULE: 'bg-rose-50 text-rose-700',
    UNKNOWN: 'bg-gray-100 text-gray-500',
  };
  const label =
    s === 'EN_COURS'
      ? 'En cours'
      : s === 'TERMINE'
      ? 'Terminé'
      : s === 'EN_ATTENTE'
      ? 'En attente'
      : s === 'ANNULE'
      ? 'Annulé'
      : '—';
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label}</span>;
};

const typeBadge = (label: string) => {
  const l = (label || '—').toString();
  const map: Record<string, string> = {
    Delivery: 'bg-indigo-50 text-indigo-700',
    TMA: 'bg-blue-50 text-blue-700',
    Interne: 'bg-gray-100 text-black',
    '—': 'bg-gray-50 text-gray-400',
  };
  const key = (['Delivery', 'TMA', 'Interne'].includes(l) ? l : '—') as keyof typeof map;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[key]}`}>{key}</span>;
};

const pct = (n?: number) => Math.min(100, Math.max(0, Number(n ?? 0)));

/* ---------------------------------------------------------------------- */

export default function AdminProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setMe(u);
        if (!id) return;
        const p = await projectService.getProjectById(Number(id));
        setProject(p);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const logout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
    } catch {
      // no-op
    }
  };

  const devs = useMemo(() => project?.developpeurs ?? [], [project]);
  const tasks = useMemo(() => project?.tasks ?? ([] as Array<{ id?: number; titre?: string; statut?: string }>), [project]);
  const publicEnabled = (project as any)?.publicLinkEnabled === true;
  const uuidPublic = (project as any)?.uuidPublic as string | undefined;

  /* ------------------------------- Loading ------------------------------- */

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={me} onLogout={logout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement du projet…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  /* -------------------------------- Render -------------------------------- */

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={me} onLogout={logout} />

        <div className="flex-1 overflow-auto">
          {/* Header violet harmonisé */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{
                  background:
                    'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)',
                }}
              />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-white/90" />
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{project.titre}</h1>
                    <p className="text-white/85">Détails & suivi du projet</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    {statusBadge(project.statut)}
                  </span>
                  <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    {typeBadge(safeType(project))}
                  </span>
                  <Link
                    to="/admin/projects"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 transition text-white"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 pb-8 space-y-6">
            {/* Carte infos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {/* Description */}
              <p className="text-gray-900 mb-6">{project.description || '—'}</p>

              {/* Grille d’infos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-gray-500">Client</div>
                  <div className="mt-1 font-medium text-gray-900">{safeClientName(project)}</div>
                </div>

                <div>
                  <div className="text-gray-500">Chef de projet</div>
                  <div className="mt-1 font-medium text-gray-900">{safeChefName(project)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-gray-500">Début</div>
                    <div className="mt-1 font-medium text-gray-900">
                      {project.dateDebut ? new Date(project.dateDebut).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-gray-500">Fin</div>
                    <div className="mt-1 font-medium text-gray-900">
                      {project.dateFin ? new Date(project.dateFin).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="mt-1">{typeBadge(safeType(project))}</div>
                </div>

                <div>
                  <div className="text-gray-500">Statut</div>
                  <div className="mt-1">{statusBadge(project.statut)}</div>
                </div>

                <div>
                  <div className="text-gray-500">Lien public</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${publicEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                      {publicEnabled ? 'Activé' : 'Désactivé'}
                    </span>
                    {publicEnabled && uuidPublic && (
                      <span className="text-xs text-gray-500">UUID : {uuidPublic}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progression */}
              <div className="mt-8">
                <div className="mb-2 text-sm text-gray-700">Progression</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 bg-[#4B2A7B] rounded"
                    style={{ width: `${pct(project.progression)}%` }}
                  />
                </div>
                <div className="mt-1 text-sm text-gray-700">{Math.round(pct(project.progression))}%</div>
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#4B2A7B]" />
                  Équipe
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {devs.length} membre(s)
                </span>
              </div>

              {devs.length === 0 ? (
                <p className="text-sm text-gray-600">Aucun développeur affecté.</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {devs.map((d, idx) => (
                    <li
                      key={`${d.id ?? idx}-${d.email ?? d.username}`}
                      className="p-3 border border-gray-200 rounded-md flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{d.username ?? '—'}</div>
                        <div className="text-xs text-gray-600">{d.email ?? ''}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tâches (si renvoyées par l’API) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tâches</h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-600">Aucune tâche pour ce projet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                      <tr>
                        <th className="px-4 py-2 font-medium">Titre</th>
                        <th className="px-4 py-2 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tasks.map((t, i) => (
                        <tr key={t.id ?? i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{t.titre ?? '—'}</td>
                          <td className="px-4 py-2 text-gray-900">{pretty(t.statut)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
