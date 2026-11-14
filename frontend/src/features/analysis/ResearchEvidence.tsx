import { useEffect, useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
const Metric=z.object({mae_degC:z.number().finite(),rmse_degC:z.number().finite(),n:z.number()});
const Schema=z.object({schema_version:z.literal('agrotwin-research-1'),normalized_sha256:z.string(),n_months:z.number(),
  experiment:z.object({decision:z.literal('RESEARCH_ONLY'),production_approved:z.literal(false),
    final_e1:z.object({candidate:Metric,baseline:Metric}),protocol:z.object({version:z.string()})})});
export function ResearchEvidence(){
  const {i18n}=useTranslation(),vi=i18n.language.startsWith('vi');
  const [report,setReport]=useState<z.infer<typeof Schema>|null>(null);
  useEffect(()=>{const c=new AbortController();fetch('/research/e1.json',{signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(v=>setReport(Schema.parse(v))).catch(()=>setReport(null));return()=>c.abort();},[]);
  return <details><summary>{vi?'EDA / thử nghiệm ML — tách khỏi khuyến nghị cây':'EDA / ML experiment — separate from crop advice'}</summary>
    {!report?<p>{vi?'Chưa có artifact nghiên cứu hợp lệ.':'No valid research artifact available.'}</p>:<>
      <p>RESEARCH_ONLY · {report.n_months} {vi?'tháng khí tượng vùng':'regional climate months'} · {report.experiment.protocol.version}</p>
      <p>{vi?'Dự báo T2M trước một tháng; validation 2021–2023, final holdout 2024–2025 (24 tháng).':'One-month-ahead T2M; validation 2021–2023, final holdout 2024–2025 (24 months).'}</p>
      <p>MAE: HGB {report.experiment.final_e1.candidate.mae_degC.toFixed(3)} °C · seasonal naive {report.experiment.final_e1.baseline.mae_degC.toFixed(3)} °C</p>
      <p>{vi?'Kiểm định thời gian nội bộ, chưa xác nhận ngoài thực địa. Không dùng cho suitability hoặc A1.':'Internal temporal evaluation, no field validation. Excluded from suitability and A1.'}</p>
      <a href="/research/e1.json" download>{vi?'Tải EDA/E1 và provenance':'Download EDA/E1 and provenance'}</a>
    </>}
  </details>;
}
