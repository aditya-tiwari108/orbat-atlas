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
  await expect(page.locator('.region-label')).toHaveCount(17);
  // The label box is generated wholly inside Karnataka; click its corner after
  // disabling label pointer events to independently exercise polygon hit-testing.
  const label = page.locator('[data-region-id="in-ncc-karnataka-goa"]');
  const box = await label.boundingBox();
  const point = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  await page.addStyleTag({
    content: '.region-label {pointer-events:none !important}',
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
