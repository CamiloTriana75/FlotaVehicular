# Guía de Despliegue

Esta guía proporciona instrucciones paso a paso para desplegar FleetManager en diferentes entornos.

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Variables de Entorno](#variables-de-entorno)
3. [Build de Producción](#build-de-producción)
4. [Despliegue en Vercel](#despliegue-en-vercel)
5. [Despliegue en Netlify](#despliegue-en-netlify)
6. [Despliegue en Railway](#despliegue-en-railway)
7. [Configuración de Supabase](#configuración-de-supabase)
8. [CI/CD](#cicd)
9. [Troubleshooting](#troubleshooting)

---

## Preparación

### Checklist Pre-Deployment

Antes de desplegar, asegúrate de que:

- [ ] Todos los tests pasan: `npm run test`
- [ ] El linter no tiene errores: `npm run lint`
- [ ] Los tipos son correctos: `npm run type-check`
- [ ] El build local funciona: `npm run build && npm run preview`
- [ ] Las variables de entorno están configuradas
- [ ] La base de datos está configurada en Supabase
- [ ] Has probado en diferentes navegadores

### Requisitos del Sistema

```bash
Node.js: >= 18.0.0
npm: >= 9.0.0
```

## Variables de Entorno

### Variables Requeridas

Crea un archivo `.env.production` con las siguientes variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica

# App Configuration (Opcional)
VITE_APP_NAME=FleetManager
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000

# Feature Flags (Opcional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a `Settings` > `API`
4. Copia `Project URL` y `anon/public key`

### Seguridad de Variables

⚠️ **IMPORTANTE**: 
- NUNCA commitees archivos `.env` al repositorio
- Las variables con prefijo `VITE_` son públicas en el cliente
- No incluyas API keys secretas en variables `VITE_`

## Build de Producción

### Crear Build

```bash
# Instalar dependencias
npm install

# Crear build de producción
npm run build
```

Esto genera una carpeta `dist/` con los archivos optimizados.

### Verificar Build Localmente

```bash
# Previsualizar build de producción
npm run preview
```

Abre `http://localhost:4173` para verificar que todo funciona.

### Análisis del Bundle

```bash
# Ver tamaño del bundle
npm run build -- --mode analyze
```

## Despliegue en Vercel

### Opción 1: Deploy desde GitHub

1. **Conectar Repositorio**
   - Ve a [Vercel](https://vercel.com)
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub

2. **Configurar Proyecto**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Agregar Variables de Entorno**
   - Ve a "Environment Variables"
   - Agrega `VITE_SUPABASE_URL`
   - Agrega `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click en "Deploy"
   - Espera a que termine (2-3 minutos)
   - Tu app estará en `https://tu-proyecto.vercel.app`

### Opción 2: Deploy con CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Configuración Avanzada (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Despliegue en Netlify

### Opción 1: Deploy desde GitHub

1. **Conectar Repositorio**
   - Ve a [Netlify](https://netlify.com)
   - Click en "Add new site" > "Import an existing project"
   - Conecta con GitHub

2. **Configurar Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables de Entorno**
   - Ve a "Site settings" > "Environment variables"
   - Agrega tus variables de entorno

4. **Deploy**
   - Click en "Deploy site"

### Opción 2: Drag & Drop

```bash
# Crear build
npm run build

# Arrastrar carpeta dist/ a Netlify
```

### Configuración (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## Despliegue en Railway

### Desde GitHub

1. **Crear Proyecto**
   - Ve a [Railway](https://railway.app)
   - "New Project" > "Deploy from GitHub"
   - Selecciona tu repositorio

2. **Configurar**
   - Railway detecta automáticamente Vite
   - Agrega variables de entorno en "Variables"

3. **Deploy**
   - El deploy se ejecuta automáticamente

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Configuración de Supabase

### Setup Inicial

1. **Crear Proyecto**
   - Ve a [Supabase](https://supabase.com)
   - "New Project"
   - Elige un nombre y contraseña

2. **Ejecutar Migraciones**
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link proyecto
   supabase link --project-ref tu-project-ref
   
   # Aplicar migraciones
   supabase db push
   ```

3. **Configurar RLS (Row Level Security)**
   ```sql
   -- Habilitar RLS en todas las tablas
   ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
   
   -- Políticas de ejemplo
   CREATE POLICY "Users can view all vehicles"
     ON vehicles FOR SELECT
     USING (true);
   ```

### Poblar Base de Datos

```bash
# Ejecutar seeds
supabase db seed
```

O desde el dashboard de Supabase > SQL Editor.

## CI/CD

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm run test
      
      - name: Run Linter
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. "Settings" > "Secrets and variables" > "Actions"
3. Agrega los siguientes secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN` (obtener de Vercel)
   - `VERCEL_ORG_ID` (obtener de Vercel)
   - `VERCEL_PROJECT_ID` (obtener de Vercel)

## Optimizaciones de Producción

### Vite Configuration

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizar chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          maps: ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Aumentar límite de advertencia de chunk
    chunkSizeWarningLimit: 1000,
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

### Headers de Seguridad

Agrega headers de seguridad en tu plataforma de hosting:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## Monitoreo Post-Deployment

### Verificar Deployment

- [ ] La aplicación carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Las rutas funcionan (no hay 404)
- [ ] La autenticación funciona
- [ ] Los datos se cargan desde Supabase
- [ ] El mapa se renderiza correctamente
- [ ] Las imágenes y assets cargan
- [ ] El sitio es responsive en móvil

### Herramientas de Monitoreo

1. **Lighthouse** - Performance audit
   ```bash
   npm install -g @lhci/cli
   lhci autorun --upload.target=temporary-public-storage
   ```

2. **Sentry** - Error tracking (opcional)
   ```bash
   npm install @sentry/react
   ```

3. **Google Analytics** - Analytics (opcional)

## Troubleshooting

### Problema: Build falla

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Variables de entorno no funcionan

- Verifica que tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo
- Revisa que estén en el archivo correcto (`.env.local` para dev, `.env.production` para prod)

### Problema: 404 en rutas

Asegúrate de tener configurado el redirect a `/index.html` en tu plataforma:

**Vercel**: `vercel.json` con rewrites
**Netlify**: `netlify.toml` con redirects

### Problema: Supabase no conecta

- Verifica las credenciales en variables de entorno
- Revisa las políticas de RLS en Supabase
- Verifica que el proyecto de Supabase esté activo

### Problema: Build muy pesado

```bash
# Analizar bundle
npm run build -- --mode analyze

# Optimizar
# - Lazy load de rutas
# - Code splitting
# - Comprimir imágenes
# - Remover dependencias no usadas
```

## Rollback

Si algo sale mal después del deploy:

### Vercel
```bash
# Revertir al deployment anterior
vercel rollback
```

### Netlify
Dashboard > Deploys > Click en deploy anterior > "Publish deploy"

### GitHub
```bash
# Revertir commit
git revert HEAD
git push origin main
```

## Checklist Post-Deploy

- [ ] URL de producción funciona
- [ ] SSL/HTTPS está activo
- [ ] Dominio personalizado configurado (si aplica)
- [ ] Analytics configurado (si aplica)
- [ ] Error monitoring configurado (si aplica)
- [ ] Backups de base de datos configurados
- [ ] Documentación actualizada con URL de producción

---

**¡Felicidades! Tu aplicación está en producción 🎉**

Para más ayuda, consulta:
- [Documentación de Vite](https://vitejs.dev/guide/build.html)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
