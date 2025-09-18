# Sistema de Gestión de Flota

## Descripción
Sistema de gestión de flota de vehículos desarrollado con React + Vite, TailwindCSS y Leaflet para geolocalización.

## Tecnologías utilizadas
- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSS
- **Mapas**: Leaflet + React-Leaflet  
- **Rutas**: React Router
- **Base de datos**: Supabase
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

## Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd sistema-gestion-flota
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Opción A: Usar datos mock (por defecto)
El sistema funciona con datos de prueba sin configuración adicional.

#### Opción B: Conectar con Supabase real
1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings → API 
3. Copiar la URL del proyecto y la clave anon
4. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```
5. Completar las variables en `.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```
6. Ejecutar el schema SQL en el editor SQL de Supabase:
```sql
-- Ver archivo db/schema.sql
```

### 4. Ejecutar el proyecto
```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción  
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar ESLint
- `npm run format` - Formatear código con Prettier
- `npm run test` - Ejecutar tests unitarios

## Estructura del proyecto

```
src/
├── pages/           # Páginas principales
├── components/      # Componentes reutilizables
├── lib/            # Utilidades y configuración
├── data/           # Datos mock
└── styles/         # Configuración de estilos

docs/
├── diagrams/       # Diagramas técnicos (UML, ER, etc)
└── ...

db/
└── schema.sql     # Schema de base de datos

tests/
└── ...           # Tests unitarios
```

## Funcionalidades implementadas

### ✅ Autenticación
- Login con email/password
- Integración con Supabase Auth
- Modo mock para desarrollo

### ✅ Gestión de Vehículos  
- Lista de vehículos con buscador
- Detalle individual con ubicación
- Formulario de edición
- Historial de actividad

### ✅ Mapas interactivos
- Visualización de flota en tiempo real
- Markers con información de velocidad
- Popups informativos

### ✅ Dashboard
- KPIs principales de la flota
- Gráficos de estado
- Resumen de actividad

### ✅ Gestión de Conductores
- Lista de conductores activos
- Información de contacto
- Estados de disponibilidad

## Despliegue en Vercel

1. Hacer push del código a GitHub
2. Conectar el repositorio en Vercel
3. Configurar las variables de entorno en Vercel
4. Desplegar automáticamente

## Checklist para Clase 9

- [x] Diagrama de casos de uso subido
- [x] Diagrama entidad-relación creado  
- [x] Diagrama de clases diseñado
- [x] Schema SQL implementado
- [ ] Rama main creada
- [ ] Rama develop creada
- [ ] Pull Request de ejemplo
- [ ] Asignar a Juan Camilo para configuración final de GitHub y CI

## Contribución

1. Crear rama feature desde develop
2. Implementar cambios
3. Crear Pull Request hacia develop
4. Revisión de código
5. Merge a develop
6. Deploy desde main

## Soporte

Para configuración de GitHub Actions y CI/CD, contactar a Juan Camilo.