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
    <div className="min-h-screen bg-gradient-to-br from-[#4B2A7B] via-[#5B3A8B] to-[#6B4A9B] flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">SQLI Digital Experience</h1>
        <p className="text-xl">Redirection vers la page de connexion...</p>
      </div>
    </div>
  );
}
