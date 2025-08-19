import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        setUser(me);
      } catch {
        // pas bloquant pour l'UI
      }
    })();
  }, []);

  const handleSubmit = async (projectData: CreateProjectRequest) => {
    setLoading(true);
    try {
      await projectService.createProject(projectData);
      toast.success('Projet créé avec succès !');
      navigate('/chef/projects');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la création du projet';
      toast.error(errorMessage);
      throw error; // Laisser le ProjectForm gérer l'état d’erreur si besoin
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          {/* Header harmonisé (même style que les autres pages) */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{
                  background:
                    'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)'
                }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <button
                  onClick={() => navigate('/chef/projects')}
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Retour</span>
                </button>

                <div className="text-right">
                  <h1 className="text-2xl font-semibold tracking-tight">Créer un projet</h1>
                  <p className="text-white/85">
                    Renseigne les informations puis enregistre
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Carte/formulaire élargis et centrés */}
          <div className="px-6 pb-10">
            <div className="mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-sm p-6 lg:p-8">
              <ProjectForm
                mode="create"
                onSubmit={handleSubmit}
                loading={loading}
              />

              {loading && (
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-4 w-4 animate-spin text-[#4B2A7B]" />
                  Création en cours…
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
