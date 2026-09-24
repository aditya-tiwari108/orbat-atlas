import { test, expect } from '@playwright/test';
import { weapons, cartridges } from '../data/armoury/catalog';
import { armouryCountries } from '../data/armoury/model';

test('armoury country and type filters, trainer search, empty recovery and shared navigation', async ({
  page,
}) => {
  await page.goto('/armoury');
  await expect(
    page.getByRole('heading', { name: 'Form. Function. Firearms.' }),
  ).toBeVisible();
  for (const [id, name] of Object.entries(armouryCountries)) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.weapon-entry')).toHaveCount(
      weapons.filter((w) => w.countries.includes(id as never)).length,
    );
  }
  await page.getByRole('button', { name: 'India', exact: true }).click();
  await page.getByLabel('Weapon category').selectOption('trainer');
  await expect(page.locator('.weapon-entry')).toHaveCount(3);
  await page.getByRole('button', { name: '.22 Deluxe .22 LR · IN' }).click();
  await expect(page.locator('.specimen-heading h2')).toHaveText('.22 Deluxe');
  await page.reload();
  await expect(page.getByLabel('Weapon category')).toHaveValue('trainer');
  await expect(page.locator('.specimen-heading h2')).toHaveText('.22 Deluxe');
  await page.getByRole('button', { name: '.22 Sporting .22 LR · IN' }).click();
  await page.goBack();
  await expect(page.locator('.specimen-heading h2')).toHaveText('.22 Deluxe');
  await page.getByLabel('Search armoury').fill('missing-specimen-xyz');
  await expect(
    page.getByRole('heading', { name: 'No matching specimens' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reset filters', exact: true })
    .click();
  await expect(page.locator('.weapon-entry')).toHaveCount(weapons.length);
});

test('every local specimen renders and disposes its WebGL context when changing selection', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const warnings: string[] = [];
  page.on('console', (e) => {
    if (/too many active webgl|context lost/i.test(e.text()))
      warnings.push(e.text());
  });
  await page.route('https://sketchfab.com/**', (r) => r.abort());
  await page.goto('/armoury');
  for (const w of weapons) {
    await page
      .locator('.weapon-entry')
      .filter({
        has: page.locator('strong', {
          hasText: new RegExp(
            `^${w.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          ),
        }),
      })
      .click();
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await expect(page.locator('.specimen-stage')).toHaveAttribute(
      'data-ready',
      'true',
    );
    await expect(page.locator('.three-host canvas')).toHaveCount(1);
    await expect(page.locator('.specimen-heading h2')).toHaveText(w.name);
  }
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test('local camera controls, exterior annotations and 2D fallback work with keyboard', async ({
  page,
}) => {
  await page.goto('/armoury?weapon=insas');
  await expect(page.locator('.specimen-stage')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const before = await page.locator('.three-host').screenshot();
  const rotate = page.getByRole('button', { name: 'Rotate left', exact: true });
  await rotate.focus();
  await page.keyboard.press('Enter');
  const after = await page.locator('.three-host').screenshot();
  expect(before.equals(after)).toBe(false);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.getByRole('button', { name: /02\s*receiver/i }).click();
  await expect(page.locator('.part-explanation')).toContainText('central body');
  await page.getByRole('button', { name: 'Switch to flat view' }).click();
  await expect(page.locator('.flat-specimen')).toBeVisible();
  await expect(page.locator('.three-host canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Study', exact: true }).click();
  await expect(page.locator('.three-host canvas')).toHaveCount(1);
  await page.screenshot({
    path: 'work/armoury/insas-desktop.png',
    fullPage: true,
  });
});

test('comparison survives country changes, preserves measurement context and closes on Escape', async ({
  page,
}) => {
  await page.goto('/armoury?weapon=insas');
  await page
    .getByRole('button', { name: 'Add to comparison', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'United States', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Add to comparison', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Compare side by side', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('INSAS');
  await expect(dialog).toContainText('M4A1');
  await expect(dialog).toContainText('With loaded magazine');
  await expect(dialog).toContainText('with sling and loaded magazine');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Compare side by side', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Remove INSAS from comparison', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Add another specimen', exact: true }),
  ).toBeDisabled();
});

test('cartridge profiles, linked weapons and direct links preserve selection', async ({
  page,
}) => {
  await page.goto('/armoury?tab=cartridges&cartridge=22lr');
  await expect(page.locator('.specimen-heading h2')).toHaveText(
    '.22 Long Rifle',
  );
  await expect(page.locator('.linked-weapons button')).toHaveCount(3);
  await expect(page.locator('.cartridge-entry')).toHaveCount(cartridges.length);
  await page
    .getByRole('button', { name: 'Inspect 7.62 × 51 mm NATO', exact: true })
    .click();
  await expect(page.locator('.specimen-heading h2')).toHaveText(
    '7.62 × 51 mm NATO',
  );
  await page.reload();
  await expect(page.locator('.specimen-heading h2')).toHaveText(
    '7.62 × 51 mm NATO',
  );
  await page
    .locator('.linked-weapons')
    .getByRole('button', { name: 'G3A3', exact: true })
    .click();
  await expect(page.locator('.specimen-heading h2')).toHaveText('G3A3');
  await expect(
    page.getByRole('button', { name: 'Weapons 27', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('unavailable WebGL and hostile or outdated shared parameters recover to usable references', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.includes('webgl')) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto('/armoury?weapon=22-deluxe');
  await expect(page.locator('.flat-specimen')).toContainText(
    '3D is unavailable',
  );
  await expect(page.locator('.technical-profile')).toContainText('2.78 kg');
  await page.goto(
    '/armoury?weapon=constructor&country=__proto__&cartridge=constructor',
  );
  await expect(page.locator('.specimen-heading h2')).toHaveText('AK-203');
  await page.getByRole('button', { name: 'Study', exact: true }).click();
  await expect(page.locator('.flat-specimen')).toContainText(
    '3D is unavailable',
  );
});

test('desktop and narrow layouts have no horizontal overflow; reduced motion has no automatic rotation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/armoury?weapon=22-no2');
  await expect(page.locator('.specimen-stage')).toHaveAttribute(
    'data-ready',
    'true',
  );
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 950 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect(
      page.getByRole('link', { name: 'Armoury', exact: true }),
    ).toBeVisible();
  }
  await page.screenshot({ path: 'work/armoury/mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: 'work/armoury/trainer-desktop.png',
    fullPage: true,
  });
});
