import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FolderOpen } from 'lucide-react';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import ProjectsTable from '../../components/ProjectsTable';
import toast from 'react-hot-toast';
import projectService, { type Project } from '../../services/projectService';

export default function AdminProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
        const all = await projectService.getAllProjects();
        setProjects(all ?? []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des projets:', error);
        toast.error('Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return projects;
    return projects.filter(p => {
      const inTitre = (p.titre ?? '').toLowerCase().includes(k);
      const inDesc = (p.description ?? '').toLowerCase().includes(k);
      const inType = String((p as any).type ?? '').toLowerCase().includes(k);
      const inStatut = String(p.statut ?? '').toLowerCase().includes(k);
      const inClient = ((p as any).clientName ?? p.client?.username ?? '')
        .toLowerCase()
        .includes(k);
      const inChef = (p.createdBy?.username ?? '').toLowerCase().includes(k);
      return inTitre || inDesc || inType || inStatut || inClient || inChef;
    });
  }, [q, projects]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={user} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des projets…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={user} onLogout={onLogout} />
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
                      <p className="text-white/90 text-lg">Gérez tous les projets de l'organisation</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{projects.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filtered.length}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="px-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <ProjectsTable projects={filtered} userRole="ADMIN" loading={false} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
