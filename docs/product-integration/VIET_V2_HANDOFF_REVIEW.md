# Kiểm tra bàn giao DATA/UI snapshot v2 của Việt

Kiểm ngày 15/11/2026 trên HEI-LAPTOP. Tài liệu này bổ sung trạng thái kỹ thuật cho [DASHBOARD_SPEC.md](DASHBOARD_SPEC.md); không thay quyết định sản phẩm của owner.

## 1. Nguồn đã pin và cách kiểm

- Repository: `NeuraX-Lab/neurax-fieldshift-lab`.
- Nhánh: `data/v2-hung-handoff`.
- Commit đã fetch: **`02e3de3f0ac2883f29e19183524c4c767de7c5b8`**. Các nhận xét dưới đây chỉ áp dụng snapshot này; nhánh có thể được cập nhật sau.
- Gói: [`handoffs/v2-data-hung`](https://github.com/NeuraX-Lab/neurax-fieldshift-lab/tree/02e3de3f0ac2883f29e19183524c4c767de7c5b8/handoffs/v2-data-hung), version `v2-frozen-hung-1`.
- Chỉ fetch và xuất snapshot riêng, không switch/merge vào lab hoặc product đang có WIP. Không sửa bundle gốc, không cài dependency, train hoặc chạy thêm dịch vụ.
- Đã đọc script `scripts/verify_v2_handoff.py` trước khi chạy. Kết quả: **PASS 27 file theo SHA256**, 514 hàng tháng, schema snapshot v2.
- Kiểm bổ sung độc lập bằng Python standard library: byte sizes, hash, lịch tháng liên tục/duy nhất/đúng thứ tự, missing từng cột, sáu forecast, trạng thái empty farm và không có joblib trong bundle.
- [Báo cáo máy đọc được](evidence/viet-v2-data-review.json). SHA hợp lệ chứng minh khớp gói được gửi, không tự chứng minh đúng dữ liệu nguồn hoặc hiệu quả nông học.

Chạy lại kiểm gói, từ product checkout (không cần ML dependency):

```powershell
& '../neurax-fieldshift-lab/.venv/Scripts/python.exe' `
  'docs/product-integration/evidence/review_viet_v2_data.py' `
  --bundle 'C:/Users/ghcoo/.codex/project-memory/agrotwin-product-integration-2026-11-15/viet-v2-data-02e3de3/handoffs/v2-data-hung' `
  --out 'docs/product-integration/evidence/viet-v2-data-review.json'
```

Khi giải nén ZIP bàn giao, bundle nằm tại `inputs/viet-v2-data/handoffs/v2-data-hung`; đổi `--bundle` theo nơi giải nén. Script chỉ đọc gói, xuất báo cáo riêng; không inference hoặc sửa dữ liệu.

## 2. Đã nhận được gì?

| Thành phần | Kết quả kiểm / ý nghĩa |
|---|---|
| `files/data/processed/v2/monthly.csv` | 514 tháng liên tục từ 1984-01 đến 2026-10; rain, nhiệt, Tmin/Tmax, RH và hai cột SMAP |
| Missing trong monthly | Rain/nhiệt/Tmin/Tmax/RH không có ô rỗng; SFMC và RZMC mỗi cột thiếu 386/514 tháng; không điền thành 0 |
| `daily.csv`, `coverage.csv`, manifest nguồn | Có, hash/size khớp; nguồn POWER chuẩn hóa theo tài liệu Việt. Chưa kiểm lại từng raw request với NASA trong lượt này |
| LOCAL và environment v1 | Bảng đất, trạm, lịch/rule candidates, rotation references, source audit và gap ledger; giữ scope/phương pháp/trạng thái duyệt |
| `overview.json` | `schema_version=fieldshift-2`, `run_id=v2-fda23ae4041a`, `region_id=MT-BLOCK-01`, dữ liệu đến tháng 10/2026; **24** tháng gần nhất trong `months`, không phải toàn bộ 514 hàng |
| Sáu forecast trong overview | Rain/nhiệt/RH × h1/h3, có giá trị/range/method/cutoff/coverage; là kết quả đã lưu, không phải inference vừa chạy trên máy Hưng |
| `analyze-empty-farm.json` | Response thật cho farm rỗng; `status=research_only`, cả R0/R1/R2 `needs_information`; rank/score/probability null, `domain_approved=false`, `rag=null` |
| `corpus-frozen.json`, `rag-index.json` | Corpus/card/index có nguồn để tra cứu; không phải raw PDF hoặc model LLM. Snapshot empty farm không chứa câu trả lời cho một câu hỏi mới |

Không có field outcome labels, sensor logs hoặc phép đo ruộng trong gói. Dữ liệu trạm nơi khác, SoilGrids và bảng vùng không được đổi nhãn thành đo tại thửa.

## 3. Chưa nhận được gì trong gói này?

**Đây là gói DATA + UI snapshot, không phải full backend/inference package.** README Việt ghi rõ và inventory phù hợp:

- Không có `model.joblib` (đếm trong bundle: 0), không có toàn bộ training/refit artifacts.
- Không có đầy đủ raw/local/satellite/PDF cache mà runtime v2 phụ thuộc.
- Thiếu các run dependencies như `rag-selection-frozen.json`, `rag-final.json`, `evaluation.json` ở đúng `runs/v2/` để dựng `Engine()` từ bundle đơn lẻ. Một số nội dung tương ứng có trong overview không có nghĩa runtime tự đọc được chúng.
- Bốn image routes trong `scripts/v2_api.py` trỏ các PNG dưới `runs/satellite-context-2026-11-14/`; các asset đó không nằm trong bundle này. Overview không thay thế ảnh nền vệ tinh tương tác của product.

Các báo cáo Việt ghi đã chạy pipeline, 16 tests/68 checks và live UI tại máy Việt. Đây là kết quả **Việt báo cáo**. Lượt này chỉ tự kiểm gói và đọc code, chưa tái chạy training/inference/full API/QA UI/bo mạch tại máy Hưng.

Đủ để triển khai phần đọc dữ liệu và trình bày snapshot trung thực; chưa đủ để tuyên bố đã nối live v2 hoặc phân tích lại mọi input. Không train lại chỉ để thiết kế UI.

## 4. Forecast phải được hiển thị đúng nghĩa

Horizon v2 là khoảng đến **tháng đích**, không phải tổng ba tháng. Code chừa một tháng buffer dữ liệu. Dữ liệu cuối 10/2026; h1 trong snapshot nhắm 12/2026, h3 nhắm 02/2027. Hiển thị tháng đích và cutoff trực tiếp, không tự dịch h1 thành tháng kế tiếp sau dòng dữ liệu cuối.

| Đại lượng | Đích h1: 12/2026 | Đích h3: 02/2027 | Đơn vị |
|---|---:|---:|---|
| Mưa | 24,95 | 20,64 | mm/tháng |
| Nhiệt độ trung bình | 26,30 | 28,38 | °C |
| RH trung bình | 81,94 | 63,02 | %RH |

Số trên là làm tròn từ snapshot, không hardcode thành kết quả live. UI đọc `forecasts[]`, `method`, `target_month`, `data_through`, `feature_data_cutoff`, `lower/upper`, `backtest_coverage`. Tên phương pháp là `method`, không phải `model`. Parse timestamp theo offset thực; không suy UTC chỉ từ suffix tên field.

- Mưa h1 và nhiệt h3 giữ climatology/baseline; không nói tất cả đầu ra là ML cải thiện baseline.
- Theo báo cáo Việt, RH kém baseline; cải thiện điểm số của mưa h3/nhiệt h1 chưa có bằng chứng ưu thế thống kê chắc chắn.
- Dải danh nghĩa 80% có coverage test khoảng 63,9–72,2%, thiếu độ phủ. Nếu hiện dải, ghi “Dải tham khảo · chưa hiệu chuẩn đủ”; không trình bày như bảo đảm 80%.
- Target là khí hậu lưới theo tháng. Không dùng cho lịch tưới hàng ngày, ngày gieo an toàn hoặc dự báo năng suất.
- Tab kiểm chứng có thể mở thêm; không đặt sáu benchmark cards lên đầu màn Farmer.

## 5. Contract/API v2 và điểm khác A1 hiện có

Code đã đọc: `scripts/v2_api.py`, `scripts/v2_runtime.py` tại commit pin.

| Route v2 | Ý nghĩa |
|---|---|
| GET `/api/v2/status` | Local research, pilot một điểm chưa xác minh |
| GET `/api/v2/overview` | `fieldshift-2`: months, forecasts, context, evaluation, qa, rules |
| POST `/api/v2/analyze` | `{region_id, farm, question?}` → `decision.options`, forecasts, rag hoặc null |
| GET `/api/v2/images/{name}` | Asset thật nếu tồn tại; không suy rằng bundle đã có asset |
| GET `/api/v2/plots/{target}/{horizon}` | Plot kiểm chứng khi có run files |

**Không đưa response này vào `RunSchema` A1 cũ.** Product hiện dùng `0.1-proposal`, `a1.forecast=null` và run ID `a1-…`; v2 dùng schema/run ID khác. Cần schema/adapter/provider có phiên bản riêng, validation và error state. Không sửa `forecast:null` thành `unknown`/`any` để bỏ qua bất tương thích.

### Request v2 thực nhận

| Trường | Giá trị/cách xử lý |
|---|---|
| `region_id` | Chỉ literal `MT-BLOCK-01`. Không có geometry request cho thửa tùy ý |
| `farm.current_crop` | rice / baby_corn / mungbean / other / unknown |
| `farm.goal` | explore / water / soil / yield. **Không có income**; không âm thầm đổi thu nhập thành năng suất |
| `farm.irrigation` | available / limited / none / unknown; product cũ gọi `irrigation_access` và dùng unavailable/null |
| `farm.drainage` | good / poor / unknown; product cũ gọi `drainage_condition` |
| `farm.window_start/end` | Ngày; end phải sau start khi có cả hai |
| `farm.soil_ph`, `ph_method`, `soil_measured_at` | pH có giới hạn schema 0–14, phương pháp H2O/KCl, ngày không tương lai; không phải threshold phù hợp cây |
| `farm.saline`, `acid_sulfate` | bool hoặc null; chưa biết không thành false |
| `farm.crop_interests` | Danh sách rice/baby_corn/mungbean; thứ tự hiển thị theo interest không phải benefit rank |
| `farm.conflicts`, `question` | Mâu thuẫn tối đa 10, câu hỏi tối đa 800 ký tự theo schema |

V2 chưa có trường `previous_crop` riêng hoặc `placement_depth_cm` trong Farm, dù missing copy có nhắc cây/vụ trước và độ sâu pH. Không mạo nhận đã thu được các trường này; không gửi extra key vì Pydantic forbids extras. Thông tin bổ sung của UI phải lưu riêng hoặc được mở rộng contract có kiểm.

### Trạng thái phương án

- `blocked`: vướng điều kiện theo logic tham khảo → “Đang vướng điều kiện”; cho xem lý do, không gắn xanh/đề xuất áp dụng.
- `needs_information`: “Cần bổ sung …”; nhóm phần thiếu chung một lần, mở phần riêng từng cây.
- `conditional_reference`: “Tham khảo có điều kiện”, vẫn `domain_approved=false`; không dịch thành phù hợp/được duyệt.
- `goal` đổi `goal_next_action`; order theo crop interests rồi reference, không rank lợi ích nông học. Giữ rank/score/probability null.
- `decision.climate_context` dùng mưa h1 để chuẩn bị kiểm tưới–tiêu, không có phép tính water balance hay eligibility từ ngưỡng mưa.

Đây là các hành vi của code v2 đã đọc, không phải xác nhận nông học độc lập của người review.

## 6. Hai đường tích hợp cho chat remake

### Có thể làm ngay với gói hiện có

Tạo schema/adapter đọc snapshot có phiên bản riêng, giữ nguyên nguồn và timestamp; dùng CSV cho lịch sử khi cần. Chế độ này ghi “Bản kết quả đã lưu”; không giả lập gọi inference. Có thể xây toàn bộ interaction/layout, nhưng sửa input phải đánh dấu stale và chỉ có kết quả mới khi một provider thực hỗ trợ request ấy.

Snapshot empty farm chỉ tương ứng farm rỗng. Không áp nguyên output này cho form đã điền, tạo các output giả để demo hoặc gọi offline snapshot là live. RAG index dùng để tra nguồn có scope, không tự dựng câu trả lời cho câu hỏi mới như đã gọi backend.

### Để chạy phân tích v2 mới

Cần đúng code + dependencies + runtime artifacts/cache tương thích, rồi kiểm status/overview/analyze và case lỗi/unknown/blocked thực. Không copy dependencies vào venv hiện tại một cách mù; requirements v2 pin riêng. Không copy đường `C:\INDIVIDUALS\…` của máy Việt thành đường trên HEI-LAPTOP.

API v2 trên máy Việt dùng 8182, UI 5180. Product hiện dùng API 8000, UI 5174. Middleware v2 hiện không cho Origin 5174, và proxy product hiện bỏ tiền tố `/api` cho **toàn bộ** request. Nếu nối v2 qua proxy, phải định tuyến `/api/v2` riêng và giữ path; giữ v1 hoạt động. CORS/Origin sửa theo lựa chọn tích hợp có kiểm, không mở wildcard để vượt lỗi.

Thửa mới vẫn có thể dùng nguồn/analysis v1 hỗ trợ geometry; v2 pilot chỉ hiện khi đúng phạm vi. Không gắn tọa độ v2 cho polygon vừa vẽ hoặc quảng bá model chạy toàn cầu.

## 7. Kết luận cho việc bàn giao UI

Gói đã giải quyết phần thiếu **DATA xử lý và output snapshot** để thiết kế dựa vào dữ liệu thật. Phần **weights/full inference cache**, satellite assets, kiểm thiết bị thật và phê duyệt nông học vẫn chưa được gói này giải quyết.

[UI_REMAKE_START_HERE.md](UI_REMAKE_START_HERE.md) là điểm vào cho chat mới: đọc mục đích, flow và review này; đến đúng checkout đang có WIP; nhìn giao diện thật trước khi sửa; triển khai một dashboard với trạng thái provider trung thực. Không lấy frontend-v2 của Việt làm chỉ đạo thay product map/hardware bằng ảnh EDA.
