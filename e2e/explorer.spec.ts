import {test,expect} from '@playwright/test';

test('national overview and keyboard search reach an unmapped division and support Back',async({page})=>{
 await page.goto('/');await expect(page.locator('.map-organization')).toHaveCount(6);await expect(page.locator('.dossier')).toHaveCount(0);
 await page.keyboard.press('Control+k');await page.getByRole('combobox').fill('XII Corps');await page.keyboard.press('Enter');
 await expect(page.locator('#dossier-title')).toHaveText('XII Corps');await page.getByRole('button',{name:'Organization tree',exact:true}).click();
 await page.locator('.dossier .tree-connector .organization-row').filter({hasText:'11 Infantry Division'}).click();
 await expect(page.locator('#dossier-title')).toHaveText('11 Infantry Division');await expect(page.locator('.hq-fact')).toContainText('not verified');
 await page.reload();await expect(page.locator('#dossier-title')).toHaveText('11 Infantry Division');
 await page.goBack();await expect(page.locator('#dossier-title')).toHaveText('XII Corps');
});

test('Navy shares HQ cities, keeps ships unlocated and labels the tri-service command',async({page})=>{
 await page.goto('/?org=in-navy-western');await expect(page.getByRole('button',{name:'2 headquarters in Mumbai',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'2 headquarters in Mumbai',exact:true}).click();await page.locator('.overlap-picker').getByRole('button',{name:'Western Fleet',exact:true}).click();
 await expect(page.locator('#dossier-title')).toHaveText('Western Fleet');await expect(page.locator('.map-organization[aria-label*="Vikram"]')).toHaveCount(0);
 await page.goto('/?org=in-joint-andaman-nicobar');await expect(page.locator('.dossier-kicker')).toContainText('TRI-SERVICE COMMAND');await expect(page.locator('.service-switch button[aria-pressed=true]')).toHaveText('Navy');
});

test('Air Force support selector and NCC directorate-group-unit navigation',async({page})=>{
 await page.goto('/?service=airforce');await page.locator('.non-territorial > button').click();await expect(page.locator('.support-menu')).toContainText('Maintenance');await expect(page.locator('.support-menu')).toContainText('Training');
 await page.goto('/?org=in-ncc-kerala');await page.locator('.dossier .organization-row').filter({hasText:'Kottayam Group'}).click();await expect(page.locator('#dossier-title')).toContainText('Kottayam');
 await page.locator('.dossier .organization-row').filter({hasText:'5 Kerala Naval Unit'}).click();await expect(page.locator('#dossier-title')).toContainText('5 Kerala Naval');
});

test('mobile selected headquarters stays above the sheet with reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?org=in-army-southern');
 const marker=page.getByRole('button',{name:'Southern Command, headquarters Pune',exact:true});await expect(marker).toBeVisible();
 await expect.poll(async()=>{const m=await marker.boundingBox();const d=await page.locator('.dossier').boundingBox();return !!m&&!!d&&m.y+m.height<d.y;}).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.dossier-toolbar [aria-label="Close dossier"]').click();await expect(page.locator('.dossier')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hierarchy',exact:true})).toBeVisible();
});

test('CARTO failure preserves the map outline and organizations; Retry recovers',async({page})=>{
 await page.route(/cartocdn\.com/,route=>route.abort());await page.goto('/');await expect(page.locator('.map-error')).toContainText('Basemap unavailable');await expect(page.locator('.map-organization')).toHaveCount(6);
 await page.unrouteAll();await page.locator('.map-error button').click();await expect(page.locator('.map-error')).toHaveCount(0);await expect(page.locator('.map-organization')).toHaveCount(6);
});

test('missing portrait falls back and native search dialog supports Escape',async({page})=>{
 await page.route('**/portraits/**',route=>route.abort());await page.goto('/?org=in-army-southern');await expect(page.locator('.portrait-placeholder')).toContainText('Portrait unavailable');
 await page.keyboard.press('Control+k');await expect(page.locator('.search-modal')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.search-modal')).toHaveCount(0);
});
