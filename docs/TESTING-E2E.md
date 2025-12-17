# Pruebas E2E (Playwright)

## Requisitos

- Node 20+
- Navegadores Playwright instalados: `npx playwright install --with-deps`
- Supabase/mocks accesibles. Las credenciales mock usadas en helpers:
  - superadmin: `superusuario@flotavehicular.com` / `Superusuario123!`
  - rrhh: `rrhh@flotavehicular.com` / `Rrhh123!`

## Scripts

```bash
npm run test:e2e       # Ejecuta suite completa
npm run test:e2e:ui    # UI runner de Playwright
```

## Configuración

- Umbral de licencia próxima a vencer: `HR_CONFIG.LICENSE_EXPIRY_THRESHOLD_DAYS` (default 30) en `src/shared/constants/index.js`.
- Base URL: `PLAYWRIGHT_BASE_URL` (default `http://localhost:5173`).

## Escenarios cubiertos

- CRUD de conductores (superadmin, RRHH): crear, editar, eliminar, ver.
- Alertas de licencias: vencida y próxima a vencer (7 días) visibles en cards de la lista.

## Consejos locales

- Arranca la app en otro terminal: `npm run dev -- --host --port 5173`.
- Si usas mock auth, asegúrate que el login page coincida con los selectores en `e2e/auth.helpers.js`.
- Para depurar, ejecuta con UI: `npm run test:e2e:ui` y abre `playwright-report` tras la corrida.
