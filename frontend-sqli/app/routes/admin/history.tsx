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
import HistoryHeader from '../../components/HistoryHeader';
import AdvancedFilters from '../../components/AdvancedFilters';
import HistoryTable from '../../components/HistoryTable';

// Fonction utilitaire pour formater les chaînes
const pretty = (s: string) =>
  s?.toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c?.toUpperCase()) ?? '';

export default function AdminHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State management
  const [all, setAll] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState('');
  const [actions, setActions] = useState<TypeOperation[]>([]);
  const [entities, setEntities] = useState<EntityName[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Computed values
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return all.filter(e => {
      const matchQ = !k || 
        pretty(e.action).toLowerCase().includes(k) ||
        pretty(e.entityName).toLowerCase().includes(k) ||
        (e.userUsername ?? '').toLowerCase().includes(k) ||
        (e.userNom ?? '').toLowerCase().includes(k) ||
        (e.description ?? '').toLowerCase().includes(k);

      const matchAction = actions.length === 0 || actions.includes(e.action);
      const matchEntity = entities.length === 0 || entities.includes(e.entityName);
      
      return matchQ && matchAction && matchEntity;
    });
  }, [q, actions, entities, all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const current = filtered.slice(start, end);

  // Effects
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

  useEffect(() => { setPage(1); }, [q, actions, entities]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  // Event handlers
  const logout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const resetAll = () => {
    setQ('');
    setActions([]);
    setEntities([]);
    setPage(1);
  };

  const toggleIn = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  // Loading state
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={user} onLogout={logout} />
        <div className="flex-1 overflow-auto">
          <HistoryHeader 
            total={all.length} 
            filtered={filtered.length} 
            actionsCount={actions.length} 
            entitiesCount={entities.length} 
            onReset={resetAll} 
          />
          <AdvancedFilters 
            search={q} 
            onSearchChange={setQ} 
            actions={actions} 
            onActionsChange={setActions} 
            entities={entities} 
            onEntitiesChange={setEntities} 
          />
          <HistoryTable 
            data={current} 
            total={filtered.length} 
            page={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
