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
  PIN,
  PlanSchema,
  readPlan,
  runMatches,
  type Overview,
  type Plan,
} from "./model";
import "./dashboard.css";
import "./desktop.css";
import { useV4 } from "./v4";

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
  const v4 = useV4();
  const [v4Attempted, setV4Attempted] = useState(false),
    [question, setQuestion] = useState("");
  const v4Current = !!v4.record && v4.record.key === key && !v4.error;
  const [selectedSensor, setSelectedSensor] = useState("");
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [desktopMode, setDesktopMode] = useState<
    "explore" | "conditions" | "decision"
  >("explore");
  const [researchResult, setResearchResult] = useState<z.infer<
    typeof ResearchInferenceSchema
  > | null>(null);
  const [snapshot, setSnapshot] = useState<Overview | null>(null);
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
  const busy = state.running === id || v4.busy;
  const chosenStatus = v4Current
    ? v4.record?.response.decision.options.find((o) => o.id === choice)?.status
    : undefined;
  const savedSelection =
    !!savedPlan &&
    savedPlan.key === key &&
    savedPlan.chosen === choice &&
    savedPlan.run.a1.run_id === run?.a1.run_id &&
    savedPlan.v4?.response.run_id === v4.record?.response.run_id;
  function changeMode(mode: "explore" | "conditions" | "decision") {
    setDesktopMode(mode);
    if (form.current) form.current.open = mode === "conditions";
    requestAnimationFrame(() => {
      if (mode === "conditions") {
        form.current?.scrollIntoView({ block: "center" });
        form.current
          ?.querySelector<HTMLInputElement>("input")
          ?.focus({ preventScroll: true });
      } else if (mode === "decision") {
        comparison.current?.scrollIntoView({ block: "start" });
        comparison.current?.focus({ preventScroll: true });
      }
    });
  }
  useEffect(
    () => () => {
      analysisRevision.current++;
      state.cancel();
      v4.cancel();
    },
    [id],
  );
  function edit(next: Draft) {
    analysisRevision.current++;
    v4.cancel();
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
    const shouldV4 = sample && draft.farm.goal !== "income";
    setV4Attempted(shouldV4);
    const [ok] = await Promise.all([
      state.execute(id, geometry, draft),
      shouldV4 ? v4.execute(geometry, draft) : Promise.resolve(false),
    ]);
    if (revision !== analysisRevision.current) return;
    if (!shouldV4) v4.restore(null);
    if (ok && revision === analysisRevision.current) {
      if (form.current) form.current.open = false;
      setDesktopMode("decision");
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
    if (v4Attempted && !v4Current) return;
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
        v2: null,
        v4: v4Current ? v4.record : null,
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
    v4.restore(savedPlan.v4 || null);
    setQuestion(savedPlan.v4?.request.question || "");
    setV4Attempted(!!savedPlan.v4);
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
      <main id="main" className={`farm-dashboard desktop-${desktopMode}`}>
        <nav
          className="dashboard-modes"
          aria-label={m("Chế độ làm việc", "Workspace mode")}
        >
          <span className="neurax-signature">
            AgroTwin <small>by NeuraX</small>
          </span>
          <button
            aria-pressed={desktopMode === "explore"}
            onClick={() => changeMode("explore")}
          >
            {m("Quan sát", "Explore")}
          </button>
          <button
            aria-pressed={desktopMode === "conditions"}
            onClick={() => changeMode("conditions")}
          >
            {m("Điều kiện", "Conditions")}
          </button>
          <button
            aria-pressed={desktopMode === "decision"}
            onClick={() => changeMode("decision")}
          >
            {m("So luân canh", "Decision")}
          </button>
        </nav>
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
                if (window.matchMedia("(min-width: 1100px)").matches) {
                  changeMode("conditions");
                  return;
                }
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
        <section
          className="farmer-journey"
          aria-label={m("Bước tiếp theo", "Next step")}
        >
          <div>
            <strong>
              {desktopMode === "explore"
                ? m(
                    "Quan sát trước khi chọn vụ",
                    "Observe before choosing a season",
                  )
                : desktopMode === "conditions"
                  ? m(
                      "Bạn biết gì về nước và vụ tới?",
                      "What do you know about water and the next season?",
                    )
                  : m(
                      "Giữ lịch hiện tại, hay đổi một vụ?",
                      "Keep the current sequence, or change a season?",
                    )}
            </strong>
            <p>
              {desktopMode === "explore"
                ? m(
                    "NASA POWER: lịch sử khí hậu vùng · ESP32-S3: số đo tại điểm · FieldShift V4: ước tính nghiên cứu. Chúng chưa tự xác định cây phù hợp.",
                    "Regional climate, point measurements and research estimates are separate sources. They do not determine crop suitability.",
                  )
                : desktopMode === "conditions"
                  ? m(
                      "Chọn khoảng vụ, nguồn tưới và thoát nước. Chưa biết có thể để chưa rõ; đây là thông tin bạn khai báo.",
                      "Choose a season, irrigation supply and drainage. Unknown is allowed; these are your declarations.",
                    )
                  : m(
                      "So cùng thứ tự vụ; xem điều kiện còn vướng trước khi chọn một bản dự kiến để trao đổi.",
                      "Compare the same season order; inspect outstanding conditions before keeping a draft for discussion.",
                    )}
            </p>
          </div>
          <button
            className="primary-action"
            disabled={desktopMode === "conditions" && busy}
            onClick={() =>
              desktopMode === "explore"
                ? changeMode("conditions")
                : desktopMode === "conditions"
                  ? form.current
                      ?.querySelector<HTMLButtonElement>(
                        'button[type="submit"]',
                      )
                      ?.click()
                  : document
                      .querySelector<HTMLElement>(".next-action")
                      ?.scrollIntoView({ block: "center" })
            }
          >
            {desktopMode === "explore"
              ? m("Xác nhận điều kiện →", "Confirm conditions →")
              : desktopMode === "conditions"
                ? m("Đối chiếu và so lịch →", "Check and compare →")
                : m("Xem bản dự kiến để lưu ↓", "Review draft to save ↓")}
          </button>
        </section>
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
        <div className="field-support">
          <div className="compare-context-heading">
            <strong>{m("Ngữ cảnh thửa", "Field context")}</strong>
            <button
              onClick={() => {
                changeMode("explore");
                requestAnimationFrame(() =>
                  document
                    .querySelector(".field-support")
                    ?.scrollIntoView({ block: "start" }),
                );
              }}
            >
              {m("Mở map, khí hậu & số đo", "Open map, climate & readings")}
            </button>
          </div>
          <SensorStrip
            id={id}
            geometry={geometry || emptyGeometry}
            selected={selectedSensor}
            onSelect={setSelectedSensor}
            vi={vi}
          />
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
            workspaceMode={desktopMode}
            run={run}
            liveV4={v4Current ? v4.record : null}
            restoredV4={openedSaved}
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
                  : v4Current || run?.sidecar.execution_mode === "computed"
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
            hidden={desktopMode === "decision" && current && v4Current && !busy}
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
          v4={v4Current ? v4.record : null}
          run={run}
          stale={stale}
          choice={choice}
          choose={(value) => {
            state.choose(id, value);
            setNotice("");
          }}
          vi={vi}
        />
        {sample && (
          <section
            className="v2-live-status v4-live-status"
            aria-label="FieldShift v4"
          >
            <p role="status">
              {draft.farm.goal === "income"
                ? m(
                    "V4 chưa hỗ trợ thu nhập; chỉ đối chiếu A1, không gửi thành mục tiêu năng suất.",
                    "V4 does not support income; A1 only, with no conversion to yield.",
                  )
                : v4Current
                  ? m(
                      openedSaved
                        ? "Bản dự kiến đã lưu từ API FieldShift v4; mở lại không chạy phân tích mới."
                        : "API FieldShift V4 · sáu prediction vừa thực thi bằng ML v3 climatology, RAG V4 và pooled intervals; chỉ dùng nghiên cứu.",
                      openedSaved
                        ? "Saved FieldShift v4 API result; reopening does not execute a new analysis."
                        : "FieldShift v4 API · conditions updated. Six fresh predictions using ML v3 climatology, RAG V4 and pooled intervals; research only.",
                    )
                  : v4Attempted
                    ? m(
                        "V4 cần cập nhật theo điều kiện hiện tại.",
                        "V4 needs updating for current inputs.",
                      )
                    : m(
                        "Chọn vụ và Xem so sánh để phân tích bằng API v4.",
                        "Choose a season and View comparison to analyze with the v4 API.",
                      )}
            </p>
            <small>
              {m(
                "Cây vụ trước, ghi chú và độ sâu chưa có trường tương đương trong v4; giữ trong nháp, không gửi ngầm.",
                "Previous crop, notes and depth have no equivalent v4 fields; kept in the draft, not silently sent.",
              )}
            </small>
            {v4.error && (
              <p role="alert">
                {m(
                  "Chưa cập nhật được v4; thử lại. Không lấy snapshot thay kết quả mới.",
                  "V4 update failed; retry. Saved snapshots do not substitute for new results.",
                )}{" "}
                {v4.error}
              </p>
            )}
            {v4Current && v4.record && (
              <p data-testid="v4-run">
                {v4.record.response.run_id} ·{" "}
                {v4.record.response.inference.model_version} ·{" "}
                {openedSaved
                  ? m("bản đã lưu", "saved result")
                  : m("inference mới", "fresh inference")}
              </p>
            )}
            {v4Current && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpenedSaved(false);
                  if (geometry) void v4.execute(geometry, draft, question);
                }}
              >
                <label>
                  {m("Hỏi tài liệu liên quan", "Ask about source documents")}
                  <input
                    name="v4-question"
                    maxLength={800}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </label>
                <button disabled={busy || !question.trim()}>
                  {m("Tra tài liệu", "Search documents")}
                </button>
                {v4.record?.response.rag &&
                  question.trim() === v4.record.request.question && (
                    <div data-testid="v4-rag-answer">
                      <p>
                        {vi
                          ? v4.record.response.rag.answer
                          : v4.record.response.rag.answer_en}
                      </p>
                      {v4.record.response.rag.citations.map((c) => (
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
        <section className="next-action" aria-labelledby="next-title">
          <div>
            {choice && (
              <p className="draft-selection-state" role="status">
                {m("Nháp đang cân nhắc", "Draft under consideration")}: {choice}{" "}
                ·{" "}
                {savedSelection
                  ? m("Đã có bản lưu khớp", "Matching saved draft")
                  : m("Chưa lưu lựa chọn này", "This selection is not saved")}
              </p>
            )}
            {chosenStatus === "blocked" && (
              <p className="blocked-draft-warning">
                {m(
                  "Phương án đang vướng điều kiện. Bạn chỉ lưu một bản dự kiến để trao đổi, không phải phương án được khuyến nghị gieo trồng.",
                  "This option is blocked by conditions. Saving keeps a draft for discussion, not a planting recommendation.",
                )}
              </p>
            )}
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
                (v4Attempted && (!v4Current || !!v4.error))
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
                  "Không phải forecast v4; mở bản lưu không chạy lại model.",
                  "Separate from v4; reopening a draft does not rerun the model.",
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
              {v4Current && v4.record
                ? `${v4.record.response.inference.model_version} · ${v4.record.response.run_id}`
                : m(
                    "Chưa có inference V4 khớp input",
                    "No matching V4 inference",
                  )}
            </p>
            {v4.record && (
              <details>
                <summary>
                  {m(
                    "Request, nguồn và kết quả v4",
                    "V4 request, provenance and result",
                  )}
                </summary>
                <p>
                  {v4.record.provider} · {v4.record.response.run_id} ·{" "}
                  {v4.record.response.generated_at_utc} ·{" "}
                  {v4.record.response.inference.model_version} ·{" "}
                  {v4Current ? "matching input" : "stale"} ·{" "}
                  {openedSaved ? "saved draft" : "API response"}
                </p>
                <pre>{JSON.stringify(v4.record, null, 2)}</pre>
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
