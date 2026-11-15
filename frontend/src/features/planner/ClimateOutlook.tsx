import { useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import type { Geometry } from '../../core/contracts';
import { ResearchInferenceSchema } from '../analysis/ResearchInference';
export type Outlook=z.infer<typeof ResearchInferenceSchema>;
const Caps=z.object({available:z.boolean(),latest_reference_month:z.string().nullable(),data_as_of_month:z.string().nullable()});
export function ClimateOutlook({geometry,geometryHash,vi,onResult}:{geometry:Geometry;geometryHash:string;vi:boolean;onResult:(v:Outlook|null)=>void}){
 const controller=useRef<AbortController|null>(null);
 const m=(en:string,vn:string)=>vi?vn:en;
 const [cap,setCap]=useState<z.infer<typeof Caps>|null>(null),[result,setResult]=useState<Outlook|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{const c=new AbortController();fetch('/api/v1/research/inference/capabilities',{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(v=>{if(!c.signal.aborted)setCap(Caps.parse(v));}).catch(()=>{});return()=>c.abort();},[]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function execute(){if(!cap?.available||!cap.latest_reference_month)return;controller.current?.abort();const c=new AbortController();controller.current=c;const timer=setTimeout(()=>c.abort(),25000);setBusy(true);setError(false);setResult(null);onResult(null);
 try{const r=await fetch('/api/v1/research/inference',{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({aoi_id:'MT-BLOCK-01',geometry,target:'temp',horizon:1,reference_month:cap.latest_reference_month})});if(!r.ok)throw Error();const v=ResearchInferenceSchema.parse(await r.json());if(v.geometry_hash!==geometryHash||v.reference_month!==cap.latest_reference_month||v.target!=='temp'||v.horizon!==1)throw Error();if(!c.signal.aborted){setResult(v);onResult(v);}}catch{if(!c.signal.aborted)setError(true);}finally{clearTimeout(timer);if(controller.current===c)setBusy(false);}}
 return <section className="plan-outlook"><div className="plan-section-title"><h3>{m('Climate model context','Bối cảnh từ model khí hậu')}</h3><span className="plan-tag">{m('Experimental','Thử nghiệm')}</span></div><p>{m('A regional temperature simulation to discuss the timing of your plan. It does not select a crop.','Mô phỏng nhiệt độ vùng để trao đổi về thời điểm canh tác. Model không tự chọn cây.')}</p>
 {cap?.available?<button type="button" disabled={busy} onClick={()=>void execute()}>{busy?m('Running model…','Đang chạy model…'):m('Run climate simulation','Chạy mô phỏng khí hậu')}</button>:<p role="status">{m('Model is unavailable; the comparison remains usable.','Model hiện chưa sẵn sàng; vẫn có thể so và lập bản dự kiến.')}</p>}
 {error&&<p role="alert">{m('Could not validate the model output. Retry; no substitute value was added.','Chưa xác thực được output model. Hãy thử lại; không điền số thay thế.')}</p>}
 {result&&<div data-testid="plan-model-result"><strong>{result.prediction.toFixed(2)} °C</strong><span>{m('Target month','Tháng mô phỏng')}: {result.reference_month.slice(0,7)} · {m('Climate baseline','Nền khí hậu')}: {result.baseline.prediction.toFixed(2)} °C</span><p>{m('Source complete through','Nguồn đầy đủ đến')}: {result.data.features_through_month.slice(0,7)}. {m('Research simulation, not an operational forecast or crop suitability score.','Mô phỏng nghiên cứu, chưa là dự báo vận hành hay điểm phù hợp cây.')}</p><details><summary>{m('Uncertainty and model source','Bất định và nguồn model')}</summary><p>{result.error_reference.lower.toFixed(2)}–{result.error_reference.upper.toFixed(2)} °C · {m('Historical error reference; no coverage guarantee.','Dải sai số lịch sử tham khảo, không bảo đảm độ phủ.')}</p><p>{result.run_id} · {result.model.method}</p></details></div>}
 </section>;
}
