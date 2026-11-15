# AgroTwin
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Người nông dân và người tư vấn khám phá phương án luân canh cho khu vực canh tác do họ chọn hoặc vẽ. Mỹ Thành là case kiểm chứng hiện tại, không phải giới hạn địa lý của sản phẩm. Tiếng Việt là chính; English phục vụ người xem quốc tế. Đây là giả thuyết vai trò, chưa có nghiên cứu người dùng ngoài đồng.

## Product Purpose
Giúp nông dân khám phá cách luân canh thích ứng với điều kiện khí hậu, đất và nước, dựa trên NASA EO, thông tin đất địa phương, đặc tính cây và ưu tiên của họ. Luồng đích: chọn/vẽ khu vực → truy vấn dữ liệu theo đúng khu vực và thời gian → bổ sung điều kiện/mục tiêu → khám phá và so các phương án → điều chỉnh/lưu bản dự kiến. Không biến sản phẩm thành báo cáo nghiên cứu hay bảng kiểm thiếu bằng chứng. Prototype cần chứng minh phương pháp và một pipeline thật có thể mở rộng, không được mô tả như nền tảng tư vấn nông học đã hoàn thiện.

## Capabilities and Constraints
R0 lúa–lúa–lúa, R1 lúa–bắp non–lúa, R2 lúa–đậu xanh–lúa là tham chiếu lịch sử. Hiện trạng/lịch giống chưa xác nhận. A1 kiểm readiness, score null và needs_review khi quy tắc chưa được duyệt. Đầu vào self-reported không thành quan trắc. Geometry Mỹ Thành khoảng 2ha digitized chưa survey. Runtime hiện mới kiểm chứng catalog/model tại case này; đây là giới hạn implementation hiện tại, không phải non-goal của sản phẩm. Tạo/vẽ thửa và truy vấn dữ liệu địa lý cần tách khỏi phạm vi áp dụng model/quy tắc. Khu vực mới phải lấy dữ liệu theo geometry của chính nó khi nguồn hỗ trợ; không mượn dữ liệu, lịch cây hoặc kết quả Mỹ Thành. Chỗ thiếu nguồn/quy tắc chỉ giới hạn chức năng liên quan, không khóa toàn bộ trải nghiệm.
NASA POWER cung cấp bối cảnh khí hậu lưới theo tháng. NASA EO giúp hiểu điều kiện, không là đo từng góc ruộng. SoilGrids là đất mô hình. Sentinel-2 thuộc ESA/Copernicus. Forecast có model thật nhưng RESEARCH_ONLY; không thay eligibility/rank, không có operational-vintage validation.

## Operating Context
Native Windows; React/Vite/TypeScript và API FastAPI của lab kế bên. Giữ checkout research/post-review-inference, không merge nhánh đầu vào mù; không push/deploy, chi tiền hoặc thay dữ liệu thật bằng fake.

## Brand Commitments
AgroTwin/NeuraX, font Be Vietnam Pro và màu xanh hiện có được giữ trong đợt tích hợp này. Thiết kế thao tác ngoài trời/điện thoại: chữ dễ đọc, ít bước, unknown có ý nghĩa.

## Evidence on Hand
Baseline product b7db703, lab 0932cd0; docs/post-review giữ kiểm chứng cũ. Nhánh Việt product 027f205, lab c6fad2b, docs 8737770 là đầu vào lịch sử cần kiểm lại theo scope. Ngày 15/11 đã nhận gói processed DATA/UI snapshot v2 từ `data/v2-hung-handoff` pin `02e3de3f0ac2883f29e19183524c4c767de7c5b8`: tự kiểm 27 hashes/sizes và 514 tháng liên tục. Không có joblib/full runtime cache trong gói; chưa replay inference v2 tại máy này. Không nhận số test cũ hoặc báo cáo máy Việt làm nghiệm thu UI mới.

## Product Principles
- So lựa chọn, lý do và việc cần làm; không tạo winner/điểm giả.
- Cùng input snapshot và run cho người canh tác và chuyên gia.
- Missing không bằng zero; nguồn/đơn vị/thời gian và giới hạn truy được.
- Không claim năng suất, lợi nhuận, tiết kiệm nước hay hiệu quả đất chưa đo.

## Accessibility & Inclusion
Desktop/mobile, keyboard và nhãn form rõ. Unknown được phép. Mục tiêu hiểu công cụ trong 30 giây chưa được thử với người thật.

## Non-goals
Tuyên bố cây tối ưu, hiệu quả ngoài đồng chưa đo, vận hành tưới tự động hoặc forecast vận hành khi chưa được kiểm chứng. Khả năng chọn/vẽ nhiều khu vực và mở rộng pipeline là hướng sản phẩm; chưa tuyên bố mọi nguồn/model/quy tắc hiện chạy được ở mọi nơi.

## Owner clarification — 15/11/2026
Owner đã làm rõ sau mockup: phương pháp giải quyết vấn đề và tính hữu dụng của prototype là trọng tâm; Mỹ Thành là case để chứng minh phương pháp. Không cần hoàn thiện mọi chức năng để thể hiện hướng đi, nhưng phần thực chạy/phần mở rộng dự kiến phải rõ. Mockup hiện có chưa là thiết kế cuối vì vẫn đặt Mỹ Thành cố định và thiên về liệt kê điều kiện. Cần giải quyết cấu trúc tác vụ này trước khi sửa tiếp frontend.

Đã đọc lại bản đề người dùng cung cấp trong docs dossier; live challenge URL trả502 trong lần kiểm tra này. Đã đọc các lượt liên quan (không phải toàn bộ lịch sử project) ở chat điều phối, chat UI và chat giải thích dự án. Chỉ đạo hiện tại của owner ưu tiên hơn đề xuất cũ giới hạn sản phẩm vào showcase.

## Dashboard content agreement — 15/11/2026
Xem [đặc tả dashboard](docs/product-integration/DASHBOARD_SPEC.md) cho yêu cầu mới nhất từ owner: mở thẳng hồ sơ Mỹ Thành trong kịch bản người nông dân quản lý, bản đồ gọn và marker đầu đo minh họa, ba số đo thật (nhiệt độ không khí, RH không khí, đầu dò đất), Hardware kết nối thật, khí hậu/model và so luân canh trên cùng hành trình. Tạo/vẽ khu vực khác vẫn thuộc hướng sản phẩm. Nội dung này thay định hướng đưa Hardware hoàn toàn ra ngoài trải nghiệm; chỉ công cụ kỹ thuật và dữ liệu synthetic/replay tách khỏi demo chính. Đặc tả là cơ sở review trước khi sửa UI tiếp, không xác nhận chức năng đã hoàn thành hoặc sở hữu/vị trí sensor thực tế.

## UI remake and Viet DATA intake — 15/11/2026

[UI_REMAKE_START_HERE.md](docs/product-integration/UI_REMAKE_START_HERE.md) là entrypoint cho chat mới; đọc [review DATA v2](docs/product-integration/VIET_V2_HANDOFF_REVIEW.md) trước khi nối provider. Giữ AgroTwin và map interactions hiện có; nền vệ tinh màu tự nhiên mặc định, ảnh màu giả/terrain là lớp tùy chọn. Ảnh mockup trước không phải concept được chấp nhận. Kết quả phải dẫn đến khác biệt phương án và việc cần làm, không chỉ chart cạnh ba thẻ cây.

Gói mới có `fieldshift-2` và forecast/rules snapshot riêng, không thay ngầm A1 forecast=null. API v2 hiện chỉ pilot MT-BLOCK-01, chưa geometry tùy ý, goal yield khác income; cần adapter/version validation. Có thể xây UI chế độ bản lưu từ output thật; chưa đủ weights/cache để hứa live v2. R0/R1/R2 vẫn có rank/score/probability null, domain_approved=false. Sensor đi theo product Hardware; không bỏ chức năng này theo scope frontend-v2 riêng của Việt.
