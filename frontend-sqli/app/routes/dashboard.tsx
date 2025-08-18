import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page de login si pas de token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Rediriger vers le dashboard approprié selon le rôle
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        switch (userData.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'CHEF_DE_PROJET':
            navigate('/chef/dashboard');
            break;
          case 'DEVELOPPEUR':
            navigate('/dev/dashboard');
            break;
          case 'CLIENT':
            navigate('/client/dashboard');
            break;
          default:
            navigate('/auth/login');
        }
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        navigate('/auth/login');
      }
    } else {
      navigate('/auth/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Activity className="h-8 w-8 animate-spin text-[#4B2A7B] mx-auto mb-4" />
        <p className="text-gray-600">Redirection vers votre dashboard...</p>
      </div>
    </div>
  );
}
