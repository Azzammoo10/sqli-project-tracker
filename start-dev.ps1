# Script PowerShell pour démarrer l'environnement de développement
Write-Host "Demarrage de l'environnement de developpement..." -ForegroundColor Green

# Fonction pour attendre que ngrok soit prêt
function Wait-ForNgrok {
    $maxAttempts = 30
    $attempt = 0
    
    Write-Host "Attente que ngrok soit pret..." -ForegroundColor Yellow
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -TimeoutSec 5
            if ($response.tunnels.Count -gt 0) {
                return $response.tunnels[0].public_url
            }
        } catch {
            # Ignore les erreurs de connexion
        }
        
        $attempt++
        Start-Sleep -Seconds 2
        Write-Host "  Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
    }
    
    throw "Ngrok n'a pas demarre dans le delai imparti"
}

# Démarrage de ngrok
Write-Host "Demarrage de ngrok..." -ForegroundColor Cyan
Start-Process -FilePath "ngrok" -ArgumentList "start", "--all", "--config", "ngrok.yml" -WindowStyle Minimized

# Attendre que ngrok soit prêt et récupérer l'URL
$ngrokUrl = Wait-ForNgrok
Write-Host "URL ngrok detectee: $ngrokUrl" -ForegroundColor Green

# Mise à jour du fichier qrCodeService.ts
Write-Host "Mise a jour de qrCodeService.ts..." -ForegroundColor Cyan
$qrCodeServicePath = "frontend-sqli/app/services/qrCodeService.ts"
$content = Get-Content $qrCodeServicePath -Raw
$updatedContent = $content -replace 'https://[a-zA-Z0-9-]+\.ngrok-free\.app', $ngrokUrl
Set-Content $qrCodeServicePath $updatedContent -NoNewline
Write-Host "qrCodeService.ts mis a jour" -ForegroundColor Green

# Mise à jour du fichier QRCodeService.java (backend)
Write-Host "Mise a jour de QRCodeService.java..." -ForegroundColor Cyan
$qrCodeServiceJavaPath = "backend-sqli/src/main/java/com/sqli/stage/backendsqli/service/QRCodeService.java"
$javaContent = Get-Content $qrCodeServiceJavaPath -Raw
$updatedJavaContent = $javaContent -replace 'https://[a-zA-Z0-9-]+\.ngrok-free\.app', $ngrokUrl
Set-Content $qrCodeServiceJavaPath $updatedJavaContent -NoNewline
Write-Host "QRCodeService.java mis a jour" -ForegroundColor Green

# Démarrage du backend
Write-Host "Demarrage du backend..." -ForegroundColor Cyan
$backendScript = "cd backend-sqli`n./mvnw spring-boot:run"
$backendScript | Out-File -FilePath "start-backend.bat" -Encoding Default
Start-Process -FilePath "cmd" -ArgumentList "/k", "start-backend.bat" -WindowStyle Normal

# Attendre que le backend démarre
Write-Host "Attente du demarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Démarrage du frontend
Write-Host "Demarrage du frontend..." -ForegroundColor Cyan
$frontendScript = "cd frontend-sqli`nnpm run dev"
$frontendScript | Out-File -FilePath "start-frontend.bat" -Encoding Default
Start-Process -FilePath "cmd" -ArgumentList "/k", "start-frontend.bat" -WindowStyle Normal

# Affichage des informations finales
Write-Host ""
Write-Host "Environnement de developpement pret !" -ForegroundColor Green
Write-Host "URL ngrok: $ngrokUrl" -ForegroundColor Cyan
Write-Host "Frontend local: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend local: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les QR codes utiliseront automatiquement la nouvelle URL ngrok" -ForegroundColor Yellow
Write-Host ""

# Nettoyer les fichiers temporaires
Start-Sleep -Seconds 2
Remove-Item "start-backend.bat" -ErrorAction SilentlyContinue
Remove-Item "start-frontend.bat" -ErrorAction SilentlyContinue

# Garder la fenêtre ouverte
Read-Host "Appuyez sur Entree pour fermer cette fenetre"
