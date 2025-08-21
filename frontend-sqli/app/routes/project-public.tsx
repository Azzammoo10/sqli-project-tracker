import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    FolderOpen,
    Calendar,
    Users,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Pause,
    Share2,
    Copy,
    RefreshCw,
} from "lucide-react";
import sqliLogo from '../assets/images/SQLI-LOGO.png';
// chemin à ajuster selon ton projet

/**
 * QR landing page (public project view)
 * - Mobile-first, fully responsive (Tailwind)
 * - Professional, card-based layout
 * - Clear status badges + progress bars
 * - Robust loading & error states
 * - Works when opened from QR scan
 */

interface PublicProject {
    id: number;
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
    type: string;
    progression: number; // 0..100
    client: { nom: string; email: string };
    chefDeProjet: { nom: string; email: string };
    developpeurs: Array<{ nom: string; email: string }>;
    taches: { total: number; completed: number; inProgress: number };
}

const statusLabel: Record<string, string> = {
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    EN_ATTENTE: "En attente",
    ANNULE: "Annulé",
};

const statusTone: Record<string, string> = {
    EN_COURS: "bg-blue-100 text-blue-700 ring-blue-200",
    TERMINE: "bg-green-100 text-green-700 ring-green-200",
    EN_ATTENTE: "bg-amber-100 text-amber-700 ring-amber-200",
    ANNULE: "bg-rose-100 text-rose-700 ring-rose-200",
};

function StatusBadge({ value }: { value: string }) {
    const label = statusLabel[value] ?? value ?? "—";
    const tone = statusTone[value] ?? "bg-gray-100 text-gray-700 ring-gray-200";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}
        >
      <span className="size-1.5 rounded-full bg-current/70" /> {label}
    </span>
    );
}

function StatChip({ title, value, className = "" }: { title: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border bg-white p-4 shadow-sm ${className}`}>
            <div className="text-xs text-gray-500">{title}</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
        </div>
    );
}

function LabeledIconRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-9 place-items-center rounded-lg bg-gray-50 ring-1 ring-gray-100">
                {icon}
            </div>
            <div>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm font-medium text-gray-900">{value}</div>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
                        <div className="space-y-2">
                            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                            <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-xl border bg-white" />
                        ))}
                    </div>
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 animate-pulse rounded-xl border bg-white" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProjectPublic() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<PublicProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        const fetchProject = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/projects/${id}/public`, { headers: { "Accept": "application/json" } });
                if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
                const data = (await res.json()) as PublicProject;
                if (alive) setProject(data);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Erreur lors du chargement du projet");
            } finally {
                if (alive) setLoading(false);
            }
        };
        if (id) fetchProject();
        return () => {
            alive = false;
        };
    }, [id]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

    const tasksProgress = useMemo(() => {
        if (!project?.taches) return 0;
        const { total, completed } = project.taches;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }, [project]);

    const publicUrl = useMemo(() => {
        // If the app is hosted under a domain, this will build a shareable absolute URL
        if (!project) return "";
        const { origin } = window.location;
        return `${origin}/project/${project.id}/public`;
    }, [project]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
        } catch {}
    };

    if (loading) return <Skeleton />;

    if (error || !project) {
        return (
            <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
                <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
                    <XCircle className="mx-auto size-12 text-rose-500" />
                    <h1 className="mt-3 text-xl font-semibold text-gray-900">Impossible d'afficher le projet</h1>
                    <p className="mt-1 text-sm text-gray-600">{error ?? "Projet non trouvé ou lien expiré."}</p>
                    <a
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
                    >
                        <RefreshCw className="size-4" /> Retour à l'accueil
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar (mobile-first) */}
            <header className="sticky top-0 z-30 border-b bg-[#221933] text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={sqliLogo}
                            alt="SQLI Logo"
                            className="h-10 sm:h-12 object-contain filter brightness-0 invert"
                        />
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold sm:text-xl">{project.nom}</h1>
                            <p className="truncate text-xs sm:text-sm opacity-80">Projet public – via QR Code</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Statut */}
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur">
{project.statut}
</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    {/* Main column */}
                    <section className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <article className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Description du projet</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-700 sm:text-[15px]">{project.description}</p>
                        </article>

                        {/* Info grid */}
                        <article className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Informations générales</h2>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <LabeledIconRow icon={<Calendar className="size-5 text-gray-400" />} label="Date de début" value={formatDate(project.dateDebut)} />
                                <LabeledIconRow icon={<Target className="size-5 text-gray-400" />} label="Date de fin" value={formatDate(project.dateFin)} />
                                <LabeledIconRow
                                    icon={<div className="grid size-5 place-items-center rounded bg-blue-100 text-xs font-semibold text-blue-600">{project.type?.[0] ?? "P"}</div>}
                                    label="Type de projet"
                                    value={project.type}
                                />
                                <LabeledIconRow
                                    icon={<div className="grid size-5 place-items-center rounded bg-green-100 text-xs font-semibold text-green-600">{project.progression ?? 0}%</div>}
                                    label="Progression"
                                    value={`${project.progression ?? 0}%`}
                                />
                            </div>
                        </article>

                        {/* Linear Progress */}
                        <article className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Progression du projet</h2>
                            <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${project.progression ?? 0}%` }}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={project.progression ?? 0}
                                    role="progressbar"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-600">{project.progression ?? 0}% complété</p>
                        </article>

                        {/* Tasks summary */}
                        <article className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Tâches du projet</h2>
                            {project.taches && project.taches.total > 0 ? (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                        <StatChip title="Total" value={<span className="text-blue-700">{project.taches.total}</span>} />
                                        <StatChip title="Terminées" value={<span className="text-green-700">{project.taches.completed}</span>} />
                                        <StatChip title="En cours" value={<span className="text-amber-700">{project.taches.inProgress}</span>} />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Progression des tâches</span>
                                            <span className="font-medium text-gray-900">{tasksProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full bg-green-600 transition-all duration-500" style={{ width: `${tasksProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">Aucune tâche disponible</p>
                            )}
                        </article>
                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Team */}
                        <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Équipe du projet</h2>

                            <div className="mt-3 space-y-3">
                                <div>
                                    <div className="text-xs font-medium text-gray-600">Client</div>
                                    <div className="mt-1 rounded-lg bg-blue-50 p-3">
                                        <div className="font-medium text-blue-900">{project.client.nom}</div>
                                        <a href={`mailto:${project.client.email}`} className="text-xs text-blue-700 hover:underline">
                                            {project.client.email}
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-medium text-gray-600">Chef de projet</div>
                                    <div className="mt-1 rounded-lg bg-emerald-50 p-3">
                                        <div className="font-medium text-emerald-900">{project.chefDeProjet.nom}</div>
                                        <a href={`mailto:${project.chefDeProjet.email}`} className="text-xs text-emerald-700 hover:underline">
                                            {project.chefDeProjet.email}
                                        </a>
                                    </div>
                                </div>

                                {project.developpeurs?.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-gray-600">Développeurs</div>
                                        <ul className="mt-1 space-y-2">
                                            {project.developpeurs.map((d, i) => (
                                                <li key={`${d.email}-${i}`} className="rounded-lg bg-gray-50 p-3">
                                                    <div className="font-medium text-gray-900">{d.nom}</div>
                                                    <a href={`mailto:${d.email}`} className="text-xs text-gray-700 hover:underline">
                                                        {d.email}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* QR Code */}
                        <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">QR Code du projet</h2>
                            <div className="mt-3 text-center">
                                <img
                                    src={`/api/qrcode/project/${project.id}?projectName=${encodeURIComponent(project.nom)}`}
                                    alt="QR Code du projet"
                                    className="mx-auto h-40 w-40 rounded-lg border object-contain sm:h-48 sm:w-48"
                                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                                />
                                <p className="mt-2 text-xs text-gray-600">Scannez pour ouvrir cette page publique.</p>
                            </div>
                        </section>

                        {/* Help */}
                        <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Besoin d'aide ?</h2>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Users className="size-4 text-gray-400" /> Chef de projet :
                                    <span className="font-medium">{project.chefDeProjet.nom}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="size-4 text-gray-400" /> Dernière mise à jour :
                                    <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {/* Mobile bottom bar: quick status & share */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur sm:hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
                    <StatusBadge value={project.statut} />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if ((navigator as any).share) {
                                    (navigator as any)
                                        .share({ title: project.nom, text: "Consultez ce projet public", url: publicUrl })
                                        .catch(() => copyLink());
                                } else {
                                    copyLink();
                                }
                            }}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                        >
                            <Share2 className="size-4" /> Partager
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
