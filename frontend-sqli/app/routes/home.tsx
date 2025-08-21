import { useEffect } from "react";
import { useNavigate } from "react-router";
import sqliLogo from "../assets/images/SQLI-LOGO.png";
import "./loader.css"; // animations personnalisées

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const redirect = setTimeout(() => {
            navigate("/auth/login");
        }, 1500);

        return () => clearTimeout(redirect);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] flex flex-col items-center justify-center p-6 text-white text-center space-y-6">
            <img
                src={sqliLogo}
                alt="SQLI Logo"
                className="h-16 sm:h-20 object-contain filter brightness-0 invert animate-logo-blink-strong"
            />
        </div>
    );
}
