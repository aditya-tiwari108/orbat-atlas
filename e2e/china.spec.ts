import { test, expect } from '@playwright/test';

test('China offers three services, dated leadership and a loaded CMC portrait', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?country=CN&service=army');
  await expect(page.locator('#leadership-title')).toHaveText(
    'PLA Army & Joint Theaters',
  );
  await expect(
    page.getByRole('button', { name: 'NCC', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.map-organization')).toHaveCount(5);
  await expect(page.locator('.home-panel')).toContainText(
    'Chairman, Central Military Commission',
  );
  const photo = page.getByAltText('Xi Jinping');
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/china-army-overview.png' });
  for (const [service, title, count] of [
    ['Navy', 'PLA Navy', 3],
    ['Air Force', 'PLA Air Force', 5],
  ] as const) {
    await page.getByRole('button', { name: service, exact: true }).click();
    await expect(page.locator('#leadership-title')).toHaveText(title);
    await expect(page.locator('.map-organization')).toHaveCount(count);
    await expect(
      page.locator('.home-panel .organization-row').filter({
        hasText:
          service === 'Navy' ? 'East Sea Fleet' : 'Eastern Theater Air Force',
      }),
    ).toHaveCount(1);
    if (service === 'Air Force')
      await expect(page.locator('.home-panel')).toContainText(
        'General Wang Gang',
      );
    await page.screenshot({
      path: `test-results/china-${service.replace(' ', '-')}.png`,
    });
  }
  await page.getByLabel('Country', { exact: true }).selectOption('PK');
  await expect(page.locator('#leadership-title')).toHaveText(
    'Pakistan Air Force',
  );
  await page.goBack();
  await expect(page.locator('#leadership-title')).toHaveText('PLA Air Force');
  expect(errors).toEqual([]);
});

test('joint theater navigation crosses services and returns to its joint parent', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?org=cn-joint-eastern');
  await expect(page.locator('.dossier-kicker')).toContainText(
    'JOINT THEATER COMMAND',
  );
  await expect(page.locator('.dossier')).toContainText('General Yang Zhibin');
  await expect(
    page.locator('.organization-children .organization-row'),
  ).toHaveCount(3);
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'Eastern Theater Army' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Eastern Theater Command Ground Force',
  );
  await expect(page.locator('.organization-children')).toContainText(
    '71st Group Army',
  );
  await page.locator('.dossier-toolbar .back-link').click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Eastern Theater Command',
  );
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'East Sea Fleet' })
    .click();
  await expect(
    page.locator('.service-switch button[aria-pressed=true]'),
  ).toHaveText('Navy');
  await expect(page.locator('.organization-facts')).toContainText(
    'Eastern Theater Command',
  );
  await page
    .locator('.organization-children')
    .getByRole('button', { name: /Show all/ })
    .click();
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: 'Dongguan' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'PLANS Dongguan (109)',
  );
  await expect(
    page.locator('[data-organization-id="cn-navy-ship-109"]'),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#dossier-title')).toHaveText(
    'PLANS Dongguan (109)',
  );
});

test('China flying brigades use base associations, global search and shared links', async ({
  page,
}) => {
  await page.goto('/?org=cn-airforce-base-9');
  await expect(page.locator('.organization-children')).toContainText(
    'Flying units based here',
  );
  await page
    .locator('.organization-children .organization-row')
    .filter({ hasText: '9th Aviation Brigade' })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    '9th Aviation Brigade',
  );
  await expect(page.locator('.dossier-kicker')).toContainText(
    'AVIATION BRIGADE',
  );
  await expect(page.locator('.hq-fact')).toContainText('Wuhu/Wanli');
  await expect(
    page.locator('[data-organization-id="cn-airforce-brigade-9"]'),
  ).toHaveCount(0);
  await page
    .locator('.organization-facts button')
    .filter({ hasText: 'Eastern Theater Command Air Force' })
    .click();
  await page
    .locator('.organization-facts button')
    .filter({ hasText: 'Eastern Theater Command' })
    .click();
  await expect(
    page.locator('.service-switch button[aria-pressed=true]'),
  ).toHaveText('Army');
  await page.keyboard.press('Control+k');
  await page.getByLabel('Search organizations').fill('Fujian');
  await expect(page.locator('#result-cn-navy-ship-18')).toContainText('China');
  await page.locator('#result-cn-navy-ship-18').click();
  await expect(page.locator('#dossier-title')).toHaveText('PLANS Fujian (18)');
});

test('China command anchors survive zoom, and tile failure keeps its own outline', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(/cartocdn\.com/, (route) => route.abort());
  const outlines: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/geography/')) outlines.push(r.url());
  });
  await page.goto('/?country=CN&service=army');
  await expect(page.locator('.map-error')).toContainText('Basemap unavailable');
  await expect(page.locator('.map-organization')).toHaveCount(5);
  for (const action of ['Zoom out', 'Zoom out', 'Zoom in', 'Show all China']) {
    await page.getByRole('button', { name: action, exact: true }).click();
    for (const theater of [
      'eastern',
      'southern',
      'western',
      'northern',
      'central',
    ]) {
      await expect(
        page.locator(`[data-organization-id="cn-joint-${theater}"]`),
      ).toHaveCount(1);
    }
  }
  expect(outlines.some((u) => u.includes('china-overview'))).toBe(true);
  expect(outlines.some((u) => u.includes('india-soi'))).toBe(false);
  await page.getByLabel('Country', { exact: true }).selectOption('PK');
  await expect(page.locator('#leadership-title')).toHaveText('Pakistan Army');
  await expect
    .poll(() => outlines.some((u) => u.includes('pakistan-natural-earth')))
    .toBe(true);
  expect(outlines.some((u) => u.includes('india-soi'))).toBe(false);
});

for (const [width, height] of [
  [1280, 720],
  [1920, 1080],
]) {
  test(`China desktop labels and leadership remain readable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?country=CN&service=army');
    await expect(page.locator('.map-organization')).toHaveCount(5);
    const panel = await page.locator('.home-panel').boundingBox();
    expect(panel).toBeTruthy();
    for (const marker of await page
      .locator('.map-organization .marker-text')
      .all()) {
      const box = await marker.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThan(panel!.x);
      expect(box!.y).toBeGreaterThan(70);
      expect(box!.y + box!.height).toBeLessThan(height - 65);
    }
    for (const caption of await page
      .locator('.home-panel .commander-caption')
      .all()) {
      const box = await caption.boundingBox();
      expect(box!.x + box!.width).toBeLessThan(panel!.x + panel!.width);
    }
    await page.screenshot({
      path: `test-results/china-${width}x${height}.png`,
    });
  });
}
