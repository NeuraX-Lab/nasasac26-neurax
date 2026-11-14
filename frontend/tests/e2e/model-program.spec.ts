import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/tile.openstreetmap.org/**',r=>r.abort());});

test('actual API report reaches Power while forecast and crop promotion stay closed', async({page,request})=>{
 const api=await request.get('http://127.0.0.1:8000/v1/research/model-program?aoi_id=MT-BLOCK-01');
 expect(api.status()).toBe(200); const report=await api.json();
 expect(report.production_inference).toBe(false);
 await page.goto('/w/my-thanh/power');
 const panel=page.getByTestId('model-program-evidence');
 await panel.locator('summary').click();
 await expect(panel).toContainText('Recorded evaluation results, not request-time inference');
 await expect(panel).toContainText('540 regional climate months');
 await expect(panel).toContainText(report.report_sha256);
 await expect(panel.locator('tbody tr')).toHaveCount(4);
 await expect(page.locator('.computed-rotation').first()).toContainText('Needs review');
 const unsupported=await request.get('http://127.0.0.1:8000/v1/research/model-program?aoi_id=OTHER');
 expect(unsupported.status()).toBe(404);
});
test('research API unavailable cannot masquerade as a prediction', async({page})=>{
 await page.route('**/api/v1/research/model-program?*',r=>r.fulfill({status:503,body:'unavailable'}));
 await page.goto('/w/my-thanh/power');
 const panel=page.getByTestId('model-program-evidence');await panel.locator('summary').click();
 await expect(panel.getByRole('status')).toContainText('no substitute prediction generated');
 await expect(panel.locator('table')).toHaveCount(0);
});
test('mobile Power can inspect report and retain honest scientific state', async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/w/my-thanh/power');
 const panel=page.getByTestId('model-program-evidence');await panel.locator('summary').click();
 await expect(panel).toContainText('RESEARCH_ONLY');
 await expect(panel.locator('table')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
