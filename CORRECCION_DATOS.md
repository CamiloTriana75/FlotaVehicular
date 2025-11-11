# 🔧 Corrección de Datos - Asignaciones HU3

## ⚠️ Problema Identificado

1. **Conductores sin número de licencia**: Los datos de prueba no incluyen `numero_licencia`
2. **Asignaciones duplicadas**: Dos asignaciones con el mismo vehículo ABC-123

## ✅ Solución

### Opción 1: Ejecutar en SQL Editor de Supabase (RECOMENDADO)

1. Ir a tu proyecto en [Supabase Dashboard](https://supabase.com)
2. Click en **SQL Editor** en el menú lateral
3. Click en **+ New Query**
4. Copiar y pegar el contenido del archivo **`EJECUTAR_EN_SUPABASE.sql`**
5. Click en **Run** (▶️)

Esto hará:

- ✅ Actualizar los 3 conductores con sus números de licencia
- ✅ Eliminar asignaciones duplicadas
- ✅ Crear 2 asignaciones correctas:
  - **ABC-123 → Carlos**: PENDIENTE (inicia mañana 12/11)
  - **ABC-123 → María**: EN CURSO (empezó hoy a las 8:33 AM)

---

### Opción 2: Resetear Base de Datos (Solo si Docker está corriendo)

```powershell
cd c:\Users\jtria\Downloads\FlotaVehicular\supabase
npx supabase db reset
```

**Nota**: Requiere Docker Desktop en ejecución.

---

## 📋 Verificación

Después de ejecutar el script, refresca la página de Asignaciones:

1. Login como `supervisor@flota.com` / `Supervisor123!`
2. Ir a **Asignaciones** en el menú
3. Deberías ver:

### ✅ Asignación 1 - PENDIENTE

```
🟡 PENDIENTE
Vehículo: ABC-123
Chevrolet Spark
Conductor: Carlos Mendoza
Lic: 123456789
Inicio: 12/11/2025 05:13
Fin: 13/11/2025 01:13
Duración: 20.0 hrs
```

### ✅ Asignación 2 - EN CURSO

```
🟢 EN CURSO
Vehículo: ABC-123
Chevrolet Spark
Conductor: María García
Lic: 987654321
Inicio: 11/11/2025 08:33
Fin: 11/11/2025 19:33
Duración: 11.0 hrs
```

---

## 🔍 Explicación del Problema

### Por qué aparecen dos asignaciones con ABC-123:

**Esto es CORRECTO y es parte del ejemplo**. Las dos asignaciones son:

1. **Carlos con ABC-123**: Empieza **mañana** 12/11 a las 5:13 AM → Estado: **PENDIENTE** (amarillo)
2. **María con ABC-123**: Empezó **hoy** 11/11 a las 8:33 AM → Estado: **EN CURSO** (verde)

**No hay conflicto** porque:

- La de María termina HOY a las 7:33 PM
- La de Carlos empieza MAÑANA a las 5:13 AM
- Hay ~10 horas de separación entre ambas

### Por qué no aparecía el número de licencia:

Los datos de prueba en la migración original NO incluían el campo `numero_licencia`:

```sql
-- ❌ ANTES (sin numero_licencia)
INSERT INTO drivers (cedula, nombre, apellidos, telefono, email, estado) VALUES
('12345678', 'Carlos', 'Mendoza', '3001234567', 'carlos@email.com', 'activo');

-- ✅ DESPUÉS (con numero_licencia)
INSERT INTO drivers (cedula, nombre, apellidos, telefono, email, numero_licencia, estado) VALUES
('12345678', 'Carlos', 'Mendoza', '3001234567', 'carlos@email.com', '123456789', 'activo');
```

---

## 📝 Archivos Modificados

1. ✅ `supabase/migrations/20250918051927_white_temple.sql`
   - Agregado `numero_licencia` a INSERT de drivers

2. ✅ `supabase/migrations/20251111000001_vehicle_assignments.sql`
   - Agregado `numero_licencia` a INSERT de drivers

3. ✅ `EJECUTAR_EN_SUPABASE.sql` (nuevo)
   - Script rápido para ejecutar en Supabase Cloud

4. ✅ `fix_assignments_data.sql` (nuevo)
   - Script completo con UPDATE de numero_licencia

---

## 🚀 Próximo Paso

**Ejecuta `EJECUTAR_EN_SUPABASE.sql` en tu proyecto de Supabase Cloud** y recarga la página de Asignaciones.

Deberías ver:

- ✅ Número de licencia visible (Lic: 123456789, etc.)
- ✅ Una asignación "PENDIENTE" (amarilla)
- ✅ Una asignación "EN CURSO" (verde)
- ✅ Ambas con el mismo vehículo ABC-123 pero sin conflicto

---

## ❓ Si aún no aparece el número de licencia

Abre la consola del navegador (F12) y verifica:

```javascript
// En la pestaña Console, ejecuta:
console.log('Assignments:', assignments);
console.log('Driver data:', assignments[0]?.driver);
```

Verifica que `driver.numero_licencia` tenga valor. Si es `null`, ejecuta nuevamente el script SQL.

---

**¡Listo para probar! 🎉**
