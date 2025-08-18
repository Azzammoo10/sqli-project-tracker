// app/components/ProjectsTable.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, LinkIcon, Search, Users } from 'lucide-react';
import type { Project } from '../services/projectService';

type Props = {
  projects: Project[];
  userRole: 'ADMIN' | 'CHEF_DE_PROJET' | 'DEVELOPPEUR' | 'CLIENT';
  onTogglePublicLink?: (projectId: number) => void;
  onDeleteProject?: (projectId: number) => void;
  loading?: boolean;
};

const badge = (text: string, color: string) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>
);

const statusBadge = (s: Project['statut']) => {
  const map: Record<Project['statut'], string> = {
    EN_COURS: 'bg-green-50 text-green-700',
    TERMINE: 'bg-purple-50 text-purple-700',
    EN_ATTENTE: 'bg-amber-50 text-amber-700',
    ANNULE: 'bg-rose-50 text-rose-700',
  };
  return badge(
    { EN_COURS: 'En cours', TERMINE: 'Terminé', EN_ATTENTE: 'En attente', ANNULE: 'Annulé' }[s],
    map[s]
  );
};

const typeBadge = (t: Project['type']) => {
  const map: Record<Project['type'], string> = {
    Delivery: 'bg-indigo-50 text-indigo-700',
    TMA: 'bg-blue-50 text-blue-700',
    Interne: 'bg-gray-100 text-black',
  };
  return badge(t, map[t]);
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div
      className="h-2 rounded-full bg-[#4B2A7B]"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

export default function ProjectsTable({ projects, userRole, onTogglePublicLink, onDeleteProject, loading }: Props) {
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState<string>('ALL');
  const [type, setType] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return projects
      .filter(p =>
        q
          ? p.titre.toLowerCase().includes(q.toLowerCase()) ||
            p.client?.username?.toLowerCase().includes(q.toLowerCase())
          : true
      )
      .filter(p => (statut === 'ALL' ? true : p.statut === statut))
      .filter(p => (type === 'ALL' ? true : p.type === type));
  }, [projects, q, statut, type]);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B]/30 text-black"
            placeholder="Rechercher un projet ou client…"
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
                <td colSpan={9} className="px-4 py-10 text-center text-black">
                  Chargement…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-black">
                  Aucun projet trouvé
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-black">{p.titre}</div>
                    <div className="text-xs text-black">{p.description ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-black">{p.client?.username ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {(p.developpeurs ?? []).slice(0, 5).map((d) => (
                        <div
                          key={d.id}
                          className="w-7 h-7 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-black"
                        >
                          {d.username.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {(p.developpeurs?.length ?? 0) > 5 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-black">
                          +{p.developpeurs!.length - 5}
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
                  <td className="px-4 py-3">{typeBadge(p.type)}</td>
                  <td className="px-4 py-3">{statusBadge(p.statut)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={Number(p.progression ?? 0)} />
                      <span className="text-sm text-black w-10 text-right">
                        {Math.round(Number(p.progression ?? 0))}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {userRole === 'ADMIN' && (
                        <Link
                          to={`/admin/projects/${p.id}`}
                          className="p-2 rounded-md hover:bg-gray-100 text-black"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      {userRole !== 'CLIENT' && onTogglePublicLink && (
                        <button
                          onClick={() => onTogglePublicLink(p.id)}
                          className="p-2 rounded-md hover:bg-gray-100 text-black"
                          title="Activer/Désactiver le lien public"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          onClick={() => onDeleteProject(p.id)}
                          className="p-2 rounded-md hover:bg-gray-100 text-rose-600"
                          title="Supprimer"
                        >
                          ×
                        </button>
                      )}
                      {(p.developpeurs?.length ?? 0) === 0 && (
                        <div className="ml-2 text-xs text-black flex items-center gap-1">
                          <Users className="w-3 h-3" /> Aucune équipe
                        </div>
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
