import { test, expect } from '@playwright/test';
import { platform } from '../data/platform';
import { rankRows, rankAssets } from '../data/ranks/model';

test('platform hub links both tools; Atlas legacy links and home navigation survive', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: platform.tagline }),
  ).toBeVisible();
  await expect(page.locator('.rank-specimen img')).toHaveCount(3);
  await expect
    .poll(() =>
      page
        .locator('.rank-specimen img')
        .evaluateAll((imgs) =>
          imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.getByRole('link', { name: 'Explore ranks and insignia' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('link', { name: 'ORBAT Atlas', exact: true }).click();
  await expect(page.locator('.map-organization')).toHaveCount(7);
  await page.getByRole('link', { name: `${platform.name} home` }).click();
  await expect(page.locator('.field-collections')).toBeVisible();
  await page.goto('/?org=in-army-northern');
  await expect(page.locator('#dossier-title')).toHaveText('Northern Command');
  expect(errors).toEqual([]);
});

test('rank hover and keyboard focus highlight counterparts without moving rows', async ({
  page,
}) => {
  await page.goto('/ranks');
  await expect(page.locator('.rank-row')).toHaveCount(9);
  const row = page.locator('[data-rank-row="in-officers-4"]');
  await row.scrollIntoViewIfNeeded();
  const before = await row.boundingBox();
  await row.locator('button').nth(1).hover();
  await expect(row).toHaveClass(/is-active/);
  expect(await row.boundingBox()).toEqual(before);
  await expect(row.locator('.rank-open')).toHaveCount(3);
  await expect(row.locator('.rank-name')).toContainText([
    'Captain',
    'Colonel',
    'Group Captain',
  ]);
  await row.locator('button').nth(0).focus();
  await expect(row).toHaveClass(/is-active/);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('dialog').locator('.rank-detail-cell strong'),
  ).toContainText(['Captain', 'Colonel', 'Group Captain']);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(row.locator('button').nth(0)).toBeFocused();
});

test('comparison URLs restore modal, country and category; browser back works', async ({
  page,
}) => {
  await page.goto('/ranks?country=CN&category=other&rank=cn-other-3');
  await expect(page.getByRole('dialog')).toContainText('一级上士');
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Close rank details').click();
  await page.getByRole('button', { name: 'Pakistan', exact: true }).click();
  await expect(page.locator('.rank-row')).toHaveCount(10);
  await page.goBack();
  await expect(
    page.getByRole('button', { name: 'China', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Other ranks', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('search spans categories, keeps equivalents and handles no results', async ({
  page,
}) => {
  await page.goto('/ranks');
  await page.getByRole('textbox', { name: 'Find a rank' }).fill('warrant');
  await expect(page.locator('.rank-row')).toHaveCount(3);
  await expect(page.locator('.rank-row').first()).toContainText(
    'Subedar Major',
  );
  await page.getByRole('textbox', { name: 'Find a rank' }).fill('nosuchrank');
  await expect(
    page.getByRole('heading', { name: 'No matching ranks' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('.rank-row')).toHaveCount(9);
});

test('NCC has separate cadet and ANO ladders with genuinely empty unknown matches', async ({
  page,
}) => {
  await page.goto('/ranks?country=NCC');
  await expect(page.locator('.rank-row')).toHaveCount(12);
  const csm = page.locator('[data-rank-row="ncc-cadets-csm"]');
  await expect(csm.locator('.empty')).toHaveCount(2);
  await expect(csm.locator('button')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'ANOs · Senior', exact: true })
    .click();
  await expect(page.locator('.rank-row')).toHaveCount(3);
  await expect(page.locator('.rank-row').first()).toContainText(
    'Lieutenant Commander',
  );
  await expect(page.locator('.rank-row img')).toHaveCount(0);
  await expect(page.locator('.insignia-unavailable').first()).toHaveText(
    'Insignia unverified',
  );
  await page
    .getByRole('button', { name: 'ANOs · Junior', exact: true })
    .click();
  await expect(page.locator('.rank-row')).toHaveCount(4);
  await expect(
    page.locator('.rank-row').first().locator('.rank-name strong'),
  ).toHaveText(['Chief Officer', 'Chief Officer', 'Chief Officer']);
});

test('images fail gracefully and reduced motion disables hover transforms', async ({
  page,
}) => {
  await page.route('**/rank-insignia/**', (r) => r.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ranks');
  await expect(
    page.locator('.rank-row').first().locator('.insignia-unavailable'),
  ).toHaveText(['Image unavailable', 'Image unavailable', 'Image unavailable']);
  await page.unrouteAll();
  await page.reload();
  const row = page.locator('.rank-row').first();
  await row.hover();
  expect(
    await row
      .locator('img')
      .first()
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe('none');
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 375, height: 812 },
  { width: 812, height: 375 },
]) {
  test(`comparison fits and sticky headers do not overlap at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/ranks?country=CN');
    await expect(page.locator('.rank-row')).toHaveCount(10);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 600));
    const toolbar = await page.locator('.rank-toolbar').boundingBox();
    const head = await page.locator('.rank-column-head').boundingBox();
    expect(head!.y).toBeGreaterThanOrEqual(toolbar!.y + toolbar!.height - 1);
    await page.locator('.rank-row button').nth(12).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const d = await page.getByRole('dialog').boundingBox();
    expect(d!.width).toBeLessThanOrEqual(viewport.width);
    expect(
      await page
        .getByRole('dialog')
        .evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true);
    await page.screenshot({ path: `work/ranks/dialog-${viewport.width}.png` });
  });
}

test('every hosted insignia decodes; all country/category views render and retain provenance', async ({
  page,
}) => {
  await page.goto('/ranks');
  const failed = await page.evaluate(
    async (paths) => {
      const bad: string[] = [];
      for (let i = 0; i < paths.length; i += 12)
        await Promise.all(
          paths.slice(i, i + 12).map(async (path) => {
            const img = new Image();
            img.src = path;
            try {
              await img.decode();
            } catch {
              bad.push(path);
            }
          }),
        );
      return bad;
    },
    Object.values(rankAssets).map((a) => a.path),
  );
  expect(failed).toEqual([]);
  for (const country of ['IN', 'PK', 'CN', 'NCC']) {
    const cats = [
      ...new Set(
        rankRows.filter((r) => r.country === country).map((r) => r.category),
      ),
    ];
    for (const category of cats) {
      await page.goto(`/ranks?country=${country}&category=${category}`);
      await expect(page.locator('.rank-row')).toHaveCount(
        rankRows.filter((r) => r.country === country && r.category === category)
          .length,
      );
      await page.locator('.rank-row').last().scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect
        .poll(() =>
          page
            .locator('.rank-row img')
            .evaluateAll((imgs) =>
              imgs.every((i) => (i as HTMLImageElement).complete),
            ),
        )
        .toBe(true);
      await page.screenshot({
        path: `work/ranks/${country}-${category}.png`,
        fullPage: true,
      });
    }
  }
});
