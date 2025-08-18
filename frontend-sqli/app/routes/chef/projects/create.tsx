import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import NavChef from '../../../components/NavChef';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/api';
import { projectService, type CreateProjectRequest } from '../../../services/projectService';
import ProjectForm from '../../../components/ProjectForm';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleSubmit = async (projectData: CreateProjectRequest) => {
    setLoading(true);
    try {
      await projectService.createProject(projectData);
      toast.success('Projet créé avec succès !');
      navigate('/chef/projects');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création du projet';
      toast.error(errorMessage);
      throw error; // Re-throw pour que le formulaire gère l'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <ProjectForm
              mode="create"
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
