# Demo FieldShift v2 trong repository UI

Ngày15/11/2026 (giờ Việt Nam). Nhánh `dashboard/fieldshift-v2` từ UI commit728249bf6f92fa64df213c88f1e7539a25ab48bc. Màn hình mới tại **http://127.0.0.1:5179/fieldshift-v2**; trang gốc vẫn ở `/`.

Presentation được nhập từ Lab v2, có attribution tại `frontend/FIELDSHIFT_V2_SOURCE.json`. Không copy dữ liệu/model/backend/metrics của product làm baseline. DATA/AI vẫn thuộc `neurax-fieldshift-lab`; màn hình gọi `/api/v2`, Vite proxy vào API Lab localhost8183. Cached forecast là kết quả mô hình đã train/inference, không train lại mỗi lần click. Form kích hoạt rules và retrieval thật.

## Chạy lại

Terminal ở `C:\INDIVIDUALS\NeuraX\neurax-fieldshift-lab`, dùng branch `fix/ui-v2-origin` (thêm Origin chính xác cho port5179, không thay model/data):

```powershell
.venv-geo-eda/Scripts/python.exe -m uvicorn scripts.v2_api:app --host 127.0.0.1 --port 8183
```

Terminal ở `C:\INDIVIDUALS\NeuraX\references\nasasac26-ui-v5\frontend`:

```powershell
npm.cmd run dev -- --port 5179 --strictPort
```

API cần cache DATA và model v2 thật tại máy. Chi tiết thuộc `neurax-fieldshift-lab/reports/v2/README.md`. Không có backend mới hoặc training trong repo UI.

## Trình diễn

1. Xem Sentinel/MODIS/SMAP lịch sử cùng QA; xem biểu đồ khí hậu POWER.
2. Chọn horizon1/3 tháng, đọc tháng đích, unit, band và cảnh báo.
3. Để input chưa biết rồi Phân tích: hiện các thông tin còn thiếu và câu trả lời đậu xanh có nguồn.
4. Nhập thoát nước kém rồi Phân tích lại: bắp non/đậu xanh bị chặn. Đây là fixture demo, không phải xác nhận ruộng Mỹ Thành thoát kém.
5. Tab Kiểm chứng thể hiện cả cải thiện và giảm chất lượng. Chưa có model năng suất, lợi nhuận hoặc chọn cây tối ưu đã được kiểm chứng.

Build `npm.cmd run build` đạt;16 tests Lab hiện hữu đạt; browser POST qua port5179 thành công, câu trả lời có citation, fixture thoát kém chặn2 phương án, không tràn ngang1440/390px. [Desktop](demo-desktop.png), [mobile](demo-mobile.png). Đã xem ảnh bằng image viewer. Route mới dùng tiếng Việt; toggle ngôn ngữ của shell cũ chưa dịch toàn bộ nội dung mới. Không deploy public, không merge nhánh gốc.
