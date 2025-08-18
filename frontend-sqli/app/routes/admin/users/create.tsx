import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
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
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={me} onLogout={logout} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => navigate('/admin/users')}
                className="inline-flex items-center gap-2 text-[#4B2A7B] hover:text-[#5B3A8B] mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à la liste des utilisateurs</span>
              </button>

              <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel utilisateur</h1>
              <p className="text-gray-700">Renseignez les informations ci-dessous, puis validez.</p>
            </div>

            <div className="max-w-2xl">
              <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Nom (requis) */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="nom"
                      name="nom"
                      value={form.nom}
                      onChange={onChange}
                      placeholder="Ex: Aya Ouahi"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 text-gray-900 placeholder:text-gray-500 focus:outline-none
                                 focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Le username sera généré automatiquement par le serveur (ex: <em>aya.ouahi-ITxxxx</em>).
                  </p>
                </div>

                {/* Email (requis) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="exemple@domaine.com"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 text-gray-900 placeholder:text-gray-500 focus:outline-none
                                 focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Mot de passe (requis) */}
                  {/* Mot de passe (requis) */}
                  <div>
                      <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-800 mb-2">
                          Mot de passe (min. 10 + aA0@) *
                      </label>
                      <PasswordInput
                          id="motDePasse"
                          name="motDePasse"
                          value={form.motDePasse}
                          onChange={(val) => setForm(prev => ({ ...prev, motDePasse: val }))}
                          placeholder="Clique la baguette pour générer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                          Raccourcis : 🪄 générer • 👁 afficher/masquer • 📋 copier.
                      </p>
                  </div>


                  {/* Rôle & Département */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                      Rôle *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={onChange}
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="DEVELOPPEUR">Développeur</option>
                      <option value="CHEF_DE_PROJET">Chef de projet</option>
                      <option value="ADMIN">Admin</option>
                      <option value="STAGIAIRE">Stagiaire</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-semibold text-gray-800 mb-2">
                      Département
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-500" />
                      </div>
                      <select
                        id="department"
                        name="department"
                        value={form.department ?? 'DEVELOPPEMENT'}
                        onChange={onChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                   text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      >
                        <option value="ADMINISTRATION">Administration</option>
                        <option value="DEVELOPPEMENT">Développement</option>
                        <option value="EXTERNE">Externe</option>
                        <option value="MANAGEMENT">Management</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Poste & Téléphone (optionnels) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-800 mb-2">
                      Intitulé de poste
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        value={form.jobTitle ?? ''}
                        onChange={onChange}
                        placeholder="Ex: Chef de projet"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                   text-gray-900 placeholder:text-gray-500 focus:outline-none
                                   focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone ?? ''}
                        onChange={onChange}
                        placeholder="+212 6 12 34 56 78"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                   text-gray-900 placeholder:text-gray-500 focus:outline-none
                                   focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
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
                        <span>Créer l’utilisateur</span>
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
