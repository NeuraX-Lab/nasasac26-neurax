# SPRINT_3A_VERIFICATION

> Cập nhật owner — 15/11/2026: Hưng xác nhận đã kiểm kỹ và hardware đang hoạt động. Ghi nhận `HARDWARE_WORKING_OWNER_CONFIRMED`; không coi board/cảm biến là đang lỗi. Các capture lỗi dưới đây là lịch sử tại thời điểm agent đọc, không phải chẩn đoán hiện tại. Agent chưa xác minh đầy đủ đường board → Web Serial → Dashboard và reconnect thật. Không yêu cầu kiểm lại hardware, flash hoặc đổi driver để tiếp tục. Không chạy thêm kiểm thử trong lần cập nhật tài liệu này.

Kết luận hiện tại: `SPRINT_3A_PARTIAL_INTEGRATION_UNVERIFIED`. Hardware hoạt động theo owner xác nhận; Dashboard end-to-end chưa được agent xác minh đầy đủ. Full browser regression chưa PASS.

## Phân loại evidence

| Hạng mục | Phân loại | Kết quả thực tế |
|---|---|---|
| USB/COM/driver và ROM ESP32-S3 | REAL_HARDWARE_VERIFIED | CH343 COM5, mở được 115200 8N1, ROM esp32s3 |
| Hardware / measurement theo owner | REAL_HARDWARE_VERIFIED (owner-confirmed) | Hưng xác nhận đã kiểm kỹ và đang hoạt động. Agent chưa tái nhận measurement; hai capture cũ không mô tả trạng thái hiện tại |
| Payload số đo trong phản hồi owner | Owner-confirmed; agent NOT_TESTED | Giữ nguồn xác nhận rõ ràng, không đưa số ví dụ vào Dashboard như live |
| Quyền Web Serial trên Edge thật | BLOCKED | Native UI được quan sát: Disconnected, ba ô trống. Không chọn port thay owner |
| Rút/cắm USB/reconnect vật lý | NOT_TESTED | Không giả lập rồi gán hardware PASS |
| Decoder, ranges, host/device clock, source metadata | SOFTWARE_VERIFIED | Unit tests; xem run logs |
| USB wait/live/invalid/stale/lost/reconnect, port failure/reload | SIMULATED_ONLY | navigator.serial/ReadableStream harness, không thiết bị thật |
| Map thật, fallback/retry/offline recovery, AOI, probes | SOFTWARE_VERIFIED | Browser test sử dụng real Esri tiles và browser network emulation; không imagery giả |
| NASA history/V2 scopes/target months/units | SOFTWARE_VERIFIED | Provider/adapter cũ, categorical historical month comparison; forecast không nội suy tháng thiếu |
| Input→API→R0/R1/R2→local save→reload/reopen | SOFTWARE_VERIFIED | Current Dashboard journey, hai desktop sizes |
| Scientific field approval/calibration | NOT_TESTED | Không thay K1/A1 hoặc tạo ranking/khuyến nghị mới |

## Các lượt kiểm riêng, không cộng thành một PASS

1. Trước polish cuối: typecheck/lint/build PASS; unit 41/41; browser mới 3/3 PASS (`frontend/artifacts/sprint3a-targeted.log`).
2. Full suite trước polish cuối: **70 test, 33 pass, 37 fail, 22.0 phút** (`frontend/artifacts/sprint3a-full.log`). Đã chạy hết, không bỏ qua hoặc đổi số FAIL bằng kết quả lượt khác. Shell wrapper ban đầu kết thúc bằng Get-Content nên tool exit code là 0; kết quả Playwright rõ 37 failed, KHÔNG coi shell exit 0 là PASS.
3. Sau polish: typecheck PASS sau sửa TS18048 ở nullable marker ref; lint/build PASS; unit **41/41**. Full logs `sprint3a-{typecheck,lint,build,unit}-final.log`.

4. Current Dashboard sau polish: **34 test, 33 pass, 1 fail, 7.2 phút** (`sprint3a-current-final.log`). Harness USB mở panel rồi bấm reconnect phía sau overlay, bị intercept. Sửa script đóng panel trước thao tác; không dùng force click hoặc tắt pointer events. Hai viewport đã pass map height và keyboard Close/Escape trong chính lượt này.
5. Chạy lại Sprint 3A sau sửa script, có thêm H1 clock-block check: **4/4 PASS, 54.9 giây** (`sprint3a-probes-final.log`). Đây là lượt riêng, không cộng với 33/34 thành một PASS.
6. Hardware regression sau fixture EN rõ ràng: **3/3 PASS, 16.4 giây** (`sprint3a-hardware-final.log`): synthetic recording/session/replay/placement; split-frame USB harness; language/a11y. Mọi packet trong các test này là mô phỏng.
7. H1 synthetic ingest: **1/1 PASS, 2.1 giây** (`sprint3a-h1-final.log`), server history/features vẫn excluded khỏi A1. Không phải real USB ingest.
8. Source cuối: typecheck/lint/build PASS, unit **41/41**; git diff --check PASS. Chưa chạy lại toàn bộ legacy70 sau polish/fixture; không suy full suite xanh từ subset.

## Lỗi full suite đã giữ lại

- analysis.spec.ts 10; app.spec.ts 9; hardware.spec.ts 5; model-program.spec.ts 3; planner.spec.ts 5; research-inference.spec.ts 3; v41.spec.ts 2 = 37 FAIL.
- Quan sát trực tiếp: selector `run-id`, `.farm-inputs`, các nhãn Farmer/Planner/Power cũ không còn hiện hoặc bị chuyển luồng; nhiều test dùng EN trong default VI. Ví dụ hardware test chờ `Connect USB / serial` khi trang là tiếng Việt; language test đổi từ VI sang EN nhưng chờ heading VI.
- Không chứng minh mọi lỗi đều vô hại chỉ từ thống kê. Không sửa production để khôi phục selector cũ, không sửa scientific gate để làm test xanh. Các chức năng hiện tại có bộ regression riêng; các case legacy còn lại cần port fixture/selector theo contract hiện hành và review trước khi dùng làm release gate.
- Trace/error-context cho từng lỗi ở `frontend/artifacts/sprint3a-full-results/`. Danh sách đủ ở cuối full log; không xóa lỗi.

## Tái chạy

Native Windows, cwd `<product>/frontend`, existing node_modules/package-lock. Không npm install/server wrapper/start trùng.

```
node node_modules/typescript/bin/tsc -b
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test --output=artifacts/<unique-run> --reporter=list
```

Các suite dùng một worker, chạy tuần tự; không build/sửa app trong lúc browser chạy. Screenshots successful map chỉ sau `data-basemap-state=ready` và animation frames; fallback screenshots là trường hợp lỗi riêng.


## Screenshots thật đã review

Các ảnh dưới từ browser UI thật, không dùng concept/generated imagery. Observe chờ basemap ready. Hardware trên ảnh là Disconnected/empty, đúng trạng thái đã xác minh; không chèn số owner cung cấp.

- [Quan sát 1440×900](../../../frontend/artifacts/sprint3a/observe-1440.png)
- [Quan sát 1920×1080](../../../frontend/artifacts/sprint3a/observe-1920.png)
- [Probe A 1440](../../../frontend/artifacts/sprint3a/probe-A-1440.png), [Probe B 1440](../../../frontend/artifacts/sprint3a/probe-B-1440.png)
- [Probe A 1920](../../../frontend/artifacts/sprint3a/probe-A-1920.png), [Probe B 1920](../../../frontend/artifacts/sprint3a/probe-B-1920.png)
- [Historical comparison 1920](../../../frontend/artifacts/sprint3a/calendar-history-1920.png): Jan/Feb/Dec 2025 có nhãn năm, temperature points không đường nối.

Đã trực tiếp xem ảnh Observe1440, ProbeB1440/1920 và historical comparison1920. Bộ ảnh còn lại được browser capture ở cùng flow; không tuyên bố user-test ngoài đồng.

## Logs

[Full70](../../../frontend/artifacts/sprint3a-full.log) · [Current34](../../../frontend/artifacts/sprint3a-current-final.log) · [Sprint3A4](../../../frontend/artifacts/sprint3a-probes-final.log) · [Hardware3](../../../frontend/artifacts/sprint3a-hardware-final.log) · [H1 synthetic1](../../../frontend/artifacts/sprint3a-h1-final.log).

Không push/merge/deploy/flash, không thay model/backend/scientific gates. Full acceptance còn thiếu xác minh tích hợp Dashboard/serial permission; không phải kết luận hardware chưa hoạt động. Full legacy regression cũng chưa xanh. Dừng để owner review.

