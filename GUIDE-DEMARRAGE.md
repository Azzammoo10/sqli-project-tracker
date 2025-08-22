# 🚀 Guide de Démarrage Rapide

## 📋 Processus manuel (recommandé pour le développement)

### 1. **Démarrer ngrok**
```bash
ngrok start --all --config ngrok.yml
```

### 2. **Copier la nouvelle URL ngrok**
- Ouvrir http://localhost:4040
- Copier l'URL du tunnel frontend (ex: `https://abc123.ngrok-free.app`)

### 3. **Mettre à jour les fichiers**

#### Frontend (qrCodeService.ts)
```typescript
// Remplacer l'ancienne URL par la nouvelle
const frontendNgrokUrl = 'https://VOTRE_NOUVELLE_URL.ngrok-free.app';
```

#### Backend (QRCodeService.java)
```java
// Remplacer l'ancienne URL par la nouvelle
String projectUrl = "https://VOTRE_NOUVELLE_URL.ngrok-free.app/project/" + projectId;
```

### 4. **Démarrer les services**
```bash
# Terminal 1 - Backend
cd backend-sqli && mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend-sqli && npm run dev
```

## 🤖 Processus automatisé

### Option A : Script Batch
```bash
start-dev.bat
```

### Option B : Script PowerShell
```powershell
.\start-dev.ps1
```

## ⚡ Commandes rapides

### Vérifier l'URL ngrok
```bash
curl http://localhost:4040/api/tunnels
```

### Tester le QR code
1. Aller sur le dashboard client
2. Sélectionner un projet dans le dropdown QR code
3. Scanner avec votre téléphone

## 🔧 Dépannage

### Ngrok ne démarre pas
- Vérifier que l'authtoken est configuré : `ngrok config check`
- Redémarrer ngrok : `ngrok start --all --config ngrok.yml`

### QR code ne fonctionne pas
- Vérifier que l'URL dans `qrCodeService.ts` correspond à l'URL ngrok
- Vérifier que l'URL dans `QRCodeService.java` correspond à l'URL ngrok
- Redémarrer le backend après modification

### Erreur de connexion
- Vérifier que le frontend et backend sont démarrés
- Vérifier que ngrok est actif sur http://localhost:4040


