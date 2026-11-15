# AgroTwin dashboard remake — bàn giao 15/11/2026

## Đã tích hợp v2 vào product — 15/11/2026

Dashboard hiện có gọi thật `/api/v2/analyze` qua Vite proxy riêng tới localhost8182; A1 vẫn qua8000, không ép response khác schema vào A1. Runtime pin cc674716 nằm ở sibling `fieldshift-v2-runtime-cc674716`, code/config02e3de3. Các ghi chú “chưa chuyển dashboard” bên dưới là lịch sử đã được thay bởi mục này.

Luồng: sửa khoảng tháng/cây/tưới–tiêu/ưu tiên → Xem so sánh → A1 nguồn lịch sử + v2 request được adapter xác thực → trạng thái từng R0/R1/R2, forecast đúng tháng đích → hỏi tài liệu/RAG có citation → chọn nháp → lưu/mở lại. `poor` drainage thực sự trả blocked cho R1/R2; sửa good rồi cập nhật trả needs_information. Chọn nháp không phê duyệt phương án blocked hoặc chứng nhận suitability.

`v2.ts` tách FarmV2/AnalysisV2/V2Record và request lifecycle. Chỉ gửi trường được contract hỗ trợ; mung_bean→mungbean, unavailable→none, tháng kết thúc chuyển thành ngày cuối tháng. Income không đổi thành yield: UI ghi chỉ đối chiếu A1 cho mục tiêu đó. Previous crop/ghi chú/depth không gửi ngầm. Trước khi gửi xác thực geometry bằng ranh pilot đã kiểm; vùng khác giữ nguồn A1, không gửi MT-BLOCK-01 thay thế. Responses phải echo đúng farm/goal và giữ null score/rank/probability, domain_approved=false.

API v2 dùng forecast đã tính sẵn trong Engine; nút so sánh phân tích lại rules và RAG theo input, không mạo nhận predict khí hậu mới mỗi lần đổi farm. Nhãn phân biệt API response, snapshot ban đầu và bản dự kiến đã lưu. Kết quả v2 dùng key input riêng, abort/generation chống race, lỗi không lấy empty-farm/snapshot làm phân tích mới. Lưu v2 request/response/provider/key bên cạnh A1 run; readback kiểm lại schema/echo/input và geometry. Mở lại giữ nguyên câu hỏi/citation, không tự phân tích lại. Forecast khi live không phụ thuộc snapshot tải thành công.

Kiểm lại sau owner revert UI: typecheck/build/full lint PASS; toàn bộ37unit tests PASS; 18browser checks PASS (14 hồi quy +4v2). Case response chậm đã phát hiện tác vụ cũ đóng form sau khi input đổi; đã thêm revision guard để tác vụ hết hiệu lực không đóng form/chuyển focus hoặc khởi chạy bước v2 kế tiếp. Logs mới `frontend/artifacts/remake/v2-resume-{unit,lint,build}.log` và `v2-resume-browser-final.log` (18/18, 1.5m). Lần browser trước đó 17/18, lỗi được giữ trong `v2-resume-browser.log`. Axe desktop/mobile không serious/critical trong trạng thái kiểm. Diff-check PASS. Ảnh UI thật `live-v2-desktop.png`, `live-v2-mobile.png` đã xem lại trên bản hiện tại. Edge connector từng chạy request v2, tra tài liệu, lưu/reload/mở lại; sau đó connector không còn khả dụng, verification tiếp tục bằng Playwright TypeScript hiện có.

Chạy từ frontend: `./Start-AgroTwin.ps1 -NoBrowser` giờ tái sử dụng/khởi động v2 qua `Start-FieldShiftV2.ps1`, không dừng service cũ. V2 dùng Python env riêng và `-X utf8`, localhost8182. PID/ownership ở runtime `api-process.json`; `./Stop-FieldShiftV2.ps1 -WhatIf` đã kiểm đúng launcher PID và child Python. Muốn dừng v2 do launcher quản lý dùng script này bỏ `-WhatIf`; script kiểm command line, creation time và quan hệ cha/con, không stop service khác. Service8182 được giữ chạy để product dùng, A1/UI PID cũ không đổi.

Các hạn chế còn lại: pilot-only, rules chưa domain-approved, không field user test, không board/calibration test mới. Các trường đất nâng cao của v2 chưa có control mới trong form ngắn hiện tại, vì vậy vẫn có trạng thái cần bổ sung. Optional PNG routes chưa có assets; product giữ map tương tác vệ tinh hợp lệ. Full requirements pin psutil vẫn có lỗi compiler đã ghi ở LOCAL_ACCEPTANCE; core runtime đã xác minh suy luận sáu artifact khớp bản lưu.

## Đã nhận và tự chạy core runtime v2 — 15/11/2026

Gói mới `data/v2-runtime-handoff` pin `cc674716fb7cf5ea6a4036c5baf58083202a23c7` đã giải quyết blocker weights/core cache trước đây. Đã kiểm40 artifact hashes + code/config02e3de3 và cài vào sibling riêng `fieldshift-v2-runtime-cc674716`, không đổi WIP/venv/service cũ. Tự load sáu joblib, thực thi forecast từ monthly input: tất cả khớp bản lưu atol1e-9; TestClient và uvicorn HTTP status/overview/analyze pass. Poor drainage chặn R1/R2, scope khác422, RAG có citation. Không train lại; server kiểm8182 đã dừng.

Lưu ý local: full requirements install lỗi psutil5.9.0 cần compiler; core không import nó, đã cài requirements-core-local chỉ bỏ dependency đó, giữ nguyên các pin model. Python3.12.14 khác patch3.12.7 của Việt, parity inference đã kiểm. HTTP phải chạy `python -X utf8 -m uvicorn ...`; thiếu UTF-8 từng gây500 khi đọc JSON tiếng Việt. Xem LOCAL_ACCEPTANCE.md và local-validation.json/http-validation.json trong sibling runtime cho logs/lệnh/giới hạn. Chưa đổi dashboard sang live v2 trong lượt intake này; các đoạn bên dưới về thiếu artifact là lịch sử trước khi nhận gói mới. PNG ảnh/plots vẫn chưa có, không ảnh hưởng core checks này.

## Đính chính sau owner hỏi về AI thực chạy — 15/11/2026

Lượt remake đầu đã làm mất entry point của `ResearchInference` khi redirect Power/planner. Backend nghiên cứu cũ **vẫn có model và runtime hợp lệ**, khác với việc gói **v2** chưa có weights/full cache. Không được diễn giải “v2 chưa live” thành “trên máy chưa có AI chạy được”. Đã gọi mới `/v1/research/inference`: Extra Trees thực thi predict, run `research-a57653e8461f40b697baa9b0e7727003`, temp/1 tháng từ 11/2026, output 26.87123627524425 °C, `RESEARCH_ONLY`, `agronomic_integration_eligible=false`.

Đã khôi phục trong `Kết quả model → Chạy model trên máy`, tách khỏi `Bản lưu v2`; không trộn định nghĩa horizon (model cũ dùng cửa sổ 1/3 tháng, v2 dùng từng tháng đích). Giữ schema cũ, thêm kiểm geometry hash và lưu output/source/run của suy luận vào bản dự kiến; mở lại truy được nguồn, không tự chạy lại. Không chuyển forecast thành suitability/rank. Chạy mới 14 browser checks (12 hiện tại + 2 về model thật, lưu/mở nguồn, mobile, outage và wrong geometry response), cùng 36 unit tests/typecheck/lint. Logs và ảnh có tiền tố `model-restoration` / `after-*-live-research` trong `frontend/artifacts/remake`.

Build/test/a11y pass là bằng chứng kỹ thuật. Chưa có bằng chứng dashboard dễ dùng hoặc giúp nông dân quyết định tốt: phần hỗ trợ còn chiếm diện tích lớn; so lịch vẫn chủ yếu là tham chiếu, chưa có phép nối nông học được duyệt để cá nhân hóa mức phù hợp. Việc sửa regression model không phải nghiệm thu chất lượng sản phẩm.

Đã triển khai trên product checkout `nasasac26-neurax`, branch `research/post-review-inference`, giữ WIP và các service của owner. Không commit/push/deploy, không cài dependency, không train hoặc gọi LLM khác. Đây là kiểm chứng kỹ thuật trên máy, chưa phải nghiệm thu với nông dân ngoài đồng.

## Kết quả đang chạy

Mở `http://127.0.0.1:5174/w/my-thanh/farmer`. Một dashboard: xác nhận thửa/vụ/điều kiện → xem khí hậu đúng phạm vi → so ba timeline cùng tiêu chí → cân nhắc → lưu trên trình duyệt → mở lại. `/plan`, `/plan/:id` và `/w/:id/power` điều hướng về luồng này; `/plan/new` dùng `/setup`. Source planner thử nghiệm được giữ, không còn là entry point cạnh tranh.

- Giữ AgroTwin, Be Vietnam Pro, palette xanh, MapLibre và HardwareProvider. Map vệ tinh màu tự nhiên 2D gọn; có lớp, zoom, mở lớn, focus trap và Escape trả focus. Mobile thu gọn map, có nút xem từng timeline và vẫn vuốt được.
- Form ngắn cho khoảng tháng vụ, cây hiện tại, tưới–tiêu, ưu tiên; cây vụ trước/ghi chú/năm lịch sử/cách lấy nguồn mở thêm. Unknown vẫn là null. Khoảng vụ dùng để đối chiếu tháng, không được biến thành calendar ngày gieo cho cả chuỗi.
- Đối chiếu A1 gọi API thật, kiểm response khớp AOI/geometry/farm/năm, chặn response cũ khi input đổi. Không sửa schema `forecast:null`. Input đổi làm kết quả stale và khóa lưu; selection/cosmetic changes không chạy lại inference.
- Ba timeline từ catalog thực, không có score/rank/winner. Nêu khác biệt tưới–tiêu và giới hạn lịch giống theo trace A1; phần thiếu chung chỉ nói một lần. Căn cứ/QA mở trong cùng kết quả.
- Lưu schema `agrotwin-draft-2` tại `agrotwin-draft-2:<areaId>` trong localStorage. Lưu geometry/input/run/source/mode/lựa chọn/việc cần kiểm/v2 context gốc/thời gian. Chỉ báo thành công sau write + readback validation. Mở lại giữ nguyên run; ranh khác không nhận bản cũ. Không hứa đồng bộ tài khoản hoặc phục hồi Web Serial sau reload.
- Thửa mới vẫn dùng chọn/vẽ/nhập/sửa ranh, thêm hoàn tác và hủy. Request A1 lấy geometry riêng. Catalog/model chưa hỗ trợ thì báo tại phần đó, không mượn R0/R1/R2 hoặc forecast pilot.
- Ba ô sensor dùng observed events của HardwareProvider, phân biệt °C/%RH/ADC; không nhận synthetic như số thật. Chờ khi không có packet; giữ số cuối + giờ/nhãn cũ sau ngắt. A/B minh họa trong ranh liên kết đúng ô; placement ngoài ranh bị loại. Bench/unverified không thành phép đo ruộng; ADC không thành % nước hoặc chỉ thị tưới.

## Provider và nguồn thực dùng

| Phần | Chế độ, phạm vi và giới hạn |
| --- | --- |
| A1 | API hiện có tại 8000 qua `/api/v1/analysis`; `0.1-proposal`, source acquisition và execution mode giữ từ response. Lịch sử theo năm người dùng chọn, lọc tháng tương ứng vụ trong phần trình bày. Quy tắc chưa domain-approved, không suitability/rank. Bản preload có nguồn tại `public/analysis/my-thanh.saved.json`. |
| V2 | API `/api/v2/analyze` thật qua8182, schema riêng `fieldshift-2`, chỉ `MT-BLOCK-01`/ranh pilot đã kiểm. Rules/RAG theo input; sáu forecast precomputed, cutoff10/2026, tháng đích12/2026 và02/2027. Không tổng ba tháng hoặc suy luận khí hậu mới theo lần chỉnh farm. Bản lưu ban đầu và bản mở lại có nhãn riêng; không dùng empty-farm làm kết quả mới. |
| V2 provenance | Commit `02e3de3f0ac2883f29e19183524c4c767de7c5b8`; `overview.json` từ intake → `public/snapshots/v2/overview.json` → build `dist/snapshots/v2/overview.json` cùng SHA256 `aa291206fa83776a4d8eec8ca268e9f4c567df52b17a7e826f54a12bb398e9fe`. Không sửa snapshot gốc. |
| Map | Stream [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9), giữ attribution và link nguồn; metadata chính chủ đã kiểm. Không export/cache tile hoặc đóng gói ảnh chưa có quyền. Không gán ngày chụp/current date cho imagery. Lỗi vệ tinh giữ OSM + ranh; lỗi WebGL có outline và retry. Đây là lựa chọn demo localhost; quyền phân phối/public deployment phải được kiểm riêng khi có yêu cầu phát hành. |
| Sensor | Web Serial của product; kiểm tự động bằng packet harness ghi rõ test bench. Chưa thử board vật lý trong lượt này. Không đưa số đo tức thời vào crop score. |

RH/baseline và dải thiếu coverage có nhãn trong tab model; phương pháp, cutoff, dải tham khảo và coverage mở thêm. Bản lưu khí hậu độc lập với lần đối chiếu A1; input đổi không biến nó thành inference mới.

## Kiểm chứng đã chạy mới

Native Windows / PowerShell, Node 24.22.1, dependencies sẵn có từ `frontend/package.json` và `package-lock.json`. Hai cổng 5174/8000 đang được tái sử dụng, không dừng service của owner. Không dùng Python Playwright hoặc server wrapper. Các lệnh dưới chạy từ `frontend/`:

```powershell
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test tests/e2e/dashboard.spec.ts --reporter=list
```

| Check | Kết quả lượt remake |
| --- | --- |
| TypeScript / production build / full lint | PASS |
| Toàn bộ Vitest | PASS — 8 files, 36 tests |
| Browser regression hiện tại | PASS — 12 tests, 31,5 giây trong lượt cuối |
| Axe desktop/mobile | Không có serious/critical violations trong các trạng thái kiểm |
| Impeccable mechanical detector | `[]` — không có findings trên các target đã đổi |
| `git diff --check` | PASS; chỉ có cảnh báo line ending LF/CRLF của Git |

12 browser cases bao gồm: preload không tự POST; request A1 thật → chọn/lưu/reload/mở lại; geometry/source riêng; API outage/sai scope/cancel response chậm; v2 malformed + tháng ngoài snapshot; ba metric qua USB harness + stale + A/B; mobile keyboard/save/axe; lỗi tile + legacy routes; lỗi persistence; vẽ/hoàn tác/sửa/hủy; fullscreen focus/Escape; mất preload + mất WebGL vẫn chạy A1 được.

Các E2E V4/Power/research/planner cũ được giữ nguyên cùng WIP, có selector cho các màn đã nghỉ; **không chạy hoặc tuyên bố toàn bộ suite lịch sử ấy pass**. Lệnh browser nghiệm thu của remake là `dashboard.spec.ts` ở trên. Không lấy số test của máy Việt hoặc lượt trước làm kết quả mới.

Logs mới: `frontend/artifacts/remake/{build,lint,unit,browser-check}.log`, `design-detector.json`. Screenshots từ UI thật:

- `frontend/artifacts/remake/before-desktop.png`, `before-mobile.png`.
- `frontend/artifacts/remake/after-desktop.png`, `after-mobile.png`, `after-mobile-map.png`.

Ngoài Playwright Chromium, đã thao tác trên Edge browser connector: mở form, đổi điều kiện, chạy A1, chọn/lưu/reload/mở lại, xem model, kiểm desktop/mobile và trả viewport về bình thường. Có một nháp kiểm thử local trong browser, không phải quyết định gieo trồng của owner.

## Code và giới hạn bàn giao

`frontend/src/features/dashboard/` chia form, climate context, sensor strip, comparison và persistence/validation. `Workspace.tsx` dẫn về dashboard; Header/App hợp nhất entry points. Chỉnh có giới hạn trong analysis state/contracts, SpatialMap, Setup và i18n; không thay backend API/dependencies. Bản Workspace trước remake được giữ tại `artifacts/remake-workspace-before.tsx` để đối chiếu WIP.

**Chưa hoàn tất live inference v2:** thiếu weights/joblib/full runtime cache tương thích như intake review đã ghi. Muốn bật cần nhận đúng artifacts + dependencies/code pin rồi kiểm status/overview/analyze, không train lại hoặc bỏ validation để lấp chỗ trống. Nông học/giống/lịch địa phương, calibration và board thật chưa được xác nhận. Khu vực ngoài pilot dùng được phần nguồn hỗ trợ geometry; chưa có catalog nên chưa chọn/lưu một phương án luân canh được backend phát hành cho vùng đó. Chưa có field user test, chưa chứng minh cải thiện năng suất/thu nhập/nước.
