# AgroTwin V4 — kịch bản live demo 5–10 phút

## Chuẩn bị trước buổi trình bày

Mục tiêu: giúp người xem hiểu cách đối chiếu điều kiện trước khi thay một vụ lúa. Đây là công cụ nghiên cứu hỗ trợ trao đổi, chưa là tư vấn nông học đã được phê duyệt.

Giữ Dashboard trên nhánh `feat/v4-dashboard-esp32-integration`; backend dùng nhánh triển khai `feat/v4-dashboard-api` từ selected V4. Không dùng nhầm các tên “V4/V5” lịch sử của UI/runtime làm phiên bản AI. AI chính là **ML v3 climatology + RAG v4 refined evidence gate + pooled intervals**.

Yêu cầu máy tương thích: Windows/PowerShell, Node 24, Python 3.12 và đúng dependency/model pins. Đặt hai repo gần nhau hoặc khai báo đường dẫn:

```powershell
cd <dashboard>/frontend
$env:AGROTWIN_LAB_ROOT = '<backend-selected-v4>'
# Chỉ cần khi tự chọn runtime A1 đã có; nếu không Start tự tạo worktree đúng SHA.
# $env:AGROTWIN_A1_ROOT = '<a1-runtime>'
# $env:AGROTWIN_PYTHON = '<python-venv>/Scripts/python.exe'
./Start-AgroTwin.ps1
```

Start tái sử dụng service tương thích hoặc mở 8000/A1-H1, 8184/V4 và 5174/Vite. Cổng 8182 được kiểm nhưng không cần chạy V2. Không tắt service lạ để giải phóng cổng. Lần đầu, Start có thể tạo worktree A1 pin `54bce495514fb3235fe7bd2d0df4ab001f74cca0`, cài dependency theo lock/pins nếu chưa có, hoặc cài artifact từ gói V4 đã xác thực. Nếu thiếu gói runtime thì phải cung cấp gói đúng từ AI repo; không có bước train hoặc fake output.

Nếu shell không mở browser được, tự mở **http://127.0.0.1:5174/w/my-thanh/farmer** bằng Chrome/Edge. Không cần sửa code hoặc nhiều terminal. Chạy kiểm chứng trước khi trình bày:

```powershell
./Preflight-AgroTwinV4.ps1
./Test-AgroTwinV4.ps1
# Chỉ khi muốn tham chiếu lại bằng chứng phần cứng mới, trong vòng 24h:
./Test-AgroTwinV4.ps1 -HardwareEvidence ../docs/integration/evidence/physical-hardware.json
```

Báo cáo ở `frontend/artifacts/local-demo-v4/readiness.json`. Mặc định automated test không chứng nhận thiết bị vật lý và trả PARTIAL nếu chưa có receipt phù hợp. READY chỉ áp dụng cho kịch bản demo đã kiểm, không chứng nhận độ chính xác ngoài đồng hoặc toàn bộ suite lịch sử. Khi demo ở máy/ngày khác, xác minh USB lại; đừng dùng receipt cũ.

## Diễn tiến 8 phút

| Thời gian | Thao tác trên Dashboard | Điều giải thích / kiểm tra |
|---|---|---|
| 0:00–0:45 | Mở hồ sơ Mỹ Thành, ở “Quan sát”; chỉ ranh và marker A/B | Case nghiên cứu ≈2 ha, ranh digitized chưa survey; A/B là vị trí minh họa, không xác nhận hai board hay vị trí ngoài ruộng. Bản đồ Esri không phải ảnh NASA. |
| 0:45–1:30 | Xem “Lịch sử”, chart NASA POWER, có thể mở bảng dữ liệu | Lịch sử khí hậu lưới vùng của năm đang chọn, có nguồn/cache và QA. Đây không phải dự báo mới hay số đo tại ruộng; tháng thiếu không thay bằng 0. |
| 1:30–2:15 | “Sửa điều kiện”: Từ 2026-12; Đến 2027-02; cây lúa; nguồn tưới hạn chế; thoát nước kém; ưu tiên nước | Đây là **input mẫu cho demo**, không khẳng định điều kiện thực tế của thửa. Unknown được phép. Mục tiêu thu nhập chưa được V4 hỗ trợ và không đổi thành yield. |
| 2:15–3:15 | Bấm “Xem so sánh”; sau loading, “Quan sát” → “Kết quả model” | Request `/api/v4/analyze` mới, run `v4-*`, model `v3-climatology-rag-v4-pooled`. Dữ liệu cố định đến 10/2026, origin 11/2026, h1 → 12/2026, h3 → 02/2027. Sáu prediction chạy thật; cùng input có thể cho cùng giá trị dù run mới. |
| 3:15–3:50 | Mở “Nguồn, thời điểm & chế độ kết quả” và “Dải tham khảo & phương pháp” | Mỗi tháng đích riêng, không có dự báo 01/2027 và không tổng ba tháng. Nominal 80% không là accuracy/coverage được bảo đảm. Forecast RESEARCH_ONLY, chưa operational-vintage validation. |
| 3:50–4:40 | Ở khối tài liệu bên dưới, nhập `T2M là gì?` → “Tra tài liệu”; mở citation NASA_POWER | RAG trích xuất có ràng buộc, kiểm query support và SHA nguồn, không phải LLM tự do. Thử `What is field EC at this plot?` để thấy từ chối thiếu evidence; không có citation bịa. Hỏi tài liệu cũng tạo run V4 mới. |
| 4:40–5:40 | “So luân canh”; xem R0/R1/R2, mở “Vì sao, cần kiểm gì & nguồn” | Với input thoát nước kém, R1/R2 blocked. R0 vẫn cần thông tin. Đổi thoát nước tốt rồi chạy lại để thấy needs_information; không biến thành “tốt nhất”. Rank/score/probability đều null, domain_approved=false. |
| 5:40–6:50 | “Quan sát” → “Kết nối ESP32-S3” → baud 115200 → “Chọn cổng USB”; tự chọn CH343 đúng cổng máy | Phiên kiểm 15/11 dùng COM3, không cố định COM5. Quan sát nhiệt độ °C, RH %RH, đầu dò ADC thay đổi. Mở đầu đo B/A để xem REAL_USB, giờ máy nhận, QA unverified. ADC không phải % nước; sensor không tự thay kết quả AI. |
| 6:50–7:20 | Nếu phù hợp: rút USB, xem số cũ/ngắt; cắm lại, chọn cổng lại | Không ghi số 0 khi mất kết nối; không tự cấp quyền hoặc reconnect ngầm. Không cần tác động vật lý lên cảm biến để demo; không chạm/chập mạch. |
| 7:20–8:15 | Chọn “Cân nhắc phương án” → “Lưu bản dự kiến”; ghi run ID; reload → “Mở bản đã lưu” | Bản lưu giữ input, ranh, A1 và V4, citations, model hashes/run gốc. Mở lại không POST hoặc inference mới. USB sau reload cần chọn lại; số cũ không được phục hồi như live. Chọn blocked chỉ là nháp để trao đổi. |

Nếu chỉ có 5 phút, rút ngắn phần chart/metadata và không làm thử ngắt cáp trên sân khấu. Nếu có 10 phút, thêm đổi drainage sang good, chạy lại và đối chiếu hai trạng thái; giữ nguồn và các thông tin còn thiếu.

## Khi gặp lỗi

- Mạng mất: các bản NASA đã cache có nguồn vẫn có thể xem; không nói đang tải NASA trực tiếp. Tile bản đồ chưa cache có thể mất, ranh vẫn được giữ và có retry.
- V4 lỗi/thiếu artifact: thông báo lỗi hiện rõ; không có fallback V2. Đừng bấm lưu như một phân tích mới. Dùng Stop/Start để restart đúng launcher-owned V4, hoặc đọc log nếu service đang được chia sẻ.
- USB lỗi: giữ disconnected/stale, kiểm đúng baud/cổng và đóng Serial Monitor đang giữ cổng; tự chọn lại trên browser. Có thể mở Hardware để replay session đã ghi, nhưng phải nói rõ **Phát lại**, không live.
- Không có phần cứng: trình bày phần mềm, ghi PARTIAL cho mục tiêu hardware; không dùng synthetic như số đo thật.

Xem [checklist](AGROTWIN_V4_DEMO_CHECKLIST.md), [troubleshooting](AGROTWIN_V4_TROUBLESHOOTING.md) và [verification](../integration/V4_ESP32_VERIFICATION.md).
