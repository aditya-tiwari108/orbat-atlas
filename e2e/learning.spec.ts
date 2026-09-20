import { test, expect } from '@playwright/test';
import { symbolCatalog, symbolCategories } from '../data/symbology/catalog';

test('home offers three modules and India artwork without invented labels', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.collection-card')).toHaveCount(3);
  await expect(page.locator('.map-note')).toHaveCount(0);
  await expect(page.locator('.map-art img')).toHaveAttribute(
    'src',
    '/geography/india-context.svg',
  );
  await page
    .getByRole('link', { name: 'Explore NATO symbols', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'A symbol. A whole story.' }),
  ).toBeVisible();
  await page.screenshot({ path: 'work/symbols/desktop.png' });
});

test('all symbol topics render, search selects across topics, empty state recovers', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/symbols');
  for (const [id, name] of Object.entries(symbolCategories)) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.symbol-tile')).toHaveCount(
      symbolCatalog.filter((r) => r.category === id).length,
    );
    await expect
      .poll(() =>
        page
          .locator('.symbol-tile img')
          .evaluateAll((imgs) =>
            imgs.every(
              (i) =>
                (i as HTMLImageElement).complete &&
                (i as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
  }
  await page.getByLabel('Search symbols').fill('corps');
  await page
    .getByRole('button', { name: 'Corps / MEF ECHELON', exact: true })
    .click();
  await expect(page.locator('.inspector-title h2')).toHaveText('Corps / MEF');
  await page.getByLabel('Search symbols').fill('nonexistent-xyz');
  await expect(
    page.getByRole('heading', { name: 'No symbols found.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  expect(errors).toEqual([]);
});

test('builder has stable shared links, history, code and SVG download', async ({
  page,
}) => {
  await page.goto('/symbols?symbol=infantry');
  await page
    .getByRole('combobox', { name: 'Affiliation', exact: true })
    .selectOption('6');
  await page
    .getByRole('combobox', { name: 'Echelon', exact: true })
    .selectOption('22');
  await page.getByLabel('Formation modifier').selectOption('2');
  await page
    .getByRole('combobox', { name: 'Status', exact: true })
    .selectOption('1');
  await page.getByRole('button', { name: '04 / HQ', exact: true }).click();
  await expect(page.locator('.anatomy-description')).toContainText(
    'staff extending downward',
  );
  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Echelon', exact: true }),
  ).toHaveValue('22');
  await expect(
    page.getByRole('combobox', { name: 'Affiliation', exact: true }),
  ).toHaveValue('6');
  await expect(page.getByLabel('Formation modifier')).toHaveValue('2');
  await expect(
    page.getByRole('combobox', { name: 'Status', exact: true }),
  ).toHaveValue('1');
  await page.getByText('Code & reference', { exact: true }).click();
  await expect(page.locator('.symbol-code code')).toHaveText(
    '130610122212110000000000000000',
  );
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save SVG' }).click();
  expect((await download).suggestedFilename()).toContain('infantry-');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(
    page.getByRole('combobox', { name: 'Echelon', exact: true }),
  ).toHaveValue('00');
  await page.goBack();
  await expect(
    page.getByRole('combobox', { name: 'Echelon', exact: true }),
  ).toHaveValue('22');
});

test('rank quiz filters, six choices, locked feedback, score and review work end to end', async ({
  page,
}) => {
  await page.goto('/ranks?country=PK');
  const launch = page.getByRole('button', { name: 'Quiz yourself' });
  await launch.click();
  await expect(page.getByLabel('Country / collection')).toHaveValue('PK');
  await page.getByLabel('Service / wing').selectOption('navy');
  await page.getByRole('button', { name: 'Start quiz' }).click();
  let correct = 0;
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.quiz-options button')).toHaveCount(6);
    await expect(page.locator('.quiz-context')).toContainText(
      'Pakistan / Navy',
    );
    const answers = await page
      .locator('.quiz-options button')
      .allTextContents();
    expect(new Set(answers).size).toBe(6);
    await page.locator('.quiz-options button').first().click();
    if (
      await page
        .locator('.quiz-options button')
        .first()
        .evaluate((el) => el.classList.contains('is-correct'))
    )
      correct++;
    await expect(page.locator('.quiz-options button:disabled')).toHaveCount(6);
    await expect(page.locator('.quiz-options .is-correct')).toHaveCount(1);
    if (i === 0) await page.screenshot({ path: 'work/symbols/rank-quiz.png' });
    await page
      .getByRole('button', {
        name: i === 9 ? 'See results' : 'Next question',
        exact: true,
      })
      .click();
  }
  await expect(page.locator('.quiz-results h2')).toHaveText(`${correct} / 10`);
  await expect(page.locator('.quiz-review details')).toHaveCount(10);
  await page.getByRole('button', { name: 'Change scope' }).click();
  await expect(page.getByLabel('Country / collection')).toHaveValue('PK');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(launch).toBeFocused();
});

test('symbol topic quiz alternates image/text and supports retry', async ({
  page,
}) => {
  await page.goto('/symbols?symbol=naval-task-force');
  await page.getByRole('button', { name: 'Quiz yourself' }).click();
  await expect(page.getByLabel('Study topic')).toHaveValue('maritime');
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await expect(page.locator('.quiz-image img')).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await expect(page.locator('.quiz-options button')).toHaveCount(6);
    if (i % 2) await expect(page.locator('.quiz-description')).toBeVisible();
    await page.locator('.quiz-options button').nth(2).click();
    await page
      .getByRole('button', {
        name: i === 5 ? 'See results' : 'Next question',
        exact: true,
      })
      .click();
  }
  await page.getByRole('button', { name: 'Try another round' }).click();
  await expect(page.locator('.quiz-progress')).toContainText('QUESTION 01 / 6');
  await expect(page.locator('.quiz-options button:disabled')).toHaveCount(0);
});

test('image failure uses a description and small screens remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ranks?country=IN');
  await page.route('**/rank-insignia/**', (route) => route.abort());
  await page.getByRole('button', { name: 'Quiz yourself' }).click();
  await page.getByLabel('Service / wing').selectOption('army');
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await expect(page.locator('.quiz-description')).toBeVisible();
  await expect(page.locator('.quiz-options button')).toHaveCount(6);
  await page.getByLabel('Close quiz').click();
  await page.goto('/symbols');
  await expect(page.locator('.symbol-inspector')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel('Search symbols').fill('division');
  await page
    .getByRole('button', { name: 'Division ECHELON', exact: true })
    .click();
  await expect(page.locator('.inspector-title h2')).toHaveText('Division');
  await page.screenshot({ path: 'work/symbols/mobile.png', fullPage: true });
});
