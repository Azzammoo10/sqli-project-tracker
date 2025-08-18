import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        const chefProjects = await projectService.getProjectsByChef();
        setProjects(chefProjects);
        console.log('Projects loaded for chef:', chefProjects);
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
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success('Projet supprimé avec succès');
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du projet');
      }
    }
  };

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
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
                <p className="text-gray-600">Gérez vos projets et équipes</p>
              </div>
              <button
                onClick={() => navigate('/chef/projects/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-md hover:bg-[#5B3A8B]"
              >
                <Plus className="w-4 h-4" /> Nouveau Projet
              </button>
            </div>

            <ProjectsTable
              projects={projects}
              userRole="CHEF_DE_PROJET"
              onDeleteProject={handleDeleteProject}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
