import type { AnalysisRun } from "../analysis/contracts";
import { useRef } from "react";
import type { V2Result } from "./v2";

export function RotationComparison({
  run,
  stale,
  choice,
  choose,
  vi,
  v2,
}: {
  run: AnalysisRun | null;
  stale: boolean;
  choice: string;
  choose: (id: string) => void;
  vi: boolean;
  v2: V2Result | null;
}) {
  const m = (vn: string, en: string) => (vi ? vn : en);
  const crop = (id: string) =>
    ({
      rice: m("Lúa", "Rice"),
      baby_corn: m("Bắp non", "Baby corn"),
      mung_bean: m("Đậu xanh", "Mung bean"),
    })[id] || id;
  const supported = run?.sidecar.catalog_supported;
  const options = v2?.response.decision.options || [];
  const sharedMissing =
    options[0]?.missing_inputs.filter((item) =>
      options.every((option) => option.missing_inputs.includes(item)),
    ) || [];
  const cards = useRef<Array<HTMLElement | null>>([]);
  return (
    <section className="rotation-comparison" aria-labelledby="rotation-title">
      <div className="section-heading">
        <div>
          <h2 id="rotation-title">
            {m(
              "Giữ lịch lúa, hay đổi một vụ?",
              "Keep the rice sequence, or change one season?",
            )}
          </h2>
          <p>
            {m(
              "So cùng thứ tự vụ và cùng tiêu chí. Chọn để lưu một bản dự kiến.",
              "Compare the same season order and criteria. Choose an option to keep a draft.",
            )}
          </p>
        </div>
        <span className="reference-label">
          {m("Lịch tham chiếu", "Reference sequences")}
        </span>
      </div>
      {!run ? (
        <div className="result-placeholder" role="status">
          {m(
            "Chọn khoảng vụ và “Xem so sánh” để lấy kết quả theo ranh. Chưa có kết quả khớp để cân nhắc phương án.",
            "Choose a season and “View comparison” to retrieve results for this boundary. No matching result is available to select an option yet.",
          )}
        </div>
      ) : !supported ? (
        <div className="unsupported-result">
          <h3>
            {m(
              "Chưa có catalog luân canh cho thửa này",
              "No rotation catalog for this field yet",
            )}
          </h3>
          <p>
            {m(
              "Nguồn khí hậu được truy vấn theo ranh riêng. Các chuỗi Mỹ Thành không được áp cho vùng này. Hãy xác nhận lịch đang trồng và hỏi cán bộ địa phương về giống, tưới–tiêu trước khi bổ sung phương án.",
              "Climate is queried for this field’s own boundary. Mỹ Thành sequences are not applied here. Confirm the current sequence and discuss cultivars, irrigation and drainage locally before adding options.",
            )}
          </p>
        </div>
      ) : (
        <>
          <p className="comparison-limit">
            {m(
              "Chưa đủ dữ liệu để phân biệt mức phù hợp. Khác biệt hiện có là cây ở vụ giữa và điều cần đối chiếu; quy tắc chưa được duyệt tại ruộng.",
              "There is not enough evidence to distinguish suitability. The available differences are the middle crop and the checks it requires; field applicability is not approved.",
            )}
          </p>
          <div
            className="mobile-option-nav"
            aria-label={m("Xem từng lịch", "View each sequence")}
          >
            {run.a1.results.map((result, index) => (
              <button
                key={result.strategy_id}
                aria-controls={`option-${result.strategy_id}`}
                onClick={() => {
                  const card = cards.current[index],
                    container = card?.parentElement;
                  if (card && container)
                    container.scrollBy({
                      left:
                        card.getBoundingClientRect().left -
                        container.getBoundingClientRect().left,
                      behavior: "auto",
                    });
                }}
              >
                {index === 0
                  ? m("Chuỗi lúa", "Rice sequence")
                  : index === 1
                    ? m("Bắp non", "Baby corn")
                    : m("Đậu xanh", "Mung bean")}
              </button>
            ))}
          </div>
          {sharedMissing.length > 0 && (
            <details className="shared-checks">
              <summary>
                {m(
                  "Cần xác nhận cho mọi phương án",
                  "Checks shared by all options",
                )}{" "}
                ({sharedMissing.length})
              </summary>
              <ul>
                {sharedMissing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                {m(
                  "Bổ sung điều bạn biết trong Điều kiện; mục chưa có trường khai báo cần trao đổi với cán bộ địa phương trước khi chốt.",
                  "Add known information under Conditions; discuss unsupported fields with a local adviser before deciding.",
                )}
              </p>
            </details>
          )}
          <div className={`rotation-options ${stale ? "is-stale" : ""}`}>
            {run.a1.results.map((result, index) => {
              const live = v2?.response.decision.options.find(
                (o) => o.id === result.strategy_id,
              );
              const drainage = result.criteria.find(
                (c) => c.criterion_id === "K1-DRAFT-DRAINAGE",
              );
              const timing = result.criteria.find(
                (c) =>
                  c.criterion_id === "K1-DRAFT-BABY-TIMING" ||
                  c.criterion_id === "K1-DRAFT-MUNG-TIMING",
              );
              const water = result.criteria.find(
                (c) => c.criterion_id === "K1-DRAFT-IRRIGATION",
              );
              return (
                <article
                  className={`rotation-option ${choice === result.strategy_id ? "is-considered" : ""}`}
                  key={result.strategy_id}
                  id={`option-${result.strategy_id}`}
                  ref={(el) => {
                    cards.current[index] = el;
                  }}
                >
                  <h3>
                    <span className="strategy-code">{result.strategy_id}</span>
                    {index === 0
                      ? m("Giữ chuỗi lúa", "Keep the rice sequence")
                      : index === 1
                        ? m(
                            "Đổi vụ giữa sang bắp non",
                            "Baby corn in the middle",
                          )
                        : m(
                            "Đổi vụ giữa sang đậu xanh",
                            "Mung bean in the middle",
                          )}
                  </h3>
                  {live && (
                    <div
                      className={`v2-option-status ${live.status}`}
                      data-testid={`v2-${live.id}`}
                    >
                      <strong>
                        {
                          {
                            blocked: m(
                              "Đang vướng điều kiện",
                              "Blocked by declared conditions",
                            ),
                            needs_information: m(
                              "Cần bổ sung thông tin",
                              "More information needed",
                            ),
                            conditional_reference: m(
                              "Tham khảo có điều kiện",
                              "Conditional reference",
                            ),
                          }[live.status]
                        }
                      </strong>
                      {live.status === "blocked" && (
                        <p className="option-brief">
                          {v2?.request.farm.drainage === "poor"
                            ? m(
                                "Thoát nước kém theo khai báo; cần kiểm biện pháp khắc phục.",
                                "Reported poor drainage; check mitigation locally.",
                              )
                            : m(
                                "Còn điều kiện chưa đáp ứng; mở lý do trước khi cân nhắc.",
                                "Unmet conditions; inspect reasons before considering.",
                              )}
                        </p>
                      )}
                      {live.missing_inputs.filter(
                        (item) => !sharedMissing.includes(item),
                      ).length > 0 && (
                        <p className="option-next-check">
                          <b>{m("Cần làm rõ: ", "Clarify: ")}</b>
                          {live.missing_inputs
                            .filter((item) => !sharedMissing.includes(item))
                            .slice(0, 2)
                            .join(" · ")}
                          {live.missing_inputs.filter(
                            (item) => !sharedMissing.includes(item),
                          ).length > 2
                            ? m(
                                ". Xem các mục còn lại bên dưới.",
                                ". See remaining items below.",
                              )
                            : ""}
                        </p>
                      )}
                      {live.status === "blocked" && (
                        <p>
                          {vi
                            ? live.reasons.join(" ")
                            : v2?.request.farm.drainage === "poor"
                              ? "You reported poor drainage. This upland-crop reference is blocked pending local review."
                              : live.reasons.join(" ")}
                        </p>
                      )}
                      <details>
                        <summary>
                          {m(
                            "Vì sao, cần kiểm gì & nguồn",
                            "Reasons, next checks & sources",
                          )}
                        </summary>
                        <p>{live.reasons.join(" ")}</p>
                        <ul>
                          {live.missing_inputs.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        <p>{live.calendar}</p>
                        <p>{live.tradeoff}</p>
                        <small>
                          {live.evidence_ids.join(" · ")} ·
                          domain_approved=false
                        </small>
                      </details>
                    </div>
                  )}
                  <ol
                    className="rotation-timeline"
                    aria-label={m(
                      "Thứ tự vụ, chưa phải lịch ngày gieo",
                      "Season order, not sowing dates",
                    )}
                  >
                    {result.seasons.map((s, i) => (
                      <li
                        key={s.season_index}
                        className={`crop-${s.crop_id} ${i === 1 ? "middle-season" : ""}`}
                      >
                        <small>
                          {m("Vụ", "Season")} {s.season_index}
                        </small>
                        <strong>{crop(s.crop_id)}</strong>
                        {i === 1 && (
                          <small>
                            {index === 0
                              ? m("giữ cây", "same crop")
                              : m("đổi cây", "changed crop")}
                          </small>
                        )}
                      </li>
                    ))}
                  </ol>
                  <details className="criteria-disclosure">
                    <summary>
                      {m("Điều kiện & lịch vụ", "Conditions & timing")}
                    </summary>
                    <dl className="rotation-criteria">
                      <div>
                        <dt>{m("Tưới–tiêu", "Water & drainage")}</dt>
                        <dd>
                          {drainage
                            ? m(
                                "Cần đối chiếu thoát nước và lịch sử ngập khi đưa cây cạn vào ruộng lúa.",
                                "Check drainage and waterlogging before introducing an upland crop.",
                              )
                            : water
                              ? m(
                                  "Mưa chưa xác nhận nguồn tưới; cần kiểm nguồn và nhu cầu từng giai đoạn.",
                                  "Rain does not establish irrigation supply; check supply and crop-stage needs.",
                                )
                              : m(
                                  "Chưa có tiêu chí đủ căn cứ.",
                                  "No supported criterion is available.",
                                )}
                        </dd>
                      </div>
                      <div>
                        <dt>{m("Khớp lịch vụ", "Timing")}</dt>
                        <dd>
                          {timing?.criterion_id === "K1-DRAFT-MUNG-TIMING"
                            ? m(
                                "Nguồn DX208 từ Hà Tĩnh chưa xác nhận giống hoặc thời lượng ở Mỹ Thành.",
                                "DX208 evidence from Hà Tĩnh does not establish the local cultivar or duration.",
                              )
                            : timing
                              ? m(
                                  "Hướng dẫn bắp non chưa được chuyển thành lịch giống ở thửa này.",
                                  "Baby-corn guidance has not been adopted as a local cultivar calendar.",
                                )
                              : m(
                                  "Chưa xác nhận giống và lịch gieo/thu của chuỗi hiện tại.",
                                  "The current cultivar and sowing/harvest calendar are unconfirmed.",
                                )}
                        </dd>
                      </div>
                    </dl>
                  </details>
                  <details>
                    <summary>
                      {m(
                        "Căn cứ riêng của phương án",
                        "Evidence for this option",
                      )}
                    </summary>
                    <p>
                      {result.is_current === true
                        ? m(
                            "Backend ghi nhận hiện trạng.",
                            "Backend marks this as current.",
                          )
                        : m(
                            "Chuỗi tham chiếu; xác nhận cây hiện tại không xác nhận toàn bộ ba vụ.",
                            "Reference sequence; confirming the current crop does not confirm all three seasons.",
                          )}
                    </p>
                    {[drainage, timing, water]
                      .filter((c) => !!c)
                      .map((c) => (
                        <div key={c!.criterion_id}>
                          <p>{c!.statement || c!.reason}</p>
                          <small>
                            {c!.approval_state} · {c!.status}
                          </small>
                          {c!.evidence_ids.map((id) => {
                            const source = run.sources.find((s) => s.id === id);
                            return source?.url ? (
                              <a
                                href={source.url}
                                key={id}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {id}
                              </a>
                            ) : (
                              <span key={id}>{id} </span>
                            );
                          })}
                        </div>
                      ))}
                  </details>
                  <button
                    className={
                      choice === result.strategy_id ? "considered-button" : ""
                    }
                    aria-pressed={choice === result.strategy_id}
                    disabled={stale}
                    onClick={() => choose(result.strategy_id)}
                  >
                    {choice === result.strategy_id
                      ? m("Bạn đang cân nhắc", "You are considering this")
                      : m("Cân nhắc phương án", "Consider this option")}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="sequence-note">
            {m(
              "Timeline thể hiện thứ tự ba vụ, chưa có ngày gieo/thu. Các đoạn không biểu thị thời lượng bằng nhau.",
              "Timelines show three seasons in sequence, without sowing/harvest dates. Segments do not imply equal durations.",
            )}
          </p>
        </>
      )}
    </section>
  );
}
