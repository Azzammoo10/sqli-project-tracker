// app/components/ProjectForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, Save, FolderOpen } from 'lucide-react';
import { userService, type User as AppUser } from '../services/userService';
import { type CreateProjectRequest, type UpdateProjectRequest, type Project } from '~/services/projectService';
import toast from 'react-hot-toast';
import DeveloperMultiSelect from './DeveloperMultiSelect';

// --- Union discriminé: le type de onSubmit dépend du mode ---
interface CreateProps {
  mode: 'create';
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
  loading?: boolean;
  project?: never;
}

interface EditProps {
  mode: 'edit';
  onSubmit: (data: UpdateProjectRequest) => Promise<void>;
  loading?: boolean;
  project: Project;
}

type ProjectFormProps = CreateProps | EditProps;

export default function ProjectForm(props: ProjectFormProps) {
  const { mode, onSubmit } = props;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateProjectRequest>({
    titre: '',
    description: '',
    type: 'Delivery',
    dateDebut: '',
    dateFin: '',
    clientId: 0,
    developpeurIds: [],
  });

  const [clients, setClients] = useState<AppUser[]>([]);
  const [developers, setDevelopers] = useState<AppUser[]>([]);

  // Pré-chargement en mode edit
  useEffect(() => {
    if (mode === 'edit') {
      const p = props.project;
      setFormData({
        titre: p.titre,
        description: p.description ?? '',
        type: p.type,
        dateDebut: p.dateDebut?.split('T')[0] ?? '',
        dateFin: (p.dateFin?.split?.('T')[0]) ?? '',
        clientId: p.client?.id ?? 0,
        developpeurIds: (p.developpeurs ?? []).map(d => d.id),
      });
    }
  }, [mode, props]);

  // Charger clients + développeurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [clientsRes, devsRes] = await Promise.all([
          userService.getUsersByRole('CLIENT'),
          userService.getUsersByRole('DEVELOPPEUR'),
        ]);
        setClients(Array.isArray(clientsRes) ? clientsRes : []);
        setDevelopers(Array.isArray(devsRes) ? devsRes : []);
      } catch (e) {
        console.error('Erreur chargement users', e);
        toast.error("Impossible de charger la liste des utilisateurs");
      }
    };
    loadUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.description || formData.clientId === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        developpeurIds: formData.developpeurIds ?? [], // garde-fou
      } as CreateProjectRequest & UpdateProjectRequest);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        `Erreur lors de la ${mode === 'create' ? 'création' : 'modification'} du projet`;
      toast.error(errorMessage);
      throw error; // Propager l'erreur pour que le parent puisse la gérer
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Section Projet */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Informations du projet</h2>
          <p className="text-xs text-gray-500">Nom, description et type.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-800 mb-2">
              Titre du projet <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 grid place-items-center">
                <FolderOpen className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Ex: Portail Client V2"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-3 text-gray-900 placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
              Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez brièvement le projet…"
              rows={4}
              required
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-900 placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Section Paramètres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-800 mb-2">
            Type de projet
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
          >
            <option value="Delivery">Delivery</option>
            <option value="TMA">TMA</option>
            <option value="Interne">Interne</option>
          </select>
        </div>

        {/* Client */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-800 mb-2">
            Client <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 grid place-items-center">
              <User className="h-5 w-5 text-gray-400" />
            </span>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-3 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
            >
              <option value={0}>Sélectionner le client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Dates */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Planning</h2>
          <p className="text-xs text-gray-500">Définissez la période du projet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Début */}
          <div>
            <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-800 mb-2">
              Date de début <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 grid place-items-center">
                <Calendar className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-3 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
              />
            </div>
          </div>

          {/* Fin */}
          <div>
            <label htmlFor="dateFin" className="block text-sm font-medium text-gray-800 mb-2">
              Date de fin <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 grid place-items-center">
                <Calendar className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin ?? ''}
                onChange={handleInputChange}
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-3 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Développeurs */}
      <div>
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Équipe</h2>
          <p className="text-xs text-gray-500">Assignez un ou plusieurs développeurs.</p>
        </div>
        <DeveloperMultiSelect
          options={developers.map(d => ({ id: d.id, label: d.username }))}
          value={formData.developpeurIds ?? []}
          onChange={(ids) => setFormData(prev => ({ ...prev, developpeurIds: ids }))}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/chef/projects')}
          className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={props.loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B2A7B] text-white hover:brightness-110
                     focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {props.loading ? (
            <>
              <Activity className="h-4 w-4 animate-spin" />
              <span>{mode === 'create' ? 'Création…' : 'Modification…'}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{mode === 'create' ? 'Créer le projet' : 'Modifier le projet'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
