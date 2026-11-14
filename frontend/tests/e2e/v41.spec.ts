import { test,expect } from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/tile.openstreetmap.org/**',r=>r.abort());});
test('Power shows actual research-only E1 without crop promotion',async({page})=>{
 await page.goto('/w/my-thanh/power');await page.getByText('EDA / ML experiment — separate from crop advice',{exact:true}).click();
 await expect(page.getByText('RESEARCH_ONLY',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('MAE: HGB',{exact:false})).toContainText('0.493');
 await expect(page.locator('.computed-rotation').first()).toContainText('Needs review');
});
test('synthetic H1 reaches server history and features but stays excluded',async({page})=>{
 await page.goto('/hardware');await page.getByRole('button',{name:'Start synthetic stream'}).click();
 await page.getByRole('button',{name:'Sync events to pipeline',exact:true}).click();
 await expect(page.getByTestId('h1-pipeline-result')).toContainText('A1: excluded');
 await expect(page.getByTestId('h1-pipeline-result')).toContainText('field_relevance_unverified');
});
