// app/routes/admin/history.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, User, Activity, FileText, Calendar } from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { historyService, type HistoryEntry, type EntityName, type TypeOperation } from '../../services/historyService';
import toast from 'react-hot-toast';

const pretty = (s: string) =>
  s?.toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c?.toUpperCase()) ?? '';

export default function AdminHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [all, setAll] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // chargement initial
  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const data = await historyService.getAllHistory();
        setAll(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filtre (recherche sur action / entité / username / nom / description)
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return all;
    return all.filter(e =>
      pretty(e.action).toLowerCase().includes(k) ||
      pretty(e.entityName).toLowerCase().includes(k) ||
      (e.userUsername ?? '').toLowerCase().includes(k) ||
      (e.userNom ?? '').toLowerCase().includes(k) ||
      (e.description ?? '').toLowerCase().includes(k)
    );
  }, [q, all]);

  // pagination client
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const current = filtered.slice(start, end);

  // reset page à 1 quand on tape
  useEffect(() => { setPage(1); }, [q]);
  // clamp si on dépasse après filtre
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const logout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const actionBadge = (a: TypeOperation) => {
    const base = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    switch (a) {
      case 'CREATE': return `${base} bg-green-100 text-green-800`;
      case 'UPDATE': return `${base} bg-blue-100 text-blue-800`;
      case 'DELETE': return `${base} bg-red-100 text-red-800`;
      case 'LOGIN':  return `${base} bg-purple-100 text-purple-800`;
      case 'LOGOUT': return `${base} bg-gray-100 text-gray-800`;
      default:       return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const entityIcon = (e: EntityName) => {
    switch (e) {
      case 'USER': return <User className="h-4 w-4" />;
      case 'PROJECT': return <FileText className="h-4 w-4" />;
      case 'TASK': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const Pagination = () => {
    if (filtered.length === 0) return null;
    const windowSize = 5;
    const startPage = Math.max(1, Math.min(page - 2, totalPages - (windowSize - 1)));
    const pages = Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => startPage + i);

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Éléments <span className="font-medium">{filtered.length === 0 ? 0 : start + 1}</span>–<span className="font-medium">{end}</span> sur <span className="font-medium">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-2 border text-sm rounded-md ${
                p === page
                  ? 'bg-[#4B2A7B] border-[#4B2A7B] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const Content = () => {
    if (loading) {
      return (
        <div className="flex h-screen">
          <NavAdmin user={user} onLogout={logout} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
              <p className="text-gray-600">Chargement de l'historique…</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={user} onLogout={logout} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Historique des Actions</h1>
              <p className="text-gray-600">Suivi de toutes les actions effectuées dans le système</p>
            </div>

            {/* Barre de recherche — visible et active */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher… (action, entité, username, nom, détails)"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white
                             text-gray-900 placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTION</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTITÉ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTILISATEUR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DÉTAILS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {current.map((e, i) => (
                      <tr key={`${e.dateHeure}-${e.entityId}-${i}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={actionBadge(e.action)}>{pretty(e.action)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {entityIcon(e.entityName)}
                            <span className="text-sm text-gray-900">{pretty(e.entityName)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-[#4B2A7B] flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{e.userUsername}</div>
                              <div className="text-sm text-gray-500">{e.userNom}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={e.description}>
                            {e.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(e.dateHeure).toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {current.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Aucun élément à afficher.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Content />
    </ProtectedRoute>
  );
}
