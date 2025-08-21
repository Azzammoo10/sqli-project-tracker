// app/routes/chef/tasks/CreateTask.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText, 
  Layers, 
  ClipboardList,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import NavChef from '../../../components/NavChef';
import DeveloperMultiSelect from '../../../components/DeveloperMultiSelect';
import { authService } from '../../../services/api';
import { projectService } from '../../../services/projectService';
import { taskService } from '../../../services/taskService';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';

type Statut = 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
type Priorite = 'BASSE' | 'MOYENNE' | 'ELEVEE';

export default function CreateTask() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        titre: '',
        description: '',
        dateDebut: '',
        dateFin: '',
        statut: 'NON_COMMENCE' as Statut,
        priorite: 'MOYENNE' as Priorite,
        plannedHours: 8,
        projectId: '' as any,
        developpeurIds: [] as number[], // Changé pour supporter plusieurs développeurs
    });

    const [projects, setProjects] = useState<any[]>([]);
    const [developers, setDevelopers] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                console.log('Chargement des données...');
                const u = await authService.getCurrentUser();
                setUser(u);
                console.log('Utilisateur chargé:', u);
                
                // Projets du chef
                const myProjects = await projectService.getProjectsByChef();
                setProjects(myProjects ?? []);
                console.log('Projets chargés:', myProjects);
                
                // Développeurs
                const devs = await userService.getUsersByRole('DEVELOPPEUR');
                setDevelopers(devs ?? []);
                console.log('Développeurs chargés:', devs);
            } catch (e) {
                console.error('Erreur détaillée:', e);
                toast.error('Erreur lors du chargement des données');
            }
        })();
    }, []);

    const valid = useMemo(() => {
        const okTitre = form.titre.trim().length >= 3;
        const okDates = form.dateDebut && form.dateFin && new Date(form.dateFin) >= new Date(form.dateDebut);
        const okProject = !!form.projectId;
        const okDevs = form.developpeurIds.length > 0; // Au moins un développeur
        return okTitre && okDates && okProject && okDevs;
    }, [form]);

    // Message d'aide pour la sélection multiple
    const getDeveloperHelpText = () => {
        if (form.developpeurIds.length === 0) {
            return "Sélectionnez au moins un développeur";
        } else if (form.developpeurIds.length === 1) {
            const dev = developers.find(d => d.id === form.developpeurIds[0]);
            return `Tâche assignée à ${dev?.username || 'un développeur'}`;
        } else {
            return `Tâche assignée à ${form.developpeurIds.length} développeurs`;
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid || submitting) return;

        setSubmitting(true);
        try {
            // Pour chaque développeur sélectionné, créer une tâche
            const promises = form.developpeurIds.map(developpeurId => {
                const payload = {
                    titre: form.titre.trim(),
                    description: form.description.trim() || undefined,
                    dateDebut: form.dateDebut,
                    dateFin: form.dateFin,
                    statut: form.statut,
                    priorite: form.priorite,
                    plannedHours: form.plannedHours,
                    projectId: Number(form.projectId),
                    developpeurId: developpeurId, // Un développeur par tâche
                    effectiveHours: 0,
                    remainingHours: form.plannedHours,
                    progression: 0
                };
                return taskService.createTask(payload);
            });

            await Promise.all(promises);
            const devCount = form.developpeurIds.length;
            const message = devCount === 1 
                ? 'Tâche créée avec succès' 
                : `${devCount} tâches créées avec succès (une par développeur)`;
            toast.success(message);
            navigate('/chef/tasks');
        } catch (error: any) {
            console.error('Erreur création tâche:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de la création de la tâche');
        } finally {
            setSubmitting(false);
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'plannedHours' ? Number(value) : value,
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

    // ✅ Classes communes pour inputs / selects / textarea (couleurs visibles)
    const fieldBase =
      'block w-full pl-9 pr-3 py-3 rounded-lg border text-gray-900 placeholder:text-gray-600 ' +
      'bg-gray-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent focus:bg-white';

    const fieldBaseNoIcon =
      'block w-full px-3 py-3 rounded-lg border text-gray-900 placeholder:text-gray-600 ' +
      'bg-gray-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent focus:bg-white';

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          {/* Bannière */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div className="relative flex items-center justify-between gap-4">
                <button
                  onClick={() => navigate('/chef/tasks')}
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Retour</span>
                </button>

                <div className="text-right">
                  <h1 className="text-3xl font-bold tracking-tight">Créer une tâche</h1>
                  <p className="text-white/90 text-lg">
                    Renseignez les informations puis enregistrez
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Carte/formulaire élargi pour matcher la page “Créer un projet” */}
          <div className="px-6 pb-10">
            <div className="mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-sm p-6 lg:p-10">
              <form onSubmit={submit} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Titre *</label>
                  <div className="relative">
                    <FileText className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      name="titre"
                      value={form.titre}
                      onChange={onChange}
                      placeholder="Ex: Implémenter JWT"
                      className={fieldBase}
                      required
                    />
                  </div>
                </div>

                {/* Projet */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Projet *</label>
                  <div className="relative">
                    <Layers className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                    <select
                      name="projectId"
                      value={form.projectId}
                      onChange={onChange}
                      className={fieldBase}
                      required
                    >
                      <option value="" disabled>— Sélectionner un projet —</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.titre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Développeurs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Développeurs *</label>
                  <DeveloperMultiSelect
                    options={developers.map(d => ({ id: d.id, label: d.username || d.nom || `Développeur #${d.id}` }))}
                    value={form.developpeurIds}
                    onChange={(selectedIds) => setForm(prev => ({ ...prev, developpeurIds: selectedIds }))}
                    placeholder="Sélectionner les développeurs"
                  />
                  <p className="text-xs text-gray-500 mt-1">{getDeveloperHelpText()}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Date début *</label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="date"
                        name="dateDebut"
                        value={form.dateDebut}
                        onChange={onChange}
                        className={fieldBase}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Date fin *</label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="date"
                        name="dateFin"
                        value={form.dateFin}
                        onChange={onChange}
                        className={fieldBase}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Statut & Priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Statut</label>
                    <div className="relative">
                      <Clock className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                      <select
                        name="statut"
                        value={form.statut}
                        onChange={onChange}
                        className={fieldBase}
                      >
                        <option value="NON_COMMENCE">Non commencé</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="BLOQUE">Bloqué</option>
                        <option value="TERMINE">Terminé</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Priorité</label>
                    <div className="relative">
                      <AlertTriangle className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                      <select
                        name="priorite"
                        value={form.priorite}
                        onChange={onChange}
                        className={fieldBase}
                      >
                        <option value="BASSE">Basse</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="ELEVEE">Élevée</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Heures planifiées */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Heures planifiées</label>
                  <div className="relative">
                    <Clock className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      name="plannedHours"
                      value={form.plannedHours}
                      onChange={onChange}
                      min={0}
                      placeholder="8"
                      className={fieldBase}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <div className="relative">
                    <ClipboardList className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      rows={4}
                      placeholder="Détails de la tâche…"
                      className={fieldBase}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/chef/tasks')}
                    className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !valid}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors
                      ${submitting || !valid
                        ? 'bg-[#4B2A7B]/60 text-white cursor-not-allowed'
                        : 'bg-[#4B2A7B] hover:bg-[#5B3A8B] text-white focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2'}`}
                  >
                    {submitting ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        <span>Création…</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Créer la tâche</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
