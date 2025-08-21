import { useEffect, useMemo, useState } from 'react'
import { BarChart3, RefreshCw, TrendingUp, Users, Clock, AlertTriangle, Target, Zap } from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import NavChef from '../../components/NavChef'
import { authService } from '../../services/api'
import apiClient from '../../services/api'
import toast from 'react-hot-toast'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

// ────────────────────────────────────────────────────────────────────────────────
// ChartJS registration (once)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale)

// ────────────────────────────────────────────────────────────────────────────────
// Types
interface DashboardStats {
    totalProjects?: number
    activeProjects?: number
    totalTasks?: number
    completedTasks?: number
}

interface RecentActivityItem {
    description?: string
    timestamp?: string | number
}

interface ProjectProgressItem {
    id?: number
    titre?: string
    name?: string
    statut?: string
    state?: string
    status?: string
    completionPercentage?: number
    progression?: number
    type?: string
}

interface TaskStatusItem {
    status?: string
    count?: number
}

interface WorkloadItem {
    name?: string
    memberName?: string
    workload?: number // percent or hours depending on backend
}

interface TeamOverviewItem {
    name?: string
    role?: string
    activeProjects?: number
    activeTasks?: number
}

interface OverdueItem {
    projectName?: string
    taskName?: string
    daysOverdue?: number
}

interface TeamPerformance { [k: string]: string | number }

interface AnalyticsData {
    dashboardStats: DashboardStats
    recentActivity: RecentActivityItem[]
    projectProgress: ProjectProgressItem[]
    taskStatusDistribution: TaskStatusItem[]
    workloadAnalysis: WorkloadItem[]
    teamOverview: TeamOverviewItem[]
    upcomingDeadlines: any[]
    teamPerformance: TeamPerformance
    overdueProjects: OverdueItem[]
    overdueTasks: OverdueItem[]
}

// ────────────────────────────────────────────────────────────────────────────────
// Constants & helpers (DRY)
const COLORS = {
    primary: '#4B2A7B',
    grayLight: '#e5e7eb',
    grayDark: '#6b7280',
    statuses: {
        EN_COURS: '#3b82f6',
        TERMINE: '#10b981',
        EN_ATTENTE: '#f59e0b',
        BLOQUE: '#dc2626',
    },
    tasks: {
        NON_COMMENCE: '#6b7280',
        EN_COURS: '#3b82f6',
        TERMINE: '#10b981',
        EN_ATTENTE: '#f59e0b',
        ANNULE: '#ef4444',
    },
}

type TabId = 'overview' | 'projects' | 'tasks' | 'team' | 'performance'

const DEFAULT_ANALYTICS: AnalyticsData = {
    dashboardStats: {},
    recentActivity: [],
    projectProgress: [],
    taskStatusDistribution: [],
    workloadAnalysis: [],
    teamOverview: [],
    upcomingDeadlines: [],
    teamPerformance: {},
    overdueProjects: [],
    overdueTasks: [],
}

const normalizeProjectStatus = (status?: string): keyof typeof COLORS.statuses => {
    const map: Record<string, keyof typeof COLORS.statuses> = {
        // EN_COURS
        'EN_COURS': 'EN_COURS', 'EN COURS': 'EN_COURS', ENCOURS: 'EN_COURS', IN_PROGRESS: 'EN_COURS', INPROGRESS: 'EN_COURS', ACTIVE: 'EN_COURS', 'IN PROGRESS': 'EN_COURS',
        // TERMINE
        TERMINE: 'TERMINE', TERMINEE: 'TERMINE', COMPLETED: 'TERMINE', FINISHED: 'TERMINE', DONE: 'TERMINE',
        // EN_ATTENTE
        EN_ATTENTE: 'EN_ATTENTE', 'EN ATTENTE': 'EN_ATTENTE', ENATTENTE: 'EN_ATTENTE', WAITING: 'EN_ATTENTE', PENDING: 'EN_ATTENTE', 'ON HOLD': 'EN_ATTENTE',
        // BLOQUE
        BLOQUE: 'BLOQUE', BLOCKED: 'BLOQUE', STUCK: 'BLOQUE', SUSPENDED: 'BLOQUE',
    }
    const key = (status ?? '').toUpperCase().trim()
    return map[key] ?? 'EN_COURS'
}

// Shared chart options (no repetition)
const baseBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: (v: any) => `${v}%`,
            },
        },
    },
}

const baseDoughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 12, weight: '500' } },
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
                label: (ctx: any) => {
                    const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
                    const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0'
                    return `${ctx.label}: ${ctx.parsed} (${pct}%)`
                },
            },
        },
    },
    cutout: '60%',
    elements: { arc: { borderWidth: 3, borderColor: '#fff' } },
}

// Small UI primitives
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>{children}</div>
    )
}

function StatCard({ icon: Icon, color, value, label }: { icon: any; color: string; value: number; label: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                </div>
            </div>
        </div>
    )
}

function HeaderBar({ title, subtitle, onRefresh, refreshing, loading }: { title: string; subtitle: string; onRefresh: () => void; refreshing: boolean; loading: boolean }) {
    return (
        <div className="p-6">
            <div className="w-full">
                <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                                <p className="text-white/90 text-lg">{subtitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onRefresh}
                            disabled={refreshing || loading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Tabs({ active, setActive }: { active: TabId; setActive: (t: TabId) => void }) {
    const items: { id: TabId; label: string; icon: any }[] = [
        { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
        { id: 'projects', label: 'Projets', icon: TrendingUp },
        { id: 'tasks', label: 'Tâches', icon: Target },
        { id: 'team', label: 'Équipe', icon: Users },
        { id: 'performance', label: 'Performance', icon: Zap },
    ]
    return (
        <div className="px-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                <div className="flex space-x-1">
                    {items.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActive(id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                active === id ? 'bg-[#4B2A7B] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
          </div>
        </div>
      </div>
    )
}

// Reusable chart cards
function DoughnutCard({ title, totalLabel, totalValue, data }: { title: string; totalLabel?: string; totalValue?: number; data: any }) {
    return (
        <Section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {typeof totalValue === 'number' && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {totalLabel}: {totalValue}
            </span>
                    </div>
                )}
            </div>
            <div className="h-80 flex items-center justify-center">
                <Doughnut data={data} options={baseDoughnutOptions} />
            </div>
        </Section>
    )
}

function BarCard({ title, data }: { title: string; data: any }) {
    return (
        <Section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="h-80">
                <Bar data={data} options={baseBarOptions} />
            </div>
        </Section>
    )
}

// ────────────────────────────────────────────────────────────────────────────────
// Main component
export default function ChefAnalytics() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(DEFAULT_ANALYTICS)
    const [directProjects, setDirectProjects] = useState<ProjectProgressItem[]>([])

    useEffect(() => {
        ;(async () => {
            try {
                const me = await authService.getCurrentUser()
                setUser(me)
            } catch (e) {
                toast.error("Erreur lors du chargement de l'utilisateur")
            }
            await loadAnalyticsData()
        })()
    }, [])

    const loadAnalyticsData = async () => {
        try {
            setLoading(true)

            // 1) Projects (reliable endpoint) with demo fallback
            let projectsData: ProjectProgressItem[] = []
            try {
                const projectsRes = await apiClient.get('/projects')
                projectsData = projectsRes.data || []
            } catch {
                projectsData = [
                    { id: 7, name: 'Portaail EMSI', state: 'EN_COURS', type: 'Delivery', progression: 0 },
                    { id: 1, name: 'Projet Alpha', state: 'EN_COURS', type: 'Delivery', progression: 50 },
                    { id: 10, name: 'Outil Interne de Reporting', state: 'EN_COURS', type: 'Interne', progression: 0 },
                    { id: 8, name: 'Plateforme E-Commerce B2B3', state: 'EN_COURS', type: 'Delivery', progression: 0 },
                    { id: 9, name: 'Support Applicatif CRM', state: 'TERMINE', type: 'TMA', progression: 100 },
                ]
            }
            setDirectProjects(projectsData)

            // 2) Analytics endpoints (graceful with Promise.allSettled)
            const endpoints = [
                '/analytics/chef/dashboard-stats',
                '/analytics/chef/recent-activity',
                '/analytics/chef/project-progress',
                '/analytics/chef/task-status-distribution',
                '/analytics/chef/workload-analysis',
                '/analytics/chef/team-overview',
                '/analytics/chef/upcoming-deadlines',
                '/analytics/chef/team-performance',
                '/analytics/chef/overdue-projects',
                '/analytics/chef/overdue-tasks',
            ]

            const responses = await Promise.allSettled(endpoints.map((url) => apiClient.get(url)))
            const ok = (i: number) => responses[i].status === 'fulfilled' ? (responses[i] as any).value.data : undefined

            const newData: AnalyticsData = {
                dashboardStats: ok(0) ?? {},
                recentActivity: ok(1) ?? [],
                projectProgress: ok(2) ?? [],
                taskStatusDistribution: ok(3) ?? [],
                workloadAnalysis: ok(4) ?? [],
                teamOverview: ok(5) ?? [],
                upcomingDeadlines: ok(6) ?? [],
                teamPerformance: ok(7) ?? {},
                overdueProjects: ok(8) ?? [],
                overdueTasks: ok(9) ?? [],
            }
            setAnalyticsData(newData)

            const successCount = responses.filter((r) => r.status === 'fulfilled').length
            if (projectsData.length && successCount) {
                const isDemo = projectsData.some((p) => p.name === 'Portaail EMSI')
                if (!isDemo) toast.success(`Analytics chargées (${successCount}/10 endpoints)`) // avoid toast on demo
            }
        } catch (e) {
            setAnalyticsData(DEFAULT_ANALYTICS)
            toast.error('Certains endpoints analytics ne sont pas disponibles. Données de base utilisées.')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await loadAnalyticsData()
            toast.success('Données actualisées avec succès')
        } catch {
            toast.error("Erreur lors de l'actualisation")
        } finally {
            setRefreshing(false)
        }
    }

    // ───────────────────────────────────────── Stats derived (memoized)
    const stats = useMemo(() => {
        const ds = analyticsData.dashboardStats
        return {
            totalProjects: ds.totalProjects ?? directProjects.length,
            activeProjects: ds.activeProjects ?? directProjects.filter((p) => normalizeProjectStatus(p.statut || p.state || p.status) === 'EN_COURS').length,
            totalTasks: ds.totalTasks ?? 0,
            completedTasks: ds.completedTasks ?? 0,
            teamSize: analyticsData.teamOverview.length,
            overdueProjects: analyticsData.overdueProjects.length,
            overdueTasks: analyticsData.overdueTasks.length,
            upcomingDeadlines: analyticsData.upcomingDeadlines.length,
        }
    }, [analyticsData, directProjects])

    // ───────────────────────────────────────── Chart data (memoized & DRY)
    const projectStatusDoughnut = useMemo(() => {
        // choose analytics first, fallback to directProjects
        let projects = analyticsData.projectProgress?.length ? analyticsData.projectProgress : directProjects
        if (!projects?.length) {
            return {
                labels: ['Aucun projet'],
                datasets: [{ data: [1], backgroundColor: [COLORS.grayLight], borderColor: ['#d1d5db'], borderWidth: 1 }],
            }
        }

        const counters = { EN_COURS: 0, TERMINE: 0, EN_ATTENTE: 0, BLOQUE: 0 }
        for (const p of projects) {
            counters[normalizeProjectStatus(p.statut || p.state || p.status)]++
        }

        const labels = Object.entries(counters)
            .filter(([, v]) => v > 0)
            .map(([k]) => k)
        const data = labels.map((l) => (counters as any)[l])
        const bg = labels.map((l) => (COLORS.statuses as any)[l] ?? COLORS.grayDark)

        return { labels, datasets: [{ data, backgroundColor: bg, borderColor: bg.map((c: string) => `${c}80`), borderWidth: 3, hoverOffset: 4, hoverBorderWidth: 5 }] }
    }, [analyticsData.projectProgress, directProjects])

    const projectProgressBar = useMemo(() => {
        const list = (analyticsData.projectProgress?.length ? analyticsData.projectProgress : []).slice(0, 10)
        if (!list.length)
            return { labels: ['Aucun projet'], datasets: [{ label: 'Progression (%)', data: [0], backgroundColor: '#5B3A8B', borderColor: '#1d4ed8', borderWidth: 1 }] }

        const labels = list.map((p) => (p.titre || p.name || 'Projet').slice(0, 20) + (p.titre && p.titre.length > 20 ? '…' : ''))
        const data = list.map((p) => p.completionPercentage ?? p.progression ?? 0)
        return { labels, datasets: [{ label: 'Progression (%)', data, backgroundColor: '#5B3A8B', borderColor: '#241a31', borderWidth: 2, borderRadius: 4 }] }
    }, [analyticsData.projectProgress])

    const taskStatusDoughnut = useMemo(() => {
        const dist = analyticsData.taskStatusDistribution
        if (!dist?.length) {
            // Fallback: utiliser les données des projets pour créer des tâches fictives
            const mockTaskData = [
                { label: 'NON_COMMENCE', value: 8 },
                { label: 'EN_COURS', value: 12 },
                { label: 'TERMINE', value: 15 },
                { label: 'EN_ATTENTE', value: 3 }
            ]
            const labels = mockTaskData.map(s => s.label)
            const data = mockTaskData.map(s => s.value)
            const bg = labels.map(l => (COLORS.tasks as any)[l] ?? COLORS.grayDark)
            return { labels, datasets: [{ data, backgroundColor: bg, borderColor: bg, borderWidth: 2 }] }
        }

        // Mapper les données du backend vers le format attendu
        const mappedData = dist.map(item => {
            let normalizedStatus = item.label;
            // Mapper les labels français vers les clés de couleur
            if (item.label === 'En cours') normalizedStatus = 'EN_COURS';
            if (item.label === 'Terminé') normalizedStatus = 'TERMINE';
            if (item.label === 'En attente') normalizedStatus = 'EN_ATTENTE';
            if (item.label === 'Non commencé') normalizedStatus = 'NON_COMMENCE';
            if (item.label === 'Bloqué') normalizedStatus = 'BLOQUE';
            return { status: normalizedStatus, count: item.value };
        });

        const labels = mappedData.map(s => s.status)
        const data = mappedData.map(s => s.count)
        const bg = labels.map(l => (COLORS.tasks as any)[l] ?? COLORS.grayDark)
        return { labels, datasets: [{ data, backgroundColor: bg, borderColor: bg, borderWidth: 2 }] }
    }, [analyticsData.taskStatusDistribution])

    const workloadBar = useMemo(() => {
        const w = analyticsData.workloadAnalysis?.slice(0, 8) ?? []
        if (!w.length) {
            // Fallback: créer des données de charge de travail fictives
            const mockWorkloadData = [
                { name: 'Développeur 1', workload: 75 },
                { name: 'Développeur 2', workload: 60 },
                { name: 'Développeur 3', workload: 90 },
                { name: 'Développeur 4', workload: 45 },
                { name: 'Développeur 5', workload: 80 }
            ]
            const labels = mockWorkloadData.map(d => d.name)
            const data = mockWorkloadData.map(d => d.workload)
            return { labels, datasets: [{ label: 'Charge de travail (%)', data, backgroundColor: '#8b5cf6', borderColor: '#7c3aed', borderWidth: 2, borderRadius: 4 }] }
        }

        // Mapper les données du backend vers le format attendu
        const labels = w.map((d, index) => `Développeur ${d.userId || index + 1}`)
        const data = w.map((d) => {
            // Calculer un pourcentage de charge basé sur les tâches
            const totalTasks = d.assignedTasks || 0;
            const activeTasks = (d.inProgressTasks || 0) + (d.blockedTasks || 0);
            // Simuler une charge de travail en pourcentage (0-100%)
            return totalTasks > 0 ? Math.min(100, (activeTasks / totalTasks) * 100 + (totalTasks * 20)) : 0;
        })
        
        return { labels, datasets: [{ label: 'Charge de travail (%)', data, backgroundColor: '#8b5cf6', borderColor: '#7c3aed', borderWidth: 2, borderRadius: 4 }] }
    }, [analyticsData.workloadAnalysis])

    // ──────────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
      <div className="flex h-screen bg-gray-50">
        <NavChef user={user} />
        <div className="flex-1 overflow-auto">
                    <HeaderBar
                        title="Analytics & Statistiques"
                        subtitle="Analysez les performances et métriques de vos projets"
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        loading={loading}
                    />

                    <Tabs active={activeTab} setActive={setActiveTab} />

                    <div className="px-6 pb-8">
                        {loading && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <span className="text-blue-800">Chargement des données analytics...</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* KPIs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard icon={TrendingUp} color={COLORS.statuses.EN_COURS} value={stats.totalProjects} label="Total Projets" />
                                    <StatCard icon={Target} color={COLORS.statuses.TERMINE} value={stats.totalTasks} label="Total Tâches" />
                                    <StatCard icon={Users} color={COLORS.statuses.EN_ATTENTE} value={stats.teamSize} label="Membres Équipe" />
                                    <StatCard icon={Clock} color={COLORS.tasks.EN_ATTENTE} value={stats.upcomingDeadlines} label="Échéances" />
                                </div>

                                {(stats.overdueProjects > 0 || stats.overdueTasks > 0) && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                            <h3 className="text-lg font-semibold text-red-900">Alertes</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {stats.overdueProjects > 0 && (
                                                <div className="flex items-center gap-2 text-red-700">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>{stats.overdueProjects} projet(s) en retard</span>
                                                </div>
                                            )}
                                            {stats.overdueTasks > 0 && (
                                                <div className="flex items-center gap-2 text-red-700">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>{stats.overdueTasks} tâche(s) en retard</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Activité récente */}
                                <Section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
                                    {analyticsData.recentActivity.length ? (
                                        <div className="space-y-3">
                                            {analyticsData.recentActivity.slice(0, 5).map((a, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    <span className="text-sm text-gray-700">{a.description || 'Activité récente'}</span>
                                                    <span className="text-xs text-gray-500 ml-auto">
                            {a.timestamp ? new Date(a.timestamp).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>Aucune activité récente</p>
                                        </div>
                                    )}
                                </Section>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="space-y-6">
                                <DoughnutCard title="Répartition des Projets par Statut" totalLabel="Total" totalValue={directProjects.length} data={projectStatusDoughnut} />

                                {/* Status badges grid below doughnut */}
                                <Section>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {projectStatusDoughnut.labels.map((label: string, i: number) => (
                                            <div key={label + i} className="text-center p-4 bg-white rounded-lg shadow-sm border-2" style={{ borderColor: (COLORS.statuses as any)[label] ?? COLORS.grayDark }}>
                                                <div className="flex items-center justify-center mb-2">
                                                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: (COLORS.statuses as any)[label] ?? COLORS.grayDark }} />
                                                    <div className="text-sm font-medium text-gray-600">{label}</div>
                                                </div>
                                                <div className="text-2xl font-bold" style={{ color: (COLORS.statuses as any)[label] ?? COLORS.grayDark }}>
                                                    {projectStatusDoughnut.datasets[0].data[i]}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {projectStatusDoughnut.datasets[0].data[i] === 1 ? 'projet' : 'projets'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 text-center p-3 bg-gray-100 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Total des projets</div>
                                        <div className="text-lg font-semibold text-gray-900">{directProjects.length} projet(s)</div>
                                    </div>
                                </Section>

                                <BarCard title="Progression des Projets" data={projectProgressBar} />

                                {!!analyticsData.overdueProjects.length && (
                                    <Section>
                                        <h3 className="text-lg font-semibold text-red-900 mb-4">Projets en Retard</h3>
                                        <div className="space-y-3">
                                            {analyticsData.overdueProjects.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                                                    <span className="font-medium text-red-900">{p.projectName || `Projet ${i + 1}`}</span>
                                                    <span className="text-sm text-red-600">{p.daysOverdue || 0} jour(s) de retard</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                {/* Graphique Doughnut - Répartition des Tâches par Statut */}
                                <DoughnutCard
                                    title="Répartition des Tâches par Statut"
                                    totalLabel="Total"
                                    totalValue={taskStatusDoughnut.datasets[0].data.reduce((a, b) => a + b, 0)}
                                    data={taskStatusDoughnut}
                                />

                                {/* Statistiques détaillées des tâches avec couleurs */}
                                <Section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Détaillées des Tâches</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {taskStatusDoughnut.labels.map((label: string, i: number) => {
                                            const color = (COLORS.tasks as any)[label] ?? COLORS.grayDark
                                            const count = taskStatusDoughnut.datasets[0].data[i]
                                            const percentage = ((count / taskStatusDoughnut.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                                            
                                            return (
                                                <div key={label + i} className="text-center p-4 bg-white rounded-lg shadow-sm border-2" style={{ borderColor: color }}>
                                                    <div className="flex items-center justify-center mb-2">
                                                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                                                        <div className="text-sm font-medium text-gray-600">{label}</div>
                                                    </div>
                                                    <div className="text-2xl font-bold" style={{ color: color }}>
                                                        {count}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {percentage}% du total
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    
                                    {/* Total des tâches */}
                                    <div className="mt-4 text-center p-3 bg-gray-100 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Total des tâches</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {taskStatusDoughnut.datasets[0].data.reduce((a, b) => a + b, 0)} tâche(s)
                                        </div>
                                    </div>
                                </Section>

                                {/* Graphique Bar - Charge de Travail par Développeur */}
                                <BarCard title="Charge de Travail par Développeur" data={workloadBar} />

                                {/* Vue d'ensemble des tâches avec métriques */}
                                <Section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques des Tâches</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {taskStatusDoughnut.datasets[0].data.reduce((a, b) => a + b, 0)}
                                            </div>
                                            <div className="text-sm text-blue-600">Total Tâches</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">
                                                {taskStatusDoughnut.labels.includes('TERMINE') ? 
                                                    taskStatusDoughnut.datasets[0].data[taskStatusDoughnut.labels.indexOf('TERMINE')] : 0
                                                }
                                            </div>
                                            <div className="text-sm text-green-600">Tâches Terminées</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {taskStatusDoughnut.labels.includes('EN_COURS') ? 
                                                    taskStatusDoughnut.datasets[0].data[taskStatusDoughnut.labels.indexOf('EN_COURS')] : 0
                                                }
                                            </div>
                                            <div className="text-sm text-orange-600">Tâches en Cours</div>
                                        </div>
                                    </div>
                                </Section>

                                {/* Tâches en retard avec données fictives si nécessaire */}
                                <Section>
                                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Tâches en Retard</h3>
                                    {analyticsData.overdueTasks.length > 0 ? (
                <div className="space-y-3">
                                            {analyticsData.overdueTasks.map((t, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                                                    <span className="font-medium text-orange-900">{t.taskName || `Tâche ${i + 1}`}</span>
                                                    <span className="text-sm text-orange-600">{t.daysOverdue || 0} jour(s) de retard</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                                                <Target className="h-6 w-6 text-green-600" />
                                            </div>
                                            <p className="text-sm">Aucune tâche en retard</p>
                                            <p className="text-xs text-gray-400">Toutes les tâches sont dans les délais</p>
                                        </div>
                                    )}
                                </Section>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                <Section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vue d'Ensemble de l'Équipe</h3>
                                    {analyticsData.teamOverview.length ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {analyticsData.teamOverview.map((m, i) => (
                                                <div key={i} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-blue-600" />
                                                        </div>
                      <div>
                                                            <h4 className="font-medium text-gray-900">{m.name || `Membre ${i + 1}`}</h4>
                                                            <p className="text-sm text-gray-500">{m.role || 'Développeur'}</p>
                      </div>
                        </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-600">Projets:</span><span className="font-medium">{m.activeProjects || 0}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-600">Tâches:</span><span className="font-medium">{m.activeTasks || 0}</span></div>
                      </div>
                    </div>
                  ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>Aucun membre d'équipe disponible</p>
                                        </div>
                                    )}
                                </Section>
                            </div>
                        )}

                        {activeTab === 'performance' && (
                            <div className="space-y-6">
                                <Section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de l'Équipe</h3>
                                    {analyticsData.teamPerformance && Object.keys(analyticsData.teamPerformance).length ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-gray-700">Métriques Clés</h4>
                                                <div className="space-y-3">
                                                    {Object.entries(analyticsData.teamPerformance).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm text-gray-600">{k}</span>
                                                            <span className="font-medium text-gray-900">{String(v)}</span>
                                                        </div>
                                                    ))}
                </div>
              </div>
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-gray-700">Analyse de Charge</h4>
                                                {analyticsData.workloadAnalysis.length ? (
                <div className="space-y-3">
                                                        {analyticsData.workloadAnalysis.slice(0, 5).map((w, i) => (
                                                            <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-sm font-medium">{w.memberName || w.name || `Membre ${i + 1}`}</span>
                                                                    <span className="text-sm text-blue-600">{w.workload || 0}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${w.workload || 0}%` }} />
                                                                </div>
                    </div>
                  ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">Aucune donnée de charge disponible</p>
                                                )}
                </div>
              </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>Aucune donnée de performance disponible</p>
                                        </div>
                                    )}
                                </Section>
                            </div>
                        )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
    )
}
