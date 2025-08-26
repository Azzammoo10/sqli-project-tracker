// app/services/qrCodeService.ts
import apiClient from './api';

export const qrCodeService = {
  /**
   * Génère un QR code pour un projet
   * @param projectId ID du projet
   * @param projectName Nom du projet
   * @returns URL du QR code généré
   */
  generateProjectQRCode: (projectId: number, projectName: string): string => {
    // Appeler le backend local directement (via le proxy Vite)
    return `/api/qrcode/project/${projectId}?projectName=${encodeURIComponent(projectName)}`;
  },

  // Générer l'URL de la page publique accessible depuis le téléphone
  generateProjectPublicUrl: (projectId: number): string => {
    // URL ngrok pour le frontend (port 5173)
    const frontendNgrokUrl = 'https://78877a0e93f8.ngrok-free.app';
    return `${frontendNgrokUrl}/project/${projectId}`;
  },

  /**
   * Vérifie si le service QR code est disponible
   * @returns Promise<boolean>
   */
  checkQRCodeServiceAvailability: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/api/qrcode/project/1?projectName=Test', {
        method: 'HEAD',
      });
      return response.ok;
    } catch (error) {
      console.error('Service QR code indisponible:', error);
      return false;
    }
  },

  /**
   * Télécharge un QR code
   * @param projectId ID du projet
   * @param projectName Nom du projet
   */
      downloadQRCode: async (projectId: number, projectName: string): Promise<void> => {
    try {
      const url = qrCodeService.generateProjectQRCode(projectId, projectName);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du QR code');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-code-${projectName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }
};
