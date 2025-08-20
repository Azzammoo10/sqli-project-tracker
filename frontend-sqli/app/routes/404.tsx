import { Link } from 'react-router-dom';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import logo from '../assets/images/SQLI-LOGO.png';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] flex items-center justify-center p-6 text-white">
            <div className="bg-[#18142A] border border-[#322C51] rounded-3xl shadow-2xl px-10 py-12 max-w-md w-full text-center animate-fade-in">
                {/* Logo */}
                <img
                    src={logo}
                    alt="Logo de l'entreprise"
                    className="h-15 mb-6 mx-auto filter brightness-0 invert"
                />


                <div className="flex flex-col items-center mb-6">
                    <ShieldAlert className="h-12 w-12 text-purple-400 mb-4" />
                    <div className="text-5xl font-extrabold text-purple-300">Erreur 404</div>
                    <h1 className="text-xl font-medium text-white mt-2">Accès refusé</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Cette page est protégée ou n'existe pas.<br />
                        Veuillez vous authentifier ou retourner en lieu sûr.
                    </p>
                </div>{/* Icone Sécurité */}


                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-6 space-y-4 sm:space-y-0">
                    <Link
                        to="/auth/login"
                        className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <Home className="h-5 w-5" />
                        <span>Connexion sécurisée</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center space-x-2 text-purple-300 hover:text-purple-400 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Retour</span>
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Ce système est surveillé. Toute tentative non autorisée sera enregistrée.
                </p>
            </div>
        </div>
    );
}
