import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Activity,
  ArrowLeft,
  Save,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import NavAdmin from '../../../components/NavAdmin';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/api';
import {
  userService,
  type Role,
  type Department,
  type User,
  type UpdateUserRequest,
} from '../../../services/userService';
import toast from 'react-hot-toast';

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = Number(id);

  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State de formulaire pour l'édition (pas de password ici)
  const [form, setForm] = useState<Required<Pick<User,
    'nom' | 'email' | 'role' | 'department' | 'jobTitle' | 'phone' | 'actif'
  >>>({
    nom: '',
    email: '',
    role: 'DEVELOPPEUR',
    department: 'DEVELOPPEMENT',
    jobTitle: '',
    phone: '',
    actif: true,
  });

  // Charger mes infos + l'utilisateur à éditer
  useEffect(() => {
    (async () => {
      try {
        const [uMe, u] = await Promise.all([
          authService.getCurrentUser(),
          userService.getUserById(userId),
        ]);
        setMe(uMe);

        // Pré-remplissage (garde valeurs sûres par défaut)
        setForm({
          nom: u.nom ?? '',
          email: u.email ?? '',
          role: (u.role as Role) ?? 'DEVELOPPEUR',
          department: (u.department as Department) ?? 'DEVELOPPEMENT',
          jobTitle: u.jobTitle ?? '',
          phone: u.phone ?? '',
          actif: u.actif ?? true,
        });
      } catch (e: any) {
        console.error(e);
        toast.error("Impossible de charger l'utilisateur");
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, userId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const valid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const nomOk = form.nom.trim().length > 0;
    return emailOk && nomOk;
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Veuillez remplir les champs requis correctement.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: UpdateUserRequest = {
        nom: form.nom.trim(),
        email: form.email.trim(),
        role: form.role as Role,
        jobTitle: form.jobTitle?.trim() || undefined,
        department: form.department as Department,
        phone: form.phone?.trim() || undefined,
        actif: form.actif,
      };

      await userService.updateUser(userId, payload);
      toast.success('Utilisateur modifié avec succès !');
      navigate('/admin/users');
    } catch (error: any) {
      const apiMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (Array.isArray(error?.response?.data?.errors) && error.response.data.errors[0]) ||
        "Erreur lors de la mise à jour de l'utilisateur";
      toast.error(apiMsg);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
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
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
          <NavAdmin user={me} onLogout={logout} />
          <div className="flex-1 grid place-items-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-3" />
              <p className="text-gray-700">Chargement de l’utilisateur…</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={me} onLogout={logout} />

        <div className="flex-1 overflow-auto">
          {/* HEADER pleine largeur et harmonisé */}
          <div className="p-6">
            <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
              <div className="relative flex items-center justify-between gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Retour</span>
                </button>
                <div className="text-right">
                  <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur</h1>
                  <p className="text-white/90 text-lg">Ajuste les informations, puis enregistre</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM élargi et moderne */}
          <div className="px-6 pb-28">
            <form
              onSubmit={submit}
              className="relative mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white shadow-sm p-6 lg:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="lg:col-span-2">
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Nom complet <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="nom"
                      name="nom"
                      value={form.nom}
                      onChange={onChange}
                      required
                      placeholder="Ex : Aya Ouahi"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      placeholder="exemple@domaine.com"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Rôle */}
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Rôle <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-3 rounded-lg bg-white border border-gray-300 text-gray-900
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="DEVELOPPEUR">Développeur</option>
                    <option value="CHEF_DE_PROJET">Chef de projet</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAGIAIRE">Stagiaire</option>
                  </select>
                </div>

                {/* Département */}
                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Département
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={onChange}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300 text-gray-900
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    >
                      <option value="ADMINISTRATION">Administration</option>
                      <option value="DEVELOPPEMENT">Développement</option>
                      <option value="EXTERNE">Externe</option>
                      <option value="MANAGEMENT">Management</option>
                    </select>
                  </div>
                </div>

                {/* Job title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Intitulé de poste
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      value={form.jobTitle}
                      onChange={onChange}
                      placeholder="Ex : Chef de projet"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+212 6 12 34 56 78"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Statut
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, actif: !f.actif }))}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition
                      ${form.actif
                        ? 'border-green-600 text-green-700 bg-green-50'
                        : 'border-gray-300 text-gray-700 bg-gray-50'}`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {form.actif ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              </div>

              {/* ACTION BAR sticky en bas */}
              <div className="sticky bottom-0 -mx-6 -mb-6 lg:-mx-8 lg:-mb-8">
                <div className="flex justify-end gap-3 border-t border-gray-200 bg-white/80 backdrop-blur px-6 lg:px-8 py-4 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !valid}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2
                      ${submitting || !valid
                        ? 'bg-[#4B2A7B]/60 text-white cursor-not-allowed'
                        : 'bg-[#4B2A7B] hover:bg-[#5B3A8B] text-white'}`}
                  >
                    {submitting ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        <span>Enregistrement…</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
