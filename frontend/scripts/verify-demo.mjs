/* global document, innerWidth */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out=process.env.AGROTWIN_VERIFY_OUT || 'artifacts/v4/demo', base=process.env.AGROTWIN_URL || 'http://127.0.0.1:5174';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge',args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000}}), page=await context.newPage();
const report={base,checkedAt:new Date().toISOString(),pageErrors:[],consoleErrors:[],criticalNetwork:[],criticalFailures:[],canceledRequests:[],accessibility:[],screens:[],expectedBlockedBasemap:true};
await page.route('**/tile.openstreetmap.org/**',r=>r.abort());
page.on('pageerror',e=>report.pageErrors.push(e.message));
page.on('console',m=>{if(m.type()==='error' && !m.text().includes('ERR_FAILED'))report.consoleErrors.push(m.text());});
const isCritical=url=>/^\/(api|analysis|snapshots)\//.test(new URL(url).pathname);
page.on('response',r=>{if(isCritical(r.url()))report.criticalNetwork.push({url:r.url(),status:r.status(),method:r.request().method()});});
page.on('requestfailed',r=>{if(isCritical(r.url())){
  const failure={url:r.url(),error:r.failure()?.errorText};
  if(failure.error==='net::ERR_ABORTED')report.canceledRequests.push(failure);
  else report.criticalFailures.push(failure);
}});
async function settleVisuals(){
  await page.locator('.spatial-map:not([data-terrain-state="loading"]), .map-fallback').first().waitFor({state:'visible',timeout:15000});
  await page.locator('.climate-card').first().waitFor({state:'visible'});
  // Let the chart's JavaScript entrance animation settle before capturing pixels.
  await page.waitForTimeout(1800);
}
try {
  for(const [name,path] of [['entry-en','/'],['farmer-en','/w/my-thanh/farmer'],['power-en','/w/my-thanh/power'],['hardware-en','/hardware']]){
    await page.goto(base+path);await page.getByRole('heading').first().waitFor();
    if(path.includes('/w/')){
      await page.getByTestId('run-id').waitFor();
      await settleVisuals();
    }
    await page.screenshot({path:`${out}/${name}.png`,fullPage:true});report.screens.push(name);
    const a=await new AxeBuilder({page}).analyze();report.accessibility.push({name,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  }
  await page.goto(base+'/w/my-thanh/farmer');await page.getByTestId('run-id').waitFor();
  await settleVisuals();
  await page.getByRole('button',{name:'English / Tiếng Việt'}).click();
  await page.screenshot({path:`${out}/farmer-vi.png`,fullPage:true});report.screens.push('farmer-vi');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`${out}/farmer-vi-mobile.png`,fullPage:true});report.screens.push('farmer-vi-mobile');
  report.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  // React StrictMode cleanup/navigation cancels duplicate reads. Require a successful
  // matching response before classifying any such cancellation as expected.
  for(const failure of report.canceledRequests)if(!report.criticalNetwork.some(r=>r.url===failure.url&&r.status===200))report.criticalFailures.push(failure);
  report.pass=!report.pageErrors.length&&!report.consoleErrors.length&&!report.criticalFailures.length&&!report.mobileOverflow&&!report.criticalNetwork.some(r=>r.status>=400)&&!report.accessibility.some(a=>a.violations.some(v=>['serious','critical'].includes(v.impact)));
} finally {await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
