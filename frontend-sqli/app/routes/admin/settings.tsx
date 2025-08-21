// app/routes/admin/settings.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Mail, User as UserIcon, BadgeCheck, Save, Phone, Briefcase,
  Upload, X, Globe, Building2, Crown, Calendar as Cal, Edit
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import NavAdmin from '../../components/NavAdmin';
import { authService } from '../../services/api';
import { userService, type Role, type Department } from '../../services/userService';
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

type Profile = {
  id: number;
  username: string;
  email: string;
  role: Role | string;
  nom?: string;
  prenom?: string;
  jobTitle?: string;
  language?: string;
  actif?: boolean;
  createdAt?: string;
  avatarUrl?: string;
  emails?: string[];
  department?: Department;
  phone?: string;
};

const DEPTS: Department[] = ['ADMINISTRATION', 'DEVELOPPEMENT', 'EXTERNE', 'MANAGEMENT'];

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border border-purple-200',
  CHEF_DE_PROJET: 'bg-blue-100 text-blue-800 border border-blue-200',
  DEVELOPPEUR: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CLIENT: 'bg-amber-100 text-amber-800 border border-amber-200',
  STAGIAIRE: 'bg-slate-100 text-slate-800 border border-slate-200',
};

const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const SectionCard = ({
  title, description, right, children,
}: { title: string; description?: string; right?: React.ReactNode; children: React.ReactNode }) => (
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
    const navigate = useNavigate();

    const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Vue / Édition
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const origRef = useRef<Partial<Profile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const enriched: Profile = {
          ...me,
          emails: [me.email],
          language: me.language ?? 'fr',
          jobTitle: me.jobTitle ?? (me.role === 'ADMIN' ? 'Administrateur' : undefined),
          actif: me.actif ?? true,
          department: me.department ?? 'DEVELOPPEMENT',
          phone: me.phone ?? '',
          createdAt: me.dateCreation ?? undefined,
        };
        setUser(enriched);
        setForm(enriched);
        origRef.current = enriched;
      } catch {
        toast.error('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateEmail = (v?: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v?: string) => !v || /^[0-9+\s()-]{6,20}$/.test(v);
  const emailOK = useMemo(() => validateEmail(form.email), [form.email]);
  const phoneOK = useMemo(() => validatePhone(form.phone), [form.phone]);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(origRef.current), [form]);

  const handleSave = async () => {
    if (!user) return;
    if (!isEditing) return toast.error('Clique sur Edit pour modifier.');
    if (!emailOK) return toast.error('Email invalide');
    if (!phoneOK) return toast.error('Téléphone invalide');

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
      setAvatarPreview(null);
      setIsEditing(false);
      toast.success('Profil mis à jour ✅');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setForm(origRef.current);
    setAvatarPreview(null);
    setIsEditing(false);
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

  const pickAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
    setIsEditing(true); // tu as cliqué pour changer, on bascule en édition
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <NavAdmin user={user ?? undefined} />
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
    (roleColor[String(user.role).toUpperCase()] ?? 'bg-slate-100 text-slate-800 border border-slate-200');

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gradient-to-b from-[#f6f4fb] to-[#fbfcfe]">
        <NavAdmin user={user} onLogout={handleLogout}  />

        <div className="flex-1 overflow-auto">
          {/* Header harmonisé (même mauve que le reste) */}
          <div className="p-6">
            <div className="w-full">
              <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={avatarPreview ?? user.avatarUrl ?? '/avatar.svg'}
                        alt="avatar"
                        className="w-14 h-14 rounded-full object-cover bg-gray-100 ring-4 ring-white/20"
                      />
                      <label
                        className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-white/95 text-[#1F1B2E] border p-1 shadow hover:bg-white"
                        title="Changer l’avatar"
                      >
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden"
                               onChange={(e) => { const f = e.target.files?.[0]; if (f) pickAvatar(f); }} />
                      </label>
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold tracking-tight">
                        {user.nom ? `${user.nom} ${user.prenom ?? ''}` : user.username}
                      </h1>
                      <div className="mt-1 text-white/85 flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {user.email}
                        </span>
                        {user.createdAt && (
                          <span className="inline-flex items-center gap-1">
                            <Cal className="w-4 h-4" /> {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-4 h-4" /> {(user.language ?? 'fr').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={roleClass}>
                      <Crown className="w-3 h-3" /> {String(user.role)}
                    </Badge>
                    <Badge className={user.actif
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'}>
                      <BadgeCheck className="w-3 h-3" /> {user.actif ? 'Actif' : 'Inactif'}
                    </Badge>

                    {/* 🔘 Boutons : soit Edit, soit Cancel+Save */}
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-2 px-3 py-2 rounded-md bg-[#4B2A7B] text-white hover:brightness-110 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    ) : (
                      <div className="ml-2 flex items-center gap-2">
                        <button
                          onClick={handleCancel}
                          className="px-3 py-2 rounded-md bg-white text-gray-800 border hover:bg-gray-50 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!dirty}
                          className="px-3 py-2 rounded-md bg-green-600 text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Petits KPIs */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <KPI label="Role" value={String(user.role)} icon={<UserIcon className="w-4 h-4" />} />
                  <KPI label="Department" value={user.department ?? '—'} icon={<Building2 className="w-4 h-4" />} />
                  <KPI label="Status" value={user.actif ? 'Active' : 'Inactive'} icon={<BadgeCheck className="w-4 h-4" />} />
                  <KPI label="Locale" value={(user.language ?? 'fr').toUpperCase()} icon={<Globe className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire profil uniquement */}
          <div className="px-6 pb-8">
            <SectionCard
              title="Personal Information"
              description="Mets à jour tes informations visibles côté administration."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name">
                  <input
                    className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
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
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black
                                 focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
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
                      } text-black focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent`}
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
                      } text-black focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent`}
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
                    className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-black
                               focus:outline-none focus:ring-2 focus:ring-[#7E56D9] focus:border-transparent"
                    disabled={!isEditing}
                    value={form.department ?? 'DEVELOPPEMENT'}
                    onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
                  >
                    {DEPTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <button
                    disabled={!isEditing}
                    onClick={() => setForm({ ...form, actif: !form.actif })}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      form.actif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" /> {form.actif ? 'Actif' : 'Inactif'}
                    </div>
                  </button>
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* --------- KPIs --------- */
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
