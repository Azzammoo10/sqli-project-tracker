// app/routes/admin/settings.tsx
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Activity,
  Edit,
  Mail,
  ShieldCheck,
  User as UserIcon, // 👈 icône renommée
  Globe,
  BadgeCheck,
  Save,
  Phone,
  Briefcase,
  ChevronRight,
  Upload,
  X,
  Lock,
  Languages,
  Building2,
  Crown,
  Calendar as Cal,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavAdmin from '../../components/NavAdmin';
import { authService } from '../../services/api';
import { userService, type Role, type Department, type User } from '../../services/userService';
import toast from 'react-hot-toast';

type Profile = {
  id: number;
  username: string;
  email: string;
  role: Role | string;
  nom?: string;
  prenom?: string;
  jobTitle?: string;
  language?: string;
  skills?: string[];
  actif?: boolean;
  createdAt?: string;
  avatarUrl?: string;
  emails?: string[];
  statusSince?: string;
  department?: Department;
  phone?: string;
};

const LANGS = ['fr', 'en', 'ar'] as const;
const DEPTS: Department[] = ['ADMINISTRATION', 'DEVELOPPEMENT', 'EXTERNE', 'MANAGEMENT'];

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border border-purple-200',
  CHEF_DE_PROJET: 'bg-blue-100 text-blue-800 border border-blue-200',
  DEVELOPPEUR: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CLIENT: 'bg-amber-100 text-amber-800 border border-amber-200',
  STAGIAIRE: 'bg-slate-100 text-slate-800 border border-slate-200',
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{children}</span>
);

const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const SectionCard: React.FC<{
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, right, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
    {children}
  </label>
);

export default function AdminSettings() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Onglets
  const [tab, setTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Édition
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const origRef = useRef<Partial<Profile>>({}); // pour Cancel

  // Avatar local
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const enriched: Profile = {
          ...me,
          emails: [me.email],
          language: me.language ?? 'fr',
          skills: me.skills ?? ['PMP', 'Agile'],
          jobTitle: me.jobTitle ?? (me.role === 'ADMIN' ? 'Administrateur' : undefined),
          actif: me.actif ?? true,
          department: me.department ?? 'DEVELOPPEMENT',
          phone: me.phone ?? '',
          createdAt: me.dateCreation ?? undefined,
        };
        setUser(enriched);
        setForm(enriched);
        origRef.current = enriched;
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/auth/login';
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const validateEmail = (v?: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v?: string) => !v || /^[0-9+\s()-]{6,20}$/.test(v);

  const emailOK = useMemo(() => validateEmail(form.email), [form.email]);
  const phoneOK = useMemo(() => validatePhone(form.phone), [form.phone]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(origRef.current), [form]);

  const handleSave = async () => {
    if (!user) return;
    if (!emailOK) {
      toast.error('Email invalide');
      return;
    }
    if (!phoneOK) {
      toast.error('Téléphone invalide');
      return;
    }

    try {
      const updated = await userService.updateUser(user.id, {
        nom: form.nom,
        email: form.email,
        role: (user.role as Role) ?? 'CLIENT',
        jobTitle: form.jobTitle,
        department: form.department,
        phone: form.phone,
        actif: form.actif,
      });
      const merged: Profile = { ...user, ...updated };
      setUser(merged);
      setForm(merged);
      origRef.current = merged;
      setIsEditing(false);
      toast.success('Profil mis à jour ✅');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setForm(origRef.current);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const pickAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={user ?? undefined} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
            <p className="text-gray-600">Chargement du profil…</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const roleClass =
    roleColor[String(user.role).toUpperCase()] ??
    'bg-slate-100 text-slate-800 border border-slate-200';

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <NavAdmin user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-auto">
          {/* Header visuel */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#4B2A7B] via-[#6b4bb1] to-[#9c7ae7]" />
            <div className="px-6 -mt-10">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <img
                      src={avatarPreview ?? user.avatarUrl ?? '/avatar.svg'}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover bg-gray-100 border-4 border-white shadow"
                    />
                    {isEditing && (
                      <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-white border p-1 shadow hover:bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) pickAvatar(f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900">
                        {user.nom ? `${user.nom} ${user.prenom ?? ''}` : user.username}
                      </h1>
                      <Badge className={roleClass}>
                        <Crown className="w-3 h-3" /> {String(user.role)}
                      </Badge>
                      <Badge
                        className={
                          user.actif
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }
                      >
                        <BadgeCheck className="w-3 h-3" /> {user.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </span>
                      {user.createdAt && (
                        <span className="inline-flex items-center gap-1">
                          <Cal className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {(user.language ?? 'fr').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={!dirty}
                          className="px-4 py-2 rounded-md bg-green-600 text-white hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 rounded-md bg-white text-gray-700 border hover:bg-gray-50 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-md bg-[#4B2A7B] text-white hover:opacity-90 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Petits KPIs */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <KPI label="Role" value={String(user.role)} icon={<ShieldCheck className="w-4 h-4" />} />
                  <KPI label="Department" value={user.department ?? '—'} icon={<Building2 className="w-4 h-4" />} />
                  <KPI label="Status" value={user.actif ? 'Active' : 'Inactive'} icon={<BadgeCheck className="w-4 h-4" />} />
                  <KPI label="Projects visibility" value="Admin scope" icon={<UserIcon className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 mt-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-1 flex gap-1 w-full md:w-auto">
              {[
                { key: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
                { key: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
                { key: 'preferences', label: 'Preferences', icon: <Languages className="w-4 h-4" /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition ${
                    tab === t.key ? 'bg-[#4B2A7B] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {tab === 'profile' && (
              <SectionCard title="Personal Information" description="Met à jour les informations visibles côté administration.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Full Name">
                    <input
                      className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black"
                      readOnly={!isEditing}
                      value={form.nom ? `${form.nom} ${form.prenom ?? ''}` : user.username}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Ex: Aya El Amrani"
                    />
                  </Field>

                  <Field label="Job Title">
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black"
                        readOnly={!isEditing}
                        value={form.jobTitle ?? ''}
                        onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                        placeholder="Administrateur / Chef de projet / Développeur"
                      />
                    </div>
                  </Field>

                  <Field label="Email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className={`w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 border ${
                          emailOK ? 'border-gray-200' : 'border-red-300'
                        } text-black`}
                        readOnly={!isEditing}
                        value={form.email ?? ''}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    {!emailOK && <p className="mt-1 text-xs text-red-600">Email invalide</p>}
                  </Field>

                  <Field label="Phone">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className={`w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 border ${
                          phoneOK ? 'border-gray-200' : 'border-red-300'
                        } text-black`}
                        readOnly={!isEditing}
                        value={form.phone ?? ''}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+212 6 12 34 56 78"
                      />
                    </div>
                    {!phoneOK && <p className="mt-1 text-xs text-red-600">Format téléphone invalide</p>}
                  </Field>

                  <Field label="Department">
                    <select
                      className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black"
                      disabled={!isEditing}
                      value={form.department ?? 'DEVELOPPEMENT'}
                      onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
                    >
                      {DEPTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Status">
                    {isEditing ? (
                      <button
                        onClick={() => setForm({ ...form, actif: !form.actif })}
                        className={`px-3 py-2 rounded-md text-sm border ${
                          form.actif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4" /> {form.actif ? 'Actif' : 'Inactif'}
                        </div>
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border ${
                          user.actif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <BadgeCheck className="w-4 h-4" /> {user.actif ? 'Actif' : 'Inactif'}
                      </span>
                    )}
                  </Field>
                </div>

                {/* Emails secondaires */}
                <div className="mt-6">
                  <div className="text-sm font-semibold text-black mb-3">Email addresses</div>
                  <div className="space-y-2">
                    {(user.emails ?? [user.email]).map((e, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="p-2 rounded-full bg-gray-100">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="text-gray-900">{e}</div>
                        <div className="text-xs text-gray-500">• {i === 0 ? 'principal' : 'ajouté récemment'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {tab === 'security' && (
              <SectionCard title="Security" description="Paramètres de sécurité du compte.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Mot de passe</div>
                      <div className="text-sm text-gray-500">Changer le mot de passe de connexion</div>
                    </div>
                    <button
                      className="px-3 py-2 text-sm rounded-md bg-white border hover:bg-gray-50"
                      onClick={() => toast('Connecte ce bouton à ton endpoint de changement de mot de passe.')}
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Sessions & Tokens</div>
                      <div className="text-sm text-gray-500">Révoquer la session en cours</div>
                    </div>
                    <button className="px-3 py-2 text-sm rounded-md bg-white border hover:bg-gray-50" onClick={handleLogout}>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {tab === 'preferences' && (
              <SectionCard title="Preferences" description="Langue et affichage.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Language">
                    <select
                      className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black"
                      disabled={!isEditing}
                      value={form.language ?? 'fr'}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                    >
                      {LANGS.map((l) => (
                        <option key={l} value={l}>
                          {l.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Theme (bientôt)">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-3 py-2 border rounded-md bg-gray-50">Système</span>
                      <span className="px-3 py-2 border rounded-md bg-gray-50">Clair</span>
                      <span className="px-3 py-2 border rounded-md bg-gray-50">Sombre</span>
                    </div>
                  </Field>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Footer sticky (Save/Cancel) */}
          {isEditing && (
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3">
              <div className="text-xs text-gray-500 mr-auto flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> {dirty ? 'Modifications non enregistrées' : 'Aucune modification'}
              </div>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-white text-gray-700 border hover:bg-gray-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!dirty}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* --------- Petits composants utilitaires --------- */
function KPI({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-600">
        {icon ?? <Activity className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );
}
