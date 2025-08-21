// app/routes/admin/history.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Clock, User, Activity, FileText, Calendar, FilterX,
    ChevronLeft, ChevronRight, X, RotateCcw, HistoryIcon
} from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { historyService, type HistoryEntry, type EntityName, type TypeOperation } from '../../services/historyService';
import toast from 'react-hot-toast';

const pretty = (s: string) =>
  s?.toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c?.toUpperCase()) ?? '';

const ALL_ACTIONS: TypeOperation[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
const ALL_ENTITIES: EntityName[] = ['USER', 'PROJECT', 'TASK'];

export default function AdminHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [all, setAll] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState('');

  const [actions, setActions] = useState<TypeOperation[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

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

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return all.filter(e => {
      const matchQ = !k
        ? true
        : pretty(e.action).toLowerCase().includes(k) ||
          pretty(e.entityName).toLowerCase().includes(k) ||
          (e.userUsername ?? '').toLowerCase().includes(k) ||
          (e.userNom ?? '').toLowerCase().includes(k) ||
          (e.description ?? '').toLowerCase().includes(k);

      const matchAction = actions.length === 0 ? true : actions.includes(e.action);
      return matchQ && matchAction;
    });
  }, [q, actions, all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const current = filtered.slice(start, end);

  useEffect(() => { setPage(1); }, [q, actions]);
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
      case 'CREATE': return `${base} bg-green-100 text-green-700`;
      case 'UPDATE': return `${base} bg-blue-100 text-blue-700`;
      case 'DELETE': return `${base} bg-rose-100 text-rose-700`;
      case 'LOGIN':  return `${base} bg-purple-100 text-purple-700`;
      case 'LOGOUT': return `${base} bg-slate-100 text-slate-700`;
      default:       return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const actionAccent = (a: TypeOperation) => {
    switch (a) {
      case 'CREATE': return 'border-l-4 border-l-green-500';
      case 'UPDATE': return 'border-l-4 border-l-blue-500';
      case 'DELETE': return 'border-l-4 border-l-rose-500';
      case 'LOGIN':  return 'border-l-4 border-l-purple-500';
      case 'LOGOUT': return 'border-l-4 border-l-slate-500';
      default:       return 'border-l-4 border-l-gray-300';
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

  const toggleIn = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const resetAll = () => {
    setQ('');
    setActions([]);
    setPage(1);
  };

  const Pagination = () => {
    if (filtered.length === 0) return null;
    const windowSize = 5;
    const startPage = Math.max(1, Math.min(page - 2, totalPages - (windowSize - 1)));
    const pages = Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => startPage + i);

    return (
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Éléments <span className="font-medium">{filtered.length === 0 ? 0 : start + 1}</span>–<span className="font-medium">{end}</span> sur <span className="font-medium">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-2 border text-sm rounded-md transition ${
                p === page
                  ? 'bg-[#4B2A7B] border-[#4B2A7B] text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant <ChevronRight className="h-4 w-4" />
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
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={user} onLogout={logout} />
        <div className="flex-1 overflow-auto">
          {/* Header pleine largeur */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <HistoryIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Historique des Actions</h1>
                      <p className="text-white/90 text-lg">Suivi des opérations sur les entités du système</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{all.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filtered.length}</b>
                    </span>
                    <button
                      onClick={resetAll}
                      className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full"
                      title="Réinitialiser recherche & filtres"
                    >
                      <RotateCcw className="h-4 w-4" /> Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu pleine largeur */}
          <div className="p-6">
            <div className="w-full">
              {/* Barre de recherche + filtres */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Rechercher… (action, entité, username, nom, détails)"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white
                                 text-gray-900 placeholder:text-gray-500 transition
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                    {q && (
                      <button
                        onClick={() => setQ('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100"
                        aria-label="Effacer la recherche"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>

                  {/* Filtres actions (chips) */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActions([])}
                      className={`px-3 py-1.5 text-xs rounded-full border transition ${
                        actions.length === 0
                          ? 'bg-[#4B2A7B] text-white border-[#4B2A7B] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Toutes
                    </button>
                    {ALL_ACTIONS.map(a => (
                      <button
                        key={a}
                        onClick={() => setActions(prev => toggleIn(prev, a))}
                        className={`px-3 py-1.5 text-xs rounded-full border transition ${
                          actions.includes(a)
                            ? 'bg-[#4B2A7B] text-white border-[#4B2A7B] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pretty(a)}
                      </button>
                    ))}
                    {actions.length > 0 && (
                      <button
                        onClick={() => setActions([])}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-200 text-black"
                        title="Réinitialiser les filtres d'action"
                      >
                        <FilterX className="h-4 w-4 text-black" /> Effacer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tableau */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entité</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Détails</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {current.map((e, i) => (
                        <tr
                          key={`${e.dateHeure}-${e.entityId}-${i}`}
                          className={`${actionAccent(e.action)} hover:bg-gray-50 transition`}
                        >
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <span className={actionBadge(e.action)}>{pretty(e.action)}</span>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {entityIcon(e.entityName)}
                              </div>
                              <span className="text-sm text-gray-900">{pretty(e.entityName)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#4B2A7B] flex items-center justify-center shadow-sm">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{e.userUsername}</div>
                                <div className="text-xs text-gray-500">{e.userNom}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="text-sm text-gray-900 max-w-md line-clamp-2" title={e.description}>
                              {e.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-gray-600">
                            <div className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(e.dateHeure).toLocaleString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {current.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16">
                            <div className="flex flex-col items-center justify-center text-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Search className="h-6 w-6 text-gray-500" />
                              </div>
                              <div className="text-gray-900 font-medium">Aucun élément à afficher</div>
                              <div className="text-gray-500 text-sm max-w-md">
                                Affine ta recherche ou réinitialise les filtres pour voir plus de résultats.
                              </div>
                              <button
                                onClick={resetAll}
                                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#4B2A7B] text-white hover:brightness-110 shadow-sm"
                              >
                                <RotateCcw className="h-4 w-4" /> Réinitialiser
                              </button>
                            </div>
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
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Content />
    </ProtectedRoute>
  );
}
