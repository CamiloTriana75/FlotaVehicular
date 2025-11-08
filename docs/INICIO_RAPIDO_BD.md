# ⚡ Inicio Rápido - Base de Datos Supabase

Guía de 5 minutos para conectar tu proyecto a Supabase.

## 🎯 Objetivo

Configurar y conectar la base de datos Supabase al proyecto FleetManager para soportar operaciones CRUD de conductores y vehículos.

---

## 📝 Pasos Rápidos

### 1️⃣ Crear Proyecto Supabase (2 min)

1. Ve a [app.supabase.com](https://app.supabase.com)
2. **New Project** → Nombre: `FleetManager`
3. Copia **Project URL** y **anon public key**

### 2️⃣ Configurar Variables de Entorno (1 min)

Edita `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MOCK_MODE=false
```

### 3️⃣ Ejecutar Migración (1 min)

1. En Supabase: **SQL Editor** → **New Query**
2. Copia contenido de: `supabase/migrations/20251108000000_schema_completo_flota.sql`
3. Pega y **Run**
4. Verifica en **Table Editor**: 8 tablas creadas ✅

### 4️⃣ Instalar Dependencia (30 seg)

```bash
npm install @supabase/supabase-js
```

### 5️⃣ Probar Conexión (30 seg)

Añade ruta de prueba en tu app:

```jsx
// src/App.jsx o router
import DatabaseTest from './pages/DatabaseTest';

// Añade ruta
<Route path="/db-test" element={<DatabaseTest />} />;
```

Visita: `http://localhost:5173/db-test`

---

## ✅ Verificación Rápida

Abre consola del navegador y ejecuta:

```javascript
import { supabase } from './src/lib/supabaseClient';

const { data, error } = await supabase.from('conductor').select('*');
console.log('Conductores:', data);
```

Si ves 3 conductores → **¡Conexión exitosa! 🎉**

---

## 📊 Datos de Prueba Incluidos

- ✅ 3 Conductores
- ✅ 5 Vehículos
- ✅ 3 Rutas
- ✅ 3 Usuarios

**Usuario admin:**

- Email: `admin@flota.com`
- Password: `admin123`

---

## 🚀 Siguiente: Usar la API

### Listar Conductores

```javascript
import { getConductores } from './src/api/conductores';

const { data, error } = await getConductores();
console.log(data);
```

### Crear Conductor

```javascript
import { createConductor } from './src/api/conductores';

const nuevo = await createConductor({
  cedula: '99999999',
  nombre_completo: 'Juan Pérez',
  telefono: '3001234567',
  email: 'juan@email.com',
  licencia: 'LIC-99999',
  categoria_licencia: 'B1',
  fecha_venc_licencia: '2026-12-31',
  estado: 'activo',
});
```

### Listar Vehículos

```javascript
import { getVehiculos } from './src/api/vehiculos';

const { data, error } = await getVehiculos({ estado: 'activo' });
console.log(data);
```

---

## 🐛 Problemas Comunes

| Error                     | Solución                                      |
| ------------------------- | --------------------------------------------- |
| `Invalid API key`         | Verifica `.env` y reinicia servidor           |
| `relation does not exist` | Ejecuta migración en SQL Editor               |
| `permission denied`       | Desactiva RLS (solo dev) o verifica políticas |

---

## 📚 Documentación Completa

- **Setup detallado:** [`docs/GUIA_CONFIGURACION_BD.md`](./GUIA_CONFIGURACION_BD.md)
- **Próximos pasos:** [`docs/PROXIMOS_PASOS_SUPABASE.md`](./PROXIMOS_PASOS_SUPABASE.md)
- **Migraciones:** [`supabase/migrations/README.md`](../supabase/migrations/README.md)

---

## 🎯 Checklist de la Issue

- [x] **DB accesible** desde entorno de desarrollo
- [x] **Migrations** aplicables y reproducibles
- [x] **`.env.example`** y docs de conexión
- [x] **Endpoint de prueba** (DatabaseTest.jsx)
- [x] **Scripts** en `supabase/migrations/`
- [x] **Seed data** con 3+ conductores
- [x] **Documentación** paso a paso

---

**Estado:** ✅ Issue completada

**Archivos creados:**

- `supabase/migrations/20251108000000_schema_completo_flota.sql`
- `src/api/conductores.js`
- `src/api/vehiculos.js`
- `src/pages/DatabaseTest.jsx`
- `docs/GUIA_CONFIGURACION_BD.md`
- `docs/PROXIMOS_PASOS_SUPABASE.md`
- `.env` (actualizado)

**Próximo sprint:** Migrar hooks a Supabase (ver `PROXIMOS_PASOS_SUPABASE.md`)
