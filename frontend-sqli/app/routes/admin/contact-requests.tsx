import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Eye, CheckSquare, MessageSquare, X, User, Mail, Calendar, FileText } from 'lucide-react';
import { contactService } from '../../services/api';
import toast from 'react-hot-toast';
import NavAdmin from '../../components/NavAdmin';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '~/services/api';

interface ContactRequest {
  id: number;
  username: string;
  email: string;
  type: string;
  description: string;
  dateCreation: string;
  traite: boolean;
  dateTraitement?: string;
}

export default function ContactRequestsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'processed'>('all');
  const [me, setMe] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [userData] = await Promise.all([
          authService.getCurrentUser(),
        ]);
        setMe(userData);
        await loadContacts();
      } catch (e: any) {
        console.error(e);
        toast.error('Erreur lors du chargement des données');
      }
    })();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await contactService.getAllContacts();
      setContacts(response);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des réclamations');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsProcessed = async (id: number) => {
    try {
      await contactService.markAsProcessed(id);
      toast.success('Réclamation marquée comme traitée');
      loadContacts(); // Recharger la liste
    } catch (error: any) {
      toast.error('Erreur lors du traitement');
      console.error('Erreur:', error);
    }
  };

  const getFilteredContacts = () => {
    switch (filter) {
      case 'unprocessed':
        return contacts.filter(contact => !contact.traite);
      case 'processed':
        return contacts.filter(contact => contact.traite);
      default:
        return contacts;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (traite: boolean) => {
    if (traite) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = (traite: boolean) => {
    if (traite) {
      return 'Traité';
    }
    return 'En attente';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openContactDetails = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  const filteredContacts = getFilteredContacts();

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <NavAdmin />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des Réclamations</h1>
                        <p className="text-white/90 text-lg">Gérez les demandes de contact et les réclamations des utilisateurs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtres et Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 grid place-items-center">
                      <AlertTriangle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 grid place-items-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">En attente</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {contacts.filter(c => !c.traite).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-green-50 grid place-items-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Traitées</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {contacts.filter(c => c.traite).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 grid place-items-center">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {contacts.filter(c => {
                          const today = new Date().toDateString();
                          return new Date(c.dateCreation).toDateString() === today;
                        }).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'all'
                          ? 'bg-[#4B2A7B] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Toutes ({contacts.length})
                    </button>
                    <button
                      onClick={() => setFilter('unprocessed')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'unprocessed'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      En attente ({contacts.filter(c => !c.traite).length})
                    </button>
                    <button
                      onClick={() => setFilter('processed')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'processed'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Traitées ({contacts.filter(c => c.traite).length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des réclamations */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B2A7B] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des réclamations...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune réclamation trouvée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                onClick={() => openContactDetails(contact)}
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {contact.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Cliquer pour voir les détails
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getTypeLabel(contact.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div 
                                className="text-sm text-gray-900 max-w-xs truncate cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                onClick={() => openContactDetails(contact)}
                              >
                                {contact.description || 'Aucune description'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(contact.dateCreation)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(contact.traite)}
                                <span className="ml-2 text-sm text-gray-900">
                                  {getStatusText(contact.traite)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {!contact.traite && (
                                <button
                                  onClick={() => markAsProcessed(contact.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                  <CheckSquare className="h-4 w-4 mr-1" />
                                  Marquer traité
                                </button>
                              )}
                              {contact.traite && contact.dateTraitement && (
                                <span className="text-sm text-gray-500">
                                  Traité le {formatDate(contact.dateTraitement)}
                                </span>
                                                             )}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>
       </div>

               {/* Modal de détails */}
        {showModal && selectedContact && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             {/* Header du modal */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center">
                   <MessageSquare className="h-6 w-6 text-[#4B2A7B]" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">Détails de la Réclamation</h2>
                   <p className="text-sm text-gray-600">#{selectedContact.id}</p>
                 </div>
               </div>
               <button
                 onClick={closeModal}
                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <X className="h-5 w-5 text-gray-500" />
               </button>
             </div>

             {/* Contenu du modal */}
             <div className="p-6 space-y-6">
               {/* Informations utilisateur */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <User className="h-5 w-5 text-[#4B2A7B]" />
                   Informations Utilisateur
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center gap-3">
                     <User className="h-4 w-4 text-gray-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Nom d'utilisateur</p>
                       <p className="text-sm text-gray-600">{selectedContact.username}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Mail className="h-4 w-4 text-gray-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Email</p>
                       <p className="text-sm text-gray-600">{selectedContact.email}</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Type de réclamation */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-[#4B2A7B]" />
                   Type de Réclamation
                 </h3>
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                   {getTypeLabel(selectedContact.type)}
                 </span>
               </div>

               {/* Description */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <FileText className="h-5 w-5 text-[#4B2A7B]" />
                   Description du Problème
                 </h3>
                 <div className="bg-white rounded-lg p-4 border border-gray-200">
                   <p className="text-sm text-gray-700 whitespace-pre-wrap">
                     {selectedContact.description || 'Aucune description fournie'}
                   </p>
                 </div>
               </div>

               {/* Dates */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <Calendar className="h-5 w-5 text-[#4B2A7B]" />
                   Informations Temporelles
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center gap-3">
                     <Clock className="h-4 w-4 text-gray-500" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">Date de création</p>
                       <p className="text-sm text-gray-600">{formatDate(selectedContact.dateCreation)}</p>
                     </div>
                   </div>
                   {selectedContact.traite && selectedContact.dateTraitement && (
                     <div className="flex items-center gap-3">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Date de traitement</p>
                         <p className="text-sm text-gray-600">{formatDate(selectedContact.dateTraitement)}</p>
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* Statut */}
               <div className="bg-gray-50 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut</h3>
                 <div className="flex items-center gap-3">
                   {getStatusIcon(selectedContact.traite)}
                   <span className="text-sm font-medium text-gray-900">
                     {getStatusText(selectedContact.traite)}
                   </span>
                 </div>
               </div>
             </div>

             {/* Actions du modal */}
             <div className="flex items-center justify-between p-6 border-t border-gray-200">
               <button
                 onClick={closeModal}
                 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
               >
                 Fermer
               </button>
               {!selectedContact.traite && (
                 <button
                   onClick={() => {
                     markAsProcessed(selectedContact.id);
                     closeModal();
                   }}
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                 >
                   <CheckSquare className="h-4 w-4 mr-2" />
                   Marquer comme traité
                 </button>
               )}
             </div>
           </div>
         </div>
       )}
     </ProtectedRoute>
   );
 }
