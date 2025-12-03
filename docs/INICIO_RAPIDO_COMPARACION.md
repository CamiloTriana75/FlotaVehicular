# 🚀 Inicio Rápido - Comparación de Rutas

## ⚡ 3 Pasos para Activar

### 1️⃣ Ejecutar Migración (2 minutos)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia el contenido de:
   ```
   supabase/migrations/20251120000000_route_tracking.sql
   ```
4. Pégalo y presiona **RUN**
5. ✅ Verifica que dice "Success"

### 2️⃣ Verificar Instalación (1 minuto)

Ejecuta esto en SQL Editor:

```sql
-- Debe retornar 2
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name IN ('route_tracking', 'route_events');

-- Debe retornar 5 o más
SELECT COUNT(*) FROM information_schema.routines
WHERE routine_name LIKE '%route%track%';
```

Si ambos números coinciden: ✅ **Instalado correctamente**

### 3️⃣ Probar (5 minutos)

#### Como Conductor:

1. Abre una ruta asignada
2. Activa **"Modo simulación"** (checkbox)
3. Presiona **"Iniciar GPS"** (botón verde)
4. Ajusta velocidad a 60 km/h
5. Espera 2 minutos
6. Presiona **"Detener GPS"**

#### Como Supervisor:

1. Ve a **"Comparación de Rutas"**
2. Selecciona la ruta de prueba
3. Deberías ver:
   - ✅ Línea azul (planificada)
   - ✅ Línea roja (recorrida)
   - ✅ Métricas de comparación

## 🎯 Uso Diario

### Conductor:

```
1. Abrir ruta → 2. "Iniciar GPS" → 3. Conducir → 4. "Detener GPS"
```

### Supervisor:

```
1. Comparación → 2. Seleccionar ruta → 3. Analizar métricas → 4. Exportar
```

## 🔍 Verificar que Funciona

```sql
-- Ver puntos guardados de la última ruta
SELECT
  COUNT(*) as puntos_gps,
  MIN(timestamp) as inicio,
  MAX(timestamp) as fin
FROM route_tracking
ORDER BY id DESC
LIMIT 1;
```

Si `puntos_gps > 0`: ✅ **Funcionando**

## 📚 Más Información

- **Guía completa:** `docs/GUIA_COMPARACION_RUTAS.md`
- **Instalación detallada:** `docs/INSTALACION_COMPARACION_RUTAS.md`
- **Resumen técnico:** `docs/RESUMEN_COMPARACION_RUTAS.md`
- **Script de prueba:** `scripts/test-route-tracking.sql`

## ❓ Problemas Comunes

### No guarda puntos GPS

→ Verificar que el conductor presionó "Iniciar GPS"

### No aparece en comparación

→ Esperar al menos 30 segundos de tracking

### Error en migración

→ Verificar que existe la tabla `routes` y `route_assignments`

## 💡 Tips

- Usar **modo simulación** para pruebas sin moverse
- Mantener la app **abierta** durante el recorrido
- Verificar **conexión a internet** estable
- El GPS se desactiva automáticamente al cerrar la app

---

¿Listo para empezar? Ejecuta el **Paso 1** ☝️
