import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, MapPin, Save, SlidersHorizontal } from "lucide-react";
import { Header } from "../../app/layouts/Header";
import { useApp } from "../../core/state";
import { emptyGeometry } from "../../core/contracts";
import { useAnalysis } from "../analysis/state";
import { initialDraft, materialKey, type Draft } from "../analysis/contracts";
import { SpatialMap } from "../../shared/map";
import { OptionalVisual } from "../../shared/OptionalVisual";
import { useBundle } from "../../data/adapters/useBundle";
import type { z } from "zod";
import type { ResearchInferenceSchema } from "../analysis/ResearchInference";
import { ConditionsForm } from "./ConditionsForm";
import { ClimateContext } from "./ClimateContext";
import { RotationComparison } from "./RotationComparison";
import { SensorStrip } from "./SensorStrip";
import {
  OverviewSchema,
  PIN,
  PlanSchema,
  readPlan,
  runMatches,
  type Overview,
  type Plan,
} from "./model";
import "./dashboard.css";
import { useV2 } from "./v2";

const storageKey = (id: string) => `agrotwin-draft-2:${id}`;
export function Dashboard({ id }: { id: string }) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith("vi"),
    m = (vn: string, en: string) => (vi ? vn : en);
  const state = useAnalysis(),
    app = useApp();
  const sample = id === "my-thanh",
    area = app.areas.find((a) => a.id === id);
  const draft = state.drafts[id] || initialDraft,
    record = state.records[id];
  const {
    bundle,
    error: boundaryError,
    retry: retryBoundary,
  } = useBundle("research", sample);
  const geometry = sample
    ? bundle?.geometry || record?.run.inputs.geometry
    : area?.geometry;
  const run = record?.run || null,
    key = geometry ? materialKey(geometry, draft) : "";
  const stale =
    !!record &&
    (record.key !== key ||
      !geometry ||
      !runMatches(record.run, id, geometry, draft));
  const current = !!run && !stale;
  const choice = state.choices[id] || "";
  const v2 = useV2();
  const [v2Attempted, setV2Attempted] = useState(false),
    [question, setQuestion] = useState("");
  const v2Current = !!v2.record && v2.record.key === key && !stale;
  const [selectedSensor, setSelectedSensor] = useState("");
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [researchResult, setResearchResult] = useState<z.infer<
    typeof ResearchInferenceSchema
  > | null>(null);
  const [snapshot, setSnapshot] = useState<Overview | null>(null),
    [snapshotError, setSnapshotError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [savedPlan, setSavedPlan] = useState<Plan | null>(() => {
    try {
      return readPlan(localStorage.getItem(storageKey(id)));
    } catch {
      return null;
    }
  });
  const [notice, setNotice] = useState(""),
    [localError, setLocalError] = useState("");
  const [openedSaved, setOpenedSaved] = useState(false);
  const form = useRef<HTMLDetailsElement>(null),
    comparison = useRef<HTMLElement>(null);
  const analysisRevision = useRef(0);
  const name = sample
    ? m("Ruộng của tôi · Mỹ Thành", "My field · Mỹ Thành")
    : area?.name || id;
  const busy = state.running === id || v2.busy;
  useEffect(() => {
    const ctrl = new AbortController();
    if (sample)
      fetch("/snapshots/v2/overview.json", { signal: ctrl.signal })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((v) => {
          setSnapshot(OverviewSchema.parse(v));
          setSnapshotError("");
        })
        .catch(() => {
          if (!ctrl.signal.aborted)
            setSnapshotError(
              m(
                "Không tải được bản lưu model. Thử lại; lịch sử không bị thay thế.",
                "Could not load the saved model result. Retry; history is not substituted.",
              ),
            );
        });
    return () => ctrl.abort();
  }, [sample, attempt]);
  useEffect(
    () => () => {
      analysisRevision.current++;
      state.cancel();
      v2.cancel();
    },
    [id],
  );
  function edit(next: Draft) {
    analysisRevision.current++;
    v2.cancel();
    setResearchResult(null);
    state.setDraft(id, next);
    setNotice("");
    setLocalError("");
    setOpenedSaved(false);
  }
  async function analyze() {
    if (!geometry) return;
    const revision = ++analysisRevision.current;
    setOpenedSaved(false);
    setResearchResult(null);
    setNotice("");
    const ok = await state.execute(id, geometry, draft);
    if (revision !== analysisRevision.current) return;
    if (ok && sample && draft.farm.goal !== "income") {
      setV2Attempted(true);
      await v2.execute(geometry, draft);
    } else if (ok) {
      setV2Attempted(false);
      v2.restore(null);
    }
    if (ok && revision === analysisRevision.current) {
      if (form.current) form.current.open = false;
      comparison.current?.focus();
    }
  }
  const tasks = [
    !draft.farm.season
      ? m(
          "Xác nhận khoảng vụ và hỏi giống, ngày gieo/thu tại địa phương.",
          "Confirm the season window, local cultivar and sowing/harvest dates.",
        )
      : m(
          "Đối chiếu giống và ngày thu cuối với khoảng vụ đã khai báo.",
          "Check cultivar and final harvest date against your declared window.",
        ),
    draft.farm.irrigation_access === "limited" ||
    draft.farm.irrigation_access === "unavailable"
      ? m(
          "Nguồn tưới bạn báo đang hạn chế: kiểm nguồn cấp cho cả vụ.",
          "Your reported water supply is constrained: verify supply for the whole season.",
        )
      : m(
          "Kiểm nguồn tưới, khả năng thoát nước và lịch sử ngập tại ruộng.",
          "Check irrigation supply, drainage and waterlogging at the field.",
        ),
    draft.farm.goal === "income"
      ? m(
          "Hỏi đầu ra, chi phí và giá địa phương; chưa có dự báo thu nhập.",
          "Discuss buyers, costs and local prices; no income forecast is available.",
        )
      : m(
          "Bổ sung thông tin đất có phương pháp/ngày đo để trao đổi với cán bộ địa phương.",
          "Bring soil information with method/date to discuss with a local adviser.",
        ),
  ];
  function save() {
    if (!geometry || !current || !run || !choice) return;
    if (v2Attempted && !v2Current) return;
    try {
      const plan = PlanSchema.parse({
        version: "agrotwin-draft-2",
        id,
        name,
        savedAt: new Date().toISOString(),
        geometry,
        draft,
        key,
        chosen: choice,
        run,
        climateSnapshot: snapshot,
        researchResult,
        v2: v2Current ? v2.record : null,
        climateSourcePin: PIN,
        tasks,
      });
      localStorage.setItem(storageKey(id), JSON.stringify(plan));
      if (!readPlan(localStorage.getItem(storageKey(id)))) throw Error();
      setSavedPlan(plan);
      setNotice(
        m(
          "Đã lưu bản dự kiến trên trình duyệt này.",
          "Draft saved in this browser.",
        ),
      );
      setLocalError("");
    } catch {
      setNotice("");
      setLocalError(
        m(
          "Không lưu được trên trình duyệt. Kiểm dung lượng/quyền lưu trữ rồi thử lại; chưa có bản lưu mới.",
          "Could not save in this browser. Check storage space/permissions and retry; no new draft was saved.",
        ),
      );
    }
  }
  function reopen() {
    if (!savedPlan || !geometry) return;
    if (
      JSON.stringify(savedPlan.geometry.features.map((f) => f.geometry)) !==
      JSON.stringify(geometry.features.map((f) => f.geometry))
    ) {
      setLocalError(
        m(
          "Ranh đã đổi từ lúc lưu. Không áp bản cũ vào ranh mới; hãy cập nhật so sánh.",
          "The boundary changed since saving. The old result cannot be applied here; update the comparison.",
        ),
      );
      return;
    }
    state.restore(id, savedPlan.draft, savedPlan.run);
    state.choose(id, savedPlan.chosen);
    setSnapshot(savedPlan.climateSnapshot);
    setResearchResult(savedPlan.researchResult || null);
    v2.restore(savedPlan.v2 || null);
    setQuestion(savedPlan.v2?.request.question || "");
    setV2Attempted(!!savedPlan.v2);
    setOpenedSaved(true);
    setNotice(
      m(
        "Đang xem nguyên bản dự kiến lúc lưu.",
        "Viewing the draft as it was saved.",
      ),
    );
    setLocalError("");
  }
  if (!sample && !area)
    return (
      <>
        <Header />
        <main id="main" className="center-message">
          <h1>{m("Không tìm thấy thửa", "Field not found")}</h1>
          <Link to="/">{m("Chọn thửa khác", "Choose another field")}</Link>
        </main>
      </>
    );
  return (
    <>
      <Header />
      <main id="main" className="farm-dashboard">
        <section className="field-context" aria-labelledby="field-title">
          <div>
            <h1 id="field-title">
              <MapPin size={23} aria-hidden="true" />
              {name}
            </h1>
            <p>
              {sample
                ? m(
                    "Hồ sơ demo · ranh nghiên cứu ≈2 ha",
                    "Demo profile · research boundary ≈2 ha",
                  )
                : m("Ranh do bạn cung cấp", "Boundary supplied by you")}{" "}
              <span>·</span>{" "}
              {draft.farm.season ||
                m("Chưa chọn khoảng vụ", "Season window not chosen")}
            </p>
          </div>
          <div className="context-actions">
            <button
              onClick={() => {
                if (form.current) {
                  form.current.open = !form.current.open;
                  if (form.current.open)
                    form.current
                      .querySelector<HTMLInputElement>("input")
                      ?.focus();
                }
              }}
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              {m("Sửa điều kiện", "Edit conditions")}
            </button>
            <Link className="button secondary" to="/">
              {m("Đổi/thêm thửa", "Change/add field")}
            </Link>
          </div>
        </section>
        <div className="task-context">
          <span>
            {m("Cây hiện tại: ", "Current crop: ")}
            {{
              rice: m("Lúa", "Rice"),
              baby_corn: m("Bắp non", "Baby corn"),
              mung_bean: m("Đậu xanh", "Mung bean"),
              other: m("Cây khác", "Other"),
            }[draft.farm.current_crop || ""] ||
              m("chưa xác nhận", "unconfirmed")}{" "}
            ·{" "}
            {
              {
                explore: m("Khám phá lựa chọn", "Explore alternatives"),
                water: m("Ưu tiên nguồn nước", "Water priority"),
                soil: m("Ưu tiên đất", "Soil priority"),
                income: m(
                  "Ưu tiên đầu ra & thu nhập",
                  "Market & income priority",
                ),
              }[draft.farm.goal]
            }
          </span>
        </div>
        <details className="edit-conditions" ref={form}>
          <summary>
            {m(
              "Điều kiện của vụ · có thể để chưa rõ",
              "Season conditions · unknown is allowed",
            )}
          </summary>
          <ConditionsForm
            draft={draft}
            change={edit}
            onSubmit={() => void analyze()}
            busy={busy}
            vi={vi}
          />
        </details>
        <SensorStrip
          id={id}
          geometry={geometry || emptyGeometry}
          selected={selectedSensor}
          onSelect={setSelectedSensor}
          vi={vi}
        />
        <div className="field-support">
          <section
            className={`field-map ${mobileMapOpen ? "is-mobile-open" : ""}`}
            aria-label={m("Bản đồ thửa", "Field map")}
          >
            <div className="map-caption">
              <strong>{m("Ranh thửa & đầu đo", "Boundary & probes")}</strong>
              <button
                className="mobile-map-toggle"
                aria-expanded={mobileMapOpen}
                onClick={() => setMobileMapOpen((v) => !v)}
              >
                {mobileMapOpen
                  ? m("Thu gọn bản đồ", "Hide map")
                  : m("Xem bản đồ", "Show map")}
              </button>
              {!sample && (
                <Link to={`/setup/${id}`}>
                  {m("Sửa ranh", "Edit boundary")}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
            <div className="dashboard-map-frame">
              {geometry ? (
                <OptionalVisual
                  fallback={m(
                    "Chưa tải được map; ranh được giữ trong hồ sơ.",
                    "Map unavailable; the boundary is kept in your profile.",
                  )}
                >
                  <SpatialMap
                    areaId={id}
                    geometry={geometry}
                    sensorNavigation={
                      sample
                        ? {
                            selected: selectedSensor,
                            onSelect: setSelectedSensor,
                          }
                        : undefined
                    }
                  />
                </OptionalVisual>
              ) : (
                <div className="result-placeholder" role="status">
                  {m("Đang mở ranh…", "Opening boundary…")}
                </div>
              )}
            </div>
            <small>
              {sample
                ? m(
                    "A · đất / B · không khí — vị trí minh họa trong ranh.",
                    "A · soil / B · air — illustrative positions inside the boundary.",
                  )
                : m(
                    "Không mang vị trí đầu đo từ thửa mẫu sang đây.",
                    "Sample probe positions are not transferred here.",
                  )}
            </small>
          </section>
          <ClimateContext
            run={run}
            snapshot={sample ? snapshot : null}
            snapshotError={snapshotError}
            retry={() => setAttempt((v) => v + 1)}
            onResearchResult={setResearchResult}
            liveV2={v2Current ? v2.record : null}
            restoredV2={openedSaved}
            season={draft.farm.season}
            stale={stale}
            vi={vi}
          />
        </div>
        <section
          className="result-status"
          ref={comparison}
          tabIndex={-1}
          aria-label={m("Trạng thái kết quả", "Result state")}
        >
          <div role="status" data-testid="result-state">
            <strong>
              {stale
                ? m(
                    "Điều kiện đã đổi · cần cập nhật so sánh",
                    "Inputs changed · update comparison",
                  )
                : openedSaved
                  ? m("Bản dự kiến đã lưu", "Saved draft")
                  : run?.sidecar.execution_mode === "computed"
                    ? m("Đã đối chiếu điều kiện", "Conditions checked")
                    : run
                      ? m("Bản phân tích đã lưu", "Saved analysis")
                      : m(
                          "Chưa có kết quả khớp · chọn Xem so sánh",
                          "No matching result · choose View comparison",
                        )}
            </strong>
            <small>
              {run && !stale
                ? `${m("Lịch sử đến", "History through")} ${run.a1.data_as_of || "—"} · ${m("chưa phê duyệt nông học", "agronomic applicability unapproved")}`
                : m(
                    "Giữ đầu vào mới; bản cũ không được lưu thành kết quả mới.",
                    "New inputs are kept; an old result cannot be saved as a new analysis.",
                  )}
            </small>
          </div>
          <button
            className={stale || !run ? "primary-action" : ""}
            disabled={!geometry || busy}
            onClick={() => {
              if (form.current && !draft.farm.season) {
                form.current.open = true;
                form.current.querySelector<HTMLInputElement>("input")?.focus();
              } else void analyze();
            }}
          >
            {busy
              ? m("Đang lấy dữ liệu…", "Retrieving data…")
              : stale
                ? m("Cập nhật so sánh", "Update comparison")
                : m("Xem so sánh", "View comparison")}
          </button>
        </section>
        {sample && !geometry && boundaryError && (
          <p role="alert" className="inline-error">
            {m(
              "Chưa tải được ranh hồ sơ. Thử lại để tiếp tục; không dùng ranh khác thay thế.",
              "Could not load the profile boundary. Retry to continue; no other boundary is substituted.",
            )}{" "}
            <button onClick={retryBoundary}>{m("Thử lại", "Retry")}</button>
          </p>
        )}
        {sample && (
          <section className="v2-live-status" aria-label="FieldShift v2">
            <p role="status">
              {draft.farm.goal === "income"
                ? m(
                    "V2 chưa hỗ trợ thu nhập; chỉ đối chiếu A1, không gửi thành mục tiêu năng suất.",
                    "V2 does not support income; A1 only, with no conversion to yield.",
                  )
                : v2Current
                  ? m(
                      openedSaved
                        ? "Bản dự kiến đã lưu từ API FieldShift v2; mở lại không chạy phân tích mới."
                        : "API FieldShift v2 · đã đối chiếu điều kiện mới. Forecast được backend tính sẵn, không suy luận lại khí hậu mỗi lần đổi khai báo.",
                      openedSaved
                        ? "Saved FieldShift v2 API result; reopening does not execute a new analysis."
                        : "FieldShift v2 API · conditions updated. Forecasts are precomputed by the backend, not rerun for each farm edit.",
                    )
                  : v2Attempted
                    ? m(
                        "V2 cần cập nhật theo điều kiện hiện tại.",
                        "V2 needs updating for current inputs.",
                      )
                    : m(
                        "Chọn vụ và Xem so sánh để phân tích bằng API v2.",
                        "Choose a season and View comparison to analyze with the v2 API.",
                      )}
            </p>
            <small>
              {m(
                "Cây vụ trước, ghi chú và độ sâu chưa có trường tương đương trong v2; giữ trong nháp, không gửi ngầm.",
                "Previous crop, notes and depth have no equivalent v2 fields; kept in the draft, not silently sent.",
              )}
            </small>
            {v2.error && (
              <p role="alert">
                {m(
                  "Chưa cập nhật được v2; thử lại. Không lấy snapshot thay kết quả mới.",
                  "V2 update failed; retry. Saved snapshots do not substitute for new results.",
                )}{" "}
                {v2.error}
              </p>
            )}
            {v2Current && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (geometry) void v2.execute(geometry, draft, question);
                }}
              >
                <label>
                  {m("Hỏi tài liệu liên quan", "Ask about source documents")}
                  <input
                    name="v2-question"
                    maxLength={800}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </label>
                <button disabled={busy || !question.trim()}>
                  {m("Tra tài liệu", "Search documents")}
                </button>
                {v2.record?.response.rag && (
                  <div data-testid="v2-rag-answer">
                    <p>
                      {vi
                        ? v2.record.response.rag.answer
                        : v2.record.response.rag.answer_en}
                    </p>
                    {v2.record.response.rag.citations.map((c) => (
                      <a
                        key={c.card_id}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.source_id} · {c.locator}{" "}
                      </a>
                    ))}
                  </div>
                )}
              </form>
            )}
          </section>
        )}
        {(state.error || localError) && (
          <p className="inline-error" role="alert">
            {localError ||
              m(
                "Chưa cập nhật được kết quả đúng phạm vi. Giữ nguyên đầu vào và thử lại. Chi tiết: ",
                "Could not update a matching result. Inputs are kept; retry. Details: ",
              ) + state.error}
          </p>
        )}
        <RotationComparison
          v2={v2Current ? v2.record : null}
          run={run}
          stale={stale}
          choice={choice}
          choose={(value) => {
            state.choose(id, value);
            setNotice("");
          }}
          vi={vi}
        />
        <section className="next-action" aria-labelledby="next-title">
          <div>
            <h2 id="next-title">
              {choice
                ? m("Bản dự kiến để trao đổi", "Your draft for discussion")
                : m(
                    "Trước khi chốt lịch trồng",
                    "Before choosing a planting plan",
                  )}
            </h2>
            <p>
              {choice
                ? `${m("Đang cân nhắc", "Considering")}: ${run?.a1.results
                    .find((r) => r.strategy_id === choice)
                    ?.seasons.map(
                      (s) =>
                        ({
                          rice: m("Lúa", "Rice"),
                          baby_corn: m("Bắp non", "Baby corn"),
                          mung_bean: m("Đậu xanh", "Mung bean"),
                        })[s.crop_id] || s.crop_id,
                    )
                    .join(" → ")}`
                : m(
                    "Chọn một phương án ở trên; giữ việc cần kiểm cùng bản dự kiến.",
                    "Choose an option above; keep the checks with your draft.",
                  )}
            </p>
            <ul>
              {tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
          <div className="save-actions">
            <button
              className="primary-action"
              disabled={
                !current ||
                !choice ||
                !run?.sidecar.catalog_supported ||
                busy ||
                (v2Attempted && (!v2Current || !!v2.error))
              }
              onClick={save}
            >
              <Save size={17} aria-hidden="true" />
              {m("Lưu bản dự kiến", "Save draft")}
            </button>
            <small>
              {m(
                "Lưu trên trình duyệt này · chưa đồng bộ tài khoản",
                "Saved in this browser · no account sync",
              )}
            </small>
            {savedPlan && (
              <>
                <button onClick={reopen} disabled={!geometry || busy}>
                  {m("Mở bản đã lưu", "Open saved draft")}
                </button>
                <small>
                  {new Intl.DateTimeFormat(vi ? "vi" : "en", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(savedPlan.savedAt))}
                </small>
              </>
            )}
            <span role="status" className="save-notice">
              {notice}
            </span>
            {openedSaved && (
              <button onClick={() => void analyze()} disabled={busy}>
                {m(
                  "Cập nhật với dữ liệu hiện có",
                  "Update with available data",
                )}
              </button>
            )}
          </div>
        </section>
        {run && (
          <details className="result-evidence">
            <summary>
              {m(
                "Xem căn cứ, nguồn & giới hạn của kết quả",
                "Evidence, sources & result limitations",
              )}
            </summary>
            {researchResult && (
              <p data-testid="research-source-trace">
                {m(
                  "Nguồn suy luận nghiên cứu đi cùng bản dự kiến",
                  "Research inference source accompanying this draft",
                )}
                : {researchResult.run_id} · {researchResult.model.method} ·{" "}
                {researchResult.target_period.start} →{" "}
                {researchResult.target_period.end_exclusive} ·{" "}
                {researchResult.prediction.toFixed(2)} {researchResult.unit} ·
                RESEARCH_ONLY.{" "}
                {m(
                  "Không phải forecast v2; mở bản lưu không chạy lại model.",
                  "Separate from v2; reopening a draft does not rerun the model.",
                )}
              </p>
            )}
            <p>
              {m("Nguồn phân tích điều kiện", "Readiness provider")}: A1 /{" "}
              {run.a1.schema_version} · {run.a1.run_id} ·{" "}
              {run.sidecar.execution_mode} · {run.sidecar.source_acquisition}
            </p>
            <p>
              {m("Phạm vi", "Scope")}: {String(run.inputs.aoi_id)} ·{" "}
              {run.sidecar.observed_period.start} →{" "}
              {run.sidecar.observed_period.end} (
              {m("không gồm ngày cuối", "exclusive end")}) ·{" "}
              {m("tính lúc", "computed")} {run.sidecar.computed_at}
            </p>
            <p>
              {m("Nguồn model khí hậu", "Climate model source")}:{" "}
              {sample && snapshot
                ? `fieldshift-2 · bản lưu / saved · ${snapshot.run_id} · ${PIN}`
                : m("chưa hỗ trợ ranh này", "not supported for this boundary")}
              .{" "}
              {m(
                "Runtime v2 đã được kiểm trên máy. API dùng forecast đã tính sẵn, phân tích lại quy tắc/RAG theo input được adapter hỗ trợ.",
                "V2 runtime verified locally. The API uses precomputed forecasts and reevaluates rules/retrieval for adapter-supported inputs.",
              )}
            </p>
            {v2.record && (
              <details>
                <summary>
                  {m(
                    "Request, nguồn và kết quả v2",
                    "V2 request, provenance and result",
                  )}
                </summary>
                <p>
                  {v2.record.provider} · {v2.record.response.run_id} ·{" "}
                  {v2.record.response.generated_at_utc} · runtime cc674716 ·{" "}
                  {v2Current ? "matching input" : "stale"} ·{" "}
                  {openedSaved ? "saved draft" : "API response"}
                </p>
                <pre>{JSON.stringify(v2.record, null, 2)}</pre>
              </details>
            )}
            <p>
              {m(
                "Các khai báo không là đo ngoài đồng; chọn phương án không phê duyệt suitability. Lưu nháp giữ input/run/source/mode, không lưu sensor thành số đo hiện tại.",
                "Declarations are not field observations; selection does not approve suitability. Drafts preserve inputs/run/source/mode; sensors are not restored as current readings.",
              )}
            </p>
            {run.sources.map((s) => (
              <p key={s.id}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.id}
                  </a>
                ) : (
                  s.id
                )}{" "}
                · {s.evidence_class}
              </p>
            ))}
            <details>
              <summary>
                {m("QA & giá trị dùng đối chiếu", "QA & comparison values")}
              </summary>
              <ul>
                {[
                  ...run.a1.warnings,
                  ...(run.sidecar.acquisition_warnings || []),
                ].map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <pre>
                {JSON.stringify(
                  {
                    inputs: run.inputs,
                    source: run.source,
                    q1: run.q1,
                    sidecar: run.sidecar,
                    climate: run.climate,
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </details>
        )}
        <footer className="dashboard-footer">
          <span>
            {m(
              "Bản dự kiến hỗ trợ trao đổi, chưa là lịch gieo trồng được khuyến nghị.",
              "Drafts support discussion; they are not approved planting recommendations.",
            )}
          </span>
          <Link to="/hardware">
            {m("Thiết bị & lịch sử đo", "Devices & reading history")}
          </Link>
        </footer>
      </main>
    </>
  );
}
