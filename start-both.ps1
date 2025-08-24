# Script pour démarrer le frontend et le backend en parallèle
param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

Write-Host "🚀 Démarrage de l'application SQLI..." -ForegroundColor Green

# Fonction pour démarrer le backend
function Start-Backend {
    if (-not $SkipBackend) {
        Write-Host "📡 Démarrage du backend Spring Boot..." -ForegroundColor Yellow
        Start-Job -Name "Backend" -ScriptBlock {
            Set-Location "C:\Users\AZZAM\Desktop\Projet_Stage_4IIR\stage-sqli\backend-sqli"
            & .\mvnw.cmd spring-boot:run
        }
    }
}

# Fonction pour démarrer le frontend
function Start-Frontend {
    if (-not $SkipFrontend) {
        Write-Host "⚛️  Démarrage du frontend React..." -ForegroundColor Cyan
        Start-Job -Name "Frontend" -ScriptBlock {
            Set-Location "C:\Users\AZZAM\Desktop\Projet_Stage_4IIR\stage-sqli\frontend-sqli"
            & npm run dev
        }
    }
}

# Démarrer les services
Start-Backend
Start-Sleep -Seconds 2
Start-Frontend

Write-Host ""
Write-Host "✅ Services en cours de démarrage..." -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend: http://localhost:8080" -ForegroundColor Yellow
Write-Host "⚛️  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour voir les logs:" -ForegroundColor White
Write-Host "  Backend:  Get-Job -Name 'Backend' | Receive-Job" -ForegroundColor Gray
Write-Host "  Frontend: Get-Job -Name 'Frontend' | Receive-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour arrêter les services:" -ForegroundColor White
Write-Host "  Stop-Job -Name 'Backend','Frontend'; Remove-Job -Name 'Backend','Frontend'" -ForegroundColor Gray
Write-Host ""

# Attendre que l'utilisateur appuie sur une touche pour voir les logs
Write-Host "Appuyez sur une touche pour voir les logs en temps réel..." -ForegroundColor Magenta
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Afficher les logs en temps réel
try {
    while ($true) {
        Clear-Host
        Write-Host "=== LOGS BACKEND ===" -ForegroundColor Yellow
        Get-Job -Name "Backend" | Receive-Job -Keep | Select-Object -Last 10
        Write-Host ""
        Write-Host "=== LOGS FRONTEND ===" -ForegroundColor Cyan  
        Get-Job -Name "Frontend" | Receive-Job -Keep | Select-Object -Last 10
        Write-Host ""
        Write-Host "Ctrl+C pour arrêter | Mise à jour toutes les 3 secondes" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}
catch {
    Write-Host "Arrêt des services..." -ForegroundColor Red
    Stop-Job -Name "Backend","Frontend" -ErrorAction SilentlyContinue
    Remove-Job -Name "Backend","Frontend" -ErrorAction SilentlyContinue
}
