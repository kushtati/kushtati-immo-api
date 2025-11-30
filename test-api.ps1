# Script de test de l'API Kushtati Immo
Write-Host "`n🧪 Tests de l'API Kushtati Immo`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Test 1: Page d'accueil
Write-Host "1️⃣ Test de la page d'accueil..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get
    Write-Host "✅ API en ligne: $($response.name)" -ForegroundColor Green
    Write-Host "   Version: $($response.version)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur: Le serveur n'est pas démarré`n" -ForegroundColor Red
    exit 1
}

# Test 2: Liste des propriétés
Write-Host "2️⃣ Test GET /api/properties..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/properties" -Method Get
    $count = $response.properties.Count
    Write-Host "✅ $count propriétés trouvées" -ForegroundColor Green
    if ($count -gt 0) {
        $first = $response.properties[0]
        Write-Host "   Exemple: $($first.title) - $($first.location)" -ForegroundColor Gray
        Write-Host "   Prix: $($first.price) GNF`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération des propriétés`n" -ForegroundColor Red
}

# Test 3: Connexion
Write-Host "3️⃣ Test POST /api/auth/login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "mamadou@kushtati.com"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
    Write-Host "   Utilisateur: $($response.user.name)" -ForegroundColor Gray
    Write-Host "   Rôle: $($response.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $response.token
    Write-Host "`n   📝 Token sauvegardé pour les tests suivants`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la connexion`n" -ForegroundColor Red
    $token = $null
}

# Test 4: Profil utilisateur (avec authentification)
if ($token) {
    Write-Host "4️⃣ Test GET /api/auth/me (avec token)..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $token"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
        Write-Host "✅ Profil récupéré" -ForegroundColor Green
        Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
        Write-Host "   Téléphone: $($response.user.phone)`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erreur lors de la récupération du profil`n" -ForegroundColor Red
    }
}

# Test 5: Filtrage des propriétés
Write-Host "5️⃣ Test GET /api/properties?type=Rent..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/properties?type=Rent" -Method Get
    $count = $response.properties.Count
    Write-Host "✅ $count propriétés en location trouvées`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du filtrage`n" -ForegroundColor Red
}

# Test 6: Propriété spécifique
Write-Host "6️⃣ Test GET /api/properties/1..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/properties/1" -Method Get
    Write-Host "✅ Propriété récupérée: $($response.property.title)" -ForegroundColor Green
    Write-Host "   Propriétaire: $($response.property.owner_name)" -ForegroundColor Gray
    Write-Host "   Contact: $($response.property.owner_phone)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la récupération de la propriété`n" -ForegroundColor Red
}

Write-Host "`n🎉 Tests terminés!`n" -ForegroundColor Cyan
Write-Host "💡 Pour plus de tests, utilisez:" -ForegroundColor Yellow
Write-Host "   - Navigateur: http://localhost:5000" -ForegroundColor Gray
Write-Host "   - Postman / Thunder Client" -ForegroundColor Gray
Write-Host "   - Extension REST Client pour VS Code`n" -ForegroundColor Gray
