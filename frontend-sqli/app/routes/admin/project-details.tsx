import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  FolderOpen,
  User,
  Users,
  BadgeCheck,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavAdmin from '../../components/NavAdmin';
import projectService, { type Project } from '../../services/projectService';
import taskService from '../../services/taskService';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

/* ----------------------- Helpers: normalisation & UI ---------------------- */

const pretty = (s?: string | null) =>
  (s ?? '')
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()) || '—';

const normStatus = (raw?: string) => {
  const v = (raw ?? '').toUpperCase();
  if (['EN_COURS', 'IN_PROGRESS'].includes(v)) return 'EN_COURS';
  if (['TERMINE', 'TERMINÉ', 'DONE'].includes(v)) return 'TERMINE';
  if (['EN_ATTENTE', 'PENDING'].includes(v)) return 'EN_ATTENTE';
  if (['ANNULE', 'ANNULÉ', 'CANCELED', 'CANCELLED'].includes(v)) return 'ANNULE';
  return 'UNKNOWN';
};

const StatusBadge = ({ value }: { value?: string }) => {
  const s = normStatus(value);
  const styles: Record<string, string> = {
    EN_COURS: 'bg-green-50 text-green-700',
    TERMINE: 'bg-purple-50 text-purple-700',
    EN_ATTENTE: 'bg-amber-50 text-amber-700',
    ANNULE: 'bg-rose-50 text-rose-700',
    UNKNOWN: 'bg-gray-100 text-gray-500',
  };
  const label =
    s === 'EN_COURS' ? 'En cours'
      : s === 'TERMINE' ? 'Terminé'
      : s === 'EN_ATTENTE' ? 'En attente'
      : s === 'ANNULE' ? 'Annulé'
      : '—';

  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s]}`}>{label}</span>;
};

const pct = (n?: number) => Math.min(100, Math.max(0, Number(n ?? 0)));

/** Normalise un objet Project venant de différents DTO côté BE */
function normalizeProject(raw: any): Project & {
  clientName?: string;
  chefUsername?: string;
  team?: Array<{ id?: number; username?: string; email?: string }>;
  taskList?: Array<{ id?: number; titre?: string; statut?: string; developpeur?: any; developpeurUsername?: string }>;
  status?: string;
  progress?: number;
  typeLabel?: string;
} {
  const clientName = raw?.clientName ?? raw?.client?.username ?? raw?.client?.nom ?? undefined;
  const chefUsername =
    raw?.chefUsername ??
    raw?.createdBy?.username ??
    raw?.chefDeProjet?.username ??
    raw?.owner?.username ??
    undefined;

  const status = raw?.statut ?? raw?.status ?? undefined;

  // Progression : couvrir plein de variantes
  const progress =
    raw?.progression ??
    raw?.progress ??
    raw?.progressPercentage ??
    raw?.progressionPercent ??
    raw?.projectProgress ??
    undefined;

  // Type
  const typeLabel =
    raw?.typeLabel ??
    raw?.type ??
    raw?.projectType?.label ??
    raw?.projectType ??
    undefined;

  // Équipe : couvrir plusieurs clés
  const team =
    raw?.developpeurs ??
    raw?.developers ??
    raw?.teamMembers ??
    raw?.members ??
    [];

  // Tâches : couvrir plusieurs clés
  const taskList =
    raw?.tasks ??
    raw?.taches ??
    raw?.todoList ??
    [];

  return {
    ...raw,
    clientName,
    chefUsername,
    status,
    progress,
    typeLabel,
    team,
    taskList,
  };
}

/** Déduit des membres depuis la liste des tâches (fallback) */
function deriveTeamFromTasks(tasks: Array<any>) {
  const byKey = new Map<string, { id?: number; username?: string; email?: string }>();
  for (const t of tasks) {
    const dev =
      t?.developpeur ??
      t?.developer ??
      undefined;

    const username =
      dev?.username ??
      t?.developpeurUsername ??
      t?.developerUsername ??
      undefined;

    const email =
      dev?.email ??
      t?.developerEmail ??
      undefined;

    if (!username && !email) continue;
    const key = (username ?? email) as string;
    if (!byKey.has(key)) byKey.set(key, { id: dev?.id, username, email });
  }
  return Array.from(byKey.values());
}

/* --------------------------------- Page ---------------------------------- */

export default function AdminProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ReturnType<typeof normalizeProject> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setMe(u);
        if (!id) return;

        // 1) Récup projet
        const raw = await projectService.getProjectById(Number(id));
        let p = normalizeProject(raw);

        // 2) Si pas de tâches dans la réponse détail, on va les chercher
        let tasks = p.taskList ?? [];
        if (!tasks.length) {
          try {
            tasks = await taskService.getByProject(Number(id));
          } catch {
            // no-op (certains projets n'ont pas de tâches)
          }
        }

        // 3) Équipe : si vide, déduire via les tâches
        let team = p.team ?? [];
        if (!team.length && tasks.length) {
          team = deriveTeamFromTasks(tasks);
        }

        // 4) Progression : si manquante, calculer depuis tâches, sinon appeler l’API de recompute
        let progress = p.progress;
        if (progress === undefined || progress === null || Number.isNaN(Number(progress))) {
          if (tasks.length) {
            const total = tasks.length;
            const done = tasks.filter((t) => normStatus(t.statut) === 'TERMINE').length;
            progress = total > 0 ? Math.round((done / total) * 100) : 0;
          } else {
            try {
              const recomputed = await projectService.recomputeProgress(Number(id));
              progress = Number(recomputed ?? 0);
            } catch {
              progress = 0;
            }
          }
        }

        setProject({
          ...p,
          taskList: tasks,
          team,
          progress,
        });
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const logout = async () => {
    try { await authService.logout(); navigate('/auth/login'); } catch {}
  };

  const devs = useMemo(() => project?.team ?? [], [project]);
  const tasks = useMemo(
    () => (project?.taskList ?? []) as Array<{ id?: number; titre?: string; statut?: string }>,
    [project]
  );

  // Stats tâches : si BE ne fournit pas, on dérive
  const { totalTasks, completedTasks, inProgressTasks } = useMemo(() => {
    const total = Number(project?.totalTasks ?? tasks.length ?? 0);
    let done = Number(project?.completedTasks ?? 0);
    let doing = Number(project?.inProgressTasks ?? 0);

    if (tasks.length) {
      done = tasks.filter((t) => normStatus(t.statut) === 'TERMINE').length;
      doing = tasks.filter((t) => normStatus(t.statut) === 'EN_COURS').length;
    }
    return { totalTasks: total, completedTasks: done, inProgressTasks: doing };
  }, [project, tasks]);

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
          {/* Header harmonisé */}
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
                    <StatusBadge value={project.status ?? project.statut} />
                  </span>
                  {(totalTasks || inProgressTasks || completedTasks) ? (
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Tâches: {completedTasks}/{totalTasks} terminées
                    </span>
                  ) : null}
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
              {project.description ? (
                <p className="text-gray-900 mb-6">{project.description}</p>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                {project.clientName && (
                  <div>
                    <div className="text-gray-500">Client</div>
                    <div className="mt-1 font-medium text-gray-900">{project.clientName}</div>
                  </div>
                )}

                {project.chefUsername && (
                  <div>
                    <div className="text-gray-500">Chef de projet</div>
                    <div className="mt-1 font-medium text-gray-900">{project.chefUsername}</div>
                  </div>
                )}

                {project.dateDebut && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500">Début</div>
                      <div className="mt-1 font-medium text-gray-900">
                        {new Date(project.dateDebut).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {project.dateFin && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500">Fin</div>
                      <div className="mt-1 font-medium text-gray-900">
                        {new Date(project.dateFin).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {project.typeLabel && (
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="mt-1 font-medium text-gray-900">{project.typeLabel}</div>
                  </div>
                )}

                {project.status && (
                  <div>
                    <div className="text-gray-500">Statut</div>
                    <div className="mt-1"><StatusBadge value={project.status} /></div>
                  </div>
                )}
              </div>

              {/* Progression */}
              <div className="mt-8">
                <div className="mb-2 text-sm text-gray-700">Progression</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 bg-[#4B2A7B] rounded"
                    style={{ width: `${pct(project.progress ?? project.progression)}%` }}
                  />
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {Math.round(pct(project.progress ?? project.progression))}%
                </div>
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
                      key={`${d.id ?? idx}-${d.email ?? d.username ?? 'm' + idx}`}
                      className="p-3 border border-gray-200 rounded-md flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{d.username ?? '—'}</div>
                        {d.email ? <div className="text-xs text-gray-600">{d.email}</div> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tâches */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tâches</h2>
                {(totalTasks || inProgressTasks || completedTasks) ? (
                  <div className="text-xs text-gray-600">
                    Total: <b>{totalTasks}</b> • En cours: <b>{inProgressTasks}</b> • Terminées:{' '}
                    <b>{completedTasks}</b>
                  </div>
                ) : null}
              </div>

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
