# Script de Push Backend vers GitHub
# Usage: .\push-backend.ps1

Write-Host '
╔═══════════════════════════════════════════════════════════════╗
║     🚀 PUSH BACKEND VERS GITHUB                              ║
╚═══════════════════════════════════════════════════════════════╝
' -ForegroundColor Cyan

Write-Host 'Étapes déjà effectuées:' -ForegroundColor Green
Write-Host '  ✅ Git initialisé'
Write-Host '  ✅ Fichiers ajoutés'
Write-Host '  ✅ Commit créé'

Write-Host '
📝 Maintenant, créez le repository sur GitHub:
' -ForegroundColor Yellow

Write-Host '1. Repository name: kushtati-immo-api'
Write-Host '2. Description: Backend API pour Kushtati Immo'
Write-Host '3. NE PAS initialiser avec README'
Write-Host '4. Créer le repository'

Write-Host '
Puis exécutez ces commandes:
' -ForegroundColor Cyan

Write-Host '  git remote add origin https://github.com/kushtati/kushtati-immo-api.git' -ForegroundColor Yellow
Write-Host '  git branch -M main' -ForegroundColor Yellow
Write-Host '  git push -u origin main' -ForegroundColor Yellow

Write-Host '
(Remplacez l URL par la vôtre)
' -ForegroundColor Gray
