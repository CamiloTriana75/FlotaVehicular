import { test, expect } from '@playwright/test';
import { loginAs, gotoPage, users } from './auth.helpers';

async function seedDriver(page, { nombre, cedula, licencia, fechaVenc }) {
  await gotoPage(page, '/conductores/nuevo');

  // Debug
  console.log('🔗 URL:', page.url());

  await expect(
    page.getByRole('heading', { name: /nuevo conductor/i })
  ).toBeVisible({ timeout: 15000 });
  await page.getByLabel(/nombre completo/i).fill(nombre);
  await page.getByLabel(/c[eé]dula/i).fill(cedula);
  await page.getByLabel(/n[uú]mero de licencia/i).fill(licencia);
  await page.getByLabel(/fecha vencimiento licencia/i).fill(fechaVenc);
  await page.getByRole('button', { name: /crear conductor/i }).click();
  await expect(page).toHaveURL(/.*\/conductores/);
}

test.describe('Alertas de licencias', () => {
  test('muestra alerta por licencia vencida y próxima a vencer', async ({
    page,
  }) => {
    await loginAs(page, users.superadmin);

    // Datos de prueba
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const iso = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const expiredDate = new Date(today);
    expiredDate.setDate(today.getDate() - 1);

    const soonDate = new Date(today);
    soonDate.setDate(today.getDate() + 7);

    await seedDriver(page, {
      nombre: 'QA Licencia Vencida',
      cedula: `200${Date.now()}`.slice(-10),
      licencia: `LIC-${Date.now()}`,
      fechaVenc: iso(expiredDate),
    });

    await seedDriver(page, {
      nombre: 'QA Licencia Próxima',
      cedula: `201${Date.now()}`.slice(-10),
      licencia: `LIC-${Date.now()}-B`,
      fechaVenc: iso(soonDate),
    });

    // Volver a la lista y validar cards
    await gotoPage(page, '/conductores');
    const expiringCard = page.getByTestId('card-licencias-por-vencer');
    await expect(expiringCard).toBeVisible();
    await expect(expiringCard).toContainText(/Licencias por Vencer/i);
    await expect(expiringCard).toContainText(/Umbral:/i);

    const expiredCard = page.getByTestId('card-licencias-vencidas');
    await expect(expiredCard).toBeVisible();
    await expect(expiredCard).toContainText(/Licencias Vencidas/i);

    // Row-level visual cue for near expiry (warning text)
    await expect(
      page.getByText('⚠️ Licencia vence en', { exact: false })
    ).toBeVisible();
  });
});
