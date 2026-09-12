import { test, expect } from '@playwright/test';

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1280, height: 633 },
]) {
  test(`NCC regional names stay inside their layout boxes at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?service=ncc');
    await expect(page.locator('.region-label')).toHaveCount(17);
    await expect(page.locator('.command-label')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    for (const step of [
      'initial',
      'Zoom in',
      'Zoom out',
      'Zoom out',
      'Show all India',
    ]) {
      if (step !== 'initial')
        await page.getByRole('button', { name: step, exact: true }).click();
      const result = await page.locator('.region-label').evaluateAll((els) => {
        const visible = els.filter(
          (el) => getComputedStyle(el).visibility !== 'hidden',
        );
        return {
          count: visible.length,
          errors: visible.flatMap((el) => {
            const box = el.getBoundingClientRect();
            return [...el.children].flatMap((span) => {
              const range = document.createRange();
              range.selectNodeContents(span);
              const text = range.getBoundingClientRect();
              return text.left < box.left - 1 || text.right > box.right + 1
                ? [el.getAttribute('aria-label')]
                : [];
            });
          }),
        };
      });
      expect(result.errors).toEqual([]);
      if (step === 'initial' || step === 'Show all India')
        expect(result.count).toBeGreaterThanOrEqual(8);
    }
    const label = page.locator('[data-region-id="in-ncc-karnataka-goa"]');
    await label.click();
    await expect(page.locator('#dossier-title')).toContainText('Karnataka');
    await expect(page.locator('.dossier .organization-row')).toHaveCount(6);
    await page.getByLabel('Close dossier').click();
    await page
      .getByRole('button', { name: 'Browse all directorates', exact: true })
      .click();
    await expect(page.locator('.browse-panel')).toContainText('Delhi');
    await page.screenshot({
      path: `test-results/regions-${viewport.width}-${viewport.height}.png`,
    });
  });
}
test('Central Command never detaches from Lucknow during wheel and button zoom', async ({
  page,
}) => {
  await page.goto('/?service=army');
  const central = page.locator('[data-organization-id="in-army-central"]');
  await expect(central).toBeAttached();
  const check = async () => {
    expect(
      await central.evaluate((el) => {
        const p = el.getBoundingClientRect();
        const t = el.querySelector('.marker-text')!.getBoundingClientRect();
        return Math.abs(t.y + t.height / 2 - (p.y + 5));
      }),
    ).toBeLessThanOrEqual(33);
    expect(
      await central
        .locator('.label-leader')
        .evaluate((el) => parseFloat((el as HTMLElement).style.width)),
    ).toBeLessThanOrEqual(40);
  };
  for (const direction of ['Zoom out', 'Zoom out', 'Zoom in', 'Zoom in']) {
    await page.getByRole('button', { name: direction, exact: true }).click();
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(80);
      await check();
    }
  }
  await page.mouse.move(800, 480);
  for (const delta of [260, 260, -260, -260]) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(200);
    await check();
  }
  await page
    .getByRole('button', { name: 'Show all India', exact: true })
    .click();
  await page.waitForTimeout(800);
  await check();
  await page.screenshot({ path: 'test-results/central-geographic-label.png' });
});
test('4 Kar Eng Coy is discoverable, sourced and linked to Mangaluru Group', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('4 Kar Eng Coy');
  await page.getByRole('option').first().click();
  await expect(page).toHaveURL(/org=in-ncc-4-kar-engineer/);
  await expect(page.locator('#dossier-title')).toHaveText(
    '4 Karnataka Engineer Company NCC',
  );
  await expect(page.locator('.hq-fact')).toContainText('Manipal');
  await expect(page.locator('.leader-block')).toContainText('P. S. Chauhan');
  await page.getByText('Institutional associations', { exact: false }).click();
  await expect(page.locator('.dossier')).toContainText('Yenepoya');
  await page.locator('.sources-disclosure summary').click();
  await expect(page.locator('.sources-disclosure')).toContainText('SMVITM');
  await page.locator('.parent-block button').click();
  await expect(page.locator('#dossier-title')).toHaveText(
    'Mangaluru NCC Group',
  );
  await page.getByRole('button', { name: 'View all in tree' }).click();
  await expect(page.locator('.dossier')).toContainText(
    '9 documented organizations',
  );
});
