import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/api";
import toast from "react-hot-toast";
import secureIllustration from "../../assets/images/undraw_secure.svg";
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
  const [showPassword, setShowPassword] = useState(false); // 👈 état pour l’œil

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.motDePasse) {
      toast.error("Merci de remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(formData);
      const data: LoginResponse =
        (res && typeof res === "object" && "data" in res)
          ? (res as { data: LoginResponse }).data
          : (res as LoginResponse);

      if (!data?.token || !data?.role) {
        toast.error("Réponse invalide du serveur (token/role manquants).");
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
      setTimeout(() => {
        if (window.location.pathname !== targetPath) {
          window.location.href = targetPath;
        }
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur de connexion";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #2a1b3d 0%, #44337a 50%, #6b46c1 100%)",
      }}
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type={showPassword ? "text" : "password"} // 👈 toggle visible
                    id="motDePasse"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleInputChange}
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
                  className="w-full bg-[#4B2A7B] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5B3A8B] focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
