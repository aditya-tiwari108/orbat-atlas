import { test, expect } from '@playwright/test';

const modes = [
  ['army', 6],
  ['navy', 3],
  ['airforce', 5],
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
