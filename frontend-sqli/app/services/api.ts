import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Configuration de base d'Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction utilitaire pour vérifier si localStorage est disponible
const isLocalStorageAvailable = () => {
  try {
    return typeof window !== 'undefined' && window.localStorage;
  } catch {
    return false;
  }
};

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    if (isLocalStorageAvailable()) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && isLocalStorageAvailable()) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types pour les réponses API
export interface LoginRequest {
  username: string;
  motDePasse: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  username: string;
  email: string;
  role: string;
  id: number;
}

export interface ContactRequest {
  username: string;
  email: string;
  type: string;
  description: string;
}

// Services API
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('token');
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const contactService = {
  sendContactRequest: async (contactData: ContactRequest): Promise<void> => {
    await apiClient.post('/contact/send', contactData);
  },
  getContactTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/contact/types');
    return response.data;
  },
  getAllContacts: async (): Promise<any[]> => {
    const response = await apiClient.get('/contact');
    return response.data;
  },
  markAsProcessed: async (id: number): Promise<void> => {
    await apiClient.put(`/contact/${id}/process`);
  },
};

export default apiClient;
