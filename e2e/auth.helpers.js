// Helper functions for authentication flows in Playwright
import { expect } from '@playwright/test';

/**
 * Login using custom auth form (mock or real) for a given user.
 * Adjust selectors if the login page changes.
 * @param {import('@playwright/test').Page} page
 * @param {{email:string,password:string}} user
 */
export async function loginAs(page, user) {
  await page.goto('/');
  // Wait for login page to load
  await expect(
    page.getByRole('heading', { name: /Gestión de Flota/i })
  ).toBeVisible({ timeout: 10_000 });

  // Fill and submit login form
  await page.getByLabel(/Usuario o Email|usuario/i).fill(user.email);
  await page.getByLabel(/Contraseña|contraseña/i).fill(user.password);
  await page.getByRole('button', { name: /Iniciar Sesión|iniciar/i }).click();

  // After login, the user is redirected. Wait for the redirect to complete
  await page.waitForLoadState('networkidle', { timeout: 20_000 });

  // Wait a bit more for the app to stabilize
  await page.waitForTimeout(2000);

  console.log('✅ Logged in as:', user.email, '| Current URL:', page.url());
}

/**
 * Navigate directly to a page after login (bypass role redirects).
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 */
export async function gotoPage(page, path) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

export const users = {
  superadmin: { email: 'superusuario@flota.com', password: 'Super123!' },
  rrhh: { email: 'rrhh@flotavehicular.com', password: 'RRHH2025!' },
};
