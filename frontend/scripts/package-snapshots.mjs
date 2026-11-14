import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { numberOrNull } from './measurements.mjs';
const resources=path.resolve(import.meta.dirname,'../../../neurax-fieldshift-lab/neurax/resources/agrotwin');
const out=path.resolve(import.meta.dirname,'../public');
const read=async n=>JSON.parse(await readFile(path.join(resources,n),'utf8'));
const cache=await read('climate.json'),study=await read('case.json');
const seen=new Set();
const months=cache.months.map(row=>{
  if(seen.has(row.date))throw Error('Duplicate D1 month'); seen.add(row.date);
  const rain=numberOrNull(row.rain),temp=numberOrNull(row.temp);
  if(rain!==null&&rain<0)throw Error('Negative precipitation');
  const flagged=cache.source.flags.some(f=>f.date.slice(0,7)===row.date.slice(0,7));
  return {...row,rain,temp,qa:row.qa==='fail'?'fail':flagged||row.qa!=='pass'||rain===null||temp===null||row.coverage<1?'warn':'pass'};
});
const coords=study.geometry.features[0].geometry.coordinates[0];
const x=coords.map(p=>p[0]),y=coords.map(p=>p[1]);
const bundle={version:1,id:'my-thanh',dataMode:'observed',datasetVersion:cache.source.sha256.slice(0,16),runId:'curated-D1-2026-11-14',months,geometry:study.geometry,
 imagery:{extent:{xmin:Math.min(...x),xmax:Math.max(...x),ymin:Math.min(...y),ymax:Math.max(...y)}},
 source:{provider:'NASA POWER',url:cache.source.url,kind:'gridded_weather_estimate',retrievedAt:cache.source.retrieved_at,sourceSha256:cache.source.sha256,
 featuresSha256:cache.source.features_sha256,flags:cache.source.flags,units:cache.source.units,nativeResolution:cache.source.native_resolution,
 validation:'Curated real monthly cache; original raw hash retained, not independent field approval. Source flags mapped into monthly QA.'},a1:null,e1:null,h1:null};
for(const name of ['research','sandbox'])await mkdir(path.join(out,'snapshots',name),{recursive:true});
await writeFile(path.join(out,'snapshots/research/my-thanh.json'),JSON.stringify(bundle,null,2)+'\n');
const rain=[20,18,35,60,100,150,210,260,300,280,180,75];
const synthetic={...bundle,dataMode:'synthetic',datasetVersion:'fixture-ui-01',runId:'fixture-ui-01',months:rain.map((r,i)=>({date:`2025-${String(i+1).padStart(2,'0')}-01`,rain:i===5?null:r,temp:26+i/10,coverage:i===5?.8:1,qa:i===5||i===9?'warn':'pass'})),source:{...bundle.source,url:null,sourceSha256:null,featuresSha256:null,provider:'UI fixture',validation:'SYNTHETIC UI only; excluded from evaluator',flags:[]}};
await writeFile(path.join(out,'snapshots/sandbox/my-thanh.json'),JSON.stringify(synthetic,null,2)+'\n');
console.log(`Packaged ${months.length} curated real months; raw data not required; no Esri imagery copied. Snapshot SHA256 ${createHash('sha256').update(JSON.stringify(bundle)).digest('hex')}`);
