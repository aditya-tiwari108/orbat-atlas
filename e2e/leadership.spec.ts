import { test, expect } from '@playwright/test';
import data from '../data/india.json' with { type: 'json' };

test('service home panels show the correct chiefs, large loaded portraits and a single bottom note', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/atlas');
  for (const [service, label, title, chief] of [
    ['army', 'Army', 'Indian Army', 'General Dhiraj Seth'],
    ['navy', 'Navy', 'Indian Navy', 'Admiral Krishna Swaminathan'],
    ['airforce', 'Air Force', 'Indian Air Force', 'Air Chief Marshal AP Singh'],
    ['ncc', 'NCC', 'National Cadet Corps', 'Lt Gen Virendra Vats'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('#leadership-title')).toHaveText(title);
    await expect(page.locator('.home-panel')).toContainText(chief);
    const photos = page.locator('.home-panel .leader-photo img');
    await expect(photos).toHaveCount(service === 'ncc' ? 1 : 2);
    await expect
      .poll(() =>
        photos.evaluateAll((imgs) =>
          imgs.every((img) => (img as HTMLImageElement).naturalWidth > 0),
        ),
      )
      .toBe(true);
    const box = await photos.first().boundingBox();
    expect(box!.width).toBeGreaterThan(145);
    expect(box!.height).toBeGreaterThan(195);
    if (service !== 'ncc')
      await expect(page.locator('.home-panel')).toContainText(
        'General N. S. Raja Subramani',
      );
    await expect(page.locator('.home-panel .sources-disclosure')).toHaveCount(
      0,
    );
    await expect(page.locator('.home-panel .accuracy-note')).toHaveCount(1);
    await expect(page.locator('.home-panel .read-more')).toHaveAttribute(
      'href',
      /^https:\/\/en.wikipedia.org\/wiki\//,
    );
    await expect(
      page.locator(service === 'ncc' ? '.region-label' : '.command-label'),
    ).toHaveCount(service === 'ncc' ? 19 : service === 'navy' ? 4 : 7);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `test-results/${service}-leadership-home.png`,
    });
  }
  await page.getByLabel('Close leadership panel').click();
  await expect(page.locator('.home-panel')).toHaveCount(0);
  await page.getByLabel('ORBAT Atlas overview').click();
  await expect(page.locator('.home-panel')).toBeVisible();
});

test('training and maintenance HQs are selectable directly on the map', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of [
    'in-army-training',
    'in-navy-southern',
    'in-airforce-training',
    'in-airforce-maintenance',
  ]) {
    const org = data.organizations.find((o) => o.id === id)!;
    await page.goto(`/?service=${org.service}`);
    await expect(page.locator('.non-territorial')).toHaveCount(0);
    await page.locator(`[data-organization-id="${id}"]`).click();
    await expect(page.locator('#dossier-title')).toHaveText(org.name);
    await expect(page.locator('.dossier-kicker')).toContainText(
      org.function!.toUpperCase(),
    );
    await page.getByLabel('Close dossier').click();
    await expect(page.locator('.home-panel')).toBeVisible();
  }
});

test('command portraits load at large size and the slim dossier retains overview and hierarchy links', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const org of data.organizations.filter((o) => o.level === 'command')) {
    await page.goto(`/?org=${org.id}`);
    await expect(page.locator('#dossier-title')).toHaveText(org.name);
    await expect(page.locator('.commander-caption')).toContainText(
      org.commander!.name,
    );
    if (org.commander && 'portraitId' in org.commander) {
      const img = page.locator('.commander-card img');
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
      const frame = await page
        .locator('.commander-card .leader-photo')
        .boundingBox();
      expect(frame!.width).toBeGreaterThan(300);
      expect(frame!.height).toBeGreaterThanOrEqual(300);
    } else {
      await expect(page.locator('.portrait-placeholder')).toContainText(
        'Portrait unavailable',
      );
    }
    await expect(page.locator('.dossier .read-more')).toHaveAttribute(
      'href',
      org.wikipedia!,
    );
    await expect(page.locator('.sources-disclosure')).toHaveCount(0);
    await page.locator('.dossier-scroll').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page.locator('.accuracy-note')).toBeVisible();
    expect(
      await page
        .locator('.accuracy-note')
        .evaluate((el) => el.parentElement?.lastElementChild === el),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
