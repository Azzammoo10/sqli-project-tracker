import React, { useState, useEffect } from 'react';
import { QrCode, Download, Share2, AlertCircle, RefreshCw } from 'lucide-react';
import { qrCodeService } from '../services/qrCodeService';

interface ProjectQRCodeProps {
  projectId: number;
  projectName: string;
  className?: string;
}

const ProjectQRCode: React.FC<ProjectQRCodeProps> = ({ projectId, projectName, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const projectPublicUrl = qrCodeService.generateProjectPublicUrl(projectId);

  // Initialiser l'URL du QR code
  useEffect(() => {
    const url = qrCodeService.generateProjectQRCode(projectId, projectName);
    setQrCodeUrl(url);
  }, [projectId, projectName]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const retryLoadImage = () => {
    setImageError(false);
    setImageLoaded(false);
  };

  const handleDownload = async () => {
    try {
      await qrCodeService.downloadQRCode(projectId, projectName);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback avec l'ancienne méthode
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${projectName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Projet: ${projectName}`,
          text: `Consultez les détails du projet ${projectName}`,
          url: window.location.origin + projectPublicUrl,
        });
      } catch (error) {
        console.log('Erreur lors du partage:', error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      navigator.clipboard.writeText(window.location.origin + projectPublicUrl);
      // Vous pouvez ajouter un toast ici pour confirmer la copie
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span>QR Code du projet</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Télécharger le QR code"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Partager le projet"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="relative inline-block">
          {imageError ? (
            <div className="w-48 h-48 mx-auto border-2 border-red-200 rounded-lg shadow-sm bg-red-50 flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-red-600 text-sm mb-2 text-center">
                {!serviceAvailable 
                  ? 'Service QR code indisponible' 
                  : 'Erreur de chargement'
                }
              </p>
              <button
                onClick={retryLoadImage}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded-md hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Réessayer</span>
              </button>
              {!serviceAvailable && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Vérifiez que le backend est démarré
                </p>
              )}
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-lg shadow-sm bg-gray-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <img 
                src={qrCodeUrl}
                alt={`QR Code pour le projet ${projectName}`}
                className={`w-48 h-48 mx-auto border-2 border-gray-200 rounded-lg shadow-sm ${!imageLoaded ? 'hidden' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {imageLoaded && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded-b-lg">
                  {projectName}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Scannez ce QR code pour accéder directement à ce projet
          </p>
          <p className="text-xs text-gray-500">
            Ou partagez le lien : <span className="font-mono text-blue-600">{projectPublicUrl}</span>
          </p>
        </div>

        {/* Instructions d'utilisation */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Comment utiliser :</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Scannez avec votre smartphone</li>
            <li>• Partagez avec votre équipe</li>
            <li>• Imprimez pour affichage</li>
            <li>• Intégrez dans vos documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectQRCode;
