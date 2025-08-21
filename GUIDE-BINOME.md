# 🚀 Guide de Mise à Jour - Projet Stage SQLI (Binôme)

## 📥 Étape 1 : Récupérer les changements

### **1.1 Pull des dernières modifications**
```bash
# Dans votre dossier de travail
git pull origin main

```

### **1.2 Vérifier les nouveaux fichiers**
```bash
# Vérifier les nouveaux fichiers ajoutés
git status

# Voir les changements récents
git log --oneline -10
```

---

## 🔧 Étape 2 : Mise à jour des dépendances

### **2.1 Backend (si nécessaire)**
```bash
cd backend-sqli
./mvnw clean install
```

### **2.2 Frontend (si nécessaire)**
```bash
cd frontend-sqli
npm install
```

---

## 🚀 Étape 3 : Démarrage avec les nouvelles fonctionnalités

### **3.1 Utiliser le script automatique (RECOMMANDÉ)**
```powershell
# Dans le dossier racine du projet
.\start-dev.ps1
```

**Ce script va automatiquement :**
- ✅ Démarrer ngrok avec la nouvelle configuration
- ✅ Détecter l'URL ngrok et mettre à jour les fichiers
- ✅ Démarrer le backend avec Maven Wrapper
- ✅ Démarrer le frontend
- ✅ Configurer les QR codes avec la bonne URL

### **3.2 Ou démarrer manuellement**
```bash
# Terminal 1 - Backend
cd backend-sqli
./mvnw spring-boot:run

# Terminal 2 - Frontend  
cd frontend-sqli
npm run dev

# Terminal 3 - ngrok
ngrok start --all --config ngrok.yml
```

---

## 🆕 Nouvelles fonctionnalités ajoutées

### **✅ Dashboard Client complet**
- **URL** : http://localhost:5173/client/projects
- **Fonctionnalités** :
  - Liste des projets du client
  - QR codes pour chaque projet
  - Statistiques et progression

### **✅ QR Codes fonctionnels**
- **Comment tester** :
  1. Aller sur http://localhost:5173/client/projects
  2. Scanner un QR code avec votre téléphone
  3. Le QR code ouvre la page publique du projet

### **✅ Page publique des projets**
- **URL** : https://[URL-NGROK]/project/[ID]
- **Fonctionnalités** :
  - Détails du projet
  - Équipe et progression
  - Interface mobile-friendly

### **✅ Scripts de démarrage automatique**
- `start-dev.ps1` : Script PowerShell complet
- `start-dev.bat` : Script batch alternatif
- Configuration automatique des URLs ngrok

---

## 🔧 Configuration requise

### **1. ngrok (si pas déjà configuré)**
```bash
# Vérifier que ngrok est installé
ngrok --version

# Si pas installé, télécharger depuis https://ngrok.com/download
```

### **2. Token ngrok (si pas déjà configuré)**
Modifier `ngrok.yml` :
```yaml
version: "2"
authtoken: VOTRE_TOKEN_NGROK_ICI

tunnels:
  frontend:
    addr: 5173
    proto: http
    inspect: true
    
  backend:
    addr: 8080
    proto: http
    inspect: true
```

---

## 🧪 Tests à effectuer

### **1. Test du dashboard client**
- [ ] Se connecter en tant que client
- [ ] Accéder à http://localhost:5173/client/projects
- [ ] Vérifier que les projets s'affichent
- [ ] Vérifier que les QR codes sont générés

### **2. Test des QR codes**
- [ ] Scanner un QR code avec votre téléphone
- [ ] Vérifier que la page publique s'ouvre
- [ ] Vérifier que les détails du projet s'affichent

### **3. Test de la page publique**
- [ ] Ouvrir https://[URL-NGROK]/project/[ID] dans le navigateur
- [ ] Vérifier que la page s'affiche correctement
- [ ] Tester sur mobile

---

## 🛠️ Dépannage

### **Problème : QR code ne fonctionne pas**
```bash
# Vérifier que ngrok est démarré
# Vérifier l'URL dans l'interface ngrok : http://localhost:4040
# Vérifier que les fichiers ont été mis à jour automatiquement
```

### **Problème : Page publique ne s'affiche pas**
```bash
# Vérifier que le backend est démarré
# Vérifier l'endpoint : http://localhost:8080/api/projects/[ID]/public
```

### **Problème : Script PowerShell ne fonctionne pas**
```bash
# Utiliser le script batch à la place
start-dev.bat
```

---

## 📱 Fonctionnalités QR Code

### **Comment ça marche maintenant :**
1. **Le QR code contient** : `https://[URL-NGROK]/project/[ID]`
2. **Quand scanné** : Ouvre la page publique du projet
3. **La page publique** : Affiche les détails du projet

### **Configuration automatique :**
Le script `start-dev.ps1` met automatiquement à jour :
- ✅ `frontend-sqli/app/services/qrCodeService.ts`
- ✅ `backend-sqli/src/main/java/com/sqli/stage/backendsqli/service/QRCodeService.java`

---

## 🎉 Résumé des améliorations

### **✅ Ajouté :**
- Dashboard client complet
- QR codes fonctionnels
- Page publique des projets
- Scripts de démarrage automatique
- Configuration automatique des URLs ngrok

### **✅ Amélioré :**
- Interface utilisateur
- Gestion des erreurs
- Responsive design
- Performance

---

## 📞 En cas de problème

### **Vérifications rapides :**
1. ✅ `git pull` a-t-il fonctionné ?
2. ✅ Les dépendances sont-elles à jour ?
3. ✅ ngrok est-il configuré ?
4. ✅ Le script de démarrage fonctionne-t-il ?

### **Logs utiles :**
- **Backend** : Terminal Spring Boot
- **Frontend** : Terminal React  
- **ngrok** : http://localhost:4040

---

## 🚀 Prêt à travailler !

Votre environnement est maintenant à jour avec toutes les nouvelles fonctionnalités !

**URLs importantes :**
- **Application** : http://localhost:5173
- **Dashboard Client** : http://localhost:5173/client/projects
- **API** : http://localhost:8080
- **ngrok** : http://localhost:4040
