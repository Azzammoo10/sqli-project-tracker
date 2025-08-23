import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('=== PROTECTED ROUTE CHECK ===');
        console.log('Current path:', window.location.pathname);
        console.log('Allowed roles:', allowedRoles);
        
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.log('No token, redirecting to login');
          navigate('/auth/login');
          return;
        }

        // Vérifier si l'utilisateur est en localStorage
        const storedUser = localStorage.getItem('user');
        console.log('Stored user exists:', !!storedUser);
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('User data:', userData);
            setUser(userData);
            
            // Vérifier les rôles si spécifiés
            if (allowedRoles && !allowedRoles.includes(userData.role)) {
              console.log('Role not allowed, redirecting to login');
              navigate('/auth/login');
              return;
            }
            console.log('User authenticated successfully');
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/auth/login');
            return;
          }
        } else {
          // Essayer de récupérer l'utilisateur depuis l'API
          console.log('No stored user, fetching from API');
          try {
            const currentUser = await authService.getCurrentUser();
            console.log('API user data:', currentUser);
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
              console.log('API user role not allowed, redirecting to login');
              navigate('/auth/login');
              return;
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/auth/login');
            return;
          }
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
        return;
      } finally {
        setIsLoading(false);
        console.log('=== PROTECTED ROUTE CHECK DONE ===');
      }
    };

    checkAuth();
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B2A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
