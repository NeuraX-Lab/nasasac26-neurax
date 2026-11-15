import type { Geometry } from '../../core/contracts';
import { z } from 'zod';
import { GeometrySchema } from '../../core/contracts/geometry';
import { RunSchema, type AnalysisRun, type Draft } from '../analysis/contracts';
import { ResearchInferenceSchema } from '../analysis/ResearchInference';
export const cropIds=['rice','baby_corn','mung_bean'] as const;
export type Crop=typeof cropIds[number];
export const InputSchema=z.object({year:z.number().int().min(1981).max(2025),start:z.string().regex(/^$|^\d{4}-(0[1-9]|1[0-2])$/),end:z.string().regex(/^$|^\d{4}-(0[1-9]|1[0-2])$/),
 current:z.enum(['','rice','baby_corn','mung_bean','other']),previous:z.enum(['','rice','baby_corn','mung_bean','other']),water:z.enum(['','available','limited','unavailable']),drainage:z.enum(['','good','poor']),goal:z.enum(['explore','water','soil','income']),candidates:z.tuple([z.enum(['','rice','baby_corn','mung_bean']),z.enum(['','rice','baby_corn','mung_bean'])])});
export type Inputs=z.infer<typeof InputSchema>;
export const defaults:Inputs={year:2025,start:'',end:'',current:'',previous:'',water:'',drainage:'',goal:'explore',candidates:['','']};
export function draftOf(input:Inputs):Draft {return {year:input.year,source_mode:'prefer_cache',farm:{current_crop:input.current||null,previous_crop:input.previous||null,season:input.start&&input.end?`${input.start} / ${input.end}`:null,irrigation_access:input.water||null,drainage_condition:input.drainage||null,goal:input.goal,waterlogging_history:null,management_plan:null}};}
export const snapshotKey=(id:string,geometry:unknown,input:Inputs)=>JSON.stringify({id,geometry:(geometry as Geometry|null)?.features.map(f=>f.geometry),input});
const Stored=z.object({id:z.string(),geometry:GeometrySchema,input:InputSchema,key:z.string(),run:RunSchema,chosen:z.number().int().min(0).max(2).nullable(),checks:z.array(z.boolean()).length(3),outlook:ResearchInferenceSchema.nullable()});
export type SavedPlan=z.infer<typeof Stored>;
export function restorePlan(raw:string|null):SavedPlan|null {try {const plan=Stored.parse(JSON.parse(raw||'null'));if(plan.key!==snapshotKey(plan.id,plan.geometry,plan.input))return null;
 const farm=plan.run.inputs.farm, expected=draftOf(plan.input);const period=plan.run.inputs.period as {start:string;end:string};if(period?.start!==`${plan.input.year}-01-01`||period?.end!==`${plan.input.year+1}-01-01`||plan.run.a1.data_mode==='synthetic')return null;if(plan.input.start&&plan.input.end&&plan.input.end<plan.input.start)return null;if(!farm||Object.entries(expected.farm).some(([k,v])=>(farm as Record<string,unknown>)[k]!==v))return null;
 if(JSON.stringify(plan.run.inputs.geometry.features.map(f=>f.geometry))!==JSON.stringify(plan.geometry.features.map(f=>f.geometry)))return null;
 const id=plan.id==='my-thanh'?'MT-BLOCK-01':plan.id;if(plan.run.inputs.aoi_id!==id)return null;
 return plan;}catch{return null;}}
export function hasClimate(run:AnalysisRun){return run.climate.some(m=>m.qa!=='fail'&&m.coverage>0&&(m.rain!==null||m.temp!==null));}
export function escapeHtml(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function download(name:string,content:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

const SourceSchema=z.object({url:z.string().url().refine(s=>/^https?:\/\//.test(s)),query_point_lon_lat:z.array(z.number().finite()).length(2).optional(),native_resolution:z.string().optional(),provider:z.string().optional()});
export function sourceOf(run:AnalysisRun){const parsed=SourceSchema.safeParse(run.source);return parsed.success?parsed.data:null;}
