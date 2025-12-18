# ⚡ Eliminar todos los conductores - FORMA RÁPIDA

## Opción 1: CLI PowerShell (Más Fácil)

```powershell
.\scripts\LIMPIAR_CONDUCTORES.ps1
```

Confirma escribiendo `si` cuando te lo pida.

---

## Opción 2: Manual en Supabase Dashboard (3 segundos)

### Paso 1️⃣

Ve a: https://app.supabase.com/project/[tu-proyecto-id]/sql/new

(Reemplaza `[tu-proyecto-id]` con tu proyecto real)

### Paso 2️⃣

Copia y pega **ESTO**:

```sql
BEGIN;
CREATE TEMP TABLE temp_cedulas AS SELECT cedula FROM drivers WHERE cedula IS NOT NULL;
DELETE FROM public.drivers;
DELETE FROM public.usuario WHERE username IN (SELECT cedula FROM temp_cedulas);
SELECT COUNT(*) as conductores_eliminados FROM temp_cedulas;
COMMIT;
```

### Paso 3️⃣

Presiona `Ctrl+Enter` o haz clic en **Run**

### ✅ Listo!

Deberías ver algo como:

```
conductores_eliminados: 5
```

---

## Verificación

Después de ejecutar, verifica en la interfaz:

1. Ve a "Conductores" → Deberá estar vacío
2. Ve a "Seguridad" → "Usuarios" → No habrá conductores

✅ Ahora puedes crear nuevos conductores sin errores

---

## Si algo falla:

### "Usuario no encontrado"

- Normal, significa que ya estaban limpios

### "Permiso denegado"

- Usa `SUPABASE_SERVICE_ROLE_KEY` en lugar de la clave anónima

### Necesitas los datos antes de borrar?

Ejecuta primero esto para ver qué vas a eliminar:

```sql
SELECT cedula, nombre, apellidos, email FROM drivers;
SELECT username, email, rol FROM usuario WHERE rol = 'conductor';
```

---

**Última actualización**: 18 Diciembre 2025
