# Khảo sát tác vụ trên Edge — 15/11/2026

Owner đã mở và đăng nhập hai website, yêu cầu kiểm tra trực tiếp. Chỉ đọc và thử bản nháp chưa lưu; không tạo thửa, phân bổ cây, mua gói hay gửi liên hệ. Không thay đổi code trong lượt khảo sát này.

## Phạm vi thực thấy

1. OneSoil Yield, thửa được chính UI gắn Demo: Status có tên/diện tích/thông tin cây, hành động thêm cây/ngày gieo; ảnh chỉ số cạnh ảnh vệ tinh cùng ngày; biểu đồ NDVI, mưa tích lũy và growing degree-days theo khoảng thời gian. Đây là màn theo dõi, chưa phải khuyến nghị chọn cây. Trạng thái: truy cập và quan sát được.
2. Theo link Crop rotation trong cùng phiên sang app.onesoil.ai: bảng thửa × vụ, diện tích, ô thêm cây và hành động Allocate crops automatically. Vụ hiện có chưa phân bổ cây, không suy ra lịch sử canh tác từ thửa demo. Trạng thái: truy cập và quan sát được.
3. Mở Allocate crops automatically: chọn cây, nhập diện tích và nút Allocate to fields. Đã thử Rice, 1ha trong BẢN NHÁP để kiểm enabled/disabled; KHÔNG nhấn Allocate. Đóng modal, xác nhận bảng vẫn 0ha đã phân bổ. Chưa kiểm chất lượng thuật toán hoặc kết quả phân bổ. Trạng thái: xác minh bước nhập, chưa chạy đầu ra.
4. EOSDA crop-monitoring.eos.com: phiên hiện ở onboarding Add field -> Add crop. Mở Add field thấy ảnh nền vệ tinh, tìm địa điểm, công cụ vẽ/cắt/hoàn tác, nhắc vẽ ranh và Save khóa khi chưa có geometry. Đã đóng mà không tạo thửa. Không đi được tới phân tích/luân canh mà không tạo dữ liệu tài khoản. Trạng thái: xác minh onboarding, chưa kiểm dashboard sau onboarding.

Ảnh gốc đã xem và lưu tại C:/Users/ghcoo/.codex/project-memory/agrotwin-product-integration-2026-11-15/screenshots/: onesoil-live-status.jpg, onesoil-live-rotation.jpg, onesoil-live-allocation-draft.jpg, eosda-live-add-field.jpg. Ảnh allocation-draft cuối đã chờ giao diện đồng bộ và hiển thị 1ha/nút enabled. Không coi ảnh trung gian trước đó là evidence trạng thái cuối.

## Điều cần áp dụng cho AgroTwin (nhận định thiết kế)

- Thửa + vụ là ngữ cảnh xuyên suốt, không bắt đầu từ QA/model/nguồn.
- Màn theo dõi và màn lập phương án có tác vụ khác nhau. Không coi ảnh bản đồ/biểu đồ đẹp là đã có decision support.
- Đầu vào -> thao tác -> đầu ra có thể sửa/lưu phải rõ. Bảng bằng chứng tĩnh không thay được một kế hoạch đang thao tác.
- Crop rotation của OneSoil bắt đầu từ cây người dùng muốn trồng và diện tích, rồi mới thực thi. Nó không chứng minh rằng một model khí hậu tự chọn cây tốt nhất.
- Với AgroTwin, lựa chọn R0/R1/R2 cần gắn vụ dự định, điều kiện do người dùng nhập, khác biệt/đánh đổi và kết quả kiểm có căn cứ. Model khí hậu cung cấp thông tin cho quyết định; logic áp dụng cây phải có quy tắc phù hợp. Không kế thừa claim năng lực nông học của đối thủ.
- Map giúp chọn/nhận diện thửa và xem lớp dữ liệu có ngày, legend. Chi tiết nguồn/QA mở thêm; không dùng chúng làm nội dung chính.

## Giới hạn

Đây là walkthrough desktop phạm vi trên, chưa có mobile, keyboard/a11y audit đầy đủ hoặc user test. Không chạy/đánh giá thuật toán phân bổ, không tạo thửa để vượt onboarding EOSDA. Không gọi đây là so sánh hiệu quả khoa học giữa sản phẩm.

Nguồn trực tiếp: phiên app.yield.onesoil.ai, app.onesoil.ai và crop-monitoring.eos.com do owner mở trên Edge. Hướng dẫn bổ trợ: https://help.onesoil.ai/en/articles/5235420-how-to-plan-crop-rotation-with-onesoil ; https://eos.com/user-guide/crop-monitoring/field-manager/ .

Bản UI AgroTwin hiện có vẫn là bản nháp chưa nghiệm thu. Checkpoint trước và 7 browser failures chưa được giải quyết trong lượt khảo sát này; không ghi đè kết quả bằng claim PASS.
