import { Search, User, Activity, FileText, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HistoryEntry, TypeOperation, EntityName } from '../services/historyService';

interface HistoryTableProps {
  data: HistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const pretty = (s: string) =>
  s?.toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c?.toUpperCase()) ?? '';

export default function HistoryTable({ data, total, page, totalPages, onPageChange }: HistoryTableProps) {
  const actionBadge = (a: TypeOperation) => {
    const base = 'inline-flex px-2.5 py-1 text-xs font-medium rounded-md';
    switch (a) {
      case 'CREATION': return `${base} bg-green-50 text-green-700 border border-green-200`;
      case 'MODIFICATION': return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
      case 'SUPPRESSION': return `${base} bg-red-50 text-red-700 border border-red-200`;
      case 'LOGIN':  return `${base} bg-purple-50 text-purple-700 border border-purple-200`;
      case 'LOGOUT': return `${base} bg-gray-50 text-gray-700 border border-gray-200`;
      case 'ASSIGN_TASK': return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
      case 'ASSIGN_TO_PROJECT': return `${base} bg-indigo-50 text-indigo-700 border border-indigo-200`;
      case 'CHANGE_STATUS': return `${base} bg-cyan-50 text-cyan-700 border border-cyan-200`;
      case 'ENABLE_USER': return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
      case 'DISABLE_USER': return `${base} bg-red-50 text-red-700 border border-red-200`;
      default:       return `${base} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };

  const actionAccent = (a: TypeOperation) => {
    switch (a) {
      case 'CREATION': return 'border-l-4 border-l-green-500';
      case 'MODIFICATION': return 'border-l-4 border-l-blue-500';
      case 'SUPPRESSION': return 'border-l-4 border-l-red-500';
      case 'LOGIN':  return 'border-l-4 border-l-purple-500';
      case 'LOGOUT': return 'border-l-4 border-l-gray-500';
      case 'ASSIGN_TASK': return 'border-l-4 border-l-amber-500';
      case 'ASSIGN_TO_PROJECT': return 'border-l-4 border-l-indigo-500';
      case 'CHANGE_STATUS': return 'border-l-4 border-l-cyan-500';
      case 'ENABLE_USER': return 'border-l-4 border-l-emerald-500';
      case 'DISABLE_USER': return 'border-l-4 border-l-red-500';
      default:       return 'border-l-4 border-l-gray-300';
    }
  };

  const entityIcon = (e: EntityName) => {
    switch (e) {
      case 'USER': return <User className="h-4 w-4" />;
      case 'PROJECT': return <FileText className="h-4 w-4" />;
      case 'TASK': return <Activity className="h-4 w-4" />;
      case 'AUTHENTICATION': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const Pagination = () => {
    if (total === 0) return null;
    const windowSize = 5;
    const startPage = Math.max(1, Math.min(page - 2, totalPages - (windowSize - 1)));
    const pages = Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => startPage + i);

    return (
      <div className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Éléments <span className="font-medium">{total === 0 ? 0 : ((page - 1) * 20) + 1}</span>–<span className="font-medium">{Math.min(page * 20, total)}</span> sur <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-2 border text-sm rounded-lg transition ${
                p === page
                  ? 'bg-[#4B2A7B] border-[#4B2A7B] text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entité</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Détails</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((e, i) => (
                  <tr
                    key={`${e.dateHeure}-${e.entityId}-${i}`}
                    className={`${actionAccent(e.action)} hover:bg-gray-50 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <span className={actionBadge(e.action)}>{pretty(e.action)}</span>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          {entityIcon(e.entityName)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{pretty(e.entityName)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#4B2A7B] flex items-center justify-center shadow-sm">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{e.userUsername}</div>
                          <div className="text-xs text-gray-500">{e.userNom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-900 max-w-md leading-relaxed" title={e.description}>
                        {e.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium">
                          {new Date(e.dateHeure).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-mono bg-gray-100 text-gray-800 border border-gray-200">
                        #{e.entityId}
                      </span>
                    </td>
                  </tr>
                ))}

                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</div>
                          <div className="text-gray-500 max-w-md">
                            Aucune entrée ne correspond à vos critères de recherche. 
                            Essayez d'ajuster vos filtres.
                          </div>
                        </div>
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
  );
}
