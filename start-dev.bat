@echo off
echo 🚀 Démarrage de l'environnement de développement...

echo.
echo 📡 Démarrage de ngrok...
start "ngrok" cmd /k "ngrok start --all --config ngrok.yml"

echo.
echo ⏳ Attente de 5 secondes pour que ngrok démarre...
timeout /t 5 /nobreak > nul

echo.
echo 🔍 Récupération de l'URL ngrok...
for /f "tokens=2 delims= " %%i in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do set NGROK_URL=%%i

echo.
echo 📝 URL ngrok détectée: %NGROK_URL%
echo.
echo 🔧 Mise à jour automatique de qrCodeService.ts...
echo.

REM Mise à jour du fichier qrCodeService.ts
powershell -Command "(Get-Content 'frontend-sqli/app/services/qrCodeService.ts') -replace 'https://[a-zA-Z0-9-]+\.ngrok-free\.app', %NGROK_URL% | Set-Content 'frontend-sqli/app/services/qrCodeService.ts'"

echo ✅ qrCodeService.ts mis à jour avec l'URL: %NGROK_URL%
echo.

echo 🎯 Démarrage du backend...
start "backend" cmd /k "cd backend-sqli && ./mvnw spring-boot:run"

echo.
echo ⏳ Attente de 10 secondes pour que le backend démarre...
timeout /t 10 /nobreak > nul

echo.
echo 🎨 Démarrage du frontend...
start "frontend" cmd /k "cd frontend-sqli && npm run dev"

echo.
echo 🎉 Environnement de développement prêt !
echo 📱 URL ngrok: %NGROK_URL%
echo 🌐 Frontend local: http://localhost:5173
echo 🔧 Backend local: http://localhost:8080
echo.
echo 💡 N'oubliez pas de mettre à jour l'URL dans le backend QRCodeService.java si nécessaire
echo.
pause
