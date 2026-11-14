import { ResearchEvidence } from "./ResearchEvidence";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Geometry } from "../../core/contracts";
import { useAnalysis } from "./state";
import { initialDraft, materialKey, type FarmDraft } from "./contracts";
import { useHardware } from "../hardware/state";
import { freshness } from "../hardware/model";

export function AnalysisPanel({ aoiId, geometry, power = false, sandbox = false }: { aoiId: string; geometry: Geometry; power?: boolean; sandbox?: boolean }) {
  const state = useAnalysis(), hardware = useHardware(), { i18n } = useTranslation();
  const vi = i18n.language.startsWith("vi"), msg = (en: string, vn: string) => vi ? vn : en;
  const draft = state.drafts[aoiId] || initialDraft, record = state.records[aoiId], run = record?.run;
  const stale = !!record && record.key !== materialKey(geometry, draft), running = state.running === aoiId;
  const [comparison, setComparison] = useState("");
  const [inputsOpen, setInputsOpen] = useState(false);
  const inputDetails = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (inputDetails.current) inputDetails.current.open = !run || stale; }, [run,stale]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  // Leaving this AOI cancels its outstanding response; records remain shared across modes.
  useEffect(() => () => state.cancel(), [aoiId]);
  function patchFarm(key: keyof FarmDraft, value: string) {
    state.setDraft(aoiId, { ...draft, farm: { ...draft.farm, [key]: value || null } });
  }
  const words: { [key: string]: string } = {
    current_crop: msg("Current crop", "Cây hiện tại"), previous_crop: msg("Previous crop", "Cây vụ trước"),
    season: msg("Intended season / window", "Vụ / khoảng thời gian dự định"),
    irrigation_access: msg("Irrigation access", "Nguồn tưới"), drainage_condition: msg("Drainage", "Thoát nước"),
    management_plan: msg("Management plan", "Kế hoạch quản lý"), waterlogging_history: msg("Waterlogging history", "Lịch sử ngập úng"),
    water: msg("Conserve water", "Bảo toàn nước"), soil: msg("Soil structure", "Cấu trúc đất"), income: msg("Market/income context", "Bối cảnh thị trường/thu nhập"),
    explore: msg("Explore evidence", "Khám phá bằng chứng"), rice: msg("Rice", "Lúa"), baby_corn: msg("Baby corn", "Bắp non"), mung_bean: msg("Mung bean", "Đậu xanh"),
    needs_review: msg("Needs review", "Cần xác minh"), eligible: msg("Reviewed constraints passed", "Đạt các điều kiện đã kiểm"), ineligible: msg("Reviewed constraint violated", "Vi phạm điều kiện đã duyệt"),
  };
  const latest = hardware.events.at(-1), context = hardware.placements.find(p => p.deviceId === latest?.device_id);
  const other = state.history.find(r => r.a1.run_id === comparison);
  const actions = run?.next_actions || [];
  const actionLabel = (key: string) => words[key] || (vi ? `Bằng chứng: ${key.replaceAll("_"," ")}` : key.replaceAll("_"," "));
  const actionText = (key: string, original: string) => !vi ? original : key === "K1_approval"
    ? "Cần người chuyên môn duyệt phạm vi quy tắc và kiểm tra số liệu trước khi dùng như khuyến nghị."
    : key === "regional_crop_catalog" ? "Geometry này chưa có catalog cây–mùa được duyệt; cần bằng chứng địa phương. Không dùng lại các chuỗi Mỹ Thành."
    : words[key] ? "Xác nhận thông tin này cùng nguồn và thời điểm; nếu chưa biết thì giữ trạng thái chưa đủ căn cứ."
    : "Bổ sung tài liệu đúng giống, mùa, đất/nước và phương pháp; người chuyên môn cần kiểm phạm vi áp dụng.";
  if (sandbox) return <section className="readiness-panel notice amber"><h2>{msg("Synthetic climate sandbox", "Sandbox khí hậu giả lập")}</h2><p>{msg("This UI fixture is not passed to the research evaluator. Switch to Research for a real readiness run.", "Dữ liệu UI giả lập không được đưa vào evaluator nghiên cứu. Chuyển sang Research để phân tích điều kiện thực.")}</p></section>;
  return <section className={`readiness-panel ${power ? "readiness-power" : ""}`} aria-label={msg("Readiness analysis", "Phân tích điều kiện")}>
    <header><span className="eyebrow">{msg("EVIDENCE → NEXT ACTION", "BẰNG CHỨNG → BƯỚC TIẾP THEO")}</span>
      <h2>{msg("Check your rotation prerequisites", "Kiểm tra điều kiện trước khi đổi vụ")}</h2>
      <p>{msg("Historical sequences are references. This evaluator checks missing inputs and rule applicability; it does not certify a crop or estimate yield.", "Các chuỗi lịch sử là tham chiếu. Hệ thống kiểm thông tin còn thiếu và phạm vi quy tắc; chưa chứng nhận cây phù hợp hay ước tính năng suất.")}</p></header>
    {run && <div className={`notice ${stale ? "amber" : ""}`} role="status" data-testid="execution-state">
      <strong>{stale ? msg("STALE — inputs changed", "KẾT QUẢ CŨ — đầu vào đã đổi") : run.sidecar.execution_mode === "computed" ? msg("Computed run", "Run đã tính") : run.sidecar.execution_mode === "offline" ? msg("OFFLINE — saved analysis", "OFFLINE — phân tích đã lưu") : msg("Saved / cached analysis", "Phân tích đã lưu / cache")}</strong>
      <span>{run.a1.data_as_of ? `${msg("Data as of", "Dữ liệu đến")} ${run.a1.data_as_of}` : msg("No climate observations available", "Chưa có dữ liệu khí hậu")}</span>
      <small>{msg("Computed", "Tính lúc")}: {run.sidecar.computed_at}</small>
    </div>}
    <details className="farm-inputs" ref={inputDetails} onToggle={e => setInputsOpen(e.currentTarget.open)}>
      <summary>{msg("Confirm field inputs — unknown is allowed", "Xác nhận điều kiện — có thể chọn chưa biết")}</summary>
      <form onSubmit={e => { e.preventDefault(); void state.execute(aoiId, geometry, draft); }}>
        <div className="farm-grid">
          <label>{msg("Analysis year", "Năm phân tích")}<select aria-label="Analysis year" value={draft.year} onChange={e => state.setDraft(aoiId, { ...draft, year: Number(e.target.value) })}>{[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}</select></label>
          {["current_crop", "previous_crop"].map(key => <label key={key}>{words[key]}<select aria-label={key} value={draft.farm[key as "current_crop"] || ""} onChange={e => patchFarm(key as keyof FarmDraft,e.target.value)}><option value="">{msg("Unknown", "Chưa biết")}</option>{["rice","baby_corn","mung_bean","other"].map(x => <option key={x} value={x}>{words[x] || msg("Other", "Khác")}</option>)}</select></label>)}
          <label>{words.season}<input aria-label="season" maxLength={80} value={draft.farm.season || ""} placeholder={msg("Unknown / specify dates", "Chưa biết / nhập khoảng ngày")} onChange={e => patchFarm("season",e.target.value)} /></label>
          <label>{words.irrigation_access}<select aria-label="irrigation_access" value={draft.farm.irrigation_access || ""} onChange={e => patchFarm("irrigation_access",e.target.value)}><option value="">{msg("Unknown", "Chưa biết")}</option><option value="available">{msg("Available", "Có nguồn")}</option><option value="limited">{msg("Limited", "Hạn chế")}</option><option value="unavailable">{msg("Unavailable", "Không có")}</option></select></label>
          <label>{words.drainage_condition}<select aria-label="drainage_condition" value={draft.farm.drainage_condition || ""} onChange={e => patchFarm("drainage_condition",e.target.value)}><option value="">{msg("Unknown", "Chưa biết")}</option><option value="good">{msg("Reported good", "Người dùng báo thoát tốt")}</option><option value="poor">{msg("Reported poor", "Người dùng báo thoát kém")}</option></select></label>
          {["waterlogging_history", "management_plan"].map(key => <label key={key}>{words[key]}<input aria-label={key} maxLength={key === "management_plan" ? 300 : 200} value={draft.farm[key as "management_plan"] || ""} onChange={e => patchFarm(key as keyof FarmDraft,e.target.value)} /></label>)}
          <label>{msg("Priority (not an automatic score)", "Ưu tiên (chưa tự chấm điểm)")}<select aria-label="goal" value={draft.farm.goal} onChange={e => patchFarm("goal",e.target.value)}>{["explore","water","soil","income"].map(x => <option key={x} value={x}>{words[x]}</option>)}</select></label>
          <label>{msg("Source acquisition", "Cách lấy dữ liệu")}<select aria-label="source_mode" value={draft.source_mode} onChange={e => state.setDraft(aoiId,{ ...draft, source_mode: e.target.value as typeof draft.source_mode })}><option value="prefer_cache">{msg("Versioned cache / public fetch if needed", "Cache có phiên bản / tải khi cần")}</option><option value="offline">{msg("Offline cache only", "Chỉ dùng cache offline")}</option><option value="live">{msg("Request NASA; explicit cache fallback", "Yêu cầu NASA; báo rõ nếu dùng cache")}</option></select></label>
        </div>
        <p className="small">{msg("Inputs are self-reported, not field verification. No pH measurement has been supplied; model pH cannot substitute for a soil test.", "Đầu vào do người dùng cung cấp, chưa xác minh ngoài đồng. Chưa có phép đo pH; pH mô hình không thay xét nghiệm đất.")}</p>
        <button className="button primary" data-testid="analyze" type="submit" disabled={running || !geometry.features.length}>{running ? msg("Evaluating…", "Đang kiểm tra…") : msg("Analyze", "Phân tích")}</button>
        {running && <button className="button secondary" type="button" onClick={state.cancel}>{msg("Cancel", "Hủy")}</button>}
      </form>
    </details>
    {run && !stale && !running && !inputsOpen && <button className="button secondary" data-testid="analyze-again" onClick={() => void state.execute(aoiId,geometry,draft)}>{msg("Analyze confirmed inputs", "Phân tích đầu vào đã xác nhận")}</button>}
    {state.error && <p role="alert" className="form-error">{msg("Analysis request unavailable. A matching saved result may be shown; changed inputs need a new successful evaluation.", "Yêu cầu phân tích chưa thành công. Chỉ có thể dùng lại kết quả lưu khớp đầu vào; dữ liệu đã đổi cần chạy thành công lại.")} {state.error}</p>}
    {run && <>
      <p className="run-proof"><strong>Run</strong> <code data-testid="run-id">{run.a1.run_id}</code> · <span data-testid="run-qa">Q1: {run.q1.status}</span> · {run.a1.status}</p>
      {stale && <p className="notice amber">{msg("The references below belong to the previous inputs. Analyze to refresh; do not use them as a current decision.", "Các kết quả dưới thuộc đầu vào trước. Cần phân tích lại; chưa dùng chúng cho điều kiện vừa sửa.")}</p>}
      {!run.a1.results.length && <p className="notice">{msg("No applicable reference catalog for this geometry. Mỹ Thành results were not reused.", "Chưa có catalog tham chiếu áp dụng cho geometry này. Không dùng lại kết quả Mỹ Thành.")}</p>}
      <h3>{msg("What to verify next", "Cần xác minh tiếp theo")}</h3>
      <ul className="next-actions">{actions.slice(0,power ? actions.length : 3).map(action => <li key={action.input}><strong>{actionLabel(action.input)}</strong>: {actionText(action.input,action.action)}</li>)}</ul>
      {!power && actions.length > 3 && <details><summary>{msg("All evidence gaps", "Toàn bộ thông tin còn thiếu")} ({actions.length})</summary><ul className="next-actions">{actions.slice(3).map(action => <li key={action.input}><strong>{actionLabel(action.input)}</strong>: {actionText(action.input,action.action)}</li>)}</ul></details>}
      <div className="computed-rotations">{run.a1.results.map(result => <article key={result.strategy_id} className="computed-rotation">
        <h3>{result.strategy_id} · {result.seasons.map(s => words[s.crop_id] || s.crop_id).join(" → ")}</h3>
        <strong>{words[result.eligibility]}</strong> · {msg("Score", "Điểm")}: {result.score === null ? msg("unavailable", "chưa có") : result.score}
        <p>{msg("Current rotation unconfirmed. Historical reference; no adopted calendar.", "Chưa xác nhận hiện trạng luân canh. Chuỗi tham chiếu lịch sử; chưa có lịch áp dụng.")}</p>
        <details><summary>{msg("Why / evidence trace", "Lý do / truy vết bằng chứng")}</summary>{result.criteria.map(c => <div key={c.criterion_id} className="criterion-trace"><strong>{c.criterion_id}</strong> · {c.status}<p>{c.reason}</p><p>{msg("Inputs", "Đầu vào")}: <code>{JSON.stringify(c.inputs)}</code></p><p>{msg("Sources", "Nguồn")}: {c.evidence_ids.join(", ")}</p><small>{c.limitation}</small></div>)}</details>
      </article>)}</div>
      <details><summary>{msg("Sources and warnings", "Nguồn và cảnh báo")}</summary><ul>{[...run.a1.warnings, ...(run.sidecar.acquisition_warnings || [])].map((w,i) => <li key={i}>{w}</li>)}</ul>{run.sources.map(s => <p key={s.id}>{s.id} · {s.evidence_class} {s.url && <a href={s.url} target="_blank" rel="noreferrer">{msg("Source", "Nguồn")}</a>}</p>)}</details>
      {power && <ResearchEvidence />}
      {power && <section className="power-run"><h3>{msg("Run provenance and comparison", "Nguồn gốc và so sánh run")}</h3><pre tabIndex={0} aria-label="Run provenance JSON">{JSON.stringify(run.sidecar,null,2)}</pre>
        <label>{msg("Compare with recorded run", "So với run đã ghi")}<select aria-label="Compare runs" value={comparison} onChange={e => setComparison(e.target.value)}><option value="">—</option>{state.history.filter(r => r.a1.run_id !== run.a1.run_id).map(r => <option key={r.a1.run_id}>{r.a1.run_id}</option>)}</select></label>
        {other && <div data-testid="run-comparison"><p>{other.a1.run_id} → {run.a1.run_id}</p><pre tabIndex={0} aria-label="Comparison input JSON">{JSON.stringify({ previous: other.inputs, current: run.inputs },null,2)}</pre><p>{msg("Same eligibility can be valid. Compare inputs and criterion traces, not a forced ranking change.", "Cùng eligibility có thể hợp lệ. So đầu vào và criterion trace, không ép đổi hạng.")}</p></div>}
        <button onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(run,null,2)],{type:"application/json"})); const a=document.createElement("a");a.href=url;a.download=run.a1.run_id+".json";a.click();setTimeout(() => URL.revokeObjectURL(url),1000); }}>{msg("Export reproducible run JSON", "Xuất JSON run có thể tái lập")}</button>
      </section>}
    </>}
    <section className="home-sensor" aria-label="Home sensor summary"><h3>{msg("Sensor context", "Bối cảnh cảm biến")}</h3>
      {!latest ? <p>{msg("No device readings. Field measurements and pH are unavailable.", "Chưa có số đo thiết bị. Chưa có phép đo ruộng hoặc pH.")}</p> : <><strong>{latest.value ?? "—"} {latest.unit} · {latest.event_type}</strong><p>{latest.data_mode === "simulated" ? "SYNTHETIC" : latest.delivery_mode === "replay" ? "REPLAY" : "BENCH / UNVERIFIED DEPLOYMENT"} · {freshness(latest,now)}</p><p>{latest.timestamp_utc} · {latest.quality} · {latest.source_context || "Physical location unverified"}</p><p>{msg("Bench at venue; any map link is simulated placement. Excluded from crop evaluation.", "Đo tại bàn demo; vị trí liên kết bản đồ là minh họa. Không dùng cho đánh giá cây trồng.")} {context?.context}</p></>}
    </section>
  </section>;
}
