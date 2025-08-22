import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Calendar,
    Users,
    Target,
    CheckCircle,
    XCircle,
    Pause,
    Share2,
    RefreshCw,
    TrendingUp,
    Activity,
    User,
    Mail,
    Briefcase,
    Download,
} from "lucide-react";
import sqliLogo from '../assets/images/SQLI-LOGO.png';

/**
 * QR landing page (public project view) - Enhanced Professional Version
 * - Mobile-first, fully responsive design
 * - Professional gradient backgrounds and modern cards
 * - Enhanced visual hierarchy and typography
 * - Smooth animations and micro-interactions
 * - Premium feel for client-facing content
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

const statusConfig: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode }> = {
    EN_COURS: {
        bg: "bg-gradient-to-r from-blue-50 to-blue-100",
        text: "text-blue-800",
        ring: "ring-blue-200",
        icon: <Activity className="size-3" />
    },
    TERMINE: {
        bg: "bg-gradient-to-r from-emerald-50 to-green-100",
        text: "text-emerald-800",
        ring: "ring-emerald-200",
        icon: <CheckCircle className="size-3" />
    },
    EN_ATTENTE: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-100",
        text: "text-amber-800",
        ring: "ring-amber-200",
        icon: <Pause className="size-3" />
    },
    ANNULE: {
        bg: "bg-gradient-to-r from-rose-50 to-red-100",
        text: "text-rose-800",
        ring: "ring-rose-200",
        icon: <XCircle className="size-3" />
    },
};

function StatusBadge({ value }: { value: string }) {
    const label = statusLabel[value] ?? value ?? "—";
    const config = statusConfig[value] ?? {
        bg: "bg-gray-50",
        text: "text-gray-700",
        ring: "ring-gray-200",
        icon: <div className="size-3 rounded-full bg-gray-400" />
    };

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all duration-200 ${config.bg} ${config.text} ${config.ring}`}>
            {config.icon}
            {label}
        </span>
    );
}

function StatChip({ title, value, className = "", gradient = "from-white to-gray-50" }: {
    title: string;
    value: React.ReactNode;
    className?: string;
    gradient?: string;
}) {
    return (
        <div className={`group rounded-2xl border border-gray-200/50 bg-gradient-to-br ${gradient} p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${className}`}>
            <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
            <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</div>
        </div>
    );
}

function InfoCard({ icon, label, value, accent = "blue" }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    accent?: string;
}) {
    const accentColors = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
    };

    return (
        <div className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200 group-hover:scale-110 ${accentColors[accent as keyof typeof accentColors] || accentColors.blue}`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
                <div className="text-base font-semibold text-gray-900 leading-relaxed">{value}</div>
            </div>
        </div>
    );
}

function TeamMemberCard({ name, email, role, accentColor = "blue" }: {
    name: string;
    email: string;
    role: string;
    accentColor?: string;
}) {
    const colors = {
        blue: "from-blue-50 to-blue-100 border-blue-200",
        emerald: "from-emerald-50 to-emerald-100 border-emerald-200",
        purple: "from-purple-50 to-purple-100 border-purple-200",
        gray: "from-gray-50 to-gray-100 border-gray-200",
    };

    return (
        <div className={`group rounded-xl border bg-gradient-to-br p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${colors[accentColor as keyof typeof colors] || colors.blue}`}>
            <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm`}>
                    <User className="size-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">{role}</div>
                    <div className="font-semibold text-gray-900 mb-1">{name}</div>
                    <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition-colors group-hover:underline"
                    >
                        <Mail className="size-3" />
                        {email}
                    </a>
                </div>
            </div>
        </div>
    );
}

function ProgressRing({ percentage, size = 120, strokeWidth = 8 }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                    style={{
                        animation: 'drawCircle 2s ease-out forwards',
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                    <div className="text-xs text-gray-500">Complété</div>
                </div>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="border-b bg-[#221933]/95 backdrop-blur supports-[backdrop-filter]:bg-[#221933]/90">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 animate-pulse rounded-xl bg-white/20" />
                        <div className="space-y-3">
                            <div className="h-5 w-48 animate-pulse rounded bg-white/20" />
                            <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 animate-pulse rounded-2xl border bg-white shadow-sm" />
                        ))}
                    </div>
                    <div className="space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 animate-pulse rounded-2xl border bg-white shadow-sm" />
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
    const [backendNgrokUrl, setBackendNgrokUrl] = useState<string>('');

    // Détecter automatiquement l'URL ngrok du backend
    useEffect(() => {
        const detectNgrokUrl = async () => {
            try {
                // Essayer de récupérer l'URL ngrok depuis l'interface ngrok
                const response = await fetch('http://localhost:4040/api/tunnels');
                if (response.ok) {
                    const data = await response.json();
                    const backendTunnel = data.tunnels?.find((tunnel: any) => 
                        tunnel.name === 'backend' || tunnel.proto === 'http'
                    );
                    if (backendTunnel) {
                        setBackendNgrokUrl(backendTunnel.public_url);
                        return;
                    }
                }
            } catch (error) {
                console.log('Impossible de détecter l\'URL ngrok automatiquement');
            }
            
            // Fallback: URL ngrok par défaut (à mettre à jour manuellement)
            setBackendNgrokUrl('https://b0dae7f7c430.ngrok-free.app');
        };

        detectNgrokUrl();
    }, []);

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
        if (!project) return "";
        const { origin } = window.location;
        return `${origin}/project/${project.id}/public`;
    }, [project]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
        } catch {}
    };

    const handleDownloadPDF = async () => {
        if (!project) return; // Early return if project is null

        try {
            // Utiliser l'URL ngrok du backend pour l'endpoint PDF
            // L'URL ngrok est accessible depuis le téléphone
            if (!backendNgrokUrl) {
                alert('URL ngrok non disponible. Veuillez vérifier que ngrok est démarré.');
                return;
            }
            
            console.log('Tentative de téléchargement PDF depuis:', `${backendNgrokUrl}/api/projects/${project.id}/pdf`);
            
            const response = await fetch(`${backendNgrokUrl}/api/projects/${project.id}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                
                // Vérifier que c'est bien un PDF
                if (blob.type !== 'application/pdf') {
                    console.warn('Le contenu reçu n\'est pas un PDF:', blob.type);
                    throw new Error('Le contenu reçu n\'est pas un PDF valide');
                }
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `projet-${project.nom.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                console.log('PDF téléchargé avec succès');
                return;
            } else {
                const errorText = await response.text();
                console.error('Erreur HTTP:', response.status, errorText);
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }

        } catch (error: any) {
            console.error('Erreur lors du téléchargement PDF:', error);
            
            // Message d'erreur spécifique pour ngrok
            if (error?.message && error.message.includes('ngrok')) {
                alert(`Erreur ngrok détectée. Essayez de:\n1. Vérifier que l'URL ngrok est correcte\n2. Redémarrer ngrok\n3. Utiliser l'impression comme alternative`);
            } else {
                alert(`Erreur lors du téléchargement PDF: ${error?.message || 'Erreur inconnue'}\n\nUtilisez l'impression comme alternative.`);
            }
            
            // Fallback: Impression vers PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const printContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Projet ${project.nom}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                margin: 20px; 
                                color: #000;
                                background: white;
                            }
                            .header { 
                                border-bottom: 2px solid #221933; 
                                padding-bottom: 10px; 
                                margin-bottom: 20px; 
                            }
                            .section { 
                                margin-bottom: 20px; 
                                border: 1px solid #ddd; 
                                padding: 15px; 
                                border-radius: 8px;
                            }
                            .title { 
                                font-size: 24px; 
                                font-weight: bold; 
                                color: #221933; 
                            }
                            .subtitle { 
                                font-size: 18px; 
                                font-weight: bold; 
                                margin-bottom: 10px; 
                            }
                            .info-row { 
                                display: flex; 
                                justify-content: space-between; 
                                margin-bottom: 8px; 
                            }
                            .progress-bar { 
                                width: 100%; 
                                height: 20px; 
                                background: #f0f0f0; 
                                border-radius: 10px; 
                                overflow: hidden;
                            }
                            .progress-fill { 
                                height: 100%; 
                                background: #4f46e5; 
                                width: ${project.progression}%;
                            }
                            .team-member { 
                                margin-bottom: 10px; 
                                padding: 8px; 
                                background: #f9f9f9; 
                                border-radius: 4px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="title">${project.nom}</div>
                            <p>Statut: ${statusLabel[project.statut] || project.statut}</p>
                        </div>
                        
                        <div class="section">
                            <div class="subtitle">Description</div>
                            <p>${project.description}</p>
                        </div>
                        
                        <div class="section">
                            <div class="subtitle">Informations générales</div>
                            <div class="info-row">
                                <span>Date de début:</span>
                                <span>${formatDate(project.dateDebut)}</span>
                            </div>
                            <div class="info-row">
                                <span>Date de fin:</span>
                                <span>${formatDate(project.dateFin)}</span>
                            </div>
                            <div class="info-row">
                                <span>Type:</span>
                                <span>${project.type}</span>
                            </div>
                            <div class="info-row">
                                <span>Progression:</span>
                                <span>${project.progression}%</span>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="subtitle">Progression visuelle</div>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <p style="text-align: center; margin-top: 5px;">${project.progression}% complété</p>
                        </div>
                        
                        ${project.taches && project.taches.total > 0 ? `
                        <div class="section">
                            <div class="subtitle">Tâches</div>
                            <div class="info-row">
                                <span>Total:</span>
                                <span>${project.taches.total}</span>
                            </div>
                            <div class="info-row">
                                <span>Terminées:</span>
                                <span>${project.taches.completed}</span>
                            </div>
                            <div class="info-row">
                                <span>En cours:</span>
                                <span>${project.taches.inProgress}</span>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="section">
                            <div class="subtitle">Équipe du projet</div>
                            <div class="team-member">
                                <strong>Client:</strong> ${project.client.nom}<br>
                                <small>${project.client.email}</small>
                            </div>
                            <div class="team-member">
                                <strong>Chef de projet:</strong> ${project.chefDeProjet.nom}<br>
                                <small>${project.chefDeProjet.email}</small>
                            </div>
                            ${project.developpeurs?.length > 0 ? `
                                <div class="team-member">
                                    <strong>Développeurs:</strong><br>
                                    ${project.developpeurs.map(d => `• ${d.nom} (${d.email})`).join('<br>')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                            Document généré le ${formatDate(new Date().toISOString())}
                        </div>
                    </body>
                    </html>
                `;

                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();

                // Instructions pour l'utilisateur
                setTimeout(() => {
                    alert('Utilisez Ctrl+P (Cmd+P sur Mac) et sélectionnez "Enregistrer au format PDF" dans les options d\'impression.');
                }, 1000);

            } else {
                alert('Impossible de télécharger le PDF. Utilisez Ctrl+P (Cmd+P sur Mac) et sélectionnez "Enregistrer au format PDF".');
            }
        }
    };

    if (loading) return <Skeleton />;

    if (error || !project) {
        return (
            <div className="grid min-h-screen place-items-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4">
                <div className="mx-auto w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-100">
                        <XCircle className="size-8 text-rose-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Projet introuvable</h1>
                    <p className="text-gray-600 mb-6">{error ?? "Projet non trouvé ou lien expiré."}</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-all duration-200 hover:scale-105"
                    >
                        <RefreshCw className="size-4" /> Retour à l'accueil
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                @keyframes drawCircle {
                    from {
                        stroke-dashoffset: ${2 * Math.PI * 52};
                    }
                    to {
                        stroke-dashoffset: ${2 * Math.PI * 52 * (1 - (project?.progression || 0) / 100)};
                    }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media print {
                    /* Cache les éléments de navigation */
                    .fixed, .sticky, header, .print\\:hidden {
                        display: none !important;
                    }

                    /* Ajuste la page pour l'impression */
                    body, html {
                        background: white !important;
                        color: black !important;
                        font-size: 12pt !important;
                        line-height: 1.4 !important;
                    }

                    /* Supprime tous les effets visuels */
                    * {
                        background-image: none !important;
                        background-color: transparent !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }

                    /* Force les bordures pour la structure */
                    .border {
                        border: 1px solid #000 !important;
                    }

                    /* Ajuste les couleurs de texte */
                    .text-white, .text-blue-600, .text-emerald-600, .text-amber-600, .text-purple-600 {
                        color: #000 !important;
                    }

                    .text-gray-500, .text-gray-600 {
                        color: #333 !important;
                    }

                    /* Optimise la mise en page pour l'impression */
                    .container, .mx-auto {
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0.5rem !important;
                    }

                    /* Réduit les espacements */
                    .p-8 { padding: 0.5rem !important; }
                    .p-6 { padding: 0.25rem !important; }
                    .space-y-8 > * + * { margin-top: 0.5rem !important; }
                    .space-y-6 > * + * { margin-top: 0.25rem !important; }
                    .gap-8 { gap: 0.5rem !important; }
                    .gap-6 { gap: 0.25rem !important; }

                    /* Force l'affichage en une colonne */
                    .grid, .lg\\:grid-cols-3, .sm\\:grid-cols-2, .sm\\:grid-cols-3 {
                        display: block !important;
                        grid-template-columns: none !important;
                    }

                    .lg\\:col-span-2 {
                        width: 100% !important;
                    }

                    /* Évite les coupures de page */
                    .rounded-3xl, .rounded-2xl, .rounded-xl {
                        border-radius: 0 !important;
                        page-break-inside: avoid;
                        margin-bottom: 0.5rem;
                    }

                    /* Cache le QR code (optionnel) */
                    img[alt*="QR"] {
                        display: none !important;
                    }

                    /* Assure la lisibilité des titres */
                    h1, h2, h3 {
                        color: #000 !important;
                        font-weight: bold !important;
                        margin-bottom: 0.25rem !important;
                    }

                    /* Style pour les badges de statut */
                    .inline-flex {
                        display: inline !important;
                        border: 1px solid #000 !important;
                        padding: 0.125rem 0.25rem !important;
                        border-radius: 0.25rem !important;
                    }
                }

                @page {
                    size: A4;
                    margin: 1cm;
                }
                `}
            </style>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                {/* Enhanced Header */}
                <header className="sticky top-0 z-30 border-b border-[#221933]/10 bg-gradient-to-r from-[#221933] via-[#2a1f3d] to-[#221933] backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl bg-white/10 blur-sm"></div>
                                <img
                                    src={sqliLogo}
                                    alt="SQLI Logo"
                                    className="relative h-12 sm:h-14 object-contain filter brightness-0 invert"
                                />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-bold text-white sm:text-2xl mb-1">{project.nom}</h1>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                                    <p className="truncate text-sm text-white/80">Projet Public</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:bg-white/30"
                                title="Télécharger en PDF"
                            >
                                <Download className="size-4" />
                                PDF
                            </button>
                            <StatusBadge value={project.statut} />
                        </div>
                    </div>
                </header>

                <main id="project-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                        {/* Main Content Column */}
                        <section className="lg:col-span-2 space-y-8 animate-fade-in-up">
                            {/* Project Overview Card */}
                            <article className="group rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white via-blue-50/30 to-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vue d'ensemble du projet</h2>
                                        <p className="text-gray-600">Détails et progression en temps réel</p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="size-6" />
                                    </div>
                                </div>
                                <p className="text-gray-800 leading-relaxed text-lg">{project.description}</p>
                            </article>

                            {/* Progress Visualization */}
                            <article className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-lg">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Progression du projet</h2>
                                    <p className="text-gray-600">Avancement global et détaillé</p>
                                </div>

                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    <div className="flex-shrink-0">
                                        <ProgressRing percentage={project.progression ?? 0} size={140} strokeWidth={12} />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                            <StatChip
                                                title="Progression générale"
                                                value={`${project.progression ?? 0}%`}
                                                gradient="from-blue-50 to-blue-100"
                                            />
                                            <StatChip
                                                title="Type de projet"
                                                value={project.type}
                                                gradient="from-purple-50 to-purple-100"
                                            />
                                            <StatChip
                                                title="Statut"
                                                value={statusLabel[project.statut] ?? project.statut}
                                                gradient="from-emerald-50 to-emerald-100"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">Avancement visuel</span>
                                                <span className="font-bold text-blue-600">{project.progression ?? 0}%</span>
                                            </div>
                                            <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out rounded-full"
                                                    style={{ width: `${project.progression ?? 0}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* Project Details */}
                            <article className="rounded-3xl border border-gray-200/50 bg-white p-8 shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations détaillées</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <InfoCard
                                        icon={<Calendar className="size-6" />}
                                        label="Date de début"
                                        value={formatDate(project.dateDebut)}
                                        accent="blue"
                                    />
                                    <InfoCard
                                        icon={<Target className="size-6" />}
                                        label="Date de fin"
                                        value={formatDate(project.dateFin)}
                                        accent="emerald"
                                    />
                                    <InfoCard
                                        icon={<Briefcase className="size-6" />}
                                        label="Type de projet"
                                        value={project.type}
                                        accent="purple"
                                    />
                                    <InfoCard
                                        icon={<TrendingUp className="size-6" />}
                                        label="Progression actuelle"
                                        value={`${project.progression ?? 0}% complété`}
                                        accent="amber"
                                    />
                                </div>
                            </article>

                            {/* Tasks Summary */}
                            {project.taches && project.taches.total > 0 && (
                                <article className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white to-emerald-50/30 p-8 shadow-lg">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Suivi des tâches</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                        <StatChip
                                            title="Total des tâches"
                                            value={project.taches.total}
                                            gradient="from-blue-50 to-blue-100"
                                        />
                                        <StatChip
                                            title="Tâches terminées"
                                            value={project.taches.completed}
                                            gradient="from-emerald-50 to-emerald-100"
                                        />
                                        <StatChip
                                            title="En cours"
                                            value={project.taches.inProgress}
                                            gradient="from-amber-50 to-amber-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-700">Progression des tâches</span>
                                            <span className="font-bold text-emerald-600">{tasksProgress}%</span>
                                        </div>
                                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out rounded-full"
                                                style={{ width: `${tasksProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </article>
                            )}
                        </section>

                        {/* Sidebar */}
                        <aside className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {/* Team Section */}
                            <section className="rounded-3xl border border-gray-200/50 bg-white p-8 shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Équipe du projet</h2>
                                <div className="space-y-4">
                                    <TeamMemberCard
                                        name={project.client.nom}
                                        email={project.client.email}
                                        role="Client"
                                        accentColor="blue"
                                    />
                                    <TeamMemberCard
                                        name={project.chefDeProjet.nom}
                                        email={project.chefDeProjet.email}
                                        role="Chef de projet"
                                        accentColor="emerald"
                                    />
                                    {project.developpeurs?.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                Développeurs ({project.developpeurs.length})
                                            </div>
                                            {project.developpeurs.map((d, i) => (
                                                <TeamMemberCard
                                                    key={`${d.email}-${i}`}
                                                    name={d.nom}
                                                    email={d.email}
                                                    role="Développeur"
                                                    accentColor="purple"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* QR Code Section */}
                            <section className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg text-center">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code du projet</h2>
                                <div className="inline-block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                    <img
                                        src={`/api/qrcode/project/${project.id}?projectName=${encodeURIComponent(project.nom)}`}
                                        alt="QR Code du projet"
                                        className="h-40 w-40 object-contain sm:h-48 sm:w-48"
                                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                                    />
                                </div>
                                <p className="mt-4 text-sm text-gray-600">Scannez pour partager cette page</p>
                                
                                {/* Indicateur URL ngrok pour PDF */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-700 mb-2">URL ngrok backend pour PDF:</p>
                                    <p className="text-xs font-mono text-blue-800 break-all">
                                        {backendNgrokUrl || 'Détection en cours...'}
                                    </p>
                                    {backendNgrokUrl && (
                                        <button
                                            onClick={() => {
                                                const newUrl = prompt('Entrez la nouvelle URL ngrok du backend:', backendNgrokUrl);
                                                if (newUrl && newUrl.trim()) {
                                                    setBackendNgrokUrl(newUrl.trim());
                                                }
                                            }}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Modifier l'URL
                                        </button>
                                    )}
                                </div>
                            </section>

                            {/* Contact Help */}
                            <section className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Besoin d'aide ?</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                                            <Users className="size-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Chef de projet</div>
                                            <div className="font-semibold">{project.chefDeProjet.nom}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
                                            <Calendar className="size-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Dernière mise à jour</div>
                                            <div className="font-semibold">{formatDate(new Date().toISOString())}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>

                {/* Enhanced Mobile Bottom Bar */}
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-md p-4 shadow-lg sm:hidden">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                        <StatusBadge value={project.statut} />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95 active:bg-gray-100"
                                title="Télécharger en PDF"
                            >
                                <Download className="size-4" />
                                PDF
                            </button>
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
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95"
                            >
                                <Share2 className="size-4" />
                                Partager
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}