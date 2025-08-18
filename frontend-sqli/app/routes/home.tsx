import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate } from "react-router";

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
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{
               background: "linear-gradient(135deg, #2a1b3d 0%, #44337a 50%, #6b46c1 100%)"
           }}>
          <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">SQLI Digital Experience</h1>
        <p className="text-xl">Redirection vers la page de connexion...</p>
      </div>
    </div>
  );
}
