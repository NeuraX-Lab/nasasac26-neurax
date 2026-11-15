# Prompt giao việc remake UI/UX AgroTwin

Dán nội dung dưới đường kẻ vào chat Codex tiếp theo. Mục tiêu là triển khai và kiểm giao diện, không tiếp tục một vòng tìm skill hoặc viết kế hoạch chung.

---

Hãy remake UI/UX dashboard **AgroTwin hiện có** thành web app hỗ trợ nông dân cân nhắc lịch luân canh, dựa trên đặc tả và dữ liệu đã chuẩn bị. Hãy thực hiện công việc lập trình và kiểm chứng trong phạm vi có thể làm; không dừng ở audit, mockup hoặc TODO.

## Đọc đúng ngữ cảnh trước

Điểm bắt đầu tuyệt đối:

`C:/Users/ghcoo/.codex/project-memory/agrotwin-v5/remote-reproduction/nasasac26-neurax/docs/product-integration/UI_REMAKE_START_HERE.md`

Từ đó đọc theo thứ tự `PRODUCT.md`, `DASHBOARD_SPEC.md`, `VIET_V2_HANDOFF_REVIEW.md`, `UI_REMAKE_SKILLS.md` và bài học đối thủ khi cần. Tuân thủ AGENTS áp dụng và runtime skill của máy. Không đọc toàn bộ lịch sử chat/repo hoặc bắt owner giải thích lại dự án.

Product đang chạy nằm ở:

`C:/Users/ghcoo/.codex/project-memory/agrotwin-v5/remote-reproduction/nasasac26-neurax`

Lab/API sibling:

`C:/Users/ghcoo/.codex/project-memory/agrotwin-v5/remote-reproduction/neurax-fieldshift-lab`

Workspace mở ở `Everything/Code/Windows/Organizations/NeuraX` có các checkout khác. Kiểm root/status trước khi sửa, không nhầm với checkout đang chạy. Có WIP/untracked cần giữ; không reset/clean/restore hàng loạt, switch branch hoặc bỏ bản đang làm. Không tạo thêm một app/planner song song để né sửa UI hiện có.

## Sản phẩm phải giúp người dùng làm gì?

Người nông dân cần trả lời: **“Vụ tới giữ lịch hiện tại hay đổi một vụ? Điều kiện ruộng/khí hậu nào liên quan, các phương án khác gì nhau, và cần kiểm gì trước khi chọn?”**

Luồng: chọn/xác nhận thửa và khoảng vụ → dữ liệu đúng phạm vi + điều kiện người dùng → kết quả khí hậu/model và tiêu chí có căn cứ → so timeline cùng tiêu chí → chọn/lưu/mở lại bản dự kiến.

Mỹ Thành là hồ sơ mở sẵn trong demo, không phải giới hạn địa lý của hướng sản phẩm. Chọn/vẽ vùng khác vẫn cần giữ; model/catalog chỉ hỗ trợ pilot thì giới hạn đúng phần ấy. Không gán forecast Mỹ Thành cho vùng mới.

Giữ thương hiệu AgroTwin, font Be Vietnam Pro, palette xanh, ranh và tương tác map hiện có. **Nền mặc định vệ tinh màu tự nhiên** từ nguồn hợp lệ; terrain/NDVI/màu giả là lớp mở thêm. Không dùng ảnh map đỏ mặc định hoặc ảnh imagegen như địa lý thật.

Map gọn có thể mở lớn. So luân canh và việc tiếp theo là trung tâm; chart và sensor hỗ trợ hiểu điều kiện. Không biến màn thành báo cáo nghiên cứu, form dài, bảng QA hoặc một lưới KPI chung.

## Skills phải dùng theo vai trò

- **Impeccable làm chính**, mode Operate: hiểu task, hierarchy, simplify flow và kiểm rendered UI. Brief/flow/identity đã chốt trong spec; không hỏi lại các quyết định ấy hoặc chạy lại ba art directions.
- `ui-ux-pro-max` cho bố cục/form/responsive/a11y; `frontend-design` cho chất lượng thị giác trong identity hiện có, không dùng mô típ landing page.
- `vercel-composition-patterns` và `vercel-react-best-practices` cho component/state/provider và hiệu năng; không overengineer hoặc thay API/hook hàng loạt.
- `emil-design-eng` cho feedback/focus/panel/interaction sau khi flow chạy đúng.
- `web-design-guidelines` và `webapp-testing` cho rà UI và kiểm flow trên browser.

Nạp skill đúng lúc, không đọc toàn bộ thư viện ngay đầu. Hai skill mới đã cài ở `C:/Users/ghcoo/.codex/skills/{vercel-composition-patterns,webapp-testing}`. Dùng browser connector và Playwright TypeScript hiện có; không cài Python Playwright hoặc gọi server wrapper chỉ vì ví dụ trong skill. Giữ service người dùng đang chạy. Không tự spawn subagents hoặc gọi bridge/LLM khác.

## Dữ liệu và model — không được hiểu sai

Đã nhận gói Việt từ `NeuraX-Lab/neurax-fieldshift-lab`, nhánh `data/v2-hung-handoff`, pin `02e3de3f0ac2883f29e19183524c4c767de7c5b8`. Đã kiểm 27 hashes/sizes, 514 tháng 1984-01–2026-10, sáu saved forecasts và empty farm không score/rank.

Gói có **processed DATA + UI snapshots**, **không có weights/joblib/full runtime cache** để tự chạy lại Engine. Các đường dẫn nằm trong intake review. Không train lại để bắt đầu remake.

- V2 `fieldshift-2` khác A1 `0.1-proposal`, nơi `forecast=null`. Dùng schema/adapter/provider versioned; không bỏ validation hoặc ép response v2 vào A1.
- Snapshot hiển thị rõ bản lưu, cutoff, target month và nguồn. Chỉnh input phải stale; không dùng empty-farm JSON làm kết quả mới cho form đã sửa.
- V2 API chỉ nhận `MT-BLOCK-01`, chưa geometry tùy ý. `yield` khác `income`, trường previous crop/depth không có tương đương đầy đủ. Đọc mapping; không gửi extra key hoặc đổi nghĩa âm thầm.
- h1/h3 là tháng đích, snapshot 12/2026 và 02/2027 từ cutoff 10/2026; không phải tổng ba tháng. Giữ cảnh báo RH/baseline và dải thiếu độ phủ ở mức cần thiết, benchmark mở thêm.
- Phương án blocked/needs_information/conditional_reference vẫn chưa domain-approved. Không tạo rank, suitability score, xác suất, năng suất, lợi nhuận hoặc % tiết kiệm nước.
- Tạo một interface hiển thị rõ provider/scope/time/stale/limitations; dùng phần runtime thực có. Nếu thiếu artifact chặn live v2, vẫn hoàn thiện UI/interaction với snapshot trung thực và nguồn A1 hợp lệ, ghi rõ phần chưa chạy; không gọi full inference integration hoàn tất.

## Những flow bắt buộc phải có

Theo chi tiết trong Dashboard spec:

1. **A — hồ sơ có sẵn:** mở Mỹ Thành → xác nhận khoảng vụ/cây/nguồn nước/ưu tiên bằng form ngắn → xem điều kiện liên quan → so ba timeline → chọn/lưu bản dự kiến.
2. **B — thửa khác:** chọn/vẽ/sửa/xác nhận ranh → source theo geometry riêng → đúng trạng thái khi catalog/model chưa hỗ trợ. Không mượn dữ liệu pilot.
3. **C — sensor:** giữ trang Hardware, ba ô nhiệt độ không khí/RH/đầu dò đất; A đất và B không khí trên map liên kết đúng ô. Chưa có packet thì chờ, mất cổng thì số cuối có giờ/nhãn cũ. ADC chưa hiệu chuẩn không thành % nước hoặc chỉ thị cần tưới. Vị trí minh họa/đo tại bàn không thành sensor ngoài ruộng.
4. **D — sửa/lưu/mở lại:** thay input làm kết quả cũ stale, không trộn run; lưu thật có snapshot/input/source/mode và mở lại được, nói rõ local/backend. Không báo đã lưu nếu chưa persistence.

Ba tên cây + câu nhận xét chung chưa đủ. Chỉ ra được một khác biệt có căn cứ hoặc nói rõ chưa đủ dữ liệu phân biệt, rồi cho bước bổ sung cụ thể. Không lặp toàn bộ thiếu hụt ở cả ba thẻ. Chi tiết nguồn/QA mở thêm trong cùng kết quả.

## Cách thực hiện

1. Kiểm đúng checkout/WIP/runtime, đọc code theo map trong Start here. Mở `http://127.0.0.1:5174/w/my-thanh/farmer`, xem DOM và chụp hiện trạng desktop/mobile trước khi edit. Không suy giao diện từ tên file hay ảnh mockup.
2. Ghi một kế hoạch triển khai ngắn theo task và phần code cần đổi, rồi làm ngay. Các quyết định kỹ thuật thông thường/reversible đã được giao; không dừng hỏi xác nhận concept đã chốt.
3. Xây một lát cắt hoàn chỉnh A→D với dữ liệu/provider thật hoặc snapshot có nhãn. Giữ nguồn/khả năng map/hardware; nối các phần hỗ trợ vào cùng tác vụ. Hợp nhất/điều hướng rõ planner thử nghiệm, không để hai dashboard cạnh tranh.
4. Xem lại rendered UI theo lô ở desktop/mobile, sửa hierarchy, khoảng cách, chữ, tương phản, focus và nội dung đang gây quá tải. Không tự thêm thư viện UI/chart/map khi stack hiện có đủ.
5. Kiểm network/adapter/input→output, loading/missing/error/stale và đổi geometry/vụ; chạy typecheck/build/lint/tests phù hợp thay đổi và browser regressions có ý nghĩa. Commands hiện có và tình trạng npm PATH ở Start here. Không dùng số test cũ làm kết quả mới.
6. Lưu checkpoint gọn ở milestone, tiếp tục đến khi phần có thể làm đã hoàn thành. Nếu còn blocker artifact/thiết bị/nông học, ghi đúng phần chức năng bị ảnh hưởng, bằng chứng và thứ cần nhận; vẫn hoàn tất phần độc lập có thể làm.

Không push, deploy public, chi tiền, gửi message cho người khác hoặc làm thay đổi hệ thống chỉ để hoàn thành remake. Nếu cần một phụ thuộc/dịch vụ ngoài phạm vi, tiến hành phần độc lập trước và trình bày rõ hạng mục cần quyết định.

## Điều kiện bàn giao

- Người mới hiểu đang so điều gì, thông tin nào liên quan, các phương án khác ở đâu và bấm gì tiếp; màn không buộc đọc bài nghiên cứu.
- Map tự nhiên nhận diện được thửa, không che phần so. Sensor thật hoặc chờ, không số bịa.
- Có một lượt input→kết quả đúng chế độ/scope→chọn→lưu→mở lại. Thay thửa/vụ không trộn dữ liệu, output stale không thành phân tích mới.
- Đã nhìn và thao tác trên browser ở desktop/mobile, kiểm keyboard/focus và các trạng thái chính. Có ảnh before/after từ UI thật để đối chiếu.
- Báo thay đổi, checks pass/fail, source/provider thực dùng và giới hạn còn lại. Không gọi thành công chỉ vì build pass hoặc screenshot trông đẹp; không tuyên bố đã user-test ngoài đồng nếu chưa làm.

Bắt đầu bằng đọc entrypoint và xem giao diện đang chạy, sau đó triển khai theo đặc tả.
