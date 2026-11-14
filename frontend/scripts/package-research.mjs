import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const lab=resolve(import.meta.dirname,'../../../neurax-fieldshift-lab');
const report=JSON.parse(await readFile(resolve(lab,'runs/agrotwin-v41-research/report.json'),'utf8'));
if(report.schema_version!=='agrotwin-research-1'||report.experiment.production_approved!==false||report.experiment.decision!=='RESEARCH_ONLY')throw Error('Expected explicit research-only artifact');
await mkdir(resolve(import.meta.dirname,'../public/research'),{recursive:true});
await writeFile(resolve(import.meta.dirname,'../public/research/e1.json'),JSON.stringify(report,null,2)+'\n');
console.log('Packaged actual EDA/E1 evidence; no production model weights or A1 join.');
