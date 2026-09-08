import { test, expect } from '@playwright/test';
test('Karnataka and Goa exposes six groups, shared Bengaluru HQs and the Goa unit hierarchy', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?org=in-ncc-karnataka-goa');
  await expect(page.locator('.dossier .organization-row')).toHaveCount(6);
  await expect(page.locator('.dossier')).toContainText('Bengaluru A');
  await expect(page.locator('.dossier')).toContainText('Bengaluru B');
  await page
    .getByRole('button', { name: '3 headquarters in Bengaluru', exact: true })
    .click();
  await page
    .locator('.overlap-picker')
    .getByRole('button', { name: 'Bengaluru B NCC Group', exact: true })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Bengaluru B NCC Group',
  );
  await page
    .locator('.dossier .organization-row')
    .filter({ hasText: '5 Kar Battalion' })
    .click();
  await expect(page.locator('.hq-fact')).toContainText('not verified');
  await page.goto('/?org=in-ncc-group-belagavi');
  await page
    .locator('.dossier .organization-row')
    .filter({ hasText: '1 Goa Naval Unit' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    '1 Goa Naval Unit NCC',
  );
  await expect(page.locator('.hq-fact')).toContainText('Mapusa');
});

test('clicking the Karnataka region opens its six-group dossier, and service switching removes regional hit targets', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?service=ncc');
  await expect(page.locator('.command-label')).toHaveCount(17);
  // Calibrate Web Mercator from visible HQ anchors, then click an interior
  // Karnataka point clear of labels. This remains valid if map padding changes.
  const point = await page.evaluate(() => {
    const merc = (lat: number) =>
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const rect = (id: string) =>
      document
        .querySelector(`[data-organization-id="${id}"]`)!
        .getBoundingClientRect();
    const a = rect('in-ncc-karnataka-goa'),
      b = rect('in-ncc-bihar');
    for (const [lat, lng] of [
      [15.4, 75.3],
      [15.8, 76.1],
      [14.7, 75.6],
    ]) {
      const x = a.x + 5 + ((lng - 77.59) / (85.14 - 77.59)) * (b.x - a.x);
      const y =
        a.y +
        5 +
        ((merc(lat) - merc(12.97)) / (merc(25.61) - merc(12.97))) * (b.y - a.y);
      if (document.elementFromPoint(x, y)?.tagName === 'CANVAS')
        return { x, y };
    }
    throw new Error('No unobstructed interior region target');
  });
  await expect
    .poll(async () => {
      await page.mouse.move(point.x, point.y);
      return page
        .locator('.maplibregl-canvas')
        .evaluate((el) => (el as HTMLElement).style.cursor);
    })
    .toBe('pointer');
  await page.mouse.click(point.x, point.y);
  await expect(page).toHaveURL(/org=in-ncc-karnataka-goa/);
  await expect(page.locator('.dossier .organization-row')).toHaveCount(6);
  await page.getByRole('button', { name: 'Army', exact: true }).click();
  await page.mouse.click(600, 640);
  await expect(page.locator('.dossier')).toHaveCount(0);
});
