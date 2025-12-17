import { test, expect } from '@playwright/test';
import { loginAs, gotoPage, users } from './auth.helpers';

const conductorFixture = () => {
  const now = Date.now();
  const in40Days = new Date();
  in40Days.setDate(in40Days.getDate() + 40);
  return {
    nombreCompleto: `QA Driver ${now}`,
    cedula: `${now}`.slice(-10),
    telefono: '3001234567',
    email: `qa+driver${now}@example.com`,
    numeroLicencia: `LIC-${now}`,
    fechaVenc: in40Days.toISOString().split('T')[0],
  };
};

async function createDriver(page, data) {
  await gotoPage(page, '/conductores/nuevo');

  // Debug: verificar si la página cargó
  const title = await page.title();
  console.log('📄 Page title:', title);
  const url = page.url();
  console.log('🔗 Current URL:', url);

  // Debug: Ver qué headings hay
  const headings = await page.locator('h1, h2').allTextContents();
  console.log('📋 Headings found:', headings);

  // Intentar obtener el heading con timeout más largo
  await expect(
    page.getByRole('heading', { name: /nuevo conductor/i })
  ).toBeVisible({ timeout: 15000 });

  await page.getByLabel(/nombre completo/i).fill(data.nombreCompleto);
  await page.getByLabel(/c[eé]dula/i).fill(data.cedula);
  await page.getByLabel(/tel[eé]fono/i).fill(data.telefono);
  await page.getByLabel(/email/i).first().fill(data.email);
  await page.getByLabel(/n[uú]mero de licencia/i).fill(data.numeroLicencia);
  await page.getByLabel(/fecha vencimiento licencia/i).fill(data.fechaVenc);

  await page.getByRole('button', { name: /crear conductor/i }).click();

  // Expect redirect back to list, verify driver appears
  await expect(page).toHaveURL(/.*\/conductores/);
  await expect(
    page.getByText(data.nombreCompleto, { exact: false })
  ).toBeVisible({ timeout: 10_000 });
}

// CRUD end-to-end for superadmin

test.describe('Conductores CRUD - superadmin', () => {
  test('crear conductor', async ({ page }) => {
    await loginAs(page, users.superadmin);
    const data = conductorFixture();
    await createDriver(page, data);
  });
});

// CRUD for RRHH role (same flows)

test.describe('Conductores CRUD - RRHH', () => {
  test('crear y ver conductor', async ({ page }) => {
    await loginAs(page, users.rrhh);
    const data = conductorFixture();
    await createDriver(page, data);
  });
});
