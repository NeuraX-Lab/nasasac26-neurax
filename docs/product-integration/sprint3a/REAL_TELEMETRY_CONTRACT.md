# REAL_TELEMETRY_CONTRACT

> Cập nhật owner — 15/11/2026: Hưng xác nhận đã kiểm kỹ và hardware đang hoạt động. Ghi nhận `HARDWARE_WORKING_OWNER_CONFIRMED`; không coi board/cảm biến là đang lỗi. Các capture lỗi dưới đây là lịch sử tại thời điểm agent đọc, không phải chẩn đoán hiện tại. Agent chưa xác minh đầy đủ đường board → Web Serial → Dashboard và reconnect thật. Không yêu cầu kiểm lại hardware, flash hoặc đổi driver để tiếp tục. Không chạy thêm kiểm thử trong lần cập nhật tài liệu này.

## Hai định dạng, một HardwareProvider

1. JSON EventSchema hiện có: UTF-8 NDJSON, timestamp_utc có timezone, device_id, event_type, value finite/null, unit, quality, data_mode. Framing hỗ trợ chunk/CRLF/LF, buffer tối đa 65536 ký tự. Boot lines được tách thành diagnostic tối đa 12 dòng, không thành số đo.
2. Bench text v1 (owner supplied): hai regex anchored, không bóc số từ log bất kỳ.
   - `Do am dat: <decimal>% (Raw ADC: <integer>)` → chỉ `raw_adc`/ADC. Phần % đất bị bỏ qua vì chưa có calibration hợp lệ.
   - `Nhiet do KK: <decimal> C | Do am KK: <decimal> %` → `air_temperature`/°C và `air_humidity`/%RH. Cùng một host-assigned device ID `USB-UART-unidentified`, không bịa hai board.

Text v1 không có UTC/ID/sequence. `timestamp_utc` trong envelope tương thích là host receipt time, gắn bắt buộc `timestamp_basis=host_received`, `received_at`, quality unverified, source_context giải thích. Không tuyên bố đây là thời điểm đo. JSON từ USB giữ nguyên timestamp thiết bị, gắn `device_unverified`; không tin metadata transport trong payload.

## Provenance / validation

- Transport ghi `REAL_USB` khi nhận observed qua cổng serial; tên này mô tả đường truyền, KHÔNG chứng nhận sensor/location/calibration. Browser harness có cùng đường xử lý nhưng được phân loại SIMULATED_ONLY trong verification.
- Replay luôn override source_transport=REPLAY và delivery_mode=replay, giữ original data_mode. Synthetic generator ghi SYNTHETIC, simulated; không hiện thành số đo thật trên Farmer.
- RH hợp lệ 0–100; ADC nguyên không âm; nhiệt độ không thấp hơn absolute zero. Không giả định giới hạn cảm biến hoặc 12-bit của firmware chưa xác minh. NaN/Infinity, JSON hỏng, schema thiếu bị từ chối; null giữ trống, zero giữ nguyên.
- Dedup event_id hoặc device/type/device-time/unit/mode. Event cũ không thay latest theo timestamp trong UI; vẫn giữ history. Text không có sequence/clock, không thể chứng minh packet trùng/out-of-order vật lý; không bịa sequence.
- Freshness 30 giây là UI policy, không cadence đã đo. USB unverified clock dùng received_at để xét freshness, hiển thị riêng device clock. Ngắt kết nối giữ số cuối có nhãn cũ; reconnect bằng chooser, không tự mở cổng chưa được cấp quyền.
- A = raw ADC; B = nhiệt độ + RH. Channel identity là event_type; text format không cung cấp hardware channel ID. Map positions luôn minh họa, không phải field deployment.

## H1 boundary

Backend hiện hữu: `/api/v1/h1/ingest`; expected quantities `air_temperature`/°C, `air_humidity`/%RH, `raw_adc`/ADC. Adapter h1Event chuẩn hóa aliases tương đương có unit phù hợp, gửi allowlist schema và giữ delivery_mode; không đổi soil % thành ADC.

Không sửa backend/K1/A1. Event USB có device clock chưa xác minh hoặc chỉ host receipt time bị chặn H1 sync với giải thích, thay vì âm thầm coi receipt UTC là measurement UTC. Existing typed events hợp lệ vẫn dùng pipeline cũ; không dựng pipeline song song. Chưa có consumer sensor→crop evaluator được phê duyệt.

## Những gì chưa được chứng minh

Adapter bench text được unit/browser harness kiểm bằng ví dụ owner cung cấp; chưa nhận measurement thật ở COM5 trong sprint. Baud 115200 đã đọc được application log; sample interval, calibration, checksum/CRC, firmware timestamps và device identity payload chưa xác minh. Cần capture thật và Web Serial permission trước khi gọi full end-to-end PASS.

