import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react"; // Ajoute une icône animée (chargement)

export function meta({}: Route.MetaArgs) {
    return [
        { title: "SQLI Digital Experience" },
        { name: "description", content: "Portail de gestion de projet SQLI" },
    ];
}

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Rediriger vers la page de login
        navigate("/auth/login");
    }, [navigate]);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                background: "linear-gradient(135deg, #2a1b3d 0%, #44337a 50%, #6b46c1 100%)",
            }}
        >
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl px-8 py-10 max-w-md w-full text-center text-white animate-fade-in">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    SQLI Digital Experience
                </h1>
                <p className="text-base sm:text-lg text-white/80 mb-6">
                    Redirection sécurisée en cours...
                </p>
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                </div>
            </div>
        </div>
    );
}
