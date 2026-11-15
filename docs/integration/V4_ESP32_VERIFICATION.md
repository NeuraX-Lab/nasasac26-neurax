# AgroTwin V4 / ESP32 — kiểm chứng phiên 15/11/2026

## Phạm vi bằng chứng

Đây là kết quả thực thi mới trên Windows native trong worktree tích hợp, không lấy PASS từ handoff máy Hưng hoặc các báo cáo V4.1 cũ. Baseline Dashboard `208055edfba45dbc292b44c1f8324b07dec2b360`, AI `03ca31a0affaef8f365a687bcf41e780de57f8be`; A1/H1 runtime pin `54bce495514fb3235fe7bd2d0df4ab001f74cca0`. Node24.13.0, Python3.12.7 trong `.venv-geo-eda`, sklearn1.5.1. Dependencies frontend cùng pins có sẵn được dùng qua junction; không tuyên bố clean npm ci.

Thuật ngữ: PASS/FAIL nói kết quả bài kiểm; BLOCKED là thiếu điều kiện thật; NOT_TESTED là chưa chạy. SOFTWARE_VERIFIED không đồng nghĩa PHYSICAL_HARDWARE_VERIFIED. Browser serial harness là SIMULATED_ONLY, dù nó kiểm đúng nhánh code REAL_USB. Bench USB thật vẫn không phải field-calibrated measurement.

## Kết quả đã quan sát

| Phần | Kết quả | Bằng chứng và giới hạn |
|---|---|---|
| Git/worktree | PASS | Hai checkout sạch trước thay đổi, nhánh riêng, SHA gốc đã ghi; không reset/clean/force/merge/deploy |
| V4 backend | PASS / SOFTWARE_VERIFIED | Full86 tests; sáu artifacts đúng SHA; test spy chứng minh12 predict calls qua2 request, run ID khác nhau, selection ID giữ nguyên |
| A1/H1 pin | PASS / SOFTWARE_VERIFIED | HTTP source registry khớp exact pinned resources;16 tests `test_agrotwin.py` + `test_v41.py` chạy mới |
| Frontend unit | PASS / SOFTWARE_VERIFIED | 51/51; bao gồm request mapping, schema/uncertainty/evidence/scientific gates, persistence và telemetry |
| TypeScript/lint/build | PASS | `tsc -b`, ESLint toàn frontend và Vite build; font/worker assets có trong dist |
| E2E V4 mới | PASS / SOFTWARE_VERIFIED | 5/5: fresh inference, NASA/map, citations/abstention, R0/R1/R2, save/reopen0POST, outage/schema, race, mobileEN/VI/axe |
| Desktop/Sprint3A hiện hành | PASS / SOFTWARE_VERIFIED | 16/16 sau port đúng provider V4; không skip; giữ map60/40/compare-first/probeA/B/fallback/offline/retry và H1 clock gate |
| Lượt E2E cuối gồm39 case hiện hành | PASS / SOFTWARE_VERIFIED | 39/39,0fail,0skip,0flaky,8phút; `frontend/artifacts/v4-integration/final-supported-e2e.json`. Sau thay đổi cuối về identity startup, smoke5/5 qua lại từ Test launcher |
| USB native thật | PASS / PHYSICAL_HARDWARE_VERIFIED | CH343COM3,115200, firmwareESP32-S3/GY-21; log native có temp/RH/ADC; không flash |
| USB→HardwareProvider→Dashboard | PASS / PHYSICAL_HARDWARE_VERIFIED | User tự grant Web Serial; nhiều snapshot Playwright thấy số đo đổi và VID1A86/PID55D3; probe detail REAL_USB/QAunverified/host_received |
| Rút/cắm USB thật | PASS / OWNER_CONFIRMED + live observed after reconnect | User xác nhận ngắt/kết nối lại đúng; agent chụp live sau đó, không trực tiếp chụp thời khắc unplug |
| Trạng thái wait/stale/invalid/lost/reconnect | PASS / SIMULATED_ONLY cho lỗi chủ động | SuiteSprint3A harness kiểm chunk/text/zero/null/invalid/30s stale/unplug/reconnect; không dùng chúng thay bằng chứng USB thật |
| Save/reopen trên browser có USB thật trước reload | PASS | Run `v4-1ca3ec270bc841ee8978d80cbbcb6d99`, input/hash giữ nguyên;0POST lúc reload/mở lại; sensor trở lại disconnected đúng, không phục hồi số cũ như live |
| Launcher Stop/Start/reuse/Test | PASS / SOFTWARE_VERIFIED | Stop V4 không đổi PID A1/UI tái sử dụng; full-owned stop giải phóng3 cổng; Start mặc định tự tạo A1 worktree; Start lại giữ3 owned roles, không duplicate. Test chạy sáu HTTP routes và smoke5case, receipt vật lý hợp lệ → READY |
| Pinout/calibration/device measurement clock | NOT_TESTED | Firmware text không cung cấp measurement UTC/ID; ADC không thành% nước |
| Vị trí sensor ngoài đồng | NOT_TESTED | A/B là minh họa; không chứng nhận deployment |
| Domain approval/rank/năng suất/lợi nhuận/nước | BLOCKED | Không có phê duyệt hoặc field outcome evidence; UI giữ null/needs_information/blocked |
| Full historical76 E2E | NOT_TESTED ở phiên bản tích hợp cuối | Inventory CLI xác nhận76case/16files. 39case hiện hành được chọn rõ;37case khác còn routes/selector Planner/Power/research cũ và chưa được kiểm cuối phiên. Không tuyên bố full suite PASS hoặc xóa/skip chúng |

## Lệnh tái kiểm

Từ backend selected V4:

```powershell
./.venv-geo-eda/Scripts/python.exe -m pytest -q
```

Từ frontend:

```powershell
./Start-AgroTwin.ps1 -NoBrowser
node node_modules/typescript/bin/tsc -b
node node_modules/eslint/bin/eslint.js .
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
./Test-AgroTwinV4.ps1
# Receipt vật lý phiên này, chỉ dùng trong24h và phải đọc giới hạn của nó:
./Test-AgroTwinV4.ps1 -HardwareEvidence ../docs/integration/evidence/physical-hardware.json
```

39 case hiện hành:

```powershell
node node_modules/@playwright/test/cli.js test tests/e2e/dashboard.spec.ts tests/e2e/dashboard-model.spec.ts tests/e2e/live-provider.spec.ts tests/e2e/live-v4.spec.ts tests/e2e/sprint3a.spec.ts tests/e2e/desktop-hardening.spec.ts tests/e2e/desktop-sprint1.spec.ts tests/e2e/farmer-sprint2.spec.ts tests/e2e/farmer-sprint21.spec.ts --trace on
```

Config chọn Edge đã cài nếu browser bundle thiếu đúng revision; không thay Windows security policy. Trace của cả lượt thành công được giữ khi dùng `--trace on`. Bản build/browser test không chạy đồng thời với sửa app.

## Lỗi tìm được và đã xử lý

- `.venv` cũ import pydantic_core lỗi; không dùng nó hoặc sửa system env. Venv3.12.7 hiện hữu load đúng modelpins.
- Font403 do dependency junction qua worktree: allow đúng realpath, giữ fontBeVietnamPro; baseline screenshot ban đầu phản ánh lỗi môi trường này.
- Bundled Chromium revision1254 chưa có: lượt đầu5FAIL trước khi mở browser; chuyển cấu hình sang Edge sẵn có,5/5qua. Không bỏ acceptance nào.
- Preflight PowerShell5 giải mãJSONUTF8 sai khi dùng Invoke-RestMethod cho registry tiếng Việt: helper đọc byteUTF8 trước ConvertFrom-Json.
- Native quote stripping làm Python `-c` lỗi `NameError scripts`: chuyển sang module import không cần quotedpath.
- Lượt regression đầu16case có5PASS/11FAIL: selectorV2 và snapshot-before-inference không còn đúng, cộng tile timeout5s ngắn hơn loading deadline. Đối chiếu source và request mới rồi port; lượt sau16/16.
- Process manifest có wrappervalue/Count trênPowerShell5 sau vòngstop/start: normalize reader, writer flatJSON; ownership được ghi trước khi wait readiness, không ghi đè manifest bằng danh sách chỉ gồm process mới.
- Identity V4 giữ checksum code/API contract tại lúc import/startup; thay file trên đĩa không làm process cũ giả thành code mới. Preflight kiểm đúng loaded hashes.
- Thông báo boot/invalid có thể tràn thẻ sensor khi live: mở chiều cao đúng hàng cho diagnostic, không đổi layout/branding.

Không xóa log lỗi để làm đẹp báo cáo. Các log/trace của lượt lỗi vẫn ở namespace artifacts riêng.

## Bằng chứng bàn giao

- [Receipt physical có hash](evidence/physical-hardware.json), [USB browser1](evidence/physical-browser-1.json), [browser2](evidence/physical-browser-2.json), [sau reconnect](evidence/physical-browser-after-reconnect.json), [provenance đầu đo](evidence/physical-sensor-provenance.json).
- [Trước sửa](evidence/before-desktop.png), [V4 cùng USB thật](evidence/physical-v4-final.png), [desktop sau tích hợp](evidence/after-desktop-observe.png), [mobileVI](evidence/after-mobile-vi.png), [mobileEN](evidence/after-mobile-en.png).
- Logs/traces đầy đủ local: `frontend/artifacts/v4-integration/` và `frontend/artifacts/local-demo-v4/`; không commit rawNASA cache hoặc weights. Báo cáo máy đọc được và readiness cuối được ghi cùng thư mục evidence sau khi hoàn tất lượt cuối.

## Kết luận readiness

Phần cứng bench đã có bằng chứng thật; các giới hạn calibration/location/clock/domain vẫn giữ. Readiness của kịch bản live demo được quyết định bởi `Test-AgroTwinV4.ps1` và kết quả cuối trong `AGROTWIN_V4_DEMO_READINESS.md`, không dựa vào HTTP200 đơn lẻ hoặc báo cáo cũ.
