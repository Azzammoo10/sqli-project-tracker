import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, BarChart3, ClipboardList, FolderOpen, Users, Plus, TrendingUp, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import NavChef from '../../components/NavChef';
import ProtectedRoute from '../../components/ProtectedRoute';
import apiClient, { authService } from '../../services/api';
import { projectService, type Project } from '~/services/projectService';
import { dashboardService } from '~/services/dashboardService';
import { taskService } from '~/services/taskService';
import toast from 'react-hot-toast';

/** -------------------- Utils -------------------- */
const fmt = new Intl.NumberFormat('fr-FR');
const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const pct = (n?: number) => `${Math.round(clamp01((n ?? 0) / 100) * 100)}%`;

type TaskRow = {
    id: number;
    titre: string;
    projectTitre?: string;
    developpeurUsername?: string;
    statut?: string;
    dateFin?: string | null;
};

type TeamRow = {
    username: string;
    role?: string;
    assignedProjects?: number;
};

type BuildProjectRow = {
    projectId: number;
    titre: string;
    completedTasks: number;
    totalTasks: number;
    completionRate: number; // 0..100
};

type TrendPoint = { label: string; value: number };

export default function ChefDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [buildProjects, setBuildProjects] = useState<BuildProjectRow[]>([]);
    const [team, setTeam] = useState<TeamRow[]>([]);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const [taskStats, setTaskStats] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);

                const [s, build, teamDash, trendData, chefProjects, allTasks, tStats] = await Promise.all([
                    projectService.getProjectStats(),
                    apiClient.get('/analytics/projects/build').then(r => r.data as BuildProjectRow[]),
                    apiClient.get('/analytics/dashboard/team').then(r => r.data as TeamRow[]),
                    dashboardService.getTrendData(),
                    projectService.getProjectsByChef(),
                    taskService.getAll(),
                    taskService.getStats(),
                ]);

                setStats(s);
                setBuildProjects(build ?? []);
                setTeam(teamDash ?? []);
                setTrend((trendData ?? []).slice(-12)); // max 12 points visibles
                setRecentProjects((chefProjects ?? []).slice(0, 4));
                setTasks((allTasks ?? []).slice(0, 5));
                setTaskStats(tStats ?? {});
            } catch (e: any) {
                console.error(e);
                const msg = e?.response?.data?.message || 'Erreur lors du chargement des données';
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/auth/login');
            toast.success('Déconnexion réussie');
        } catch {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    // KPIs sécurisés
    const kpis = useMemo(() => ([
        { title: 'Projets Totaux', value: stats?.totalProjects ?? 0, icon: FolderOpen },
        { title: 'Projets Actifs', value: stats?.activeProjects ?? 0, icon: BarChart3 },
        { title: 'Terminés', value: stats?.completedProjects ?? 0, icon: ClipboardList },
        { title: 'En Retard', value: stats?.lateProjects ?? 0, icon: Activity },
    ]), [stats]);

    return (
        <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
            <div className="flex h-screen bg-gray-50">
                <NavChef user={user} onLogout={handleLogout} />

                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Bonjour {user?.username?.toUpperCase()} 👋
                                </h1>
                                <p className="text-gray-600">Vue d’ensemble des projets, tâches et équipe</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/chef/projects/create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B2A7B] text-white hover:bg-[#5B3A8B] transition"
                                >
                                    <Plus className="w-4 h-4" /> Nouveau projet
                                </button>
                                <button
                                    onClick={() => navigate('/chef/tasks')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-800 transition"
                                >
                                    <ClipboardList className="w-4 h-4" /> Gérer les tâches
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Body */}
                    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-4 h-4" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* KPIs */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                                : kpis.map(({ title, value, icon: Icon }) => (
                                    <KpiCard key={title} title={title} value={fmt.format(value)} icon={<Icon className="w-4 h-4 text-[#4B2A7B]" />} />
                                ))
                            }
                        </section>

                        {/* Rows */}
                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Recent projects */}
                            <Card title="Projets récents" actionLabel="Voir tout" onAction={() => navigate('/chef/projects')}>
                                {loading ? (
                                    <ProjectGridSkeleton />
                                ) : recentProjects.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recentProjects.map((p) => (
                                            <article key={p.id} className="rounded-xl border bg-white p-4 hover:shadow-sm transition">
                                                <div className="flex items-center justify-between mb-2">
                                                    <StatusChip label={p.statut ?? '—'} />
                                                    <TypeChip label={String(p.type ?? '—')} />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{p.titre}</h3>
                                                <p className="text-xs text-gray-500 mb-3">Client : {p.client?.username ?? '—'}</p>

                                                <div className="flex items-center justify-between text-xs text-gray-600">
                                                    <span>Début : {fmtDate((p as any).dateDebut)}</span>
                                                    <span>Fin : {fmtDate((p as any).dateFin)}</span>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {(p.developpeurs ?? []).slice(0, 3).map((d: any) => (
                                                        <span key={d.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">
                              {d.username}
                            </span>
                                                    ))}
                                                    {(p.developpeurs?.length ?? 0) > 3 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs">
                              +{(p.developpeurs!.length) - 3}
                            </span>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Aucun projet"
                                        description="Crée ton premier projet pour démarrer le suivi."
                                        actionLabel="Nouveau projet"
                                        onAction={() => navigate('/chef/projects/create')}
                                        icon={FolderOpen}
                                    />
                                )}
                            </Card>

                            {/* Build progress */}
                            <Card title="Suivi projets Build">
                                {loading ? (
                                    <ListSkeleton rows={6} />
                                ) : buildProjects.length ? (
                                    <ul className="space-y-4">
                                        {buildProjects.slice(0, 6).map((p) => (
                                            <li key={p.projectId} className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1">{p.titre}</div>
                                                    <div className="text-xs text-gray-500">{p.completedTasks}/{p.totalTasks} tâches</div>
                                                </div>
                                                <Progress value={pct(p.completionRate)} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySimple text="Aucun projet build disponible." />
                                )}
                            </Card>

                            {/* Team */}
                            <Card title="Équipe">
                                {loading ? (
                                    <ListSkeleton rows={6} />
                                ) : team.length ? (
                                    <ul className="space-y-3">
                                        {team.slice(0, 8).map((m, idx) => (
                                            <li key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar initials={m.username?.slice(0,2)?.toUpperCase()} />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{m.username}</div>
                                                        <div className="text-xs text-gray-500">{m.role ?? 'Développeur'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {m.assignedProjects ?? 0} projets
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySimple text="Aucun membre d’équipe." />
                                )}
                            </Card>

                            {/* Tasks + Trend */}
                            <Card
                                title="Tâches développeur"
                                actionLabel="Voir toutes les tâches"
                                onAction={() => navigate('/chef/tasks')}
                            >
                                {loading ? (
                                    <TableSkeleton />
                                ) : tasks.length ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-100 text-left text-sm text-gray-700">
                                            <tr>
                                                <Th>Développeur</Th>
                                                <Th>Tâche</Th>
                                                <Th>Projet</Th>
                                                <Th>Statut</Th>
                                                <Th>Échéance</Th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                            {tasks.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50">
                                                    <Td>{t.developpeurUsername ?? '—'}</Td>
                                                    <Td className="font-medium text-gray-900">{t.titre}</Td>
                                                    <Td>{t.projectTitre ?? '—'}</Td>
                                                    <Td><StatusChip label={t.statut ?? '—'} compact /></Td>
                                                    <Td>{fmtDate(t.dateFin)}</Td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptySimple text="Aucune tâche." />
                                )}
                            </Card>

                            <Card title="Progression des tâches terminées">
                                {loading ? (
                                    <div className="h-40 grid place-items-center text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <TrendLine data={trend} />
                                        <div className="mt-6">
                                            <h3 className="text-sm font-medium text-gray-700 mb-3">Répartition par statut</h3>
                                            {Object.keys(taskStats).length ? (
                                                <StatusBars data={taskStats} />
                                            ) : (
                                                <EmptySimple text="Aucune donnée de statut." />
                                            )}
                                        </div>
                                    </>
                                )}
                            </Card>
                        </section>

                        {/* Footer mini health */}
                        {!loading && (
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Données à jour — {new Date().toLocaleTimeString('fr-FR')}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

/** -------------------- Reusable UI -------------------- */

function Card({
                  title,
                  actionLabel,
                  onAction,
                  children,
              }: {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {actionLabel && onAction && (
                    <button onClick={onAction} className="text-sm text-[#4B2A7B] hover:underline">
                        {actionLabel}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border hover:shadow transition">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{title}</span>
                {icon}
            </div>
            <div className="text-3xl font-semibold text-gray-900">{value}</div>
        </div>
    );
}

function Progress({ value }: { value: string }) {
    return (
        <div className="w-44" aria-label={`Progression ${value}`} role="progressbar" aria-valuemin={0} aria-valuemax={100}>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-[#4B2A7B]" style={{ width: value }} />
            </div>
            <div className="text-xs text-right text-gray-600 mt-1">{value}</div>
        </div>
    );
}

function StatusChip({ label, compact = false }: { label: string; compact?: boolean }) {
    const map: Record<string, string> = {
        'EN_COURS': 'bg-indigo-50 text-indigo-700',
        'ACTIF': 'bg-indigo-50 text-indigo-700',
        'TERMINE': 'bg-emerald-50 text-emerald-700',
        'EN_RETARD': 'bg-rose-50 text-rose-700',
        '—': 'bg-gray-50 text-gray-500',
    };
    const key = map[label] ? label : '—';
    return (
        <span className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} rounded-full font-medium ${map[key]}`}>
      {label}
    </span>
    );
}

function TypeChip({ label }: { label: string }) {
    const map: Record<string, string> = {
        'Delivery': 'bg-indigo-50 text-indigo-700',
        'TMA': 'bg-blue-50 text-blue-700',
        'Interne': 'bg-gray-100 text-gray-900',
        '—': 'bg-gray-50 text-gray-500',
    };
    const key = map[label] ? label : '—';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[key]}`}>{key}</span>;
}

function Avatar({ initials = '?' }: { initials?: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border text-xs font-semibold text-[#4B2A7B] grid place-items-center">
            {initials}
        </div>
    );
}

function EmptyState({
                        title, description, actionLabel, onAction, icon: Icon,
                    }: {
    title: string; description: string; actionLabel?: string; onAction?: () => void; icon?: any;
}) {
    return (
        <div className="rounded-xl border border-dashed py-10 grid place-items-center text-center">
            {Icon && <Icon className="w-6 h-6 text-gray-400 mb-2" />}
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4B2A7B] text-white hover:bg-[#5B3A8B] text-sm">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

function EmptySimple({ text }: { text: string }) {
    return (
        <div className="h-32 grid place-items-center text-gray-500 text-sm border rounded-lg bg-gray-50/50">
            {text}
        </div>
    );
}

/** -------------------- Charts -------------------- */

// Sparkline/line chart en SVG (responsive)
function TrendLine({ data }: { data: TrendPoint[] }) {
    if (!data.length) return <EmptySimple text="Aucune donnée de tendance." />;
    const h = 160, w = 560, pad = 24;
    const xs = data.map((_, i) => i);
    const ys = data.map(d => d.value);
    const min = Math.min(...ys), max = Math.max(...ys);
    const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, xs.length - 1);
    const y = (v: number) => h - pad - ((v - min) * (h - pad * 2)) / Math.max(1, max - min || 1);
    const path = xs.map((i, idx) => `${idx ? 'L' : 'M'} ${x(i)} ${y(ys[i])}`).join(' ');

    return (
        <div className="w-full overflow-x-auto">
            <svg width={w} height={h} className="min-w-full">
                <defs>
                    <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4B2A7B" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4B2A7B" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Axes light */}
                <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
                {/* Area */}
                <path d={`${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#area)" />
                {/* Line */}
                <path d={path} fill="none" stroke="#4B2A7B" strokeWidth={2} />
                {/* Points */}
                {xs.map((i) => (
                    <circle key={i} cx={x(i)} cy={y(ys[i])} r={3} fill="#4B2A7B" />
                ))}
                {/* Labels */}
                {xs.map((i) => (
                    <text
                        key={`lbl-${i}`}
                        x={x(i)} y={h - 6}
                        fontSize="10" textAnchor="middle" className="fill-gray-500"
                    >
                        {data[i].label}
                    </text>
                ))}
            </svg>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <TrendingUp className="w-3 h-3" /> {max >= (ys[0] ?? 0) ? 'Tendance haussière' : 'Tendance baissière'}
            </div>
        </div>
    );
}

function StatusBars({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data);
    const max = Math.max(1, ...entries.map(([, v]) => Number(v || 0)));
    return (
        <div className="grid grid-cols-12 gap-2 items-end h-40">
            {entries.map(([label, value]) => {
                const height = `${(Number(value) / max) * 100}%`;
                return (
                    <div key={label} className="col-span-3 sm:col-span-2 lg:col-span-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-indigo-100 rounded relative" style={{ height }}>
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-700">{value}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 text-center truncate w-full">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

/** -------------------- Table helpers -------------------- */
function Th({ children }: { children: React.ReactNode }) {
    return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}

/** -------------------- Skeletons -------------------- */
function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>
            <div className="h-7 w-20 bg-gray-200 rounded" />
        </div>
    );
}
function ProjectGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
function ListSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <ul className="space-y-3 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <li key={i} className="flex items-center justify-between">
                    <div>
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-44 bg-gray-200 rounded" />
                </li>
            ))}
        </ul>
    );
}
function TableSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden animate-pulse">
            <div className="h-9 bg-gray-100" />
            <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-7 bg-gray-100 rounded" />
                ))}
            </div>
        </div>
    );
}
