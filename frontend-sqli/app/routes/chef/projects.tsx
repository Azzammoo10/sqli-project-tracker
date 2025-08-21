import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, Search, RotateCcw, FolderOpen } from 'lucide-react';
import NavChef from '../../components/NavChef';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../../services/api';
import { projectService, type Project } from '../../services/projectService';
import ProjectsTable from '../../components/ProjectsTable';
import toast from 'react-hot-toast';

export default function ChefProjects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);

  // 🔎 recherche légère (inspire admin, sans modifier la logique métier)
  const [q, setQ] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        const chefProjects = await projectService.getProjectsByChef();
        console.log('🔍 Projets récupérés depuis /projects/chef/overview:', chefProjects);
        
        // Vérifier la structure des données
        if (chefProjects && chefProjects.length > 0) {
          console.log('📊 Premier projet:', chefProjects[0]);
          console.log('📈 Progression du premier projet:', chefProjects[0].progression);
          console.log('🔑 Clés disponibles:', Object.keys(chefProjects[0]));
        }
        
        setProjects(chefProjects ?? []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des projets:', error);
        toast.error('Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success('Projet supprimé avec succès');
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du projet');
      }
    }
  };

  const resetAll = () => setQ('');

  // ✅ Filtrage (uniquement sur champs existants du type Project)
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return projects;
    return projects.filter(p => {
      const inTitre = (p.titre ?? '').toLowerCase().includes(k);
      const inDesc = (p.description ?? '').toLowerCase().includes(k);
      const inType = (p.type ?? '').toLowerCase().includes(k);
      const inStatut = (p.statut ?? '').toLowerCase().includes(k);
      const inClient = (p.client?.username ?? '').toLowerCase().includes(k);
      const inChef = (p.createdBy?.username ?? '').toLowerCase().includes(k);
      return inTitre || inDesc || inType || inStatut || inClient || inChef;
    });
  }, [q, projects]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
          {/* Bannière */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Mes Projets</h1>
                      <p className="text-white/90 text-lg">Gérez vos projets et équipes</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Total: <b>{projects.length}</b>
                    </span>
                    <span className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                      Affichés: <b>{filtered.length}</b>
                    </span>
                    <button
                      onClick={() => navigate('/chef/projects/create')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
                      title="Nouveau projet"
                    >
                      <Plus className="h-4 w-4" />
                      Créer un projet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6">
            

            {/* Tableau projets (liste filtrée) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <ProjectsTable
                projects={filtered}
                userRole="CHEF_DE_PROJET"
                // onDeleteProject={handleDeleteProject}
                loading={false}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
