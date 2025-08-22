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
# --- Params ---
$qrCodeServicePath = "frontend-sqli/app/services/qrCodeService.ts"
$targetPort = 5173
$maxRetries = 15
$delaySeconds = 1

Write-Host "Recherche du tunnel ngrok pour localhost:$targetPort..." -ForegroundColor Cyan

function Get-NgrokUrlForPort([int]$port, [int]$retries, [int]$delaySec) {
    for ($i = 1; $i -le $retries; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method GET -TimeoutSec 2 -ErrorAction Stop

            if ($resp -and $resp.tunnels) {
                # Filtrer sur le tunnel qui pointe vers le port demandé
                $tunnels = $resp.tunnels | Where-Object {
                    # ngrok retourne typiquement "http://localhost:5173" ou "http://127.0.0.1:5173"
                    $_.config.addr -match "://(localhost|127\.0\.0\.1):$port($|/)"
                }

                if ($tunnels) {
                    # Prioriser l'URL publique en HTTPS si dispo
                    $httpsTunnel = $tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1
                    $chosen = if ($httpsTunnel) { $httpsTunnel } else { $tunnels | Select-Object -First 1 }

                    if ($null -ne $chosen.public_url) {
                        return $chosen.public_url
                    }
                }
            }
        } catch {
            # API pas prête ou ngrok pas lancé
        }

        Start-Sleep -Seconds $delaySec
    }

    return $null
}

$ngrokUrl = Get-NgrokUrlForPort -port $targetPort -retries $maxRetries -delaySec $delaySeconds

if (-not $ngrokUrl) {
    Write-Host "Échec: impossible de trouver une URL ngrok pour localhost:$targetPort via l'API 4040." -ForegroundColor Red
    Write-Host "Vérifie que ngrok tourne et qu'un tunnel pointe vers le port $targetPort." -ForegroundColor Yellow
    exit 1
}

Write-Host "URL ngrok détectée pour $targetPort : $ngrokUrl" -ForegroundColor Green

# --- Mise à jour du fichier ---
if (-not (Test-Path $qrCodeServicePath)) {
    Write-Host "Fichier introuvable: $qrCodeServicePath" -ForegroundColor Red
    exit 1
}

Write-Host "Mise à jour de qrCodeService.ts..." -ForegroundColor Cyan

# Remplace toute URL https://*.ngrok-free.app par celle détectée
# (conserve le chemin qui suit l'hôte le cas échéant)
# Exemple: https://XXXX.ngrok-free.app/api -> devient https://NEW.ngrok-free.app/api
$content = Get-Content $qrCodeServicePath -Raw

# Pattern: capture l'hôte ngrok et un éventuel chemin à conserver
$pattern = "https://[a-zA-Z0-9-]+\.ngrok-free\.app(?<rest>/[^\s`"'\)\]]*)?"

# Remplacement: nouvel host + le chemin capturé si présent
$replacement = "${ngrokUrl}`$1"
# Comme on a nommé le groupe (?<rest>...), référençons-le comme ${rest}
# PowerShell -replace n'autorise pas la syntaxe ${rest} directement,
# on fait une 2e passe pour corriger si besoin :
$updated = [Regex]::Replace($content, $pattern, { param($m)
    $rest = $m.Groups["rest"].Value
    return "$ngrokUrl$rest"
})

Set-Content $qrCodeServicePath $updated -NoNewline
Write-Host "qrCodeService.ts mis à jour avec $ngrokUrl" -ForegroundColor Green


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
