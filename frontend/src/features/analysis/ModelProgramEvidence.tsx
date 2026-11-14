import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const Metrics = z.object({ n: z.number().int().nonnegative(), mae: z.number().finite(), rmse: z.number().finite(), bias: z.number().finite() });
export const ModelProgramSchema = z.object({
  schema_version: z.literal('agrotwin-model-program-1'), aoi_id: z.literal('MT-BLOCK-01'),
  result_kind: z.literal('research_evaluation'), production_inference: z.literal(false),
  historical_months: z.number().int(), new_period: z.string(), report_sha256: z.string().length(64),
  tasks: z.array(z.object({ task: z.string(), method: z.string(), unit: z.string(),
    known_final: Metrics, baseline: Metrics, new_final: Metrics.nullable(),
    new_baseline: Metrics.nullable(), status: z.literal('RESEARCH_ONLY'), reasons: z.array(z.string()) })),
  eo: z.object({ catalog_items: z.number().int(), usable_dates: z.number().int(),
    longest_gap_days: z.number().nullable(), status: z.literal('RESEARCH_ONLY') }),
});

export function ModelProgramEvidence({ aoiId, supported }: { aoiId: string; supported: boolean }) {
  const { i18n } = useTranslation();
  const vi = i18n.language.startsWith('vi');
  const researchAoi = aoiId === 'my-thanh' ? 'MT-BLOCK-01' : aoiId;
  const [state, setState] = useState<{key: string; report: z.infer<typeof ModelProgramSchema> | null} | null>(null);
  const key = `${aoiId}:${supported}`;
  useEffect(() => {
    if (researchAoi !== 'MT-BLOCK-01' || !supported) return;
    const controller = new AbortController();
    fetch(`/api/v1/research/model-program?aoi_id=${encodeURIComponent(researchAoi)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw Error('Research report unavailable'); return r.json(); })
      .then(value => { if (!controller.signal.aborted) setState({key, report: ModelProgramSchema.parse(value)}); })
      .catch(() => { if (!controller.signal.aborted) setState({key, report: null}); });
    return () => controller.abort();
  }, [researchAoi, supported, key]);
  const report = supported && state?.key === key ? state.report : null;
  if (researchAoi !== 'MT-BLOCK-01' || !supported) return null;
  return <details data-testid="model-program-evidence" style={{minWidth:0,maxWidth:'100%'}}>
    <summary>{vi ? 'Benchmark model mở rộng và quan sát vệ tinh' : 'Extended model benchmarks and satellite observations'}</summary>
    {!report ? <p role="status">{vi ? 'Báo cáo nghiên cứu chưa khả dụng; không tạo dự báo thay thế.' : 'Research report unavailable; no substitute prediction generated.'}</p> : <>
      <p>{vi ? 'Kết quả đánh giá đã lưu, không phải inference theo yêu cầu.' : 'Recorded evaluation results, not request-time inference.'} RESEARCH_ONLY.</p>
      <p>{report.historical_months} {vi ? 'tháng khí tượng vùng; giai đoạn đánh giá mới' : 'regional climate months; new evaluation period'}: {report.new_period}.</p>
      <p>{vi ? '2024–2025 đã được biết từ V4.1. Giai đoạn 2026 ngắn, chưa đủ chứng minh vận hành hoặc khuyến nghị cây.' : '2024–2025 was already known in V4.1. The short 2026 period cannot establish operational or crop recommendation validity.'}</p>
      <div style={{overflowX:'auto'}}><table><caption>{vi ? 'MAE trên giai đoạn 2026 sau khi đã đóng băng lựa chọn' : 'MAE on 2026 after model selection was frozen'}</caption>
        <thead><tr><th>{vi ? 'Tác vụ' : 'Task'}</th><th>{vi ? 'Ứng viên' : 'Candidate'}</th><th>MAE</th><th>Baseline MAE</th><th>n</th></tr></thead>
        <tbody>{report.tasks.map(t => <tr key={t.task}><th scope="row">{t.task} ({t.unit})</th><td>{t.method}</td><td>{t.new_final?.mae.toFixed(3) ?? '—'}</td><td>{t.new_baseline?.mae.toFixed(3) ?? '—'}</td><td>{t.new_final?.n ?? 0}</td></tr>)}</tbody>
      </table></div>
      <p>Sentinel-2: {report.eo.usable_dates}/{report.eo.catalog_items} {vi ? 'ngày có feature / catalog scenes' : 'usable feature dates / catalog scenes'}; {vi ? 'khoảng trống lớn nhất' : 'largest gap'}: {report.eo.longest_gap_days ?? '—'} {vi ? 'ngày' : 'days'}.</p>
      <p>{vi ? 'Chỉ số quang phổ mô tả tín hiệu bề mặt; không xác định cây, ngày thu hoạch, pH hoặc độ ẩm đất thực đo. A1 giữ needs_review và không xếp hạng bằng forecast.' : 'Spectral indices describe surface signals; no crop, harvest date, pH or measured soil moisture identification. A1 retains needs_review and does not rank using forecasts.'}</p>
      <small style={{overflowWrap:'anywhere'}}>Report SHA256: {report.report_sha256}</small>
    </>}
  </details>;
}
