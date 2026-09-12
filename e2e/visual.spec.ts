import { test, expect } from '@playwright/test';

test('HQ staff tips stay on geographic anchors through zoom, label toggles and font changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?org=in-army-northern');
  const corps = page.locator('[data-organization-id="in-army-corps-xvi"]');
  // Use the actual rendered staff path endpoint, independent of the placement code.
  const anchorErrors = () =>
    page.locator('.map-organization:has(.mil-symbol)').evaluateAll((els) =>
      els.map((el) => {
        const staff = el.querySelector('svg path') as SVGPathElement;
        const end = staff
          .getPointAtLength(staff.getTotalLength())
          .matrixTransform(staff.getScreenCTM()!);
        const marker = el.getBoundingClientRect();
        return Math.hypot(
          end.x - (marker.x + marker.width / 2),
          end.y - (marker.y + marker.height / 2),
        );
      }),
    );
  await expect(corps).toBeAttached();
  for (const direction of ['Zoom out', 'Zoom in', 'Zoom in', 'Zoom out']) {
    await page.getByRole('button', { name: direction, exact: true }).click();
    await expect
      .poll(async () => Math.max(...(await anchorErrors())))
      .toBeLessThan(1.2);
  }
  await page.getByRole('button', { name: 'Layers', exact: true }).click();
  await page.getByLabel('Organization labels').uncheck();
  expect(Math.max(...(await anchorErrors()))).toBeLessThan(1.2);
  await page.getByLabel('Organization labels').check();
  await page.getByRole('button', { name: 'Layers', exact: true }).click();
  await page.addStyleTag({
    content: '.formation-label strong { font-size: 18px !important; }',
  });
  expect(Math.max(...(await anchorErrors()))).toBeLessThan(1.2);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1020 },
]) {
  test(`selected formations and controls do not overlap at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const id of [
      'in-army-northern',
      'in-army-western',
      'in-navy-western',
      'in-ncc-karnataka-goa',
    ]) {
      await page.goto(`/?org=${id}`);
      await expect(page.locator('.map-organization').first()).toBeAttached();
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() =>
          page.locator('.map-organization').evaluateAll((els) => {
            const labels = els
              .filter((el) => getComputedStyle(el).visibility !== 'hidden')
              .map((el) =>
                el.querySelector('.marker-text')!.getBoundingClientRect(),
              );
            return labels.every(
              (a, i) =>
                !labels.some(
                  (b, j) =>
                    i !== j &&
                    a.left < b.right &&
                    a.right > b.left &&
                    a.top < b.bottom &&
                    a.bottom > b.top,
                ),
            );
          }),
        )
        .toBe(true);
      await page.screenshot({
        path: `test-results/${id}-${viewport.width}.png`,
      });
    }
  });
}

test('short desktop shared-HQ menu stays on screen and search returns to its first result', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 633 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?org=in-ncc-group-mysuru');
  await page
    .getByRole('button', { name: '7 headquarters in Mysuru', exact: true })
    .click();
  const menu = page.locator('.overlap-picker');
  await expect(menu).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThan(633 - 50);
  await menu
    .getByRole('button', {
      name: '1 Karnataka Artillery Battery NCC',
      exact: true,
    })
    .click();
  await expect(page.locator('#dossier-title')).toHaveText(
    '1 Karnataka Artillery Battery NCC',
  );
  await page.keyboard.press('Control+k');
  await page
    .locator('.search-results')
    .evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.getByRole('combobox').fill('NCC');
  await expect
    .poll(() =>
      page.locator('.search-results').evaluate((el) => {
        const first = el
          .querySelector('[aria-selected="true"]')!
          .getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return first.top >= box.top && first.bottom <= box.bottom;
      }),
    )
    .toBe(true);
});
