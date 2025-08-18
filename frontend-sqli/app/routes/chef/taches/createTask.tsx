// src/pages/chef/CreateTask.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Save, Calendar, FileText, Layers, ClipboardList } from 'lucide-react';
import ProtectedRoute from '~/components/ProtectedRoute';
import NavChef from '~/components/NavChef';
import { authService } from '~/services/api';
import { projectService } from '~/services/projectService';
import { taskService } from '~/services/taskService';
import toast from 'react-hot-toast';
import DeveloperMultiSelect, {type DeveloperOption } from '~/components/DeveloperMultiSelect';

type Statut = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE';

export default function CreateTask() {
    const navigate = useNavigate();
    const [me, setMe] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        titre: '',
        description: '',
        dateDebut: '',
        dateFin: '',
        statut: 'A_FAIRE' as Statut,
        priorite: 'MOYENNE' as Priorite,
        plannedHours: 0,
        projectId: '' as any,
    });

    const [projects, setProjects] = useState<any[]>([]);
    const [devOptions, setDevOptions] = useState<DeveloperOption[]>([]);
    const [selectedDevs, setSelectedDevs] = useState<number[]>([]); // multi UI, on prendra le 1er

    useEffect(() => {
        (async () => {
            try {
                const u = await authService.getCurrentUser();
                setMe(u);
                // projets du chef
                const myProjects = await projectService.getProjectsByChef();
                setProjects(myProjects ?? []);
                // développeurs (à adapter à ton endpoint si besoin)
                // ex: /api/users?role=DEVELOPPEUR
                const res = await fetch('/api/users?role=DEVELOPPEUR', { headers: { 'Accept': 'application/json' } });
                const devs = await res.json();
                setDevOptions((devs ?? []).map((d: any) => ({ id: d.id, label: d.username ?? d.nom ?? `dev#${d.id}` })));
            } catch (e) {
                toast.error('Erreur lors du chargement des données');
            }
        })();
    }, []);

    const valid = useMemo(() => {
        const okTitre = form.titre.trim().length >= 3;
        const okDates = form.dateDebut && form.dateFin && new Date(form.dateFin) >= new Date(form.dateDebut);
        const okProject = !!form.projectId;
        const okDev = selectedDevs.length >= 1;
        return okTitre && okDates && okProject && okDev;
    }, [form, selectedDevs]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid) {
            toast.error('Champs requis invalides.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                titre: form.titre.trim(),
                description: form.description?.trim() || undefined,
                dateDebut: form.dateDebut,
                dateFin: form.dateFin,
                statut: form.statut,
                priorite: form.priorite,
                plannedHours: Number(form.plannedHours) || 0,
                projectId: Number(form.projectId),
                developpeurId: selectedDevs[0], // on prend le 1er sélectionné
            };
            await taskService.create(payload);
            toast.success('Tâche créée avec succès !');
            navigate('/chef/tasks');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Erreur lors de la création";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
            <div className="flex h-screen bg-gray-50">
                <NavChef user={me} />

                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        <button
                            onClick={() => navigate('chef/tasks/create')}
                            className="inline-flex items-center gap-2 text-[#4B2A7B] hover:text-[#5B3A8B] mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Retour à la liste des tâches</span>
                        </button>

                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer une tâche</h1>
                        <p className="text-gray-700 mb-6">Renseignez les informations ci-dessous, puis validez.</p>

                        <div className="max-w-2xl">
                            <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-6">
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Titre *</label>
                                    <div className="relative">
                                        <FileText className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                                        <input
                                            name="titre"
                                            value={form.titre}
                                            onChange={onChange}
                                            placeholder="Ex: Implémenter JWT"
                                            className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Projet */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Projet *</label>
                                    <div className="relative">
                                        <Layers className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                                        <select
                                            name="projectId"
                                            value={form.projectId}
                                            onChange={onChange}
                                            className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                            required
                                        >
                                            <option value="" disabled>— Sélectionner un projet —</option>
                                            {projects.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.titre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Développeur via DeveloperMultiSelect */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Développeur *</label>
                                    <DeveloperMultiSelect
                                        options={devOptions}
                                        value={selectedDevs}
                                        onChange={setSelectedDevs}
                                        placeholder="Sélectionner le développeur…"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Astuce : tu peux en sélectionner plusieurs, seul le premier sera envoyé.</p>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Date début *</label>
                                        <div className="relative">
                                            <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                                            <input
                                                type="date"
                                                name="dateDebut"
                                                value={form.dateDebut}
                                                onChange={onChange}
                                                className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Date fin *</label>
                                        <div className="relative">
                                            <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                                            <input
                                                type="date"
                                                name="dateFin"
                                                value={form.dateFin}
                                                onChange={onChange}
                                                className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Statut & Priorité */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Statut</label>
                                        <select
                                            name="statut"
                                            value={form.statut}
                                            onChange={onChange}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                        >
                                            <option value="A_FAIRE">À faire</option>
                                            <option value="EN_COURS">En cours</option>
                                            <option value="TERMINE">Terminé</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Priorité</label>
                                        <select
                                            name="priorite"
                                            value={form.priorite}
                                            onChange={onChange}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                        >
                                            <option value="BASSE">Basse</option>
                                            <option value="MOYENNE">Moyenne</option>
                                            <option value="HAUTE">Haute</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Heures planifiées */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Heures planifiées</label>
                                    <input
                                        type="number"
                                        name="plannedHours"
                                        value={form.plannedHours}
                                        onChange={onChange}
                                        min={0}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                                    <div className="relative">
                                        <ClipboardList className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={onChange}
                                            rows={4}
                                            placeholder="Détails de la tâche…"
                                            className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
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
                </div>
            </div>
        </ProtectedRoute>
    );
}
