import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, Users } from 'lucide-react';
import type { Project } from '~/services/projectService';

/** PROPS — plus d’actions optionnelles, juste la vue */
type Props = {
  projects: Project[];
  userRole: 'ADMIN' | 'CHEF_DE_PROJET' | 'DEVELOPPEUR' | 'CLIENT';
  loading?: boolean;
};

/* ========================= Helpers ========================= */

const badge = (text: string, color: string) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>
);

// L’API /projects actuelle peut renvoyer "clientName" (string) ou un objet client
const safeClientName = (p: Project) =>
  (p as any).clientName || p.client?.username || '—';

const normalizeType = (t: unknown): 'Delivery' | 'TMA' | 'Interne' | 'UNKNOWN' => {
  if (!t) return 'UNKNOWN';
  const s = String(t).toLowerCase();
  if (['delivery', 'livraison'].includes(s)) return 'Delivery';
  if (['tma'].includes(s)) return 'TMA';
  if (['interne', 'internal'].includes(s)) return 'Interne';
  return 'UNKNOWN';
};

const normalizeStatut = (s: unknown): Project['statut'] | 'UNKNOWN' => {
  if (!s) return 'UNKNOWN';
  const v = String(s).toUpperCase();
  if (['EN_COURS', 'IN_PROGRESS'].includes(v)) return 'EN_COURS';
  if (['TERMINE', 'TERMINÉ', 'DONE'].includes(v)) return 'TERMINE';
  if (['EN_ATTENTE', 'PENDING'].includes(v)) return 'EN_ATTENTE';
  if (['ANNULE', 'ANNULÉ', 'CANCELED', 'CANCELLED'].includes(v)) return 'ANNULE';
  return 'UNKNOWN';
};

const renderTypeBadge = (p: any) => {
  const raw = p.typeLabel || p.type || '—';
  const label = ['Delivery', 'TMA', 'Interne'].includes(raw) ? raw : '—';
  const map: Record<string, string> = {
    Delivery: 'bg-indigo-50 text-indigo-700',
    TMA: 'bg-blue-50 text-blue-700',
    Interne: 'bg-gray-100 text-black',
    '—': 'bg-gray-50 text-gray-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[label]}`}>
      {label}
    </span>
  );
};

const statusBadgeSafe = (raw: Project['statut'] | string | undefined) => {
  const s = normalizeStatut(raw);
  const map: Record<typeof s, string> = {
    EN_COURS: 'bg-green-50 text-green-700',
    TERMINE: 'bg-purple-50 text-purple-700',
    EN_ATTENTE: 'bg-amber-50 text-amber-700',
    ANNULE: 'bg-rose-50 text-rose-700',
    UNKNOWN: 'bg-gray-50 text-gray-400',
  };
  const label =
    s === 'EN_COURS' ? 'En cours' :
    s === 'TERMINE' ? 'Terminé' :
    s === 'EN_ATTENTE' ? 'En attente' :
    s === 'ANNULE' ? 'Annulé' : '—';
  return badge(label, map[s]);
};

// Initiales pour avatars
const initials = (s?: string) =>
  (s || '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0]?.toUpperCase() || '')
    .join('') || 'DE';

/* ========================= Composant ========================= */

export default function ProjectsTable({ projects, userRole, loading }: Props) {
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState<string>('ALL');
  const [type, setType] = useState<string>('ALL');

  const hasTypeInData = useMemo(() => projects.some(p => (p as any).type != null), [projects]);

  const filtered = useMemo(() => {
    return projects
      .filter(p => {
        if (!q) return true;
        const txt = q.toLowerCase();
        return (
          (p.titre ?? '').toLowerCase().includes(txt) ||
          safeClientName(p).toLowerCase().includes(txt) ||
          (p.description ?? '').toLowerCase().includes(txt)
        );
      })
      .filter(p => (statut === 'ALL' ? true : normalizeStatut(p.statut) === statut))
      .filter(p => (type === 'ALL' ? true : normalizeType((p as any).type) === type));
  }, [projects, q, statut, type]);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filtres */}
      <div className="p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B]/30 text-black placeholder-gray-500"
            placeholder="Rechercher un projet, client, description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#4B2A7B]/30 text-black"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ANNULE">Annulé</option>
        </select>

        {hasTypeInData ? (
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#4B2A7B]/30 text-black"
          >
            <option value="ALL">Tous les types</option>
            <option value="Delivery">Delivery</option>
            <option value="TMA">TMA</option>
            <option value="Interne">Interne</option>
          </select>
        ) : (
          <div /> /* placeholder pour garder 3 colonnes */
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left text-sm text-black">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Équipe</th>
              <th className="px-4 py-3 font-medium">Début</th>
              <th className="px-4 py-3 font-medium">Fin</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Progression</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-black">Chargement…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-black">Aucun projet trouvé</td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-black">{p.titre}</div>
                    <div className="text-xs text-black">{p.description ?? '—'}</div>
                  </td>

                  <td className="px-4 py-3 text-black">{safeClientName(p)}</td>

                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {(p.developpeurs ?? []).slice(0, 5).map((d, i) => (
                        <div
                          key={`${d.username || d.email || 'dev'}-${i}`}
                          className="w-7 h-7 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-black"
                          title={d.username || d.email}
                        >
                          {initials(d.username)}
                        </div>
                      ))}
                      {(p.developpeurs?.length ?? 0) === 0 && (
                        <div className="ml-1 text-xs text-black flex items-center gap-1">
                          <Users className="w-3 h-3" /> Aucune équipe
                        </div>
                      )}
                      {(p.developpeurs?.length ?? 0) > 5 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-black">
                          +{(p.developpeurs!.length - 5)}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-black">
                    {p.dateDebut ? new Date(p.dateDebut).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-black">
                    {p.dateFin ? new Date(p.dateFin).toLocaleDateString() : '—'}
                  </td>

                  <td className="px-4 py-3">{renderTypeBadge(p)}</td>
                  <td className="px-4 py-3">{statusBadgeSafe(p.statut)}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-28 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[#4B2A7B]"
                          style={{ width: `${Math.min(Math.max(Number(p.progression ?? 0), 0), 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-black w-10 text-right">
                        {Math.round(Number(p.progression ?? 0))}%
                      </span>
                    </div>
                  </td>

                  {/* ✨ Seule action : œil → page détails */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {userRole !== 'CLIENT' && (
                        <Link
                          to={userRole === 'ADMIN' ? `/admin/projects/${p.id}` : `/chef/projects/${p.id}`}
                          className="p-2 rounded-md hover:bg-gray-100 text-black"
                          title="Voir le détail du projet"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
