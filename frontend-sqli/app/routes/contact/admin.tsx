import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, MessageSquare } from 'lucide-react';
import { contactService } from '../../services/api';
import toast from 'react-hot-toast';
import serverIllustration from '../../assets/images/undraw_server-cluster_7ugi.svg';
import sqliLogo from '../../assets/images/SQLI-LOGO.png';

export default function ContactAdminPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await contactService.sendContactRequest(formData);
      toast.success('Message envoyé avec succès !');
      navigate('/auth/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi du message';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66] flex items-center justify-center p-6 text-white">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">

        <div className="flex">
          {/* Section Formulaire - Gauche */}
          <div className="flex-1 p-8">
            {/* Header avec Logo */}
            <div className="text-center mb-8">
              <img 
                src={sqliLogo} 
                alt="SQLI Logo" 
                className="h-16 mx-auto mb-4"
              />
              
              <p className="text-gray-600">Contactez l'administrateur</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
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
                    placeholder="azqamazz"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ex: name@domain.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Description Problème */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description Problème
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter your problem here"
                    rows={4}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent resize-none text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#4B2A7B] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5B3A8B] focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Envoi...' : 'Send'}
                </button>
                
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    to="/auth/login"
                    className="block w-full border border-[#4B2A7B] text-[#4B2A7B] py-3 px-4 rounded-lg font-medium hover:bg-[#4B2A7B]/5 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:ring-offset-2 transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Section Illustration - Droite */}
          <div className="flex-1 bg-gradient-to-br from-[#4B2A7B]/5 to-[#4B2A7B]/10 p-8 flex items-center justify-center relative">
            <div className="text-center">
              <img 
                src={serverIllustration} 
                alt="Server Cluster" 
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
