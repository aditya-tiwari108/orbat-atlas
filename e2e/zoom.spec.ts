import { test, expect } from '@playwright/test';

const modes = [
  ['army', 6],
  ['navy', 3],
  ['airforce', 5],
  ['ncc', 17],
] as const;
for (const [service, count] of modes) {
  test(`${service}: desktop HQ names survive zoom cycles, detail changes and panning`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?service=${service}`);
    const commands = page.locator('.command-label');
    await expect(commands).toHaveCount(count);
    await page.evaluate(() => {
      (window as any).originalCommands = [
        ...document.querySelectorAll('.command-label'),
      ];
    });
    for (const direction of [
      'Zoom in',
      'Zoom in',
      'Zoom in',
      'Zoom in',
      'Zoom out',
      'Zoom out',
      'Zoom out',
      'Zoom out',
    ]) {
      await page.getByRole('button', { name: direction, exact: true }).click();
      await expect(commands).toHaveCount(count);
      await expect
        .poll(() =>
          page.evaluate(() => {
            const originals = (window as any).originalCommands as HTMLElement[];
            return originals.every(
              (el) =>
                el.isConnected &&
                getComputedStyle(el.querySelector('.marker-text')!).display !==
                  'none',
            );
          }),
        )
        .toBe(true);
    }
    await page
      .getByRole('button', { name: 'Show all India', exact: true })
      .click();
    await expect
      .poll(() =>
        commands.evaluateAll((els) =>
          els.every((el) => getComputedStyle(el).visibility === 'visible'),
        ),
      )
      .toBe(true);
    await page.mouse.move(950, 600);
    await page.mouse.down();
    await page.mouse.move(1050, 650, { steps: 8 });
    await page.mouse.up();
    await expect(commands).toHaveCount(count);
    await page
      .getByRole('button', { name: 'Show all India', exact: true })
      .click();
    await expect
      .poll(() =>
        commands.evaluateAll((els) =>
          els.every((el) => getComputedStyle(el).visibility === 'visible'),
        ),
      )
      .toBe(true);
    expect(await page.locator('.quiet-label').count()).toBe(0);
    await page.screenshot({ path: `test-results/${service}-zoom-return.png` });
  });
}
for (const size of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1280, height: 633 },
]) {
  test(`NCC names are readable and selectable at ${size.width}×${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?service=ncc');
    await expect(page.locator('.command-label')).toHaveCount(17);
    await page.evaluate(() => document.fonts.ready);
    const names = page.locator('.command-label .marker-text');
    await expect
      .poll(() =>
        names.evaluateAll((els) => {
          const rects = els.map((el) => el.getBoundingClientRect());
          return rects.every(
            (a, i) =>
              a.left >= 0 &&
              a.right <= innerWidth &&
              a.top >= 90 &&
              a.bottom <= innerHeight - 55 &&
              !rects.some(
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
    const initialPoints = await page
      .locator('.command-label')
      .evaluateAll((els) =>
        els.map((el) => ({
          id: (el as HTMLElement).dataset.organizationId,
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
        })),
      );
    const ids = await page
      .locator('.command-label')
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).dataset.organizationId!),
      );
    // Every name is a usable target, not just a text node behind another marker.
    for (const id of ids) {
      const label = page.locator(`[data-organization-id="${id}"] .marker-text`);
      await label.click();
      await expect(page).toHaveURL(new RegExp(`org=${id}`));
      await expect(page.locator('#dossier-title')).toBeVisible();
      await page.locator('[aria-label="Close dossier"]').click();
    }
    const finalPoints = await page
      .locator('.command-label')
      .evaluateAll((els) =>
        els.map((el) => ({
          id: (el as HTMLElement).dataset.organizationId,
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
        })),
      );
    for (const point of initialPoints) {
      const last = finalPoints.find((p) => p.id === point.id)!;
      expect(Math.abs(last.x - point.x)).toBeLessThan(2);
      expect(Math.abs(last.y - point.y)).toBeLessThan(2);
    }
    await page.screenshot({
      path: `test-results/ncc-${size.width}-${size.height}.png`,
    });
  });
}

test('desktop wheel zoom with motion retains every in-view NCC HQ and restores the overview', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?service=ncc');
  await expect(page.locator('.command-label')).toHaveCount(17);
  await page.mouse.move(760, 510);
  for (const deltaY of [-260, -260, 260, 260]) {
    await page.mouse.wheel(0, deltaY);
    // Sample during and after the transition; anchors outside the map are
    // allowed to leave, but in-view HQs must never be collision-hidden.
    for (let sample = 0; sample < 4; sample++) {
      await page.waitForTimeout(160);
      expect(await page.locator('.command-label').evaluateAll(els => els.every(el => {
        const r = el.getBoundingClientRect();
        if (r.x < 20 || r.right > innerWidth - 20 || r.y < 110 || r.bottom > innerHeight - 80) return true;
        return getComputedStyle(el).visibility === 'visible' && getComputedStyle(el.querySelector('.marker-text')!).display !== 'none';
      }))).toBe(true);
    }
  }
  await page.getByRole('button', { name: 'Show all India', exact: true }).click();
  await expect.poll(() => page.locator('.command-label').evaluateAll(els => els.every(el => getComputedStyle(el).visibility === 'visible'))).toBe(true);
  await page.locator('[data-organization-id="in-ncc-karnataka-goa"] .marker-text').click();
  await expect(page.locator('.dossier .organization-row')).toHaveCount(6);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test-results/karnataka-selected-desktop.png' });
  await page.goto('/?org=in-ncc-group-mysuru');
  await expect(page.locator('.dossier .organization-row')).toHaveCount(6);
  await page.locator('.dossier .organization-row').filter({ hasText: '4 Kar Air Squadron' }).click();
  await expect(page.locator('#dossier-title')).toHaveText('4 Karnataka Air Squadron NCC');
});
