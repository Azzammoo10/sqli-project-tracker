import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Activity,
    ArrowLeft,
    Calendar,
    Users,
    Target,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import NavClient from '../../components/NavClient';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '~/services/api';
import { clientService, type ClientProject } from '~/services/clientService';
import toast from 'react-hot-toast';

/* -------------------------------- Helpers -------------------------------- */

const cn = (...classes: Array<string | false | undefined>) =>
    classes.filter(Boolean).join(' ');

const formatDate = (date?: string) => {
    if (!date) return '—';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const STATUS_STYLES: Record<
    string,
    { chip: string; icon: JSX.Element; label: string }
> = {
    EN_COURS: {
        chip: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className="w-4 h-4" />,
        label: 'En cours',
    },
    TERMINE: {
        chip: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Terminé',
    },
    EN_ATTENTE: {
        chip: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'En attente',
    },
    ANNULE: {
        chip: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Annulé',
    },
};

const TYPE_STYLES: Record<string, string> = {
    Delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    TMA: 'bg-blue-50 text-blue-700 border-blue-200',
    Interne: 'bg-gray-50 text-gray-700 border-gray-200',
};

function StatusBadge({ statut }: { statut?: string }) {
    const s = statut ? STATUS_STYLES[statut] : undefined;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                    s?.chip || 'bg-gray-100 text-gray-800 border-gray-200'
            )}
        >
            {s?.icon ?? <Clock className="w-4 h-4" />}
            {s?.label ?? (statut || '—')}
        </span>
    );
}

function TypeBadge({ type }: { type?: string }) {
    const chip = (type && TYPE_STYLES[type]) || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
        <span className={cn('px-3 py-1.5 rounded-full text-sm font-medium border', chip)}>
      {type || '—'}
    </span>
    );
}

function StatCard({
                      label,
                      value,
                      color,
                      bg,
                  }: {
    label: string;
    value: number | undefined;
    color: string;
    bg: string;
}) {
    return (
        <div className={cn('text-center rounded-lg p-4 border', bg, 'border-gray-200')}>
            <p className={cn('text-3xl font-bold', color)}>{value ?? 0}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200" />
            <div className="flex-1 p-6 space-y-6">
                <div className="h-28 rounded-xl bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] animate-pulse" />
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                    <div className="h-40 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
                    <div className="h-36 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
                    <div className="h-52 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------ Main component ----------------------------- */

export default function ClientProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ClientProject | null>(null);
    const [user, setUser] = useState<any>(null);

    const projectId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) ? n : undefined;
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (!cancelled) setUser(userData);

                if (!projectId) {
                    toast.error('Identifiant de projet invalide');
                    navigate('/client/projects');
                    return;
                }

                const projects = await clientService.getClientProjects();
                const found = projects.find((p) => p.id === projectId);
                if (!cancelled) {
                    if (found) {
                        setProject(found);
                    } else {
                        toast.error('Projet non trouvé');
                        navigate('/client/projects');
                    }
                }
            } catch (e) {
                if (!cancelled) toast.error("Erreur lors du chargement du projet");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [projectId, navigate]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/auth/login');
            toast.success('Déconnexion réussie');
        } catch {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    if (loading) return <Skeleton />;

    if (!project) {
        return (
            <div className="flex h-screen bg-gray-100">
                <NavClient user={user} onLogout={handleLogout} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-600">Projet non trouvé.</p>
                </div>
            </div>
        );
    }

    const progress = Math.max(0, Math.min(100, Math.round(project.progression ?? 0)));

    return (
        <ProtectedRoute allowedRoles={['CLIENT']}>
            <div className="flex h-screen bg-gray-100">
                <NavClient user={user} onLogout={handleLogout} />

                <main className="flex-1 overflow-auto">
                    {/* ---- Header ---- */}
                    <div className="p-6">
                        <div className="relative rounded-xl text-white p-6 shadow-lg bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                            <div
                                className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                                style={{
                                    background:
                                        'radial-gradient(1200px 300px at 10% -10%, #ffffff 0%, transparent 60%)',
                                }}
                            />
                            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate('/client/projects')}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                                        aria-label="Retour"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-white" />
                                    </button>
                                    <div className="w-12 h-12 rounded-xl bg-white/20 grid place-items-center">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">{project.titre}</h1>
                                        <p className="text-white/85 text-sm">Détails du projet</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge statut={project.statut} />
                                    <TypeBadge type={project.type} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---- Content ---- */}
                    <div className="px-6 pb-10">
                        <div className="max-w-5xl mx-auto space-y-8">
                            {/* Infos générales */}
                            <section className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Informations générales</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm text-gray-500 font-medium mb-1">Description</h3>
                                        <p className="text-gray-800">{project.description || '—'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-500 font-medium mb-1">Type</h3>
                                        <TypeBadge type={project.type} />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <h3 className="text-sm text-gray-500">Date de début</h3>
                                            <p className="text-gray-800">{formatDate(project.dateDebut)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Target className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <h3 className="text-sm text-gray-500">Date de fin</h3>
                                            <p className="text-gray-800">{formatDate(project.dateFin)}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Progression */}
                            <section className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Progression</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Avancement global</span>
                                        <span
                                            className={cn(
                                                'text-xl font-bold',
                                                progress >= 100 ? 'text-green-600' : 'text-indigo-600'
                                            )}
                                        >
                      {progress}%
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                progress >= 100 ? 'bg-green-500' : 'bg-indigo-600'
                                            )}
                                            style={{ width: `${progress}%` }}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={progress}
                                            role="progressbar"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Équipe */}
                            {project.developpeurs?.length ? (
                                <section className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Équipe de développement</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {project.developpeurs.map((dev) => {
                                            const initials =
                                                dev?.nom?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '—';
                                            return (
                                                <div
                                                    key={dev.id}
                                                    className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="w-12 h-12 bg-indigo-700 text-white rounded-full grid place-items-center font-semibold">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-800 font-medium">{dev.nom || '—'}</p>
                                                        <p className="text-sm text-gray-500">{dev.jobTitle || 'Développeur'}</p>
                                                        <p className="text-xs text-gray-400">{dev.email || ''}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : null}

                            {/* Statistiques des tâches */}
                            {typeof project.totalTasks !== 'undefined' && (
                                <section className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Statistiques des tâches</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <StatCard label="Total" value={project.totalTasks} color="text-gray-800" bg="bg-gray-50" />
                                        <StatCard label="Terminées" value={project.completedTasks} color="text-green-600" bg="bg-green-50" />
                                        <StatCard label="En cours" value={project.inProgressTasks} color="text-blue-600" bg="bg-blue-50" />
                                        <StatCard label="En retard" value={project.overdueTasks} color="text-red-600" bg="bg-red-50" />
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
