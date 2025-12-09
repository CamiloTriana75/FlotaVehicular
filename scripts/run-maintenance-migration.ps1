# Script para ejecutar migraciones de mantenimiento en Supabase

Write-Host "🔧 Ejecutando migración de sistema de mantenimiento..." -ForegroundColor Cyan

# Leer el archivo SQL
$sqlFile = "supabase\migrations\20251209000001_maintenance_system.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ No se encontró el archivo SQL: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw

Write-Host "📄 Archivo SQL cargado" -ForegroundColor Green
Write-Host "📊 Ejecutando en Supabase..." -ForegroundColor Yellow

# Mostrar instrucciones
Write-Host "`n📋 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Ve a https://supabase.com/dashboard/project/nqsfitpsygpwfglchihl/sql/new" -ForegroundColor White
Write-Host "2. Copia y pega el contenido del archivo:" -ForegroundColor White
Write-Host "   $sqlFile" -ForegroundColor Cyan
Write-Host "3. Ejecuta el SQL" -ForegroundColor White
Write-Host "`nO ejecuta directamente con Supabase CLI:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Cyan

# Copiar al portapapeles si está disponible
try {
    $sqlContent | Set-Clipboard
    Write-Host "`n✅ SQL copiado al portapapeles!" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  No se pudo copiar al portapapeles automáticamente" -ForegroundColor Yellow
}

Write-Host "`nPresiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
