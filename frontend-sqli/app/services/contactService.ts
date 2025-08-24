import apiClient from './api';

export interface ContactRequest {
  id: number;
  username: string;
  email: string;
  type: string;
  description: string;
  dateCreation: string;
  traite: boolean;
  dateTraitement?: string;
}

export interface ContactStats {
  total: number;
  nonTraitees: number;
  traitees: number;
  parType: Record<string, number>;
  parStatut: {
    NOUVELLE: number;
    EN_COURS: number;
    RESOLUE: number;
    REJETEE: number;
  };
}

export const contactService = {
  // Obtenir toutes les réclamations
  getAllContacts: async (): Promise<ContactRequest[]> => {
    try {
      console.log('🔍 Appel API /contact...');
      const response = await apiClient.get('/contact');
      console.log('📡 Réponse API /contact:', response);
      console.log('📊 Données contacts:', response.data);
      console.log('📊 Type de données:', typeof response.data);
      console.log('📊 Longueur:', Array.isArray(response.data) ? response.data.length : 'Pas un tableau');
      
      if (Array.isArray(response.data)) {
        console.log('✅ Contacts reçus:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ Réponse non-tableau:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des contacts:', error);
      return [];
    }
  },

  // Obtenir les types de contact disponibles
  getContactTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/contact/types');
    return response.data;
  },

  // Marquer une réclamation comme traitée
  markAsProcessed: async (id: number): Promise<void> => {
    await apiClient.put(`/contact/${id}/process`);
  },

  // Envoyer une nouvelle réclamation
  sendContactRequest: async (contactData: Omit<ContactRequest, 'id' | 'traite' | 'dateCreation'>): Promise<void> => {
    await apiClient.post('/contact/send', contactData);
  },

  // Obtenir les statistiques des réclamations
  getContactStats: async (): Promise<ContactStats> => {
    try {
      const contacts = await contactService.getAllContacts();
      const contactsArray = contacts || [];
      
      if (contactsArray.length === 0) {
        return {
          total: 0,
          nonTraitees: 0,
          traitees: 0,
          parType: {},
          parStatut: {
            NOUVELLE: 0,
            EN_COURS: 0,
            RESOLUE: 0,
            REJETEE: 0,
          }
        };
      }
      
      // Calculer les statistiques
      const stats: ContactStats = {
        total: contactsArray.length,
        nonTraitees: contactsArray.filter((c: ContactRequest) => !c.traite).length,
        traitees: contactsArray.filter((c: ContactRequest) => c.traite).length,
        parType: {},
        parStatut: {
          NOUVELLE: 0,
          EN_COURS: 0,
          RESOLUE: 0,
          REJETEE: 0,
        }
      };

      // Compter par type
      contactsArray.forEach((contact: ContactRequest) => {
        stats.parType[contact.type] = (stats.parType[contact.type] || 0) + 1;
      });

      // Compter par statut (basé sur le champ traite et type)
      contactsArray.forEach((contact: ContactRequest) => {
        if (!contact.traite) {
          if (contact.type.includes('URGENT') || contact.type.includes('CRITIQUE')) {
            stats.parStatut.EN_COURS++;
          } else {
            stats.parStatut.NOUVELLE++;
          }
        } else {
          // Si traité, on considère comme résolu par défaut
          stats.parStatut.RESOLUE++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des réclamations:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        total: 0,
        nonTraitees: 0,
        traitees: 0,
        parType: {},
        parStatut: {
          NOUVELLE: 0,
          EN_COURS: 0,
          RESOLUE: 0,
          REJETEE: 0,
        }
      };
    }
  },

  // Obtenir les réclamations des dernières 24h
  getRecentContacts: async (hours: number = 24): Promise<ContactRequest[]> => {
    try {
      const contacts = await contactService.getAllContacts();
      const contactsArray = contacts || [];
      
      if (contactsArray.length === 0) {
        return [];
      }
      
      const now = new Date();
      const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      
      return contactsArray.filter((contact: ContactRequest) => {
        const contactDate = new Date(contact.dateCreation);
        return contactDate >= cutoff;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations récentes:', error);
      return [];
    }
  },

  // Obtenir les réclamations par statut
  getContactsByStatus: async (status: 'all' | 'unprocessed' | 'processed'): Promise<ContactRequest[]> => {
    try {
      const contacts = await contactService.getAllContacts();
      const contactsArray = contacts || [];
      
      if (contactsArray.length === 0) {
        return [];
      }
      
      switch (status) {
        case 'unprocessed':
          return contactsArray.filter((contact: ContactRequest) => !contact.traite);
        case 'processed':
          return contactsArray.filter((contact: ContactRequest) => contact.traite);
        default:
          return contactsArray;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations par statut:', error);
      return [];
    }
  }
};

export default contactService;
