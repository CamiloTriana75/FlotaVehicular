#!/usr/bin/env pwsh
<#
.SYNOPSIS
Script para eliminar todos los conductores y usuarios desde PowerShell

.DESCRIPTION
Ejecuta el SQL de limpieza contra Supabase para eliminar conductores y sus usuarios

.EXAMPLE
./scripts/LIMPIAR_CONDUCTORES.ps1
#>

# Cargar variables de entorno
$env:DOTENV_PATH = ".env"
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL) {
    Write-Host "❌ Error: VITE_SUPABASE_URL no está configurada" -ForegroundColor Red
    Write-Host "Agrega esta variable a tu archivo .env" -ForegroundColor Yellow
    exit 1
}

if (-not $SUPABASE_SERVICE_KEY) {
    Write-Host "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada" -ForegroundColor Red
    Write-Host "Agrega esta variable a tu archivo .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔐 Conectando a Supabase..." -ForegroundColor Cyan
Write-Host "URL: $SUPABASE_URL" -ForegroundColor Gray

# Confirmación
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los conductores y sus usuarios" -ForegroundColor Yellow
Write-Host "Esta acción es IRREVERSIBLE" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "¿Estás seguro? (escribe 'si' para confirmar)"

if ($confirmation -ne "si") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📊 Ejecutando limpieza..." -ForegroundColor Cyan

# SQL a ejecutar
$sql = @"
BEGIN;

-- 1. Obtener lista de cédulas de conductores
CREATE TEMP TABLE temp_cedulas AS
SELECT cedula FROM drivers WHERE cedula IS NOT NULL;

-- 2. Eliminar todos los registros de la tabla drivers
DELETE FROM public.drivers;

-- 3. Eliminar usuarios cuyo username sea una cédula (conductores)
DELETE FROM public.usuario 
WHERE username IN (SELECT cedula FROM temp_cedulas);

-- 4. Mostrar resultado
SELECT 
  (SELECT COUNT(*) FROM temp_cedulas) as conductores_eliminados,
  'Limpieza completada' as resultado;

COMMIT;
"@

# Usar psql si está disponible
$psqlPath = & { 
    $null = (psql --version 2>&1)
    if ($LASTEXITCODE -eq 0) { "psql" }
    else { $null }
}

if ($psqlPath) {
    Write-Host "✅ Encontrado psql, usando para ejecutar SQL..." -ForegroundColor Green
    
    # Extraer host, base de datos y puerto de la URL de Supabase
    # URL formato: https://[project].supabase.co
    $supabaseProject = $SUPABASE_URL -replace "https://", "" -replace ".supabase.co", ""
    $dbHost = "$supabaseProject.supabase.co"
    $dbName = "postgres"
    $dbUser = "postgres"
    $dbPort = 5432
    
    # Ejecutar SQL
    $sql | psql -h $dbHost -U $dbUser -d $dbName -p $dbPort --set PGPASSWORD=$SUPABASE_SERVICE_KEY 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Limpieza completada exitosamente!" -ForegroundColor Green
        Write-Host "Todos los conductores y usuarios han sido eliminados." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar SQL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  psql no encontrado. Instrucciones manuales:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ve a https://app.supabase.com/project/[tu-proyecto]/sql/new" -ForegroundColor Cyan
    Write-Host "2. Copia y pega el siguiente SQL:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $sql -ForegroundColor White
    Write-Host ""
    Write-Host "3. Haz clic en 'Run' o presiona Ctrl+Enter" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✨ Ahora puedes crear nuevos conductores sin conflictos" -ForegroundColor Green
