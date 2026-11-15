# Handoff cho Việt — desktop dashboard / demo workflow

15/11/2026. Nhánh `research/post-review-inference`. Đây là toàn bộ WIP frontend qua desktop Sprint1–3A, không phải bản full regression đã nghiệm thu. Owner yêu cầu push để Việt kéo về chỉnh kiến trúc v4 và kiểm workflow demo thật. Không tự chuyển V5.1.

## Bắt đầu

- Đọc PRODUCT.md, docs/product-integration/UI_REMAKE_HANDOFF.md, rồi docs/product-integration/sprint3a/SPRINT_3A_IMPLEMENTATION_REPORT.md và SPRINT_3A_VERIFICATION.md.
- Giữ map-first60/40, Compare-first, ba chế độ, MapLibre/AOI/probeA/B, nguồn AI chính FieldShiftV2 của Việt, A1/V2 schema tách biệt và scientific gates.
- Hardware đang hoạt động theo xác nhận kỹ của Hưng. Boot/error captures của agent là lịch sử, không phải chẩn đoán hiện tại. Chưa được agent xác minh đủ board→WebSerial→Dashboard/reconnect; đừng flash hay audit hardware lại chỉ vì báo cáo cũ.
- NDJSON và text firmware dùng cùng HardwareProvider. Text parser chỉ nhận temperature/RH/rawADC; bỏ %đất chưa hiệu chuẩn, ID/receipt time do host gán có nhãn. H1 chặn clock chưa xác minh; cần review contract khi kiểm demo, không âm thầm đổi giờ nhận thành giờ đo.

## Check đã chạy

Source cuối: typecheck/lint/build PASS, unit41/41. Full browser70 trước polish:33pass37fail; current34 sau polish:33pass1scriptfail do reconnect bị panel mở che, đã sửa script đóng panel. Lượt liên quan cuối riêng: Sprint3A4/4, Hardware3/3, H1synthetic1/1 PASS. Không cộng thành full-suite PASS. Legacy test fixtures/selectors/ngôn ngữ còn cần port và review; xem đủ log, không xóa/skip để làm xanh.

## Runtime

Windows native, Node24.22.1, frontend/package-lock.json. Không chia sẻ node_modules/.venv Windows↔WSL. Máy Hưng giữ UI5174, A18000 và V28182; không start trùng. Máy Việt cần runtime riêng và artifact/model theo handoff V2 đã có; Git pull không tự mang service hoặc model weights ngoài repo sang.

Trong frontend dùng scripts package.json hoặc direct node nếu npm không trên PATH:
`node node_modules/typescript/bin/tsc -b`
`node node_modules/eslint/bin/eslint.js .`
`node node_modules/vite/bin/vite.js build`
`node node_modules/vitest/vitest.mjs run`
`node node_modules/@playwright/test/cli.js test`

## Ưu tiên ít thời gian

1. Kéo nhánh này vào working tree an toàn, giữ WIP riêng của Việt; không reset/force pull.
2. Kiểm demo thật Mỹ Thành→NASA history→điều kiện→V2→R0/R1/R2→save/reopen→map.
3. Owner tự cấp quyền COM trên Chromium, kiểm số thật lên đúng A/B, ngắt thì stale. Không dùng simulator như hardware PASS.
4. Chỉnh kiến trúc v4 trong phạm vi owner giao; giữ source/provenance/scientific boundaries. Không cần redesign mới hay train model để bắt đầu.

Ảnh/log Sprint3A được commit có chủ đích trong frontend/artifacts; traces/cache/build/dependencies vẫn ngoài Git. Báo cáo root artifacts và test-results cũ là evidence lịch sử, không phải lượt PASS mới.
