# Tích hợp V4 / ESP32 — 15/11/2026

## Baseline và phạm vi

Dashboard nguồn `research/post-review-inference` tại `208055edfba45dbc292b44c1f8324b07dec2b360`, worktree riêng trên `feat/v4-dashboard-esp32-integration`. AI nguồn `ai/selected-v4-api` tại `03ca31a0affaef8f365a687bcf41e780de57f8be`, triển khai trên `feat/v4-dashboard-api`. Cả hai checkout sạch trước thay đổi. Không reset/clean/merge/flash/train.

A1/H1 không có trong nhánh AI selected; dùng checkout riêng của cùng repository tại `54bce495514fb3235fe7bd2d0df4ab001f74cca0` (bàn giao runtime UI). Tên nhánh lịch sử `ai/v5-viet-handoff` không phải cấu hình ML được chọn: AI chính vẫn pin ML v3 climatology + RAG v4 + pooled intervals, `auto_upgrade=false`.

## Đối chiếu trước khi sửa code

| Thành phần | V2 đang dùng | V4 / quyết định triển khai |
|---|---|---|
| Dashboard/UI | map-first, Compare-first, Farmer/Power chung dashboard | Giữ layout/CSS/branding/map/AOI, chỉ đổi provider và nội dung liên quan |
| A1/H1 8000 | `0.1-proposal`, catalog/dữ liệu NASA theo ranh, telemetry gates | Tái sử dụng nguyên runtime pin, không ép V4 vào A1 |
| AI 8182 → 8184 | `/api/v2/analyze`, forecast precomputed | `/api/v4/analyze`, thực gọi sáu prediction qua SelectedEngine |
| Hợp đồng | `fieldshift-2`, run `v2-*` | Vẫn có envelope research `fieldshift-2`, nhưng phải có `selected_system=v4`, `api_schema_version=fieldshift-dashboard-1`, blocks đúng và run riêng |
| Forecast | issued/cutoff/backtest_coverage | V4 có origin/data_through/uncertainty_method/coverage_guaranteed; cần schema riêng, không bịa coverage |
| RAG | corpus/retrieval V2 | V4 refined gate kiểm query support và source SHA; giữ abstention/citations |
| Rotation | ba timeline A1, statuses V2 | Timeline catalog giữ nguyên; statuses/reasons/tradeoffs từ V4, score/rank/probability null |
| Persistence | draft-2, V2 cùng A1 | Mở rộng record V4 riêng, giữ input/run/model/provenance; bản cũ vẫn được nhận diện là V2 |
| Hardware | HardwareProvider + NDJSON/bench text + SensorStrip A/B | Tái sử dụng; USB/REPLAY/SYNTHETIC, ADC thô, clock/calibration gates giữ nguyên |
| Launcher | sibling path cố định, khởi động V2 | Resolve runtime rõ, pin A1, kiểm identity, ownership/PID/time, không cần V2 |

## API và dữ liệu cần bổ sung

Sáu route V4 hiện có đủ output chính. Bổ sung metadata mỗi inference (run ID mới, checksum selection/artifacts/dataset/corpus, execution mode), output validation và lỗi artifact có mã rõ. Không cần model hoặc API forecast thứ hai. Lịch sử NASA tiếp tục dùng A1 theo năm/geometry; overview V4 không được đổi nhãn thành dữ liệu NASA live.

## Rủi ro và cách kiểm

- V4 khác schema forecast V2: adapter xác thực target/unit/origin/horizon/cutoff/bounds và sáu cặp duy nhất.
- Farm echo, geometry scope và stale/race phải kiểm trước khi dùng hoặc lưu. Income không đổi thành yield.
- Forecast nghiên cứu, nominal 80% không phải accuracy/achieved coverage. Không rank cây.
- Không dùng snapshot V2 làm output V4 khi lỗi. Bản đã lưu giữ run gốc, không tự inference khi mở lại.
- Hardware physical chưa hiện trong danh sách serial Windows tại khảo sát; không quy lỗi cho board và không coi harness là live proof.
- Baseline unit 41/41; các báo cáo/test cũ trong source chỉ là lịch sử, không phải nghiệm thu phiên này.

Chi tiết triển khai và kết quả mới được ghi bổ sung sau kiểm thử trong báo cáo verification và tài liệu demo.

## Đã triển khai

Backend đã commit tại **`c01519e6257a0788c453964f8dfe12c754c7cfed`**, nhánh `feat/v4-dashboard-api`. Frontend cần bản tích hợp này hoặc code tương thích; nhánh selected V4 nguồn trước đó chưa có receipt/loaded-code identity của đợt này.

- `frontend/src/features/dashboard/v4.ts`: contract V4 độc lập, tái sử dụng duy nhất mapping farm và cấu trúc option không đổi của V2. Không sử dụng output V2. Kiểm target/unit/bounds, origin/horizon/cutoff, sáu task duy nhất, null rank/score/probability, domain=false, exact selected blocks, citations/source integrity và echo farm/question. Cổng8184 đi qua proxy `/api/v4`, giữ Origin thật để API kiểm CORS.
- `SelectedEngine.analyze`: vẫn thực thi đúng Engine được chọn, không tạo model mới. Mỗi request chạy sáu prediction, tạo `v4-<uuid>` mới; giữ selection ID riêng và checksum dataset/corpus/selections/model artifacts. Server log ghi run/request/selection. Output qua Pydantic; lỗi không chuyển V2 hoặc snapshot.
- A1 và V4 chạy độc lập cùng lúc khi đối chiếu: A1 giữ geometry/history/catalog/H1 hợp đồng cũ; V4 nhận farm allowlist cho pilot đã kiểm geometry. A1 hỏng không ngăn một request V4 độc lập, nhưng không được lưu kết quả so sánh như một A1 hoàn chỉnh. V4 hỏng chặn lưu phân tích V4 mới, hiện error rõ.
- Dashboard giữ map-first60/40, Compare-first, ba chế độ, Farmer và Power entry thống nhất theo source Hưng. Giữ MapLibre/AOI/probe A/B, chart, Be Vietnam Pro, palette, tiếng Việt/Anh, hardware và local persistence. Tab model chính đọc V4; bỏ việc tự tải snapshot V2 và picker Extra Trees cũ khỏi luồng AI chính. Source legacy và validator V2 còn để đọc đúng các bản nháp cũ, không đổi nhãn chúng thành V4.
- Draft-2 mở rộng field `v4` riêng bên cạnh A1; lưu request/response/run/model/citations/checksums, kiểm readback. Mở lại không POST; receipt V4 đầu phiên thiếu question echo vẫn đọc được để giữ nguyên bản lưu. Response HTTP mới bắt buộc echo question; không hiển thị answer cũ dưới một câu hỏi đang sửa khác.
- HardwareProvider/parser/SensorStrip được tái sử dụng nguyên pipeline. Chỉ sửa CSS cho diagnostic/packet warning có đủ hàng, không tràn khỏi thẻ. Không đổi calibration, clock, H1 gate hoặc sensor→AI contract.
- Vite cho phép đúng realpath của dependency junction để font tải trong worktree; không mở quyền đọc toàn ổ đĩa. Cấu hình Playwright dùng Edge đã cài khi bundled Chromium đúng revision chưa có.

## Launcher và reproducibility

`Start-AgroTwin.ps1` và `Stop-AgroTwin.ps1` là entrypoint tương thích, gọi bộ V4 mới. Common helper tìm lab qua ancestor hoặc env, chuẩn bị A1 worktree pin, kiểm dependencies/model/cache, kiểm registry A1 và identity V4/frontend. V2/8182 không bắt buộc. Log/context/PID manifest nằm trong `frontend/artifacts/local-demo-v4`.

Stop kiểm PID, creation time, command line và child Python đúng app-dir; không claim/stop service tái sử dụng. Đã phát hiện và sửa serialization `value/Count` của array trên Windows PowerShell5 trong thử vòng đời launcher; reader chuẩn hóa an toàn, writer chỉ ghi flat records. Không dùng taskkill theo cổng. Các tiến trình thủ công phục vụ khảo sát đầu phiên đã được dừng theo identity/thời gian đã ghi; runtime bàn giao được Start quản lý đầy đủ.

Không cài tool mới toàn hệ thống, không sửa driver/firmware, không train model đã chọn. Tái sử dụng native dependency tree có cùng package pins qua junction; đây không phải bằng chứng clean `npm ci`. A1/H1 chạy từ checkout pin riêng bằng venv V4 tương thích đã kiểm imports và endpoints. Installer artifacts từ chối bytes khác manifest, không ghi đè source data có hash khác.

## Phần cứng thực tế phiên này

Windows PnP nhận **USB-Enhanced-SERIAL CH343 (COM3)**, VID1A86/PID55D3, trạng thái OK. Native serial115200 đọc firmware ESP32-S3 và GY-21: °C, RH và rawADC. Sau khi đóng native port, người dùng tự cấp quyền Web Serial trong browser. Playwright quan sát cùng Dashboard nhận số thật thay đổi qua nhiều capture, ví dụ25,6–25,8°C,44,1–44,4%RH,ADC3077–3080; đây là số bench tại thời điểm kiểm, không phải ngưỡng chuẩn.

Người dùng xác nhận rút/cắm và chọn lại cổng thành công; agent quan sát live sau reconnect nhưng không trực tiếp chụp khoảnh khắc unplug. Chi tiết probe ghi REAL_USB, QA unverified, host_received và ID do host gán. Không xác minh sensor calibration, vị trí ngoài đồng, device clock hay cadence chuẩn. Receipt có hash tại [evidence/physical-hardware.json](evidence/physical-hardware.json).

## Quy trình đã diễn tập

Trên chính browser được user cấp USB: chọn input mẫu → request V4 `v4-4b2a3f7f37e044e8a90cb370b0f87e8b` → hỏi `T2M là gì?` → citation NASA_POWER đã kiểm bytes → run `v4-1ca3ec270bc841ee8978d80cbbcb6d99` → chọn R1 blocked như nháp → lưu → reload/mở lại. Truy vết quan sát được **0 POST V4 khi mở lại**, input/model hashes/run ID nguyên vẹn. USB sau reload là disconnected, không khôi phục số cũ như live. Automated E2E dùng contexts khác, không giả lập phép đo để thay các bằng chứng physical này.

## Test migration và giới hạn

Các test desktop/Sprint3A hiện hành được port selector provider sang V4 và thay kỳ vọng snapshot trước inference bằng trạng thái “chưa có kết quả V4”. `live-v2.spec.ts` đổi tên thành `live-provider.spec.ts`, giữ bốn acceptance scenarios. Hai bài model đổi từ picker Extra Trees đã nghỉ sang selected V4, vẫn kiểm predict/provenance/persistence/mobile/error/wrong scope. Không thêm skip hoặc xóa acceptance để báo xanh. Screenshot mới đi namespace v4-integration để không ghi đè bằng chứng lịch sử.

Toàn bộ suite lịch sử còn có routes/selector cho Planner/Power/research cũ đã nghỉ ngay ở source Hưng; không mô tả lượt kiểm các workflow hiện hành như full legacy-suite PASS. Tình trạng và lệnh chính xác ở [V4_ESP32_VERIFICATION.md](V4_ESP32_VERIFICATION.md).
