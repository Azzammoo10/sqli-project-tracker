import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Users,
  User,
  Clock,
  Target,
  FileText,
  Building,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play
} from 'lucide-react';
import ProtectedRoute from '~/components/ProtectedRoute';
import NavChef from '~/components/NavChef';
import { authService } from '~/services/api';
import { projectService, type Project } from '~/services/projectService';
import { taskService, type Task } from '~/services/taskService';
import toast from 'react-hot-toast';

export default function ChefProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);

        if (!id) return;
        
        // Charger les détails du projet
        const projectData = await projectService.getProjectById(Number(id));
        console.log('=== DEBUG: Project Data ===', projectData);
        console.log('Client:', projectData.client);
        console.log('Developpeurs:', projectData.developpeurs);
        setProject(projectData);

        // Charger les tâches du projet
        const tasksData = await taskService.getByProject(Number(id));
        setTasks(tasksData);
      } catch (error: any) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      try {
        await projectService.deleteProject(project.id);
        toast.success('Projet supprimé avec succès');
        navigate('/chef/projects');
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du projet');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS': return 'bg-green-50 text-green-700 border-green-200';
      case 'TERMINE': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ANNULE': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EN_COURS': return <Play className="w-4 h-4" />;
      case 'TERMINE': return <CheckCircle className="w-4 h-4" />;
      case 'EN_ATTENTE': return <Clock className="w-4 h-4" />;
      case 'ANNULE': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Delivery': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'TMA': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interne': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.statut === 'TERMINE').length;
    const inProgress = tasks.filter(t => t.statut === 'EN_COURS').length;
    const blocked = tasks.filter(t => t.statut === 'BLOQUE').length;
    const notStarted = tasks.filter(t => t.statut === 'NON_COMMENCE').length;
    
    return { total, completed, inProgress, blocked, notStarted };
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen">
        <NavChef user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Projet non trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={user} onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{ background: 'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)' }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/10 p-2">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{project.titre}</h1>
                    <p className="text-white/85">Détails du projet</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/chef/projects"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition text-white text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </Link>
                  <Link
                    to={`/chef/projects/${project.id}/edit`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition text-white text-sm"
                  >
                    <Edit className="w-4 h-4" /> Modifier
                  </Link>
                  <button
                    onClick={handleDeleteProject}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-red-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations principales */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#4B2A7B]" />
                    <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description || 'Aucune description disponible'}
                  </p>
                </div>

                {/* Statistiques des tâches */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#4B2A7B]" />
                      <h2 className="text-lg font-semibold text-gray-900">Statistiques des tâches</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-sm text-green-700">Terminées</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                      <div className="text-sm text-blue-700">En cours</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                      <div className="text-sm text-red-700">Bloquées</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
                      <div className="text-sm text-gray-700">Non commencées</div>
                    </div>
                  </div>

                  {/* Progression globale */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression globale</span>
                      <span className="text-sm font-bold text-[#4B2A7B]">{Math.round(Number(project.progression || 0))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 bg-gradient-to-r from-[#4B2A7B] to-[#7E56D9] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Math.max(Number(project.progression || 0), 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Liste des tâches */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-[#4B2A7B]" />
                    <h2 className="text-lg font-semibold text-gray-900">Tâches du projet</h2>
                  </div>
                  
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucune tâche pour ce projet</p>
                      <Link
                        to={`/chef/taches/create?projectId=${project.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] transition"
                      >
                        <Plus className="w-4 h-4" /> Créer la première tâche
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{task.titre}</div>
                            <div className="text-sm text-gray-600">
                              Assigné à: {task.developpeur?.username || 'Non assigné'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.statut)}`}>
                              {task.statut === 'EN_COURS' ? 'En cours' :
                               task.statut === 'TERMINE' ? 'Terminé' :
                               task.statut === 'BLOQUE' ? 'Bloqué' :
                               task.statut === 'NON_COMMENCE' ? 'Non commencé' : task.statut}
                            </span>
                            <Link
                              to={`/chef/taches/${task.id}/edit`}
                              className="p-1 text-gray-400 hover:text-gray-600 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                      {tasks.length > 5 && (
                        <div className="text-center py-3">
                          <Link
                            to={`/chef/tasks?projectId=${project.id}`}
                            className="text-[#4B2A7B] hover:text-[#5B3A8B] font-medium"
                          >
                            Voir toutes les {tasks.length} tâches →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4B2A7B]/10 flex items-center justify-center">
                        <Building className="w-4 h-4 text-[#4B2A7B]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Type</div>
                        <div className="font-medium text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
                            {project.type || 'Non défini'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4B2A7B]/10 flex items-center justify-center">
                        {getStatusIcon(project.statut)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Statut</div>
                        <div className="font-medium text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.statut)}`}>
                            {project.statut === 'EN_COURS' ? 'En cours' :
                             project.statut === 'TERMINE' ? 'Terminé' :
                             project.statut === 'EN_ATTENTE' ? 'En attente' :
                             project.statut === 'ANNULE' ? 'Annulé' : project.statut}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4B2A7B]/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#4B2A7B]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Dates</div>
                        <div className="font-medium text-gray-900">
                          <div>Début: {project.dateDebut ? new Date(project.dateDebut).toLocaleDateString() : 'Non définie'}</div>
                          <div>Fin: {project.dateFin ? new Date(project.dateFin).toLocaleDateString() : 'Non définie'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4B2A7B]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#4B2A7B]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Client</div>
                        <div className="font-medium text-gray-900">
                          {project.client?.nom || project.client?.username || project.clientName || 'Non assigné'}
                        </div>
                        {project.client?.email && (
                          <div className="text-xs text-gray-500">{project.client.email}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Équipe */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
                    <span className="text-sm text-gray-600">{project.developpeurs?.length || 0} membre(s)</span>
                  </div>
                  
                  {project.developpeurs && project.developpeurs.length > 0 ? (
                    <div className="space-y-3">
                      {project.developpeurs.map((dev) => (
                        <div key={dev.id || dev.username} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-[#4B2A7B] text-white flex items-center justify-center text-sm font-semibold">
                            {(dev.nom || dev.username)?.slice(0, 2).toUpperCase() || 'DE'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{dev.nom || dev.username}</div>
                            <div className="text-sm text-gray-600">{dev.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucun développeur assigné</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
