import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Save,
  ClipboardList,
  Calendar,
  Flag,
  User as UserIcon,
  Layers,
  X,
  Plus
} from 'lucide-react';
import ProtectedRoute from '~/components/ProtectedRoute';
import NavChef from '~/components/NavChef';
import { authService } from '~/services/api';
import taskService from '~/services/taskService';
import { userService } from '~/services/userService';
import toast from 'react-hot-toast';

type Form = {
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
  priorite?: 'BASSE' | 'MOYENNE' | 'ELEVEE';
  developpeurId?: number;
};

interface Developer {
  id: number;
  username: string;
  nom?: string;
  email: string;
}

const toDateInput = (s?: string) => {
  if (!s) return '';
  const d = s.length > 10 ? new Date(s) : new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ChefTaskEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({ titre: '' });
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [showDeveloperSelect, setShowDeveloperSelect] = useState(false);
  const [developersLoading, setDevelopersLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setMe(u);

        // Charger la liste des développeurs
        try {
          const devs = await userService.getUsersByRole('DEVELOPPEUR');
          console.log('Developers loaded:', devs);
          setDevelopers(devs);
        } catch (error) {
          console.error('Error loading developers:', error);
          toast.error('Erreur lors du chargement des développeurs');
        } finally {
          setDevelopersLoading(false);
        }

        if (!id) return;
        const task = await taskService.getById(Number(id));
        
        console.log('Task loaded:', task);
        console.log('Task developpeur:', task.developpeur);
        console.log('Task developpeur ID:', task.developpeur?.id);

        setForm({
          titre: task.titre ?? '',
          description: task.description ?? '',
          dateDebut: toDateInput(task.dateDebut),
          dateFin: toDateInput(task.dateFin),
          statut: (task.statut as any) ?? 'NON_COMMENCE',
          priorite: (task.priorite as any) ?? 'MOYENNE',
          developpeurId: task.developpeur?.id,
        });
      } catch (e) {
        console.error(e);
        toast.error('Impossible de charger la tâche');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      
      // Mettre à jour les informations de base de la tâche
      await taskService.update(Number(id), {
        titre: form.titre,
        description: form.description,
        dateDebut: form.dateDebut || undefined,
        dateFin: form.dateFin || undefined,
        statut: form.statut,
        priorite: form.priorite,
      });

      // Gérer l'assignation du développeur
      if (form.developpeurId) {
        await taskService.assignTask(Number(id), form.developpeurId);
      } else {
        // Si aucun développeur n'est sélectionné, on peut utiliser une méthode pour retirer l'assignation
        // Note: Le backend devra supporter cette fonctionnalité
        try {
          await taskService.assignTask(Number(id), 0); // ou une autre approche selon le backend
        } catch (error) {
          console.log('Impossible de retirer l\'assignation du développeur');
        }
      }

      toast.success('Tâche mise à jour ✅');
      navigate('/chef/tasks');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const addDeveloper = (developerId: number) => {
    setForm(prev => ({
      ...prev,
      developpeurId: developerId
    }));
    setShowDeveloperSelect(false);
  };

  const removeDeveloper = () => {
    setForm(prev => ({
      ...prev,
      developpeurId: undefined
    }));
  };

  const changeDeveloper = (developerId: number) => {
    setForm(prev => ({
      ...prev,
      developpeurId: developerId
    }));
    setShowDeveloperSelect(false);
  };

  const getSelectedDevelopers = () => {
    console.log('getSelectedDevelopers - form.developpeurId:', form.developpeurId);
    console.log('getSelectedDevelopers - developers:', developers);
    if (!form.developpeurId) return [];
    const selected = developers.filter(dev => dev.id === form.developpeurId);
    console.log('getSelectedDevelopers - selected:', selected);
    return selected;
  };

  const getAvailableDevelopers = () => {
    // Retourner tous les développeurs sauf celui actuellement sélectionné
    return developers.filter(dev => dev.id !== form.developpeurId);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavChef user={me} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavChef user={me} />
        <div className="flex-1 overflow-auto">
          {/* Bandeau harmonisé */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-5 shadow-md bg-[#372362]">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                style={{ background: 'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)' }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/10 p-2">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Modifier la tâche</h1>
                    <p className="text-white/85">Mettez à jour les informations de la tâche</p>
                  </div>
                </div>
                <Link
                  to="/chef/tasks"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition text-white text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </Link>
              </div>
            </div>
          </div>

          {/* Formulaire – carte élargie, champs avec icônes */}
          <div className="px-6 pb-10">
            <form
              onSubmit={submit}
              className="mx-auto max-w-4xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 space-y-6"
            >
              {/* Titre + description */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-800">Titre *</label>
                  <div className="relative mt-1">
                    <Layers className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      placeholder="Ex: Implémentation authentification"
                      value={form.titre}
                      onChange={(e) => setForm({ ...form, titre: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Description</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                    placeholder="Détails, critères d'acceptation, liens, etc."
                    value={form.description ?? ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-800">Date de début</label>
                  <div className="relative mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      value={form.dateDebut ?? ''}
                      onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Date de fin</label>
                  <div className="relative mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      value={form.dateFin ?? ''}
                      onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Statut / Priorité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-800">Statut</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                    value={form.statut ?? 'NON_COMMENCE'}
                    onChange={(e) => setForm({ ...form, statut: e.target.value as any })}
                  >
                    <option value="NON_COMMENCE">Non commencé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="BLOQUE">Bloqué</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Priorité</label>
                  <div className="relative mt-1">
                    <Flag className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      value={form.priorite ?? 'MOYENNE'}
                      onChange={(e) => setForm({ ...form, priorite: e.target.value as any })}
                    >
                      <option value="BASSE">Basse</option>
                      <option value="MOYENNE">Moyenne</option>
                      <option value="ELEVEE">Élevée</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Développeurs assignés */}
              <div>
                <label className="text-sm font-medium text-gray-800">Développeurs assignés</label>
                <div className="mt-1 space-y-3">
                                     {/* Développeur actuellement assigné */}
                   {getSelectedDevelopers().length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {getSelectedDevelopers().map((dev) => (
                         <div
                           key={dev.id}
                           className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4B2A7B] text-white rounded-lg text-sm"
                         >
                           <UserIcon className="w-4 h-4" />
                           <span>{dev.username}</span>
                           <button
                             type="button"
                             onClick={removeDeveloper}
                             className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                             title="Retirer le développeur"
                           >
                             <X className="w-3 h-3" />
                           </button>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border">
                       <strong>État actuel :</strong> Aucun développeur assigné à cette tâche
                     </div>
                   )}

                   {/* Boutons d'action */}
                   <div className="flex gap-2">
                     {/* Bouton pour changer/ajouter un développeur */}
                     <div className="relative">
                       <button
                         type="button"
                         onClick={() => setShowDeveloperSelect(!showDeveloperSelect)}
                         className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                       >
                         {form.developpeurId ? (
                           <>
                             <UserIcon className="w-4 h-4" />
                             Changer le développeur
                           </>
                         ) : (
                           <>
                             <Plus className="w-4 h-4" />
                             Ajouter un développeur
                           </>
                         )}
                       </button>

                                           {/* Dropdown des développeurs disponibles */}
                       {showDeveloperSelect && (
                         <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                           {getAvailableDevelopers().length > 0 ? (
                             getAvailableDevelopers().map((dev) => (
                               <button
                                 key={dev.id}
                                 type="button"
                                 onClick={() => changeDeveloper(dev.id)}
                                 className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                               >
                                 <div className="w-8 h-8 rounded-full bg-[#4B2A7B] text-white flex items-center justify-center text-sm font-semibold">
                                   {dev.username.slice(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                   <div className="font-medium text-gray-900">{dev.username}</div>
                                   <div className="text-sm text-gray-500">{dev.email}</div>
                                 </div>
                               </button>
                             ))
                           ) : (
                             <div className="px-4 py-2 text-gray-500 text-sm">
                               Aucun autre développeur disponible
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </div>

                                     {/* Informations de débogage (à retirer en production) */}
                   <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded border">
                     <strong>Debug:</strong> form.developpeurId = {form.developpeurId || 'undefined'} | 
                     developers count = {developers.length} | 
                     selected count = {getSelectedDevelopers().length} |
                     developersLoading = {developersLoading.toString()}
                   </div>

                   {developersLoading ? (
                     <p className="text-sm text-gray-500">
                       Chargement des développeurs...
                     </p>
                   ) : !form.developpeurId ? (
                     <p className="text-sm text-gray-500">
                       Aucun développeur assigné. Cliquez sur "Ajouter un développeur" pour en assigner un.
                     </p>
                   ) : (
                     <p className="text-sm text-gray-500">
                       Le développeur actuellement assigné est affiché ci-dessus. Vous pouvez le retirer ou le changer.
                     </p>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  to="/chef/tasks"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4B2A7B] text-white hover:bg-[#5B3A8B] focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 disabled:opacity-60"
                >
                  {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
