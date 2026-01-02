# Script PowerShell pour démarrer l'environnement de développement en mode preview
Write-Host "Demarrage de l'environnement de developpement (MODE PREVIEW)..." -ForegroundColor Green

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

# Vérifier si ngrok est déjà en cours d'exécution
$ngrokProcess = Get-Process ngrok -ErrorAction SilentlyContinue
if (-not $ngrokProcess) {
    Write-Host "Demarrage de ngrok..." -ForegroundColor Cyan
    Start-Process -FilePath "ngrok" -ArgumentList "start", "--all", "--config", "ngrok.yml" -WindowStyle Minimized
} else {
    Write-Host "Ngrok est deja en cours d'execution" -ForegroundColor Yellow
}

# Attendre que ngrok soit prêt et récupérer l'URL
try {
    $ngrokUrl = Wait-ForNgrok
    Write-Host "URL ngrok detectee: $ngrokUrl" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la detection de ngrok: $_" -ForegroundColor Red
    Write-Host "Verifiez que ngrok est correctement configure." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}

# Récupérer l'URL ngrok pour le port 5173
$targetPort = 5173
$maxRetries = 15
$delaySeconds = 1

Write-Host "Recherche du tunnel ngrok pour localhost:$targetPort..." -ForegroundColor Cyan

function Get-NgrokUrlForPort([int]$port, [int]$retries, [int]$delaySec) {
    for ($i = 1; $i -le $retries; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method GET -TimeoutSec 2 -ErrorAction Stop

            if ($resp -and $resp.tunnels) {
                $tunnels = $resp.tunnels | Where-Object {
                    $_.config.addr -match "://(localhost|127\.0\.0\.1):$port($|/)"
                }

                if ($tunnels) {
                    $httpsTunnel = $tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1
                    $chosen = if ($httpsTunnel) { $httpsTunnel } else { $tunnels | Select-Object -First 1 }

                    if ($null -ne $chosen.public_url) {
                        return $chosen.public_url
                    }
                }
            }
        } catch {
            # API pas prête
        }

        Start-Sleep -Seconds $delaySec
    }

    return $null
}

$ngrokUrl = Get-NgrokUrlForPort -port $targetPort -retries $maxRetries -delaySec $delaySeconds

if (-not $ngrokUrl) {
    Write-Host "Échec: impossible de trouver une URL ngrok pour localhost:$targetPort" -ForegroundColor Red
    exit 1
}

Write-Host "URL ngrok détectée pour $targetPort : $ngrokUrl" -ForegroundColor Green

# Mise à jour des fichiers
$qrCodeServicePath = "frontend-sqli/app/services/qrCodeService.ts"
$qrCodeServiceJavaPath = "backend-sqli/src/main/java/com/sqli/stage/backendsqli/service/QRCodeService.java"

Write-Host "Mise a jour de qrCodeService.ts..." -ForegroundColor Cyan
$content = Get-Content $qrCodeServicePath -Raw
$pattern = "https://[a-zA-Z0-9-]+\.ngrok-free\.(app|dev|io)"
$updated = [Regex]::Replace($content, $pattern, $ngrokUrl)
Set-Content $qrCodeServicePath $updated -NoNewline
Write-Host "qrCodeService.ts mis a jour avec $ngrokUrl" -ForegroundColor Green

Write-Host "Mise a jour de QRCodeService.java..." -ForegroundColor Cyan
$javaContent = Get-Content $qrCodeServiceJavaPath -Raw
$updatedJavaContent = $javaContent -replace 'https://[a-zA-Z0-9-]+\.ngrok-free\.(app|dev|io)', $ngrokUrl
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

# Build du frontend
Write-Host "Build du frontend..." -ForegroundColor Cyan
$buildScript = "cd frontend-sqli`nnpm run build"
$buildScript | Out-File -FilePath "build-frontend.bat" -Encoding Default
Start-Process -FilePath "cmd" -ArgumentList "/c", "build-frontend.bat" -Wait -WindowStyle Normal

# Démarrage du frontend en mode preview
Write-Host "Demarrage du frontend en mode PREVIEW..." -ForegroundColor Cyan
$frontendScript = "cd frontend-sqli`nnpm run preview -- --host 0.0.0.0 --port 5173"
$frontendScript | Out-File -FilePath "start-frontend-preview.bat" -Encoding Default
Start-Process -FilePath "cmd" -ArgumentList "/k", "start-frontend-preview.bat" -WindowStyle Normal

# Affichage des informations finales
Write-Host ""
Write-Host "Environnement de developpement pret (MODE PREVIEW) !" -ForegroundColor Green
Write-Host "URL ngrok: $ngrokUrl" -ForegroundColor Cyan
Write-Host "Frontend local: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend local: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les QR codes utiliseront automatiquement la nouvelle URL ngrok" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: Le frontend tourne en mode PREVIEW pour une meilleure compatibilite avec ngrok" -ForegroundColor Yellow
Write-Host ""

# Nettoyer les fichiers temporaires
Start-Sleep -Seconds 2
Remove-Item "start-backend.bat" -ErrorAction SilentlyContinue
Remove-Item "build-frontend.bat" -ErrorAction SilentlyContinue
Remove-Item "start-frontend-preview.bat" -ErrorAction SilentlyContinue

# Garder la fenêtre ouverte
Read-Host "Appuyez sur Entree pour fermer cette fenetre"
