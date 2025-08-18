// app/components/ProjectForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, ArrowLeft, Save, FolderOpen, Users } from 'lucide-react';
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

    // Charger clients + développeurs (un seul useEffect)
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
            toast.success(mode === 'create' ? 'Projet créé avec succès !' : 'Projet modifié avec succès !');
            navigate('/chef/projects');
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                `Erreur lors de la ${mode === 'create' ? 'création' : 'modification'} du projet`;
            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/chef/projects')}
                    className="flex items-center space-x-2 text-[#4B2A7B] hover:text-[#5B3A8B] mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour aux projets</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Créer un nouveau projet' : 'Modifier le projet'}
                </h1>
                <p className="text-gray-600">
                    {mode === 'create'
                        ? 'Remplissez les informations pour créer un nouveau projet'
                        : 'Modifiez les informations du projet'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Titre et Description */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                            Titre du projet *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FolderOpen className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="titre"
                                name="titre"
                                value={formData.titre}
                                onChange={handleInputChange}
                                placeholder="Nom du projet"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Décrivez le projet..."
                            rows={4}
                            required
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Type et Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Type de projet
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                        >
                            <option value="Delivery">Delivery</option>
                            <option value="TMA">TMA</option>
                            <option value="Interne">Interne</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                            Client *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                id="clientId"
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                            >
                                <option value={0}>Sélectionner le Client</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-2">
                            Date de début *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="dateDebut"
                                name="dateDebut"
                                value={formData.dateDebut}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-2">
                            Date de fin *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="dateFin"
                                name="dateFin"
                                value={formData.dateFin ?? ''}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent bg-white text-black"
                            />
                        </div>
                    </div>
                </div>

                <DeveloperMultiSelect
                    options={developers.map(d => ({ id: d.id, label: d.username }))}
                    value={formData.developpeurIds ?? []}
                    onChange={(ids) => setFormData(prev => ({ ...prev, developpeurIds: ids }))}
                />


                {/* Boutons */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/chef/projects')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={props.loading}
                        className="px-6 py-3 bg-[#4B2A7B] text-white rounded-lg hover:bg-[#5B3A8B] focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {props.loading ? (
                            <>
                                <Activity className="h-4 w-4 animate-spin" />
                                <span>{mode === 'create' ? 'Création...' : 'Modification...'}</span>
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
        </div>
    );
}
