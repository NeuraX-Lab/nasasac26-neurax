import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Geometry } from '../../core/contracts';

const Hash=z.string().regex(/^[a-f0-9]{64}$/);
const Capabilities=z.object({schema_version:z.literal('agrotwin-research-capabilities-1'),available:z.boolean(),
  latest_reference_month:z.string().nullable(),first_reference_month:z.string().nullable(),
  data_as_of_month:z.string().nullable(),production_forecast_available:z.literal(false),agronomic_integration_eligible:z.literal(false)});
export const ResearchInferenceSchema=z.object({schema_version:z.literal('agrotwin-research-inference-1'),
  run_id:z.string().regex(/^research-[a-f0-9]{32}$/),result_kind:z.literal('computed_research_prediction'),
  status:z.literal('RESEARCH_ONLY'),production_approved:z.literal(false),agronomic_integration_eligible:z.literal(false),
  climate_statistical_qualified:z.literal(false),aoi_id:z.literal('MT-BLOCK-01'),geometry_hash:Hash,
  target:z.enum(['temp','rain']),horizon:z.union([z.literal(1),z.literal(3)]),unit:z.enum(['degC','mm']),reference_month:z.string(),
  target_period:z.object({start:z.string(),end_exclusive:z.string()}),
  model:z.object({method:z.string(),role:z.enum(['evaluation_2024','evaluation_2026']),sha256:Hash,training_cutoff:z.string(),feature_schema_sha256:Hash}),
  prediction:z.number().finite(),baseline:z.object({method:z.string(),prediction:z.number().finite()}),
  error_reference:z.object({lower:z.number().finite(),upper:z.number().finite(),kind:z.literal('historical_residual_reference_not_coverage_guarantee'),calibration_end:z.string(),calibration_policy:z.string()}),
  data:z.object({sha256:Hash,available_through_month:z.string(),features_through_month:z.string(),feature_vector_sha256:Hash,source_kind:z.literal('regional_reanalysis_not_field_measurement')}),
  computed_at:z.string(),execution:z.literal('model.predict executed for this request'),duration_ms:z.number().finite(),warnings:z.array(z.string()),
});

export function ResearchInference({aoiId,geometry,supported}:{aoiId:string;geometry:Geometry;supported:boolean}){
  const {i18n}=useTranslation(),vi=i18n.language.startsWith('vi'),msg=(en:string,vn:string)=>vi?vn:en;
  const [cap,setCap]=useState<{scope:string;data:z.infer<typeof Capabilities>}|null>(null);
  const [task,setTask]=useState('temp-1'),[month,setMonth]=useState('');
  const [state,setState]=useState<{key:string;result?:z.infer<typeof ResearchInferenceSchema>;error?:string}|null>(null);
  const [busy,setBusy]=useState<string|null>(null),controller=useRef<AbortController|null>(null);
  const valid=(aoiId==='my-thanh'||aoiId==='MT-BLOCK-01')&&supported;
  const scope=JSON.stringify({aoiId,geometry,supported});
  const key=JSON.stringify({scope,task,month});
  useEffect(()=>{
    if(!valid)return;
    const c=new AbortController();
    fetch('/api/v1/research/inference/capabilities',{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();})
      .then(v=>{if(c.signal.aborted)return;const data=Capabilities.parse(v);setCap({scope,data});setMonth((data.latest_reference_month||'').slice(0,7));})
      .catch(()=>{if(!c.signal.aborted)setCap(null);});
    return()=>c.abort();
  },[valid,scope]);
  useEffect(()=>{controller.current?.abort();return()=>controller.current?.abort();},[key]);
  if(!valid)return null;
  const capabilities=cap?.scope===scope?cap.data:null;
  const current=state?.key===key?state:null,loading=busy===key;
  async function execute(){
    if(!capabilities?.available||!month)return;
    controller.current?.abort();const c=new AbortController();controller.current=c;setBusy(key);setState(null);
    const [target,h]=task.split('-');
    try{
      const r=await fetch('/api/v1/research/inference',{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json'},
        body:JSON.stringify({aoi_id:'MT-BLOCK-01',geometry,target,horizon:Number(h),reference_month:month+'-01'})});
      if(!r.ok)throw Error('unavailable');
      const result=ResearchInferenceSchema.parse(await r.json());
      if(result.reference_month!==month+'-01'||result.target!==target||result.horizon!==Number(h))throw Error('scope');
      if(!c.signal.aborted)setState({key,result});
    }catch{if(!c.signal.aborted)setState({key,error:'unavailable'});}
    finally{if(controller.current===c)setBusy(null);}
  }
  return <section className="power-run" data-testid="research-inference" style={{minWidth:0,maxWidth:'100%'}}>
    <h3>{msg('Run research model','Chạy model nghiên cứu')}</h3>
    <p>{msg('Computes a new model prediction from the selected reference month. Regional experiment; not operational weather or crop advice.',
      'Chạy model thật theo tháng tham chiếu đã chọn. Thử nghiệm khí hậu vùng; chưa là dịch vụ dự báo vận hành hoặc khuyến nghị cây.')}</p>
    <p>RESEARCH_ONLY · {msg('Source complete through','Nguồn đầy đủ đến tháng')}: {capabilities?.data_as_of_month?.slice(0,7)||'—'}.</p>
    {!capabilities?.available?<p role="status">{msg('Trusted model/context unavailable. No prediction generated.','Chưa có model/nguồn hợp lệ. Không tạo dự báo thay thế.')}</p>:<form onSubmit={e=>{e.preventDefault();void execute();}}>
      <div className="farm-grid">
        <label>{msg('Research task','Tác vụ nghiên cứu')}<select aria-label="Research task" value={task} onChange={e=>setTask(e.target.value)}>
          <option value="temp-1">{msg('Mean temperature · 1 month (°C)','Nhiệt độ trung bình · 1 tháng (°C)')}</option>
          <option value="temp-3">{msg('Mean temperature · 3 months (°C)','Nhiệt độ trung bình · 3 tháng (°C)')}</option>
          <option value="rain-1">{msg('Total rain · 1 month (mm)','Tổng mưa · 1 tháng (mm)')}</option>
          <option value="rain-3">{msg('Total rain · 3 months (mm)','Tổng mưa · 3 tháng (mm)')}</option>
        </select></label>
        <label>{msg('Target reference month','Tháng bắt đầu cần mô phỏng')}<input aria-label="Research reference month" type="month" required value={month}
          min={capabilities.first_reference_month?.slice(0,7)} max={capabilities.latest_reference_month?.slice(0,7)} onChange={e=>setMonth(e.target.value)} /></label>
      </div>
      <button className="button primary" type="submit" disabled={loading||!month}>{loading?msg('Running model…','Đang chạy model…'):msg('Run research inference','Chạy suy luận nghiên cứu')}</button>
    </form>}
    {current?.error&&<p role="alert">{msg('Request, source QA or artifact validation failed. No prediction shown.','Yêu cầu, QA nguồn hoặc kiểm tra artifact không đạt. Không hiển thị dự báo.')}</p>}
    {current?.result&&<div data-testid="research-inference-result" aria-live="polite">
      <p><strong>{msg('Computed model output','Kết quả model vừa chạy')}: {current.result.prediction.toFixed(2)} {current.result.unit==='degC'?'°C':'mm'}</strong></p>
      <p>{msg('Strong baseline','Baseline đối chiếu')}: {current.result.baseline.prediction.toFixed(2)} {current.result.unit==='degC'?'°C':'mm'} · {current.result.baseline.method}</p>
      <p>{msg('Target window','Khoảng mục tiêu')}: {current.result.target_period.start} → {current.result.target_period.end_exclusive} ({msg('end exclusive','không gồm ngày cuối')})</p>
      <p>{msg('Historical error reference, no coverage guarantee','Dải sai số lịch sử tham khảo, không bảo đảm coverage')}: {current.result.error_reference.lower.toFixed(2)} – {current.result.error_reference.upper.toFixed(2)}</p>
      <p>{msg('Error-reference data ends','Dữ liệu tham khảo sai số kết thúc')}: {current.result.error_reference.calibration_end}</p>
      <p>{msg('Uses completed observations through','Dùng quan sát tháng đã hoàn tất đến')}: {current.result.data.features_through_month.slice(0,7)}. {msg('Computed','Tính lúc')}: {current.result.computed_at}</p>
      <p>{msg('Does not change A1 eligibility, score or crop ranking.','Không thay eligibility, điểm hoặc xếp hạng cây của A1.')}</p>
      <details><summary>{msg('Model, source and limitations','Model, nguồn và giới hạn')}</summary>
        <p>{current.result.model.method} · {current.result.model.role} · {msg('Training cutoff','Mốc kết thúc train')}: {current.result.model.training_cutoff}</p>
        <small style={{overflowWrap:'anywhere'}}>Model SHA256: {current.result.model.sha256}<br/>Source SHA256: {current.result.data.sha256}<br/>Run: {current.result.run_id}</small>
        <ul>{current.result.warnings.map(w=><li key={w}>{w}</li>)}</ul>
      </details>
    </div>}
  </section>;
}
