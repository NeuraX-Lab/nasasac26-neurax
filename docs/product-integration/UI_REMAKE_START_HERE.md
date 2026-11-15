# BẮT ĐẦU Ở ĐÂY — remake UI/UX AgroTwin

**Sau tích hợp 15/11/2026:** xem [bàn giao UI và checks mới](UI_REMAKE_HANDOFF.md). Dashboard gọi API v2 thật ở localhost8182 để đối chiếu rules/RAG theo input; forecast khí hậu được backend tính sẵn. Đã nhận weights/cache và tự kiểm sáu artifact inference. Các mục dưới giữ bối cảnh đầu vào; tình trạng thiếu runtime trước đây đã được thay bởi handoff mới.

Cập nhật 15/11/2026, sau khi owner phản hồi mockup và gửi DATA v2 của Việt. Dùng tài liệu này cho một chat Codex mới trên cùng máy. Không cần đọc toàn bộ lịch sử chat để bắt đầu; kiểm lại trạng thái runtime/code trước khi sửa.

**Đã chuẩn bị skills:** [Bộ skill và phân vai](UI_REMAKE_SKILLS.md). Hai skill mới đã cài: `vercel-composition-patterns`, `webapp-testing`; các skill thiết kế chính đã có. [Prompt triển khai đầy đủ](UI_REMAKE_PROMPT.md) có thể dán vào chat tiếp theo. Không cần tìm/cài skill thêm để bắt đầu.

## 1. Nhiệm vụ sản phẩm, đọc trước mọi công việc code

**Làm rõ và triển khai lại dashboard hiện có để nông dân cân nhắc lịch luân canh cho thửa của họ.** Câu hỏi trung tâm: “Vụ tới giữ lịch hiện tại hay đổi một vụ? Điều kiện nào liên quan, các phương án khác gì nhau, cần kiểm gì trước khi chốt?”

Giữ AgroTwin, font Be Vietnam Pro, palette xanh và tương tác map hiện có. Nền vệ tinh màu tự nhiên mặc định, ranh rõ, map gọn có thể mở rộng. Hai điểm sensor A đất/B không khí; ba số đo thật nhiệt độ không khí/RH/đầu dò đất. Phần so timeline và việc cần làm là trọng tâm.

Owner đã bác hướng ảnh map đỏ màu giả làm mặc định và dashboard chỉ gồm chart + ba thẻ cây với nhận xét chung. **Không coi ảnh mockup trước đây là thiết kế được chốt.** Không tạo thêm một app/planner song song. Dùng một luồng làm việc, ít chữ trên màn; chi tiết bằng chứng mở thêm.

Mỹ Thành là hồ sơ demo mở sẵn, không phải giới hạn địa lý của hướng sản phẩm. Chọn/vẽ vùng khác và lấy dữ liệu đúng geometry là hướng cần giữ; model/catalog hiện tại có phạm vi hẹp thì giới hạn đúng phần đó.

Không cần nền tảng thương mại hoàn chỉnh cho cuộc thi; cần một pipeline thật và phương pháp giúp quyết định. Không tạo sensor số giả, rank cây, % lợi ích hoặc dự báo để lấp màn.

## 2. Thứ tự đọc ngắn

1. Root `PRODUCT.md`: mục đích và ranh giới sản phẩm. Phần cập nhật bàn giao v2 mới nhất ưu tiên hơn tình trạng thiếu data trong ghi chú lịch sử.
2. [DASHBOARD_SPEC.md](DASHBOARD_SPEC.md): **đặc tả chính**, flow A/B/C/D, wireframe, input, metrics, trạng thái, so phương án, lưu và nghiệm thu.
3. [VIET_V2_HANDOFF_REVIEW.md](VIET_V2_HANDOFF_REVIEW.md): gói vừa nhận, contract thực, dữ liệu được dùng, chỗ chưa thể gọi live.
4. [COMPETITOR_TASK_REVIEW.md](COMPETITOR_TASK_REVIEW.md): bài học tác vụ từ OneSoil/EOSDA; không coi là chứng nhận thuật toán của đối thủ.
5. Chỉ đọc các file code liên quan ở mục 5; đối chiếu UI đang chạy. Đọc thêm runbook/contract cũ khi sửa đường tương ứng, không đọc toàn repo trước.

Ưu tiên chỉ đạo: yêu cầu owner mới nhất → đặc tả dashboard và intake v2 đã kiểm → code/contract đang chạy → tài liệu lịch sử. README root và báo cáo V4/V5 có phần cũ; không dùng để đổi lại hướng web app thành báo cáo nghiên cứu. Không suy một yêu cầu trong spec là chức năng đã triển khai.

## 3. Đúng checkout trên HEI-LAPTOP

| Vị trí | Vai trò |
|---|---|
| `C:/Users/ghcoo/.codex/project-memory/agrotwin-v5/remote-reproduction/nasasac26-neurax` | **Product đang được chỉnh và chạy**, docs này nằm trong đây |
| `C:/Users/ghcoo/.codex/project-memory/agrotwin-v5/remote-reproduction/neurax-fieldshift-lab` | Lab/API v1 sibling, có `.venv` riêng |
| `C:/Users/ghcoo/Everything/Code/Windows/Organizations/NeuraX` | Workspace root chứa các checkout khác; không nhầm chúng với checkout đang chạy |
| `C:/Users/ghcoo/.codex/project-memory/agrotwin-product-integration-2026-11-15/viet-v2-data-02e3de3` | Snapshot xuất từ commit v2 để review, **không phải checkout chạy backend đầy đủ** |

Product HEAD tại lần kiểm: `b7db70303b22dd9c2d1ca086f6462901df59405a`, branch `research/post-review-inference`. **Có nhiều thay đổi chưa commit và file untracked**, gồm planner/map/analysis/i18n/tests/docs. Không reset, clean, restore hàng loạt hoặc switch branch để làm sạch. HEAD không chứa toàn bộ công việc hiện có; clone HEAD mới sẽ không có đủ bản đang làm.

Lab đã fetch nhánh DATA mới nhưng không checkout/merge. Nguồn v2 pin `02e3de3f0ac2883f29e19183524c4c767de7c5b8`, không phải mặc định thay baseline đang chạy. `frontend-v2` trong nhánh Việt là triển khai riêng ở Lab, chưa tích hợp ngược product.

Nếu cần sandbox/worktree, theo công cụ và quy định workspace; phải chuyển WIP được chọn một cách có kiểm. Không tạo một bản trắng rồi bỏ mất form, map, hardware hoặc source lineage.

## 4. Môi trường và cách mở hiện trạng

Native Windows/PowerShell. Frontend React/Vite/TypeScript, MapLibre, Recharts, i18n; dependencies trong `frontend/package.json`/`package-lock.json`. Python lab hiện có 3.12.14 `.venv`, không trộn với requirements v2.

Lần kiểm 15/11: Node **24.22.1** có trên PATH, `npm.cmd` **không có trên PATH**. Existing node_modules và dịch vụ đang có; không cài lại chỉ để đọc/chỉnh UI. Đọc skill `hei-dev-workflow` và environment map trước khi chọn interpreter/install/start.

- UI: `http://127.0.0.1:5174/w/my-thanh/farmer`.
- API hiện tại: `127.0.0.1:8000`.
- Cả hai cổng đang lắng nghe lúc bàn giao; kiểm lại trước khi start. Không dừng tiến trình đang có chỉ để tránh xung đột.
- `/plan` và `/plan/:id` là bản thử trước, chưa được owner chấp nhận làm giao diện cuối. Không đổi link chính sang đây rồi coi như hoàn tất remake.

Khi dịch vụ chưa chạy, tại product/frontend có `Start-AgroTwin.ps1 -NoBrowser` để tái sử dụng service tương thích. Đọc script trước khi dùng. Lệnh thủ công tương đương, chạy ở đúng thư mục:

```powershell
# Terminal API: cwd = lab sibling
& '.venv/Scripts/python.exe' -m uvicorn neurax.api:app --host 127.0.0.1 --port 8000

# Terminal UI: cwd = product/frontend, dùng dependencies sẵn có
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort
```

Chỉ localhost. Nếu dùng Start-Process thì `-WindowStyle Hidden`, ghi ownership/logs đúng runbook. Không push/deploy/publish, dùng paid service hoặc thay hệ thống vì mục tiêu remake UI.

## 5. Bản đồ code cần đến

| File/thư mục product | Đọc/sửa khi nào |
|---|---|
| `frontend/src/app/App.tsx` | Routes; dashboard, setup, hardware và planner thử nghiệm |
| `frontend/src/app/layouts/{Workspace,Header}.tsx` | Khung hiện tại, map/inspector/navigation |
| `frontend/src/shared/map/SpatialMap.tsx` | Map/tương tác hiện có; giữ phần hữu ích |
| `frontend/src/shared/map/FieldContextMap.tsx` | Bản thử map context; kiểm trước khi dùng, không thay bằng ảnh giả |
| `frontend/src/features/analysis/{contracts.ts,state.tsx,AnalysisPanel.tsx}` | A1 schema, request/run lifecycle, stale và kết quả hiện tại |
| `frontend/src/features/planner/` | Bản thử trước; tái sử dụng phần đúng nếu có, không lấy làm visual authority |
| `frontend/src/features/hardware/{model.ts,state.tsx,Hardware.tsx}` | Web Serial, event schema, provider và trang thiết bị |
| `frontend/src/styles/index.css`, `frontend/src/i18n/index.ts` | Màu/font/layout/VI–EN; giữ identity |
| `frontend/vite.config.ts` | Proxy hiện bỏ `/api` cho v1, asset allowlist khi build; v2 cần route riêng |
| `frontend/tests/`, `frontend/tests/e2e/` | Hành vi contracts/planner/analysis/hardware và browser regressions |

Nguồn v2 đọc từ pin trong Lab: `scripts/{v2_api,v2_runtime,v2_data,v2_rag}.py`, `requirements-v2.txt`, `handoffs/v2-data-hung/` và `reports/v2/`. Không chạy `run_v2.py` hoặc intake ghi đè UI để bắt đầu remake.

## 6. Dùng gói Việt thế nào cho đúng?

Đã tự kiểm 27 hashes/sizes, 514 tháng liên tục, sáu forecast và empty-farm statuses. Đọc review để có field mapping cụ thể.

- Đã nhận **processed DATA và saved output**. Chưa có joblib/full cache để tái chạy Engine trên máy này từ gói đơn lẻ.
- Snapshot có thể dùng ở chế độ bản lưu đúng scope. Không phát output empty farm như kết quả cho input đã sửa.
- V2 `fieldshift-2` khác A1 `0.1-proposal`; tạo schema/adapter versioned, không truyền thẳng qua A1 hoặc bỏ validation.
- API v2 chỉ nhận `MT-BLOCK-01`, không nhận polygon tùy ý. Giữ khả năng chọn/vẽ của product, giới hạn v2 đúng chỗ.
- V2 `goal=yield` khác `income` của product; không map ngầm. Previous crop/depth chưa có trường tương đương, không giả đã gửi.
- h1/h3 là **tháng đích**, snapshot 12/2026 và 02/2027, cutoff 10/2026. Dải thiếu độ phủ; rank/score/probability null, domain chưa được duyệt.
- Sensor dùng provider của product. Không bỏ trang Thiết bị vì `frontend-v2` của Việt đã bỏ Hardware trong scope riêng của anh ấy.
- Nền map mặc định dùng nguồn vệ tinh tự nhiên hợp lệ; ảnh EDA trong lab là lớp tham khảo, không phải nền tương tác hoặc ảnh hiện tại.

Phần chưa đủ runtime không chặn làm layout/interaction/provider cho snapshot; nhưng không được gọi hoàn tất live integration. Nếu nhận thêm weights/cache sau đó, kiểm phiên bản, paths, dependencies, API và kết quả trước khi bật provider live.

## 7. Cách bắt đầu làm trong chat mới

1. Đọc AGENTS áp dụng, load checkpoint checkout-scoped và các tài liệu theo mục 2. Kiểm git status, đúng checkout và cổng đang chạy; giữ WIP.
2. Dùng Impeccable và hướng Operate để giảm tải tác vụ; xem UI thật trước khi edit. Không áp một template dashboard hoặc thế giới hình ảnh khác. Concept chủ đạo đã có trong đặc tả; chỉ hỏi khi còn lựa chọn sản phẩm thật sự chưa được quyết định.
3. Xác định provider nào đang có: A1 live/cache, v2 snapshot, sensor live/chờ. Chốt view model có scope/time/source/limitations; không trộn response.
4. Triển khai một hành trình hoàn chỉnh theo spec: thửa/vụ → điều kiện → so cùng tiêu chí → chọn/lưu/mở lại. Map/sensor gọn; căn cứ mở thêm. Trạng thái thiếu phải có bước tiếp.
5. Kiểm bằng browser ở desktop/mobile và keyboard; sửa lỗi thấy được; kiểm input→API/adapter→output cho đúng scope và trạng thái.
6. Chạy checks phù hợp các file thay đổi; build/type/lint và regression liên quan. Báo rõ pass/fail và hạn chế, không mượn số test cũ làm chứng nhận mới.

Khi npm không có PATH, có thể gọi công cụ hiện có từ frontend:

```powershell
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test
```

Đây là đường gọi tương đương scripts, cần kiểm dependencies trước; không phải tuyên bố các checks đã chạy/pass trong lượt bàn giao tài liệu. Không chạy bộ test không liên quan chỉ để tạo báo cáo dài.

## 8. Thế nào là hoàn thành remake?

Người mới giải thích được: đang so vụ/lịch nào, điều kiện nào liên quan, phương án khác ở đâu, còn thiếu gì và bước tiếp theo. Có một lượt input→kết quả thực/đúng chế độ→chọn/lưu/mở lại. Đổi thửa/vụ không trộn dữ liệu; sensor có thì thật, không có thì chờ. Map tự nhiên nhận diện được thửa và không chiếm hết màn.

“UI build pass”, “có ba cards” hoặc “ảnh mockup đẹp” riêng lẻ không đáp ứng. Chưa có user test thì báo chưa kiểm hữu ích ngoài đồng. Chưa có full v2 runtime thì bàn giao rõ provider snapshot, không gọi model inference mới.

## 9. Prompt có thể dán vào chat Codex mới

> Hãy đọc `docs/product-integration/UI_REMAKE_START_HERE.md` trong checkout product được chỉ rõ ở file đó, rồi đọc Dashboard spec và review DATA v2 theo thứ tự. Remake UI/UX dashboard AgroTwin hiện có theo flow đã chốt, giữ map/tương tác và Hardware, dùng nền vệ tinh màu tự nhiên. Giữ mọi WIP. Kiểm dữ liệu/provider thực trước khi nối; gói Việt hiện là processed DATA + output snapshot, không có weights/full backend cache. Không tạo app song song hoặc số giả. Triển khai và kiểm một hành trình hoàn chỉnh; ghi đúng phần chưa có runtime/căn cứ, không dừng ở một ảnh hoặc kế hoạch.

Chat Codex trên cùng máy có thể đọc code và các đường dẫn này. **ChatGPT web chỉ nhận vài MD thì đủ hiểu hướng, chưa đủ sửa/chạy repo**; cần cấp source/checkout hoặc công cụ kết nối phù hợp. ZIP bàn giao chứa docs và gói dữ liệu/snapshot để đọc, không thay toàn bộ source code và WIP.
