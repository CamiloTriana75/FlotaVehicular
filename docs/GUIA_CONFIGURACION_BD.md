# 🚀 Guía de Configuración: Base de Datos Supabase

## 📋 Índice

1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Aplicar Migraciones](#2-aplicar-migraciones)
3. [Configurar Variables de Entorno](#3-configurar-variables-de-entorno)
4. [Conectar la Aplicación](#4-conectar-la-aplicación)
5. [Verificar Conexión](#5-verificar-conexión)
6. [Pruebas](#6-pruebas)

---

## 1. Configuración de Supabase

### Paso 1.1: Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `FleetManager` (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Free (para desarrollo)
4. Haz clic en **"Create new project"**
5. Espera 1-2 minutos mientras Supabase configura tu proyecto

### Paso 1.2: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API**
3. Copia las siguientes credenciales:
   - **Project URL** (ejemplo: `https://abcdefghijk.supabase.co`)
   - **anon public** key (una clave larga que empieza con `eyJ...`)

---

## 2. Aplicar Migraciones

### Opción A: Editor SQL de Supabase (Recomendado)

1. En tu proyecto de Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New Query"**
3. Abre el archivo de migración:
   ```
   supabase/migrations/20251108000000_schema_completo_flota.sql
   ```
4. Copia **todo** el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona `Ctrl + Enter`)
7. Espera a que se ejecute (puede tardar 10-15 segundos)
8. Verifica que aparezca el mensaje: **"Success. No rows returned"**

### Opción B: Supabase CLI (Avanzado)

Si tienes instalado Supabase CLI:

```bash
# Instalar CLI (si no la tienes)
npm install -g supabase

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Aplicar migraciones
supabase db push
```

### Verificar Tablas Creadas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - ✅ `conductor`
   - ✅ `vehiculo`
   - ✅ `ruta`
   - ✅ `asignacion`
   - ✅ `mantenimiento`
   - ✅ `incidente`
   - ✅ `combustible`
   - ✅ `usuario`

---

## 3. Configurar Variables de Entorno

### Paso 3.1: Crear archivo `.env`

En la raíz del proyecto, crea un archivo `.env` (si no existe):

```bash
# PowerShell
Copy-Item env.example .env
```

### Paso 3.2: Completar credenciales

Abre el archivo `.env` y reemplaza:

```env
# Reemplaza con tus credenciales reales
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Modo mock debe estar en false para usar Supabase
VITE_MOCK_MODE=false
```

### Paso 3.3: Reiniciar servidor de desarrollo

Si el servidor está corriendo, reinícialo para cargar las nuevas variables:

```bash
# Detener servidor (Ctrl + C)
# Iniciar nuevamente
npm run dev
```

---

## 4. Conectar la Aplicación

### Actualizar `supabaseClient.js`

El archivo `src/lib/supabaseClient.js` ya está configurado. Verifica que luzca así:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isMockMode = () => {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://mock.supabase.co'
  );
};
```

### Instalar dependencias (si falta)

```bash
npm install @supabase/supabase-js
```

---

## 5. Verificar Conexión

### Opción 1: Endpoint de Salud (Crear nuevo archivo)

Crea `src/api/health.js`:

```javascript
import { supabase } from '../lib/supabaseClient';

export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('conductor')
      .select('count')
      .limit(1);

    if (error) throw error;

    return {
      status: 'connected',
      message: 'Conexión exitosa a Supabase',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Opción 2: Consola del navegador

Abre la consola de desarrollo del navegador (F12) y ejecuta:

```javascript
// Importar cliente
import { supabase } from './src/lib/supabaseClient';

// Probar consulta
const { data, error } = await supabase.from('conductor').select('*').limit(5);
console.log('Conductores:', data);
```

### Opción 3: Componente de prueba

Crea `src/pages/DatabaseTest.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DatabaseTest() {
  const [status, setStatus] = useState('Conectando...');
  const [conductores, setConductores] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .limit(5);

      if (error) throw error;

      setStatus('✅ Conexión exitosa');
      setConductores(data);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Conexión BD</h1>
      <p className="mb-4">{status}</p>

      {conductores.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Conductores:</h2>
          <ul className="list-disc pl-5">
            {conductores.map((c) => (
              <li key={c.id}>
                {c.nombre_completo} - {c.cedula}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Pruebas

### Test 1: Listar Conductores

```javascript
import { supabase } from '../lib/supabaseClient';

async function getConductores() {
  const { data, error } = await supabase
    .from('conductor')
    .select('*')
    .order('nombre_completo');

  if (error) {
    console.error('Error:', error);
    return [];
  }

  return data;
}

// Ejecutar
const conductores = await getConductores();
console.log('Total conductores:', conductores.length);
```

### Test 2: Insertar Conductor

```javascript
async function createConductor(conductor) {
  const { data, error } = await supabase
    .from('conductor')
    .insert([conductor])
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }

  return data;
}

// Ejecutar
const nuevoConductor = await createConductor({
  cedula: '99887766',
  nombre_completo: 'Ana Pérez Gómez',
  telefono: '3159988776',
  email: 'ana.perez@flota.com',
  licencia: 'LIC-99887',
  categoria_licencia: 'B1',
  fecha_venc_licencia: '2026-12-31',
  estado: 'activo',
});
```

### Test 3: Actualizar Vehículo

```javascript
async function updateVehiculo(placa, updates) {
  const { data, error } = await supabase
    .from('vehiculo')
    .update(updates)
    .eq('placa', placa)
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }

  return data;
}

// Ejecutar
const vehiculoActualizado = await updateVehiculo('ABC-123', {
  kilometraje_actual: 46000,
  estado: 'mantenimiento',
});
```

### Test 4: Consulta con JOIN

```javascript
async function getAsignacionesActivas() {
  const { data, error } = await supabase
    .from('asignacion')
    .select(
      `
      *,
      conductor:id_conductor (nombre_completo, cedula, telefono),
      vehiculo:id_vehiculo (placa, marca, modelo),
      ruta:id_ruta (nombre, origen, destino)
    `
    )
    .in('estado', ['programada', 'en_curso'])
    .order('fecha_inicio', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return [];
  }

  return data;
}
```

---

## 📊 Datos de Seed

El script de migración ya incluye datos de ejemplo:

- **3 Conductores** de prueba
- **5 Vehículos** de prueba
- **3 Rutas** de ejemplo
- **3 Usuarios** del sistema (admin, operador, mecánico)

### Credenciales de Usuario (desarrollo)

```
Usuario: admin
Email: admin@flota.com
Contraseña: admin123
Rol: superusuario
```

**⚠️ IMPORTANTE**: Cambia estas contraseñas en producción.

---

## 🔒 Row Level Security (RLS)

El esquema incluye políticas RLS básicas:

- ✅ Usuarios autenticados pueden **ver** todos los datos
- ✅ Solo administradores pueden **crear/modificar** conductores y vehículos
- ✅ Mecánicos pueden gestionar mantenimientos
- ✅ Conductores pueden reportar sus propios incidentes

### Desactivar RLS temporalmente (solo desarrollo)

Si tienes problemas con permisos durante desarrollo:

```sql
-- EN SQL EDITOR DE SUPABASE
ALTER TABLE conductor DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo DISABLE ROW LEVEL SECURITY;
-- ... repetir para todas las tablas
```

**⚠️ REACTIVAR antes de producción**

---

## 🐛 Solución de Problemas

### Error: "Invalid API key"

- Verifica que copiaste correctamente `VITE_SUPABASE_ANON_KEY`
- Asegúrate de que no hay espacios extras
- Reinicia el servidor de desarrollo

### Error: "relation does not exist"

- Las tablas no se crearon correctamente
- Vuelve a ejecutar el script de migración
- Verifica en **Table Editor** que existan las tablas

### Error: "permission denied for table"

- Problema de RLS
- Verifica que tengas usuario autenticado
- O desactiva RLS temporalmente (ver arriba)

### No se conecta a Supabase

- Verifica que `VITE_MOCK_MODE=false`
- Confirma que las URLs no tengan espacios ni comillas
- Revisa la consola del navegador para errores

---

## ✅ Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Credenciales copiadas (URL + anon key)
- [ ] Archivo `.env` configurado
- [ ] Migración ejecutada en SQL Editor
- [ ] Tablas visibles en Table Editor
- [ ] Servidor de desarrollo reiniciado
- [ ] Test de conexión exitoso
- [ ] Datos de seed presentes

---

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)

---

## 🚀 Próximos Pasos

1. **Migrar hooks a Supabase**: Actualizar `useVehicles.js`, `useDrivers.js` para usar supabase en lugar de localStorage
2. **Implementar autenticación**: Integrar Supabase Auth para login/logout
3. **Crear endpoint REST**: Si necesitas un backend propio, integrar con API Routes
4. **Configurar Storage**: Para subir documentos (licencias, facturas, etc.)
5. **Realtime subscriptions**: Escuchar cambios en tiempo real para ubicaciones

---

**¿Necesitas ayuda?** Consulta la documentación o crea un issue en el repositorio.
