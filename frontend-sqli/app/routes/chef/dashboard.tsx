import ProtectedRoute from '../../components/ProtectedRoute';
import NavChef from '../../components/NavChef';
import { Header } from '~/components/_parts/Header';
import { Card, KpiCard, Progress, StatusChip, TypeChip, EmptySimple, EmptyState } from '~/components/_parts/UI';
import { TrendLine, StatusBars } from '~/components/_parts/Charts';
import { ProjectGridSkeleton, ListSkeleton, TableSkeleton, SkeletonCard } from '~/components/_parts/Skeletons';
import { Th, Td } from '~/components/_parts/Table';
import { useChefDashboardData } from '~/components/_parts/useChefDashboardData';

export default function ChefDashboard() {
    const {
        user, loading, error, kpis,
        recentProjects, buildProjects, team, tasks, trend, taskStats,
        navigate, handleLogout, fmt, fmtDate, pct
    } = useChefDashboardData();

    return (
        <ProtectedRoute allowedRoles={['CHEF_DE_PROJET']}>
            <div className="flex h-screen bg-gray-50">
                <NavChef user={user} onLogout={handleLogout} />

                <main className="flex-1 overflow-auto">
                    <Header user={user} onNewProject={() => navigate('/chef/projects/create')} onTasks={() => navigate('/chef/tasks')} />

                    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* KPIs */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                                : kpis.map(({ title, value, Icon }) => (
                                    <KpiCard key={title} title={title} value={fmt.format(value)} icon={<Icon className="w-4 h-4 text-[#4B2A7B]" />} />
                                ))
                            }
                        </section>

                        {/* Grids */}
                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Projets récents */}
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
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border text-xs font-semibold text-[#4B2A7B] grid place-items-center">
                                                        {m.username?.slice(0,2)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{m.username}</div>
                                                        <div className="text-xs text-gray-500">{m.role ?? 'Développeur'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600">{m.assignedProjects ?? 0} projets</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySimple text="Aucun membre d’équipe." />
                                )}
                            </Card>

                            {/* Tâches */}
                            <Card title="Tâches développeur" actionLabel="Voir toutes les tâches" onAction={() => navigate('/chef/tasks')}>
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

                            {/* Tendance & répartition */}
                            <Card title="Progression des tâches terminées">
                                {loading ? (
                                    <div className="h-40 grid place-items-center text-gray-500">Chargement…</div>
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

                        {!loading && (
                            <div className="text-xs text-gray-500">Données à jour — {new Date().toLocaleTimeString('fr-FR')}</div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
