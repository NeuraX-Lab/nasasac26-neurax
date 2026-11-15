# AgroTwin V4 — xử lý nhanh

| Dấu hiệu | Kiểm tra / cách xử lý |
|---|---|
| Không tìm được lab | Đặt `AGROTWIN_LAB_ROOT` tới checkout backend V4; Start tìm tối đa sáu thư mục cha nếu không khai báo. |
| Thiếu A1/H1 | Start tự tạo worktree tách biệt ở `.agrotwin-runtime/a1` pin `54bce495...`; đây là deterministic A1/H1, không phải nâng AI V5. Không copy đè vào checkout AI. Có thể dùng `AGROTWIN_A1_ROOT` tới checkout đúng pin. |
| Python import lỗi | Đặt `AGROTWIN_PYTHON` tới venv đúng pins. Môi trường `.venv` cũ trên máy có lỗi pydantic_core; phiên này dùng `.venv-geo-eda` Python3.12.7, sklearn1.5.1. Không đổi system Python để lấp lỗi. Venv mới dùng `integration/requirements-dashboard-v4.txt`. |
| Thiếu model/cache | Cần gói `handoffs/selected-v4-runtime` đúng manifest/archive SHA, rồi `scripts/install_selected_v4.py`. Installer từ chối file khác hash; không train hoặc đổi tên V2 weights thành V4. |
| Preflight báo cổng không tương thích | Xem service identity, PID và checkout đang chạy. Chọn đúng checkout hoặc tự dừng service của mình. Launcher không kill service lạ. 8182 không cần cho V4. |
| A1 registry mismatch trên PowerShell5 | Đọc UTF-8 bằng helper của launcher; không so JSON bị giải mã ANSI. Không bỏ kiểm identity. |
| Chạy Start lần hai | Service tương thích được tái sử dụng; manifest ownership cũ được giữ, không tạo process thứ hai. |
| Stop không dừng một PID | PID/creation time/command đã khác hoặc không do launcher quản lý. Đây là chốt an toàn; xem manifest, không dùng taskkill theo cổng. |
| HTTP503 ARTIFACTS_UNAVAILABLE | V4 startup không load được artifact/selection/data đúng SHA. Xem log `v4-*-error.log`, sửa đúng gói rồi restart service sở hữu. |
| HTTP503 INFERENCE_UNAVAILABLE | Output không qua schema/scientific gate. Xem local API log; không tắt validation hoặc dùng snapshot. |
| HTTP422 | Input sai schema, mục tiêu không hỗ trợ, AOI ngoài pilot, ngày đảo hoặc giá trị sai phạm vi. Unknown không cần điền số 0. |
| HTTP403 | Origin không trong allowlist V4. Dùng localhost/127.0.0.1:5174 hoặc khai báo `FIELDSHIFT_DASHBOARD_ORIGINS` rõ và restart; không giả mạo Origin để vượt gate. |
| V4 forecast không hiện trước phân tích | Hành vi đúng: chọn điều kiện, bấm “Xem so sánh”. Không tự dùng snapshot V2 ở tab V4. |
| Chọn vụ không có forecast | V4 hiện có 12/2026 và02/2027 từ cutoff10/2026. Không nội suy01/2027 hoặc mượn tháng khác. |
| RAG không có citation | Nếu insufficient_evidence là kết quả hợp lệ, giải thích giới hạn. Dùng `T2M là gì?` cho ví dụ có căn cứ; không bypass evidence gate. |
| Input đã đổi, save bị khóa | Chạy cập nhật theo input mới. Response trễ bị hủy; không dùng run cũ cho ranh/điều kiện mới. |
| Lưu báo lỗi | localStorage có thể bị chặn/hết quota. Chỉ có bản mới khi write và readback đều hợp lệ. Không hứa account sync. |
| Thiếu Chromium headless đúng revision | Playwright config dùng Edge đã cài nếu có. Có thể đặt `PLAYWRIGHT_CHANNEL=msedge` hoặc `chrome`; nếu dùng Chromium bundled thì cài đúng browser bằng CLI Playwright của repo. Không đổi Windows security policy. |
| Vite403 font khi dùng junction node_modules | Cấu hình đã allow đúng realpath của dependency junction; không mở toàn ổ đĩa. npm ci riêng trong worktree cũng dùng được. |
| Không thấy COM5 | Cổng thay đổi theo máy. Phiên kiểm này là CH343 COM3, VID1A86/PID55D3. Preflight liệt kê cổng/PnP, không mặc định COM5. |
| Cổng USB busy | Đóng Serial Monitor/tool native đang giữ cổng; chọn lại trên Dashboard. Native capture phải đóng cổng trước Web Serial. |
| Có kết nối nhưng chờ dữ liệu | Kiểm baud115200 và firmware đang xuất NDJSON hoặc bench text hỗ trợ. Boot/error lines là diagnostic; không tự biến số trong log thành measurement. |
| Invalid packet sau reset | Một dòng boot hỏng/partial có thể bị reject; số đo hợp lệ kế tiếp vẫn cập nhật. Mở diagnostic để xem, không biến NaN thành0. |
| USB rút ra | Giữ số cuối có giờ/nhãn cũ, trạng thái mất kết nối; cắm lại và user chọn cổng. Reload không phục hồi quyền mở cổng tự động. |
| Raw ADC có % firmware bên cạnh | Parser bỏ % đất chưa calibration và chỉ hiển thị ADC. Không suy ra đất khô/ướt hoặc điều khiển tưới. |
| H1 sync chặn bench text | Hành vi đúng: timestamp là giờ máy nhận, device clock chưa xác minh. Hardware vẫn hiển thị, sensor chưa đủ hợp đồng để nhập vào AI/crop evaluation. |
| Tile mất mạng/terrain không có dữ liệu | Giữ ranh và nguồn; reset góc nhìn/tắt lớp terrain trong “Lớp”, dùng retry. Không gắn ảnh nơi khác hoặc ảnh tạo sinh. Ảnh nền mặc định là Esri tự nhiên2D; terrain là tùy chọn. |

Logs chính: `frontend/artifacts/local-demo-v4/` (preflight/context/owned-processes/API receipt/readiness/browser report/traces). Bằng chứng tích hợp mở rộng ở `frontend/artifacts/v4-integration/`. Traces/log sinh ra không tự commit toàn bộ; báo cáo verification ghi đường dẫn và hash của bằng chứng bàn giao có chọn lọc.
