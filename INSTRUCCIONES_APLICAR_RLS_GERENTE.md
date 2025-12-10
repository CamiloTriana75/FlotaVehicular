# 📋 Instrucciones para Aplicar RLS Policies (Gerente y Drivers)

## ✅ Pasos para aplicar las migraciones

### 1️⃣ Abrir Supabase SQL Editor

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **FlotaVehicular**
3. En el menú lateral, haz clic en **SQL Editor**

### 2️⃣ Aplicar migración de Gerente (RLS Policies)

1. Abre el archivo: `supabase/migrations/20251210_gerente_rls_policies.sql`
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en el botón **Run** (▶️) en la esquina inferior derecha

### 3️⃣ Aplicar migración de Drivers (RLS Policies)

1. Abre el archivo: `supabase/migrations/20251210_drivers_rls_policies.sql`
2. **Copia TODO el contenido** del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en el botón **Run** (▶️) en la esquina inferior derecha

### 4️⃣ Verificar que se aplicaron correctamente

Deberías ver mensajes como:

**Para gerente_rls_policies.sql:**

```
✅ Políticas RLS para GERENTE configuradas exitosamente

🔐 Permisos otorgados:
   ✅ maintenance_orders: SELECT para gerente, admin, superusuario
   ✅ vehicles: SELECT para gerente, admin, superusuario
   ✅ incidents: SELECT para gerente, admin, superusuario
   ✅ drivers: SELECT para gerente, admin, superusuario, rrhh

💡 El gerente ahora puede acceder al Dashboard de KPIs con datos reales
```

**Para drivers_rls_policies.sql:**

```
✅ Políticas RLS para tabla DRIVERS configuradas exitosamente

🔐 Permisos otorgados:
   ✅ SELECT: admin, superusuario, supervisor, rrhh, gerente, planificador
   ✅ INSERT: admin, superusuario, rrhh
   ✅ UPDATE: admin, superusuario, rrhh, supervisor
   ✅ DELETE: admin, superusuario

💡 Los roles administrativos ahora pueden gestionar conductores
```

## 📊 ¿Qué hacen estas migraciones?

### Migración 1: gerente_rls_policies.sql

### Migración 1: gerente_rls_policies.sql

Configura permisos Row Level Security (RLS) para que el rol `gerente` pueda:

✅ **Ver órdenes de mantenimiento** (`maintenance_orders`)
✅ **Ver vehículos** (`vehicles`)  
✅ **Ver incidentes** (`incidents`)
✅ **Ver conductores** (`drivers`)

Necesario para:

- **Dashboard General**: Mostrar KPIs de mantenimiento
- **Reportes**: Mostrar agregados de incidentes con información de conductores y vehículos

### Migración 2: drivers_rls_policies.sql

Configura permisos completos para gestión de conductores:

✅ **Ver conductores (SELECT)**: admin, superusuario, supervisor, rrhh, gerente, planificador
✅ **Crear conductores (INSERT)**: admin, superusuario, rrhh  
✅ **Modificar conductores (UPDATE)**: admin, superusuario, rrhh, supervisor
✅ **Eliminar conductores (DELETE)**: admin, superusuario

Necesario para:

- **Página Conductores**: Lista y búsqueda de conductores
- **Nuevo Conductor**: Formulario de creación
- **Editar Conductor**: Modificación de datos
- **Asignaciones**: Ver conductores disponibles

## 🔐 Credenciales de prueba

## 🔐 Credenciales de prueba

**Gerente:**

- **Email**: `gerente@flotavehicular.com`
- **Contraseña**: `Gerente123!`

**Admin/Superusuario:** (usa las credenciales que ya tienes configuradas)

## 🎯 Próximos pasos después de aplicar

1. ✅ Iniciar sesión como gerente o admin
2. ✅ **Como gerente:** Verificar que aparecen los items en la Sidebar:
   - Dashboard General
   - Reportes
3. ✅ **Como admin/supervisor:** Verificar acceso a la página Conductores:
   - Ver lista de conductores
   - Crear nuevo conductor (admin/rrhh)
   - Editar conductor (admin/rrhh/supervisor)
   - Eliminar conductor (admin/superusuario)
4. ✅ Verificar que Dashboard y Reportes muestran datos reales

## ⚠️ Importante

- Estas migraciones **NO modifican datos**, solo configuran permisos
- Es seguro ejecutar estas migraciones múltiples veces (usa `DROP POLICY IF EXISTS`)
- Las políticas RLS protegen los datos según el rol del usuario autenticado

## 🆘 Solución de problemas

### Si no se muestran datos en Dashboard o Reportes (gerente):

1. Verifica que `20251210_gerente_rls_policies.sql` se aplicó correctamente
2. Verifica que iniciaste sesión con `gerente@flotavehicular.com`
3. Abre la consola del navegador (F12) y busca errores de RLS
4. Verifica que las tablas tienen datos (consulta directa en Supabase)

### Si no puedes ver/crear conductores (admin/supervisor/rrhh):

1. Verifica que `20251210_drivers_rls_policies.sql` se aplicó correctamente
2. Verifica tu rol en la tabla `usuario`
3. Verifica que `usuario.activo = true`
4. Revisa permisos según tu rol:
   - **Ver:** admin, superusuario, supervisor, rrhh, gerente, planificador
   - **Crear:** admin, superusuario, rrhh
   - **Editar:** admin, superusuario, rrhh, supervisor
   - **Eliminar:** admin, superusuario

### Si aparece error "permission denied":

- Asegúrate de ejecutar TODA la migración, no solo una parte
- Verifica que tu usuario existe en la tabla `usuario`
- Verifica que `usuario.activo = true`
- Verifica que el email en `usuario` coincide con el email de tu sesión

---

**Autor**: Sistema FlotaVehicular  
**Fecha**: 2025-12-10  
**HU**: HU22 - Dashboard de KPIs para gerentes + Gestión de conductores por rol
