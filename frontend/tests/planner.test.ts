import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {RunSchema} from '../src/features/analysis/contracts';
import {defaults,draftOf,restorePlan,snapshotKey,escapeHtml} from '../src/features/planner/model';
const run=RunSchema.parse(JSON.parse(readFileSync('public/analysis/my-thanh.saved.json','utf8')));
const good=()=>({id:'my-thanh',geometry:run.inputs.geometry,input:defaults,key:snapshotKey('my-thanh',run.inputs.geometry,defaults),run,chosen:1,checks:[false,false,false],outlook:null});
it('reload restores exactly the saved area and farm inputs while preserving unknown values',()=>{expect(draftOf(defaults).farm.current_crop).toBeNull();expect(restorePlan(JSON.stringify(good()))?.run.a1.run_id).toBe(run.a1.run_id);});
it('corrupt or mismatched saved area, geometry and input snapshots are rejected',()=>{expect(restorePlan('{')).toBeNull();expect(restorePlan(JSON.stringify({...good(),id:'area-123'}))).toBeNull();const forged=good();forged.run=structuredClone(run);forged.run.inputs.farm={current_crop:'rice'};expect(restorePlan(JSON.stringify(forged))).toBeNull();});
it('export escapes user text as data instead of executable HTML',()=>{expect(escapeHtml('<script>"&')).toBe('&lt;script&gt;&quot;&amp;');});
