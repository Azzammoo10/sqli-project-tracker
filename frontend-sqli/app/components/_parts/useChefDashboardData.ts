import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import apiClient, {authService} from '../../services/api';
import {projectService} from '~/services/projectService';
import {dashboardService} from '~/services/dashboardService';
import {taskService} from '~/services/taskService';
import toast from 'react-hot-toast';
import {Activity, BarChart3, ClipboardList, FolderOpen} from 'lucide-react';

const fmt = new Intl.NumberFormat('fr-FR');
const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const pct = (n?: number) => `${Math.round(clamp01((n ?? 0) / 100) * 100)}%`;




type TeamMember = { id: number | string; username: string; role: string; assignedProjects: number };

const normalizeTeam = (rows: any[]): TeamMember[] =>
    (rows ?? []).map((m: any) => {
        const username =
            m?.username ??
            m?.nom ??
            m?.name ??
            m?.fullName ??
            m?.user?.username ??
            m?.user?.nom ??
            (m?.email ? String(m.email).split('@')[0] : undefined) ??
            '—';

        const assignedProjects =
            m?.assignedProjects ??
            m?.projectsCount ??
            m?.nbProjets ??
            (Array.isArray(m?.projects) ? m.projects.length : undefined) ??
            0;

        const role = m?.role ?? m?.user?.role ?? 'DEVELOPPEUR';

        return {
            id: m?.id ?? m?.userId ?? m?.developpeurId ?? username,
            username,
            role,
            assignedProjects: Number(assignedProjects || 0),
        };
    });


export function useChefDashboardData() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [buildProjects, setBuildProjects] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [trend, setTrend] = useState<Array<{ label: string; value: number }>>([]);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [taskStats, setTaskStats] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);

                const [s, build, teamDashRaw, trendData, chefProjects, allTasks, tStats] = await Promise.all([
                    projectService.getProjectStats(),
                    apiClient.get('/analytics/projects/build').then(r => r.data),
                    apiClient.get('/analytics/dashboard/team').then(r => r.data),
                    dashboardService.getTrendData(),
                    projectService.getProjectsByChef(),
                    taskService.getAll(),
                    taskService.getStats(),
                ]);

                setStats(s);
                setBuildProjects(build ?? []);
                let teamNorm = normalizeTeam(teamDashRaw);

                 if ((!teamNorm || teamNorm.length === 0) && (chefProjects?.length ?? 0) > 0) {
                     teamNorm = Array.from(
                            new Map(
                                (chefProjects ?? [])
                                    .flatMap((p: any) => p.developpeurs ?? [])
                                    .map((d: any) => [
                                        d.id,
                                        {
                                            id: d.id,
                                            username: d.username ?? d.nom ?? `dev#${d.id}`,
                                            role: d.role ?? 'DEVELOPPEUR',
                                            assignedProjects: 1,
                                        },
                                    ])
                            ).values()
                        );
                    }
                setTeam(teamNorm);
                setTrend((trendData ?? []).slice(-12));
                setRecentProjects((chefProjects ?? []).slice(0, 4));
                setTasks((allTasks ?? []).slice(0, 5));
                setTaskStats(tStats ?? {});
            } catch (e: any) {
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

    const kpis = useMemo(() => ([
        { title: 'Projets Totaux', value: stats?.totalProjects ?? 0, Icon: FolderOpen },
        { title: 'Projets Actifs', value: stats?.activeProjects ?? 0, Icon: BarChart3 },
        { title: 'Terminés', value: stats?.completedProjects ?? 0, Icon: ClipboardList },
        { title: 'En Retard', value: stats?.lateProjects ?? 0, Icon: Activity },
    ]), [stats]);

    return {
        // data / state
        user, loading, error, kpis, recentProjects, buildProjects, team, tasks, trend, taskStats,
        // actions
        navigate, handleLogout,
        // helpers
        fmt, fmtDate, pct,
    };
}
