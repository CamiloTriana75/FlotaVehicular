# 🔐 Credenciales de Usuarios del Sistema

## 📋 Usuarios Disponibles

### 1. **SUPERUSUARIO** (Acceso Total)

```
Email: superusuario@flota.com
Password: Super123!
Rol: superusuario
```

**Permisos**: Acceso completo al sistema, gestión de todos los módulos

---

### 2. **ADMINISTRADOR**

```
Email: admin@flota.com
Password: Admin123!
Rol: admin
```

**Permisos**: Gestión de vehículos, conductores, rutas, reportes

---

### 3. **RECURSOS HUMANOS (RRHH)**

```
Email: rrhh@flota.com
Password: Rrhh123!
Rol: rrhh
```

**Permisos**: Gestión de conductores, asignaciones, historial laboral

---

### 4. **SUPERVISOR**

```
Email: supervisor@flota.com
Password: Supervisor123!
Rol: supervisor
```

**Permisos**: Crear/modificar asignaciones de vehículos a conductores, monitoreo de rutas

---

### 5. **OPERADOR**

```
Email: operador@flota.com
Password: Operador123!
Rol: operador
```

**Permisos**: Visualización de vehículos, rutas y conductores (solo lectura)

---

### 6. **CONDUCTOR**

```
Email: conductor@flota.com
Password: Conductor123!
Rol: conductor
```

**Permisos**: Ver sus asignaciones, reportar incidentes, actualizar ubicación

---

## 🚗 Datos de Prueba

### Vehículos Disponibles:

| ID  | Placa   | Marca     | Modelo  | Estado      |
| --- | ------- | --------- | ------- | ----------- |
| 1   | ABC-123 | Chevrolet | Spark   | activo      |
| 2   | DEF-456 | Renault   | Logan   | estacionado |
| 3   | GHI-789 | Toyota    | Corolla | activo      |

### Conductores Disponibles:

| ID  | Cédula   | Nombre | Apellidos | Licencia  | Estado     |
| --- | -------- | ------ | --------- | --------- | ---------- |
| 1   | 12345678 | Carlos | Mendoza   | LIC123456 | activo     |
| 2   | 87654321 | María  | García    | LIC876543 | disponible |
| 3   | 11223344 | Luis   | Rodríguez | LIC112233 | activo     |

---

## 📝 Notas Importantes

### Para crear usuarios adicionales:

**Usando Supabase Dashboard:**

1. Ve a Authentication > Users
2. Click en "Add user"
3. Ingresa email y password
4. En User Metadata agrega: `{"role": "nombre_del_rol"}`

**Usando SQL:**

```sql
-- Ejemplo para crear un nuevo supervisor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'nuevo.supervisor@flota.com',
  crypt('Password123!', gen_salt('bf')),
  NOW()
);
```

### Roles disponibles en el sistema:

- `superusuario` - Acceso total
- `admin` - Administrador
- `rrhh` - Recursos Humanos
- `supervisor` - Supervisor de operaciones
- `operador` - Operador (solo lectura)
- `conductor` - Conductor de vehículo

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:

- Estas son credenciales de **DESARROLLO/PRUEBAS**
- **NO usar en producción**
- Cambiar todas las contraseñas antes de desplegar
- Usar contraseñas fuertes y únicas en producción
- Habilitar autenticación de dos factores (2FA) en producción

---

## 🆘 Problemas Comunes

### No puedo iniciar sesión:

1. Verifica que el email esté correcto (sin espacios)
2. Asegúrate de que la contraseña sea exacta (case-sensitive)
3. Revisa que Supabase esté configurado correctamente
4. Verifica la consola del navegador para errores

### Usuario sin permisos:

1. Verifica que el rol esté asignado correctamente en la base de datos
2. Revisa las políticas RLS (Row Level Security)
3. Asegúrate de que el usuario esté activo

---

## 📞 Soporte

Para crear scripts de usuarios personalizados, consulta:

- `scripts/create-admin.js` - Crear usuarios admin
- `scripts/create-supervisor.js` - Crear usuarios supervisor
- `docs/CREAR_ADMIN.md` - Guía detallada

---

**Última actualización**: 11 de noviembre de 2025
