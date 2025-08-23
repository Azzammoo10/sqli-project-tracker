import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Activity,
  ArrowLeft,
  Save,
  Phone,
  Briefcase,
  Building2,
} from 'lucide-react';
import NavAdmin from '../../../components/NavAdmin';
import ProtectedRoute from '~/components/ProtectedRoute';
import { authService } from '~/services/api';
import PasswordInput from '../../../components/PasswordInput';

import {
  userService,
  type CreateUserRequestBackend,
  type Role,
  type Department,
} from '../../../services/userService';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const navigate = useNavigate();
  const [me, setMe] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // === Formulaire minimal et 100% compatible DTO backend ===
  const [form, setForm] = useState<CreateUserRequestBackend>({
    nom: '',
    email: '',
    motDePasse: '',
    role: 'DEVELOPPEUR',
    jobTitle: '',
    department: 'DEVELOPPEMENT',
    phone: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getCurrentUser();
        setMe(u);
      } catch {
        toast.error('Erreur lors du chargement des données');
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Activer le bouton uniquement si les champs requis sont OK
  const valid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const passOk = form.motDePasse.trim().length >= 6; // laisse @StrongPassword décider du reste côté back
    const nomOk = form.nom.trim().length > 0;
    return emailOk && passOk && nomOk;
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Veuillez remplir les champs requis correctement.');
      return;
    }
    setSubmitting(true);
    try {
      // Debug: afficher la valeur du rôle avant envoi
      console.log('Role sélectionné dans le formulaire:', form.role);
      console.log('Type du rôle:', typeof form.role);
      
      // On envoie tel quel, sans transformation
      const payload: CreateUserRequestBackend = {
        nom: form.nom.trim(),
        email: form.email.trim(),
        motDePasse: form.motDePasse,
        role: form.role as Role,
        jobTitle: form.jobTitle?.trim() || undefined,
        department: form.department as Department,
        phone: form.phone?.trim() || undefined,
      };
      
      // Debug: afficher le payload complet
      console.log('Payload envoyé au backend:', payload);
      
      await userService.createUser(payload);
      toast.success('Utilisateur créé avec succès !');
      navigate('/admin/users');
    } catch (error: any) {
      // Affiche le message @BeanValidation / @StrongPassword si présent
      const apiMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (Array.isArray(error?.response?.data?.errors) && error.response.data.errors[0]) ||
        "Erreur lors de la création de l'utilisateur";
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
                  <h1 className="text-3xl font-bold tracking-tight">Créer un utilisateur</h1>
                  <p className="text-white/90 text-lg">Renseigne les informations, puis enregistre</p>
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
                {/* Nom complet */}
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
                      placeholder="Ex : Aya Ouahi"
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Le username sera généré automatiquement par le serveur (ex : <em>aya.ouahi‑ITxxxx</em>).
                  </p>
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
                      placeholder="exemple@domaine.com"
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Mot de passe (min. 6, règles back) <span className="text-rose-600">*</span>
                  </label>
                  <PasswordInput
                    id="motDePasse"
                    name="motDePasse"
                    value={form.motDePasse}
                    onChange={(val) => setForm(prev => ({ ...prev, motDePasse: val }))}
                    placeholder="🪄 Générer, 👁 voir, 📋 copier"
                  />
                  <p className="text-xs text-gray-500 mt-1">La politique exacte est validée côté serveur.</p>
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
                    className="w-full px-3 py-3 rounded-lg bg-white border border-gray-300
                               text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
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
                      value={form.department ?? 'DEVELOPPEMENT'}
                      onChange={onChange}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
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
                      value={form.jobTitle ?? ''}
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
                      value={form.phone ?? ''}
                      onChange={onChange}
                      placeholder="+212 6 12 34 56 78"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300
                                 text-gray-900 placeholder:text-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    />
                  </div>
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
                        <span>Création…</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Créer l’utilisateur</span>
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
