// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ⬅️ bien "react-router-dom"
import { Activity } from "lucide-react";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const targetByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  CHEF_DE_PROJET: "/chef/dashboard",
  DEVELOPPEUR: "/dev/dashboard",
  CLIENT: "/client/dashboard",
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔒 ProtectedRoute - Vérification de l'authentification");
    console.log("📍 Route actuelle:", location.pathname);
    console.log("🎭 Rôles autorisés:", allowedRoles);
    
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    console.log("🔑 Token présent:", !!token);
    console.log("👤 User présent:", !!rawUser);

    // 1) Non authentifié → login
    if (!token || !rawUser) {
      console.log("❌ Non authentifié, redirection vers login");
      navigate("/auth/login", { replace: true, state: { from: location } });
      setLoading(false);
      return;
    }

    // 2) Rôle
    let role = "";
    try {
      const userData = JSON.parse(rawUser);
      role = String(userData.role || "").toUpperCase();
      console.log("🎭 Rôle de l'utilisateur:", role);
      console.log("👤 Données utilisateur:", userData);
    } catch (error) {
      console.error("❌ Erreur parsing user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/auth/login", { replace: true });
      setLoading(false);
      return;
    }

    // 3) Autorisation
    if (allowedRoles?.length) {
      const wanted = allowedRoles.map((r) => r.toUpperCase());
      const isAllowed = role && wanted.includes(role);
      console.log("🔍 Vérification autorisation:", { role, wanted, isAllowed });
      
      if (!isAllowed) {
        console.log("❌ Rôle non autorisé, redirection vers:", targetByRole[role] ?? "/auth/login");
        navigate(targetByRole[role] ?? "/auth/login", { replace: true });
        setLoading(false);
        return;
      }
    }

    console.log("✅ Authentification réussie, affichage du contenu");
    setLoading(false);
  }, [allowedRoles, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
