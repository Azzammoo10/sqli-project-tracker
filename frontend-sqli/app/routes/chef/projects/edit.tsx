import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Users, UserPlus, UserMinus } from 'lucide-react';
import NavChef from '../../../components/NavChef';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/api';
import { projectService, type Project, type UpdateProjectRequest } from '../../../services/projectService';
import { userService, type User } from '../../../services/userService';
import toast from 'react-hot-toast';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id!);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [project, setProject] = useState<Project | null>(null);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  
  const [form, setForm] = useState<UpdateProjectRequest>({
    titre: '',
    description: '',
    type: 'Delivery',
    dateDebut: '',
    dateFin: '',
    clientId: 0,
    developpeurIds: [],
    statut: 'EN_COURS',
    progression: 0
  } as UpdateProjectRequest);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Charger le projet
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);
        
        // Charger les développeurs disponibles
        const devs = await userService.getUsersByRole('DEVELOPPEUR');
        setDevelopers(devs);
        
        // Charger les clients
        const clientUsers = await userService.getUsersByRole('CLIENT');
        setClients(clientUsers);
        
        // Initialiser le formulaire
        setForm({
          titre: projectData.titre || '',
          description: projectData.description || '',
          type: projectData.type,
          dateDebut: projectData.dateDebut || '',
          dateFin: projectData.dateFin || '',
          clientId: projectData.client?.id || 0,
          developpeurIds: projectData.developpeurs?.map(d => d.id) || [],
          statut: projectData.statut,
          progression: projectData.progression || 0
        });
        
      } catch (error: any) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement du projet');
        navigate('/chef/projects');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadData();
    }
  }, [projectId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.titre?.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    
    if (!form.clientId) {
      toast.error('Un client doit être sélectionné');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: UpdateProjectRequest = {
        titre: form.titre!.trim(),
        description: form.description?.trim() || '',
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin || undefined,
        clientId: form.clientId,
        developpeurIds: form.developpeurIds,
        statut: form.statut,
        progression: form.progression
      };

      await projectService.updateProject(projectId, updateData);
      
      toast.success('Projet mis à jour avec succès');
      navigate('/chef/projects');
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du projet');
    } finally {
      setSaving(false);
    }
  };

  const toggleDeveloper = (developerId: number) => {
    setForm(prev => ({
      ...prev,
      developpeurIds: prev.developpeurIds?.includes(developerId)
        ? prev.developpeurIds.filter(id => id !== developerId)
        : [...(prev.developpeurIds || []), developerId]
    }));
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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
        <div className="flex h-screen bg-gray-50">
          <NavChef user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
        <div className="flex h-screen bg-gray-50">
          <NavChef user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">Projet non trouvé</h1>
                <button
                  onClick={() => navigate('/chef/projects')}
                  className="text-[#4B2A7B] hover:text-[#5B3A8B]"
                >
                  ← Retour aux projets
                </button>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/chef/projects')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Modifier le projet</h1>
                  <p className="text-gray-600">{project.titre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de base */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations du projet</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={form.titre}
                      onChange={(e) => setForm(prev => ({ ...prev, titre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                    >
                      <option value="Delivery">Delivery</option>
                      <option value="TMA">TMA</option>
                      <option value="Interne">Interne</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={form.dateDebut}
                      onChange={(e) => setForm(prev => ({ ...prev, dateDebut: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={form.dateFin}
                      onChange={(e) => setForm(prev => ({ ...prev, dateFin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut *
                    </label>
                    <select
                      value={form.statut}
                      onChange={(e) => setForm(prev => ({ ...prev, statut: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                    >
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINE">Terminé</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="ANNULE">Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progression (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.progression}
                      onChange={(e) => setForm(prev => ({ ...prev, progression: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                  />
                </div>
              </div>

              {/* Client */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Client</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client assigné *
                  </label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                    required
                  >
                    <option value={0}>Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.nom || client.username} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Développeurs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Équipe de développement</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {developers.map(dev => (
                    <div
                      key={dev.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        form.developpeurIds?.includes(dev.id)
                          ? 'border-[#4B2A7B] bg-[#4B2A7B]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleDeveloper(dev.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          form.developpeurIds?.includes(dev.id)
                            ? 'border-[#4B2A7B] bg-[#4B2A7B]'
                            : 'border-gray-300'
                        }`}>
                          {form.developpeurIds?.includes(dev.id) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{dev.nom || dev.username}</div>
                          <div className="text-sm text-gray-600">{dev.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {form.developpeurIds && form.developpeurIds.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>{form.developpeurIds.length}</strong> développeur(s) sélectionné(s)
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/chef/projects')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
