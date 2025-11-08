# 🚀 Próximos Pasos - Integración Completa con Supabase

Esta guía describe los siguientes pasos para integrar completamente Supabase en tu aplicación después de configurar la base de datos.

## 📋 Índice

1. [Migrar Hooks a Supabase](#1-migrar-hooks-a-supabase)
2. [Implementar Autenticación](#2-implementar-autenticación)
3. [Actualizar Reducers y Actions](#3-actualizar-reducers-y-actions)
4. [Configurar Realtime](#4-configurar-realtime-opcional)
5. [Storage para Archivos](#5-storage-para-archivos-opcional)
6. [Optimizaciones de RLS](#6-optimizaciones-de-rls)

---

## 1. Migrar Hooks a Supabase

### 1.1 Actualizar `useDrivers.js`

Reemplaza el hook actual con llamadas a la API de Supabase:

```javascript
// src/hooks/useDrivers.js
import { useState, useEffect, useCallback } from 'react';
import {
  getConductores,
  getConductorById,
  createConductor,
  updateConductor,
  deleteConductor,
  getConductoresStats,
} from '../api/conductores';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar conductores al montar
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async (filters = {}) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await getConductores(filters);

    if (err) {
      setError(err.message);
    } else {
      setDrivers(data || []);
    }

    setLoading(false);
  };

  const addDriver = useCallback(async (driver) => {
    setLoading(true);
    const { data, error: err } = await createConductor(driver);

    if (!err && data) {
      setDrivers((prev) => [...prev, data]);
    }

    setLoading(false);
    return { data, error: err };
  }, []);

  const updateDriverData = useCallback(async (id, updates) => {
    setLoading(true);
    const { data, error: err } = await updateConductor(id, updates);

    if (!err && data) {
      setDrivers((prev) => prev.map((d) => (d.id === id ? data : d)));
    }

    setLoading(false);
    return { data, error: err };
  }, []);

  const removeDriver = useCallback(async (id) => {
    setLoading(true);
    const { success, error: err } = await deleteConductor(id);

    if (success) {
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    }

    setLoading(false);
    return { success, error: err };
  }, []);

  const getStats = async () => {
    const { data } = await getConductoresStats();
    return data;
  };

  return {
    drivers,
    loading,
    error,
    loadDrivers,
    addDriver,
    updateDriver: updateDriverData,
    deleteDriver: removeDriver,
    getStats,
  };
};
```

### 1.2 Actualizar `useVehicles.js`

Similar al anterior:

```javascript
// src/hooks/useVehicles.js
import { useState, useEffect, useCallback } from 'react';
import {
  getVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  getVehiculosStats,
} from '../api/vehiculos';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async (filters = {}) => {
    setLoading(true);
    const { data, error: err } = await getVehiculos(filters);

    if (err) {
      setError(err.message);
    } else {
      setVehicles(data || []);
    }

    setLoading(false);
  };

  // ... similar a useDrivers

  return {
    vehicles,
    loading,
    error,
    loadVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getStats,
  };
};
```

---

## 2. Implementar Autenticación

### 2.1 Actualizar `useAuth.js`

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase, useSupabaseAuth } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useSupabaseAuth();

  useEffect(() => {
    // Obtener sesión inicial
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await auth.signIn(email, password);
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await auth.signOut();
    setLoading(false);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
```

### 2.2 Crear Protected Route

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## 3. Actualizar Reducers y Actions

### Opción A: Mantener Context API + Supabase

```javascript
// src/store/actions/vehicleActions.js
import { VEHICLE_ACTIONS } from '../types';
import {
  getVehiculos,
  createVehiculo,
  updateVehiculo,
} from '../../api/vehiculos';

export const loadVehiclesAction = () => async (dispatch) => {
  dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });

  const { data, error } = await getVehiculos();

  if (error) {
    dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: error.message });
  } else {
    dispatch({ type: VEHICLE_ACTIONS.SET_VEHICLES, payload: data });
  }
};

export const addVehicleAction = (vehicle) => async (dispatch) => {
  const { data, error } = await createVehiculo(vehicle);

  if (!error) {
    dispatch({ type: VEHICLE_ACTIONS.ADD_VEHICLE, payload: data });
  }

  return { data, error };
};

// ... más actions
```

### Opción B: Usar React Query (Recomendado)

```bash
npm install @tanstack/react-query
```

```javascript
// src/hooks/useVehiclesQuery.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehiculos, createVehiculo, updateVehiculo } from '../api/vehiculos';

export const useVehiclesQuery = (filters = {}) => {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => getVehiculos(filters),
  });

  const createMutation = useMutation({
    mutationFn: createVehiculo,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateVehiculo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
    },
  });

  return {
    vehicles: vehiclesQuery.data?.data || [],
    loading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    createVehicle: createMutation.mutate,
    updateVehicle: updateMutation.mutate,
  };
};
```

---

## 4. Configurar Realtime (Opcional)

Para escuchar cambios en tiempo real:

```javascript
// src/hooks/useRealtimeVehicles.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeVehicles = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Cargar inicial
    loadVehicles();

    // Suscribirse a cambios
    const subscription = supabase
      .channel('vehiculos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehiculo',
        },
        (payload) => {
          console.log('Cambio detectado:', payload);

          if (payload.eventType === 'INSERT') {
            setVehicles((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setVehicles((prev) =>
              prev.map((v) => (v.id === payload.new.id ? payload.new : v))
            );
          } else if (payload.eventType === 'DELETE') {
            setVehicles((prev) => prev.filter((v) => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadVehicles = async () => {
    const { data } = await supabase.from('vehiculo').select('*');
    setVehicles(data || []);
  };

  return vehicles;
};
```

---

## 5. Storage para Archivos (Opcional)

Para subir documentos (licencias, facturas, fotos):

### 5.1 Crear Bucket en Supabase

1. Ve a **Storage** en Supabase
2. Crea bucket `documentos`
3. Configura políticas de acceso

### 5.2 Helper de Upload

```javascript
// src/api/storage.js
import { supabase } from '../lib/supabaseClient';

export async function uploadFile(bucket, path, file) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { data: { ...data, publicUrl }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  return { success: !error, error };
}
```

---

## 6. Optimizaciones de RLS

### 6.1 RLS por Usuario

Si quieres filtrar por usuario específico:

```sql
-- Política: Los conductores solo ven sus propios datos
CREATE POLICY "Conductores ven solo sus datos"
ON combustible FOR SELECT
USING (
  id_conductor = (
    SELECT id FROM conductor
    WHERE id = (
      SELECT id_conductor FROM usuario
      WHERE auth_user_id = auth.uid()
    )
  )
);
```

### 6.2 Multi-Tenant (Empresa)

Si añades `empresa_id`:

```sql
-- Agregar columna empresa_id a todas las tablas
ALTER TABLE vehiculo ADD COLUMN empresa_id UUID REFERENCES empresas(id);
ALTER TABLE conductor ADD COLUMN empresa_id UUID REFERENCES empresas(id);
-- ... etc

-- Política de acceso por empresa
CREATE POLICY "Usuarios ven solo su empresa"
ON vehiculo FOR SELECT
USING (
  empresa_id = (
    SELECT empresa_id FROM usuario
    WHERE auth_user_id = auth.uid()
  )
);
```

---

## ✅ Checklist de Integración

- [ ] Hooks migrados a Supabase
- [ ] Autenticación implementada
- [ ] Protected routes configurados
- [ ] Actions/Reducers actualizados (o React Query)
- [ ] Realtime configurado (si aplica)
- [ ] Storage configurado (si aplica)
- [ ] RLS optimizado
- [ ] Tests de integración
- [ ] Documentación actualizada

---

## 🚨 Advertencias Importantes

### Seguridad

- **NUNCA** expongas `service_role_key` en el frontend
- Usa solo `anon` key en el cliente
- Confía en RLS para seguridad
- Valida datos en el frontend Y con constraints en BD

### Performance

- Usa índices en columnas de filtro frecuente
- Evita `SELECT *` en producción (especifica columnas)
- Implementa paginación para listas grandes
- Usa React Query para cache automático

### RLS

- Prueba políticas exhaustivamente
- RLS puede ser complejo de debuggear
- Usa `EXPLAIN` para analizar queries
- Considera desactivar en desarrollo (reactivar en prod)

---

## 📚 Recursos

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query](https://tanstack.com/query/latest)

---

**Siguiente:** Implementa autenticación y actualiza hooks según prioridad.
