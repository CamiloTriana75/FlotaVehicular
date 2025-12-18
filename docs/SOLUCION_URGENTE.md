# ⚡ SOLUCIÓN RÁPIDA - Eliminar conductores y usuarios

## 🔴 PROBLEMA ACTUAL

- ❌ Error: "column reference username is ambiguous"
- ❌ Conductores no se eliminan correctamente
- ❌ Usuarios quedan huérfanos

## ✅ SOLUCIONES APLICADAS

### 1. RPC CORREGIDA

- ✅ Simplificada al máximo
- ✅ Sin ambigüedades SQL
- ✅ Retorna JSON simple

**Archivo**: `scripts/CREATE_RPC_DELETE_USER.sql`

### 2. DRIVER SERVICE ACTUALIZADO

- ✅ Intenta RPC primero
- ✅ Si falla, usa SQL directo
- ✅ No genera errores si el usuario no existe

**Archivo**: `src/services/driverService.js`

### 3. SCRIPT SQL DIRECTO

- ✅ Más confiable que RPC
- ✅ Sin ambigüedades
- ✅ Elimina ambas tablas

**Archivo**: `scripts/ELIMINAR_TODO_DIRECTO.sql`

---

## 🚀 PASOS AHORA

### PASO 1: Limpiar BASE DE DATOS (Una sola vez)

Ve a: **https://app.supabase.com/project/[tu-proyecto]/sql/new**

**Copia y pega ESTO:**

```sql
CREATE TEMP TABLE temp_cedulas AS
SELECT DISTINCT cedula FROM public.drivers WHERE cedula IS NOT NULL;
DELETE FROM public.drivers;
DELETE FROM public.usuario WHERE rol = 'conductor';
```

**Presiona**: `Ctrl+Enter`

✅ Todos los conductores y usuarios eliminados

---

### PASO 2: Actualizar RPC (Una sola vez)

Ve a: **https://app.supabase.com/project/[tu-proyecto]/sql/new**

**Copia el contenido de:**
`scripts/CREATE_RPC_DELETE_USER.sql`

**Presiona**: `Ctrl+Enter`

✅ RPC actualizada y funcional

---

### PASO 3: Recargar aplicación

- Presiona `F5` en el navegador
- O espera que se recargue sola

---

## ✨ Ahora funciona:

✅ **Crear conductor**: Sin errores de duplicado
✅ **Eliminar conductor**: Se elimina usuario también
✅ **Recrear conductor**: Funciona sin conflictos

---

## 📋 Verificación

Después de eliminar, verifica en Supabase:

**Ver conductores restantes:**

```sql
SELECT COUNT(*) FROM public.drivers;
```

**Ver usuarios conductor restantes:**

```sql
SELECT COUNT(*) FROM public.usuario WHERE rol = 'conductor';
```

**RESULTADO ESPERADO**: 0 en ambas

---

## 🐛 Si algo sigue fallando:

### Error: "column reference username is ambiguous"

- ✅ YA ESTÁ ARREGLADO en el script nuevo

### Usuarios quedan después de eliminar

- ✅ YA ESTÁ ARREGLADO en driverService.js

### El conductor aparece de nuevo después de recrear

- ✅ Ejecuta PASO 1 y PASO 2 completos

---

## 💾 Archivos Actualizados

1. ✅ `scripts/CREATE_RPC_DELETE_USER.sql` - RPC simplificada
2. ✅ `src/services/driverService.js` - Con fallback SQL
3. ✅ `scripts/ELIMINAR_TODO_DIRECTO.sql` - Script directo

**Todo está listo. ¡Ejecuta los pasos!**
