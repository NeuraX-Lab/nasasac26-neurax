import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/tile.openstreetmap.org/**',r=>r.abort());});

test('real model requests reach Power with distinct runs and unchanged A1',async({page})=>{
 await page.goto('/w/my-thanh/power');const panel=page.getByTestId('research-inference');
 await expect(panel.getByRole('button',{name:'Run research inference'})).toBeEnabled();
 const a1=await page.getByTestId('run-id').textContent();
 const one=page.waitForResponse(r=>r.url().endsWith('/v1/research/inference')&&r.request().method()==='POST');
 await panel.getByRole('button',{name:'Run research inference'}).click();const r1=await(await one).json();
 await expect(panel.getByTestId('research-inference-result')).toContainText(r1.prediction.toFixed(2));
 expect(r1.production_approved).toBe(false);expect(r1.execution).toBe('model.predict executed for this request');
 await panel.getByLabel('Research task').selectOption('rain-3');
 await expect(panel.getByTestId('research-inference-result')).toHaveCount(0);
 const two=page.waitForResponse(r=>r.url().endsWith('/v1/research/inference')&&r.request().method()==='POST');
 await panel.getByRole('button',{name:'Run research inference'}).click();const r2=await(await two).json();
 expect(r2.target).toBe('rain');expect(r2.horizon).toBe(3);expect(r2.run_id).not.toBe(r1.run_id);
 await expect(panel.getByTestId('research-inference-result')).toContainText(r2.baseline.prediction.toFixed(2));
 expect(await page.getByTestId('run-id').textContent()).toBe(a1);
 await expect(page.locator('.computed-rotation').first()).toContainText('Needs review');
});
test('failed inference does not show stale or invented output',async({page})=>{
 await page.route('**/api/v1/research/inference',r=>r.fulfill({status:503,body:'unavailable'}));
 await page.goto('/w/my-thanh/power');const panel=page.getByTestId('research-inference');
 await panel.getByRole('button',{name:'Run research inference'}).click();
 await expect(panel.getByRole('alert')).toContainText('No prediction shown');
 await expect(panel.getByTestId('research-inference-result')).toHaveCount(0);
});
test('mobile can execute research model without page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/w/my-thanh/power');
 const panel=page.getByTestId('research-inference');await panel.getByRole('button',{name:'Run research inference'}).click();
 await expect(panel.getByTestId('research-inference-result')).toBeVisible();
 await panel.getByText('Model, source and limitations',{exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
