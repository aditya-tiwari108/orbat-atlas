import { test, expect } from '@playwright/test';

test('Air Force command → base → squadron, linked command and browser history', async ({
  page,
}) => {
  await page.goto('/?org=in-airforce-western');
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'Ambala AFS' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Ambala Air Force Station',
  );
  await expect(
    page.getByRole('heading', { name: 'Squadrons based here' }),
  ).toBeVisible();
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'No. 17 Squadron' })
    .click();
  await expect(page.locator('#dossier-title')).toContainText('Golden Arrows');
  await expect(page.locator('.organization-facts')).toContainText('Rafale');
  await expect(page.locator('.hq-fact')).toHaveText('Based at Ambala AFS');
  await expect(
    page.locator(
      '.map-organization.active[data-organization-id="in-airforce-base-ambala"]',
    ),
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.locator(
      '.map-organization[data-organization-id="in-airforce-squadron-17"]',
    ),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#dossier-title')).toContainText('Golden Arrows');
  await page.locator('.organization-facts button').click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Western Air Command',
  );
  await page.goBack();
  await expect(page.locator('#dossier-title')).toContainText('Golden Arrows');
});

test('fleet list expands and filters, a ship links back to its fleet and has no location marker', async ({
  page,
}) => {
  await page.goto('/?org=in-navy-fleet-western');
  const rows = page.locator('.organization-children .organization-row');
  await expect(rows).toHaveCount(6);
  await page.getByRole('button', { name: 'Show all 16', exact: true }).click();
  await expect(rows).toHaveCount(16);
  await page.getByRole('textbox', { name: 'Filter ships' }).fill('Tamal');
  await expect(rows).toHaveCount(1);
  await rows.click();
  await expect(page.locator('#dossier-title')).toHaveText('INS Tamal');
  await expect(page.locator('.organization-facts')).toContainText(
    'Talwar-class',
  );
  await expect(page.locator('.hq-fact')).toHaveText('Fleet asset');
  await expect(
    page.locator('.map-organization[aria-label*="Tamal"]'),
  ).toHaveCount(0);
  await page.locator('.parent-block button').click();
  await expect(page.locator('#dossier-title')).toHaveText('Western Fleet');
  await expect(page.getByRole('textbox', { name: 'Filter ships' })).toHaveValue(
    '',
  );
});

test('search discovers aircraft and training ships; joint installations retain the tri-service parent', async ({
  page,
}) => {
  await page.goto('/?service=airforce');
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox', { name: 'Search organizations' }).fill('Golden Arrows');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dossier-title')).toContainText('No. 17 Squadron');
  await page.goto('/?org=in-navy-training-squadron-1');
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'INS Tir' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText('INS Tir');
  await page.goto('/?org=in-navy-base-baaz');
  await page.locator('.parent-block button').click();
  await expect(page.locator('.dossier-kicker')).toContainText(
    'TRI-SERVICE COMMAND',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
