import { test, expect } from '@playwright/test';

test('country switching preserves valid service modes, chiefs, portraits and browser history', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?service=ncc&country=IN');
  await page.getByLabel('Country', { exact: true }).selectOption('PK');
  await expect(page.locator('#leadership-title')).toHaveText('Pakistan Army');
  await expect(
    page.getByRole('button', { name: 'NCC', exact: true }),
  ).toHaveCount(0);
  for (const [mode, title, chief, count] of [
    ['Army', 'Pakistan Army', 'Asim Munir', 1],
    ['Navy', 'Pakistan Navy', 'Naveed Ashraf', 2],
    ['Air Force', 'Pakistan Air Force', 'Zaheer Ahmed Baber Sidhu', 2],
  ] as const) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    await expect(page.locator('#leadership-title')).toHaveText(title);
    await expect(page.locator('.home-panel')).toContainText(chief);
    const photos = page.locator('.home-panel .leader-photo img');
    await expect(photos).toHaveCount(count);
    await expect
      .poll(() =>
        photos.evaluateAll((imgs) =>
          imgs.every((img) => (img as HTMLImageElement).naturalWidth > 0),
        ),
      )
      .toBe(true);
    await expect(page.locator('.map-organization').first()).toBeVisible();
    await expect(page.locator('.map-loading')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `test-results/pakistan-${mode.replace(' ', '-')}.png`,
    });
  }
  await page.getByLabel('Country', { exact: true }).selectOption('IN');
  await expect(page.locator('#leadership-title')).toHaveText(
    'Indian Air Force',
  );
  await page.goBack();
  await expect(page.locator('#leadership-title')).toHaveText(
    'Pakistan Air Force',
  );
  expect(errors).toEqual([]);
});

test('Pakistan hierarchy, cross-country search and conflicting squadron facts remain navigable', async ({
  page,
}) => {
  await page.goto('/?org=pk-army-corps-i');
  await expect(page.locator('#dossier-title')).toHaveText('I Corps');
  await expect(page.locator('.organization-children')).toContainText(
    '6th Armoured',
  );
  await page.getByLabel('Search the atlas').click();
  await page.getByLabel('Search organizations').fill('I Corps');
  await expect(page.locator('#result-pk-army-corps-i')).toContainText(
    'Pakistan',
  );
  await expect(page.locator('#search-results')).toContainText('India');
  await page.getByLabel('Close search').click();
  await page.goto('/?org=pk-airforce-squadron-27');
  await expect(page.locator('.hq-fact')).toContainText('Rafiqui');
  await expect(page.locator('.organization-facts')).toContainText('Mirage 5');
  await expect(page.locator('.organization-facts button')).toHaveCount(0);
  await page.goto('/?org=pk-navy-ship-f261');
  await expect(page.locator('#dossier-title')).toHaveText('PNS Tughril');
  await expect(page.locator('.hq-fact')).toHaveText('Fleet asset');
  await expect(
    page.locator('[data-organization-id="pk-navy-ship-f261"]'),
  ).toHaveCount(0);
});

test('all 19 approved NCC directorates are selectable without invented new headquarters', async ({
  page,
}) => {
  for (const [id, name] of [
    ['in-ncc-andhra-pradesh', 'Andhra Pradesh'],
    ['in-ncc-jharkhand', 'Jharkhand'],
  ]) {
    await page.goto(`/?org=${id}`);
    await expect(page.locator('#dossier-title')).toContainText(name);
    await expect(page.locator('.dossier-kicker')).toContainText('APPROVED');
    await expect(page.locator(`[data-organization-id="${id}"]`)).toHaveCount(0);
    await expect(page.locator('.region-label')).toHaveCount(19);
  }
  await page.goto('/?country=PK&service=ncc');
  await expect(page.locator('#leadership-title')).toHaveText('Pakistan Army');
});

test('Pakistan shared headquarters expose every colocated command and survive zoom changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?country=PK&service=navy');
  await page
    .getByRole('button', { name: '5 headquarters in Karachi', exact: true })
    .click();
  await expect(page.locator('.overlap-picker button')).toHaveCount(6);
  await page
    .locator('.overlap-picker')
    .getByRole('button', { name: /Logistics Command/ })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText('Logistics Command');
  for (const label of ['Zoom out', 'Zoom in', 'Show all Pakistan']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('.map-organization.active')).toBeVisible();
  }
  await page.screenshot({ path: 'test-results/pakistan-logistics.png' });
});
