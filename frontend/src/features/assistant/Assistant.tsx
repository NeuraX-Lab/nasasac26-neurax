import { useParams } from "react-router-dom";
import { useAnalysis } from "../analysis/state";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { useHardware } from "../hardware/state";
import type { Bundle } from "../../core/contracts";
export function Assistant({
  bundle,
  areaName,
  year,
}: {
  bundle: Bundle | null;
  areaName: string;
  year: string;
}) {
  const { t } = useTranslation(),
    h = useHardware();
  const { id = "my-thanh" } = useParams();
  const analysis = useAnalysis();
  const actualRun = analysis.records[id]?.run.a1.run_id;
  const [open, setOpen] = useState(false),
    [question, setQuestion] = useState(""),
    [topic, setTopic] = useState("");
  function ask(q: string) {
    setTopic(
      /sensor|device|hardware|cảm biến|thiết bị/i.test(q)
        ? "hardware"
        : /climate|khí hậu|mưa|rain|nhiệt/i.test(q)
          ? "climate"
          : /rank|rotation|luân canh|xếp hạng/i.test(q)
            ? "rotation"
            : /missing|thiếu/i.test(q)
              ? "missing"
              : "unsupported",
    );
  }
  return (
    <>
      <button className="assistant-launch" onClick={() => setOpen(true)}>
        <MessageCircle size={17} />
        {t("contextGuide")}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("contextGuide")}>
        <p>{t("assistantIntro")}</p>
        <div className="context-chip">
          {areaName} · {year} · {actualRun || bundle?.runId || t("noData")}
        </div>
        <p className="notice">{t("assistantLimit")}</p>
        <div className="assistant-prompts">
          {["Missing", "Climate", "Hardware", "Rotation"].map((k) => (
            <button
              key={k}
              onClick={() => {
                setQuestion(t("ask" + k));
                setTopic(k.toLowerCase());
              }}
            >
              {t("ask" + k)}
            </button>
          ))}
        </div>
        <form
          className="assistant-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <label>
            {t("question")}
            <input
              value={question}
              maxLength={300}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <button disabled={!question.trim()}>{t("send")}</button>
        </form>
        {topic && (
          <section className="assistant-answer" aria-live="polite">
            <h3>{t("evidence")}</h3>
            {topic === "missing" ? (
              <p>{t("missingAnswer")}</p>
            ) : topic === "rotation" ? (
              <p>{t("rotationAnswer")}</p>
            ) : topic === "climate" ? (
              <>
                <p>
                  {bundle
                    ? t(
                        bundle.dataMode === "synthetic"
                          ? "sandboxWarn"
                          : "coarse",
                      )
                    : t("noFieldData")}
                </p>
                {bundle && (
                  <dl>
                    <dt>{t("dataset")}</dt>
                    <dd>{bundle.datasetVersion}</dd>
                    <dt>Run</dt>
                    <dd>{bundle.runId}</dd>
                    <dt>{t("year")}</dt>
                    <dd>{year}</dd>
                    <dt>{t("source")}</dt>
                    <dd>{bundle.source.provider}</dd>
                  </dl>
                )}
                {bundle?.source.url && (
                  <a href={bundle.source.url} target="_blank" rel="noreferrer">
                    {t("sourceLink")} <ArrowUpRight size={15} />
                  </a>
                )}
              </>
            ) : topic === "hardware" ? (
              <>
                <p>
                  {t(h.status)} · {h.events.length} {t("received")} ·{" "}
                  {h.rejected} {t("rejected")}
                </p>
                <p>{t("pointLimit")}</p>
                <Link to="/hardware">{t("hardware")} →</Link>
              </>
            ) : (
              <p>{t("unsupportedQuestion")}</p>
            )}
            {["missing", "rotation"].includes(topic) && (
              <>
                <p>{t("referenceLimit")}</p>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/download/605/3214/3214"
                >
                  CTU 2009 / S4 <ArrowUpRight size={15} />
                </a>
              </>
            )}
          </section>
        )}
      </Modal>
    </>
  );
}
