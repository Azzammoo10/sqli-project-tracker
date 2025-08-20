import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Save,
  ClipboardList,
  Calendar,
  Flag,
  Hash,
  User as UserIcon,
  Layers
} from 'lucide-react';
import ProtectedRoute from '~/components/ProtectedRoute';
import NavChef from '~/components/NavChef';
import { authService } from '~/services/api';
import taskService from '~/services/taskService';
import toast from 'react-hot-toast';

type Form = {
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: 'NON_COMMENCE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
  priorite?: 'BASSE' | 'MOYENNE' | 'ELEVEE';
  projectId?: number;
  developpeurId?: number;
};

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

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setMe(u);

        if (!id) return;
        const task = await taskService.getById(Number(id));

        setForm({
          titre: task.titre ?? '',
          description: task.description ?? '',
          dateDebut: toDateInput(task.dateDebut),
          dateFin: toDateInput(task.dateFin),
          statut: (task.statut as any) ?? 'NON_COMMENCE',
          priorite: (task.priorite as any) ?? 'MOYENNE',
          projectId: task.project?.id,
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
      await taskService.update(Number(id), {
        titre: form.titre,
        description: form.description,
        dateDebut: form.dateDebut || undefined,
        dateFin: form.dateFin || undefined,
        statut: form.statut,
        priorite: form.priorite,
        projectId: form.projectId,
        developpeurId: form.developpeurId,
      });
      toast.success('Tâche mise à jour ✅');
      navigate('/chef/tasks');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
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
                    placeholder="Détails, critères d’acceptation, liens, etc."
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

              {/* Références (IDs simples – on garde ta logique) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-800">Projet (ID)</label>
                  <div className="relative mt-1">
                    <Hash className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      value={form.projectId ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, projectId: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Développeur (ID)</label>
                  <div className="relative mt-1">
                    <UserIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      value={form.developpeurId ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, developpeurId: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </div>
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
