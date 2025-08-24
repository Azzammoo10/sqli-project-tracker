import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { authService } from "~/services/api";

import toast from "react-hot-toast";
import secureIllustration from "../../assets/images/secure-login-animate.svg";
import sqliLogo from "../../assets/images/SQLI-LOGO.png";

type LoginForm = {
  username: string;
  motDePasse: string;
};

type LoginResponse = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "CHEF_DE_PROJET" | "DEVELOPPEUR" | "CLIENT" | string;
  token: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    motDePasse: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer pour cacher automatiquement l'erreur après 4 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) {
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Empêcher la soumission par défaut du formulaire
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.username || !formData.motDePasse) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.login(formData);
      
      const data: LoginResponse =
        (res && typeof res === "object" && "data" in res)
          ? (res as { data: LoginResponse }).data
          : (res as LoginResponse);

      if (!data?.token || !data?.role) {
        setError("Réponse invalide du serveur (token/role manquants).");
        return;
      }

      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Connexion réussie !");

      const targetByRole: Record<string, string> = {
        ADMIN: "/admin/dashboard",
        CHEF_DE_PROJET: "/chef/dashboard",
        DEVELOPPEUR: "/dev/dashboard",
        CLIENT: "/client/dashboard",
      };

      const roleKey = String(data.role).toUpperCase();
      const targetPath = targetByRole[roleKey] ?? "/auth/login";

      navigate(targetPath, { replace: true });
      
    } catch (error: any) {
      
      let errorMessage = "Erreur de connexion";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || "Erreur de connexion";
        
        // Gérer les différents types d'erreur avec des messages plus spécifiques
        if (errorData.error === 'USER_NOT_FOUND') {
          errorMessage = "Nom d'utilisateur incorrect";
        } else if (errorData.error === 'USER_DISABLED') {
          errorMessage = "Votre compte est désactivé. Veuillez contacter l'administrateur.";
        } else if (errorData.error === 'INVALID_CREDENTIALS') {
          errorMessage = "Mot de passe incorrect";
        } else if (errorData.error === 'INVALID_TOKEN') {
          errorMessage = "Token d'authentification invalide";
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] flex items-center justify-center p-6 text-white"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex">
          {/* Section Login - Gauche */}
          <div className="flex-1 p-8">
            {/* Header avec Logo */}
            <div className="text-center mb-8">
              <img src={sqliLogo} alt="SQLI Logo" className="h-16 mx-auto mb-4" />
              <p className="text-gray-600">Login into your account</p>
            </div>

            {/* Formulaire */}
            <form 
              className="space-y-6" 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
            >
              {/* Affichage des erreurs */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="username.IT*"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="motDePasse"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="motDePasse"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-black"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="w-full bg-[#4B2A8B] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5B2A8B] focus:outline-none focus:ring-2 focus:ring-[#4B2A8B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Connexion..." : "Login now"}
                </button>

                <Link
                  to="/contact/admin"
                  className="block w-full border border-[#4B2A7B] text-[#4B2A7B] py-3 px-4 rounded-lg font-medium hover:bg-[#4B2A7B]/5 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 transition-colors text-center"
                >
                  Contact Admin
                </Link>
              </div>
            </form>
          </div>

          {/* Section Illustration - Droite */}
          <div className="flex-1 bg-gradient-to-br from-[#4B2A7B]/5 to-[#4B2A7B]/10 p-8 flex items-center justify-center relative">
            <div className="text-center">
              <img
                src={secureIllustration}
                alt="Secure Login"
                className="w-[400px] max-w-none mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}