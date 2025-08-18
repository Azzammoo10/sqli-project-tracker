import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        const allProjects = await projectService.getAllProjects();
        setProjects(allProjects);
        console.log('Projects loaded for admin:', allProjects);
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

  const handleTogglePublicLink = async (projectId: number) => {
    try {
      const updatedProject = await projectService.togglePublicLink(projectId);
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      toast.success('Lien public mis à jour');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du lien public:', error);
      toast.error('Erreur lors de la mise à jour du lien public');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={user} onLogout={handleLogout} />
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Projets</h1>
              <p className="text-gray-600">Gérez tous les projets de l'organisation</p>
            </div>

            <ProjectsTable
              projects={projects}
              userRole="ADMIN"
              onTogglePublicLink={handleTogglePublicLink}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
