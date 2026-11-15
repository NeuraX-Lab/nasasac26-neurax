# SPRINT_3A_IMPLEMENTATION_REPORT

> Cập nhật owner — 15/11/2026: Hưng xác nhận đã kiểm kỹ và hardware đang hoạt động. Ghi nhận `HARDWARE_WORKING_OWNER_CONFIRMED`; không coi board/cảm biến là đang lỗi. Các capture lỗi dưới đây là lịch sử tại thời điểm agent đọc, không phải chẩn đoán hiện tại. Agent chưa xác minh đầy đủ đường board → Web Serial → Dashboard và reconnect thật. Không yêu cầu kiểm lại hardware, flash hoặc đổi driver để tiếp tục. Không chạy thêm kiểm thử trong lần cập nhật tài liệu này.

Status hiện tại: `SPRINT_3A_PARTIAL_INTEGRATION_UNVERIFIED`. Hardware hoạt động theo owner xác nhận; chưa gọi Dashboard hardware end-to-end PASS.

## Đã triển khai

- HardwareProvider/Web Serial cũ là nguồn duy nhất. Dashboard có kết nối qua chooser do người dùng cấp quyền, chọn baud rõ ràng, 8N1/no flow control; không gửi lệnh, không auto-connect cổng mới.
- NDJSON decoder và bench text v1 adapter dùng chung provider. Chỉ lấy air °C, RH và raw ADC; không dùng % đất chưa hiệu chuẩn. Boot/error logs hiển thị riêng, không bị dùng làm số đo.
- Runtime provenance REAL_USB / REPLAY / SYNTHETIC; nhận UTC trên máy, giữ giờ thiết bị chưa xác minh; freshness 30s, invalid/duplicate counter, waiting/live/stale/lost/reconnect-required states. Không có số đo thì giữ trống.
- Probe A/B phân nhóm channel, hiển thị provenance, QA, timestamp, calibration và lịch sử Hardware. Một host-assigned device khi text firmware không có device ID; không bịa hai board, không sao chép số đo giữa kênh. Vị trí map luôn minh họa.
- H1 alias adapter allowlist, giữ replay marker. Chặn USB clock chưa xác minh trước H1, không âm thầm chuyển host receipt time thành measurement UTC. Không đổi backend/K1/A1.
- NASA lịch sử lọc theo tháng vụ dùng categorical month comparison có nhãn năm và nhiệt độ dạng điểm; không nối Jan/Feb/Dec thành đường liên tục. Chuỗi lịch sử đầy đủ vẫn dùng chart hiện có. FieldShift V2 của Việt giữ provider/adapter, cutoff, target months, units, uncertainty, RESEARCH_ONLY; không nội suy 01/2027.
- Giữ Explore 60/40, Compare-first, map thật/attribution/fallback/recovery, điều kiện, R0/R1/R2 và lưu/mở draft. Không tạo concept, thư viện, pipeline hay model mới.

## Diff của sprint (ngoài WIP trước đó)

`frontend/src/features/hardware/{model.ts,state.tsx,Pipeline.tsx,Hardware.tsx}`; `frontend/src/features/dashboard/{SensorStrip.tsx,ClimateContext.tsx,desktop.css}`; `frontend/src/shared/charts/Climate.tsx`; tests `telemetry-sprint3a.test.ts`, `e2e/sprint3a.spec.ts`; báo cáo và evidence trong thư mục sprint3a. SpatialMap chỉ chỉnh propagation/focus/aria của marker, không thay geometry/tỷ lệ.

Working tree vốn đã có nhiều WIP/untracked của các sprint trước; `git diff` so HEAD không phải toàn bộ diff của Sprint 3A. Không reset/clean/restore/switch/commit/push/merge/deploy. Branch `research/post-review-inference`, HEAD `3a78edc2b3fde23850c6b9ca3f5584020f99d2a7`.

## Runtime / nguồn thực

Windows native; Node 24.22.1; existing package-lock/node_modules; npm không trên PATH. UI5174 PID53036, A18000 PID4616, V28182 PID64196 được giữ nguyên. A1/V2 schemas không gộp. Không retrain, không đổi artifacts/inference. V2 khí hậu precomputed không thành inference mới mỗi lần đổi điều kiện.

## Blocker trước NASA demo final

1. Hardware đang hoạt động theo xác nhận mới nhất của Hưng. Phần còn chưa được agent xác minh là ít nhất một measurement thật lên Dashboard qua quyền Web Serial, đúng channel và freshness. Không coi các boot log cũ là lỗi hardware hiện tại.
2. Chưa xác minh sensor pinout, calibration, cadence đo thực tế, device clock/ID của firmware đang chạy. NDJSON source ở checkout khác không phải bằng chứng code đã flash.
3. H1 realtime ingest bị chặn với USB clock chưa xác minh. Cần contract UTC/host receipt được phê duyệt trước khi mở boundary này; không sửa gate để làm demo trông thành công.
4. Full browser suite có legacy selectors không còn khớp Farmer UI; xem verification cho kết quả từng run và lỗi còn lại. Không coi targeted PASS là full suite PASS.
5. Không có field user test, đo ngoài ruộng hay scientific approval mới.

Dừng sau Sprint 3A để owner nghiệm thu.

## Polish cuối sau full-suite run

Probe panel chuyển thành vùng evidence cuộn, cao tối đa 440px trong cột phải; không tăng chiều cao map khi chọn A/B. Có Close/Escape và trả focus về marker; marker không bị xóa/tạo lại chỉ vì đổi selection. Click probe ngừng bubble vào AOI inspector. Tắt chart entrance animation để screenshot không chụp đường đang vẽ dở và tôn trọng nhu cầu giảm motion. Event identity namespace theo device; JSON payload không tự gán provenance nhận trên host. Null vẫn không thành số đo. Các sửa này có lượt regression riêng, không sửa kết quả full70 đã ghi trước đó.


