import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { contactService } from '../../services/api';
import toast from 'react-hot-toast';
import serverIllustration from '../../assets/images/secure-server-animate.svg';
import sqliLogo from '../../assets/images/SQLI-LOGO.png';

export default function ContactAdminPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    type: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [contactTypes, setContactTypes] = useState<Array<{value: string, label: string}>>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  
    setFormData(prev => {
      // si on change le type et que ce n’est plus AUTRE → vider la description
      if (name === 'type' && value !== 'AUTRE') {
        return { ...prev, type: value, description: '' };
      }
      return { ...prev, [name]: value };
    });
  
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  

  // Charger les types de contact disponibles
  useEffect(() => {
    const loadContactTypes = async () => {
      try {
        const types = await contactService.getContactTypes();
        setContactTypes(types.map((type: string) => ({
          value: type,
          label: type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des types de contact:', error);
        // Types par défaut en cas d'erreur
        setContactTypes([
          { value: 'MOT_DE_PASSE_OUBLIE', label: 'Mot de passe oublié' },
          { value: 'COMPTE_BLOQUE', label: 'Compte bloqué' },
          { value: 'PROBLEME_CONNEXION', label: 'Problème de connexion' },
          { value: 'DEMANDE_ACCES', label: 'Demande d\'accès' },
          { value: 'BUG_APPLICATION', label: 'Bug dans l\'application' },
          { value: 'DEMANDE_FONCTIONNALITE', label: 'Demande de nouvelle fonctionnalité' },
          { value: 'PROBLEME_PERFORMANCE', label: 'Problème de performance' },
          { value: 'AUTRE', label: 'Autre' }
        ]);
      }
    };

    loadContactTypes();
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est obligatoire';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.type) {
      errors.type = 'Le type de réclamation est obligatoire';
    }

    if (formData.type === 'AUTRE' && !formData.description.trim()) {
      errors.description = 'La description est obligatoire pour le type "Autre"';
    }
    

    // Description est optionnelle, pas de validation requise

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

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
                    placeholder="username.role-sqli.000"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900 ${
                      validationErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {validationErrors.username}
                  </p>
                )}
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
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900 ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Type de Réclamation */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Réclamation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent text-gray-900 ${
                      validationErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Sélectionnez un type de réclamation</option>
                    {contactTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {validationErrors.type}
                  </p>
                )}
              </div>

              {/* Description Problème */}
              {formData.type === 'AUTRE' && (
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
        placeholder="Décrivez le problème"
        rows={4}
        required
        className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent resize-none text-gray-900 ${
          validationErrors.description ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    </div>
    {validationErrors.description && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {validationErrors.description}
      </p>
    )}
  </div>
)}


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
                className="w-[420px] max-w-none mx-auto"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
