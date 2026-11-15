# AgroTwin — đặc tả dashboard và hành trình người dùng

Ngày 15/11/2026 · Owner: Hưng · **Đặc tả để triển khai và đối chiếu, chưa phải nghiệm thu chức năng.**

Tài liệu này xác định tác vụ, nội dung, hành vi và luồng dữ liệu cần xây. Giữ khung AgroTwin và tương tác bản đồ tại `/w/my-thanh/farmer`; tổ chức lại kết quả quanh quyết định vụ tới. Không mở thêm một giao diện cạnh tranh. Bản này thay định hướng ảnh mockup vừa tạo: nền vệ tinh màu tự nhiên, không dùng ảnh đỏ màu giả làm bản đồ mặc định. Tỷ lệ/kích thước là điểm xuất phát để kiểm trên nội dung thật; ảnh mockup không phải nguồn dữ liệu hoặc bằng chứng chức năng đã chạy.

**Chat mới bắt đầu tại [UI_REMAKE_START_HERE.md](UI_REMAKE_START_HERE.md).** DATA/UI snapshot v2 của Việt đã được nhận và kiểm ngày 15/11: [review kỹ thuật](VIET_V2_HANDOFF_REVIEW.md). Phần cập nhật ở mục 18 thay trạng thái “chưa có DATA” trước đó; weights/full runtime vẫn chưa có trong gói.

## 1. Dashboard giải quyết việc gì?

**Giúp nông dân hiểu điều kiện khu vực đang quản lý, khám phá việc thay một vụ trong luân canh, so các phương án và giữ một bản dự kiến để ra quyết định cùng hiểu biết địa phương.**

Câu hỏi trung tâm của màn hình:

> Vụ tới tôi giữ lịch trồng hiện tại hay thay một vụ bằng cây khác? Với điều kiện ruộng và khí hậu trong khoảng đó, mỗi lựa chọn khác nhau ở đâu, còn vướng điều kiện gì, và tôi cần làm gì trước khi chọn?

Đầu ra hữu ích là **phương án đang cân nhắc + lịch dự kiến + lý do có nguồn + việc cần kiểm tra**, có thể lưu và mở lại. Chỉ xem được map, số đo, biểu đồ và ba tên cây chưa giải quyết đủ vấn đề. Mỗi khối trên dashboard phải phục vụ một phần của câu hỏi trên.

Chuỗi giá trị: chọn/vẽ khu vực → dữ liệu NASA tại đó + thông tin đất/nước/cây + số đo thật nếu có → model phân tích khí hậu và quy tắc đối chiếu điều kiện → phương án có giải thích → người dùng điều chỉnh, chọn và lưu.

Mỹ Thành là case chứng minh phương pháp. Trong kịch bản trình diễn, mở thẳng hồ sơ **“Ruộng của tôi · Mỹ Thành”**, ranh và dữ liệu có sẵn; không bắt người xem điền form dài trước khi thấy giá trị. Đây là vai trò giả định trong demo, không xác nhận quyền sở hữu thực hay thay đổi provenance của ranh nghiên cứu. Menu “Đổi/thêm thửa” vẫn cho chọn/vẽ khu vực khác. Vùng mới truy vấn nguồn theo ranh của chính nó; model/catalog chưa áp dụng thì giới hạn phần đó, không mượn kết quả Mỹ Thành hoặc khóa toàn bộ app.

## 2. Những gì phải có trên màn chính

| Vị trí | Nội dung hiển thị | Tác vụ phục vụ |
|---|---|---|
| Thanh ngữ cảnh | Tên thửa, vụ dự định, cây hiện tại nếu đã nhập, ưu tiên; nút “Sửa điều kiện”, “Đổi/thêm thửa” | Biết đang xem đâu, lúc nào, cho mục tiêu gì |
| Dải số đo | Ba ô **nhiệt độ không khí / độ ẩm không khí / độ ẩm đất**; giờ đo và trạng thái cập nhật | Nhìn nhanh điều kiện đo tại điểm, biết số còn mới hay đã cũ |
| Bản đồ gọn | Ranh mẫu, ảnh địa lý có nguồn, hai vị trí đầu đo; chọn marker để liên kết ô số đo | Nhận diện thửa và nguồn đo, không che phần hỗ trợ quyết định |
| Khí hậu và model | Tóm tắt liên quan đến khoảng vụ trước, chart sau; chuyển rõ “Lịch sử” / “Kết quả model”, đúng mốc thời gian và trạng thái | Hiểu điều kiện nào có liên quan; không phải tự suy từ chart sang chọn cây |
| So luân canh — trọng tâm | Ba timeline cây theo vụ; khác biệt, điều kiện cần đáp ứng, đánh đổi và lý do có nguồn | Cân nhắc giữa các phương án, không chỉ đọc biểu đồ |
| Thanh hành động | Phương án người dùng đang cân nhắc; “Lưu bản dự kiến”; việc cần làm tiếp | Có đầu ra mang đi trao đổi và tiếp tục chuẩn bị |

Nguồn/QA/sai số đầy đủ mở trong “Xem căn cứ” của cùng kết quả. Không đặt hash, JSON, benchmark, mã K1/A1 hay toàn bộ danh sách thiếu dữ liệu trên màn chính. Giới hạn quan trọng xuất hiện ngắn ngay cạnh kết quả liên quan, không lặp thành nhiều đoạn cảnh báo.

### Hình dạng đề xuất

- Desktop: thanh ngữ cảnh ở trên; dải ba số đo ngay dưới nhưng gọn, trạng thái chờ không lấn phần quyết định. Hàng kế tiếp chia **bản đồ khoảng 1/3, khí hậu/model khoảng 2/3**, cao khoảng 280–320px; có nút mở rộng bản đồ. Hàng so luân canh dùng toàn chiều rộng phía dưới. Phải nhận ra phần so và hành động tiếp theo ở màn hình thông thường, không cuộn qua nhiều khối giới thiệu.
- Mỗi phương án dùng một timeline ba vụ với màu cây nhất quán, tối đa ba nhận xét ngắn: khác biệt, điều kiện cần xem, đánh đổi. Ưu tiên hình và số có đơn vị; giải thích dài mở thêm.
- Mobile: ngữ cảnh → số đo → tóm tắt điều kiện → so phương án → hành động. Bản đồ thu gọn có thể mở; giữ khả năng so cùng tiêu chí khi vuốt/chọn phương án, tránh ba trang văn bản dài nối tiếp.
- Giữ font Be Vietnam Pro, màu xanh hiện có, tương phản dễ đọc, thao tác chạm tối thiểu 44px. Tiếng Việt mặc định; English dịch cả nhãn và trạng thái. Mỗi nhóm có một hành động chính.

```text
AgroTwin · Tổng quan · Thiết bị · Ngôn ngữ
Thửa đang xem [Đổi/thêm thửa] · Vụ/ưu tiên [Sửa điều kiện]
──────────────────────────────────────────────────────────
Số đo tại điểm: nhiệt độ | RH không khí | đầu dò đất
                                      [Kết nối thiết bị]
───────────────────┬──────────────────────────────────────
Map vệ tinh + ranh │ Điều kiện cho khoảng vụ đang cân nhắc
A đất / B không khí│ Tóm tắt → chart lịch sử / kết quả model
[Mở rộng] [Lớp]    │ Nguồn và mốc dữ liệu
───────────────────┴──────────────────────────────────────
So lịch luân canh, cùng khoảng vụ và cùng tiêu chí
Tham chiếu/hiện trạng │ Phương án khác 1 │ Phương án khác 2
Timeline             │ Timeline        │ Timeline
Khác biệt/điều kiện  │ Cùng tiêu chí   │ Cùng tiêu chí
──────────────────────────────────────────────────────────
Đang cân nhắc · Việc cần kiểm tiếp      [Lưu bản dự kiến]
```

Khi vẽ/chọn thửa, map được mở lớn; xác nhận xong quay lại bố cục so. Trên mobile, khối map/sensor có thể thu gọn; khi chuyển phương án giữ cùng tiêu chí và nhãn rõ, không biến thành ba bài dài nối tiếp. Thanh hành động không che nội dung hay bàn phím.

### Bản đồ — quyết định đã làm rõ sau mockup

- Giữ MapLibre, ranh thửa, chọn/vẽ, zoom, reset và mở rộng hiện có. **Mặc định 2D với nền vệ tinh màu tự nhiên** từ provider hợp lệ, giữ attribution. Cần kiểm provider/token/quyền dùng và tải trên máy demo; không coi đây là tính năng đã có chỉ vì đã ghi vào đặc tả.
- Terrain/3D, NDVI và ảnh màu giả nằm trong “Lớp bản đồ”, không bật sẵn để nhận diện ruộng. Bật lớp phân tích phải có ngày, nguồn, legend và giải thích ngắn.
- Không đưa ảnh imagegen vào app như ảnh địa lý thật. Nền lỗi thì giữ ranh trên fallback hợp lệ, báo ngắn và cho thử lại; không thay bằng ảnh đẹp của nơi khác. Không tự gắn ngày chụp khi provider không có metadata.
- Ranh tương phản, không tô kín che nền; marker có nhãn/hình, không chỉ phân biệt bằng màu. Đổi ranh khiến điểm đầu đo nằm ngoài thì cần đặt/xác nhận lại; không giữ điểm ngoài ruộng như hợp lệ.

## 3. Chính xác hiển thị những chỉ số nào?

| Chỉ số | Nguồn | Đơn vị/nhãn bắt buộc | Cách hiển thị và sử dụng |
|---|---|---|---|
| Nhiệt độ không khí | Đầu đo thật qua thiết bị | °C; device ID, giờ đo | Ô số mới nhất; bấm xem lịch sử. Không dùng một số đo để suy ra khí hậu cả vụ |
| Độ ẩm không khí | Đầu đo thật qua thiết bị | %RH; device ID, giờ đo | Ô riêng với nhiệt độ; không nhầm thành độ ẩm đất |
| Độ ẩm đất | Đầu dò thật | **ADC/thang tương đối** nếu chưa có hiệu chuẩn; % chỉ khi có phương pháp phù hợp | Ô số kèm loại phép đo. Không tự gán % thể tích nước, ngưỡng khô/ướt hoặc chỉ thị “cần tưới” |
| Mưa lịch sử | NASA POWER tại khu vực chọn | mm/tháng; tháng/năm; dữ liệu lưới vùng | Cột mưa cùng trục thời gian; tháng thiếu giữ thiếu, không điền 0 |
| Nhiệt độ lịch sử | NASA POWER | °C, trung bình tháng; tháng/năm | Đường nhiệt độ; phân biệt với nhiệt độ tức thời từ đầu đo |
| Mưa/nhiệt từ model | Artifact và API hợp lệ được bàn giao | Giá trị, đơn vị, tháng/khoảng mục tiêu, horizon, dữ liệu đến ngày/tháng nào | So với nền khí hậu; dải sai số khi có, nhãn mô phỏng/nghiên cứu đúng trạng thái. Không gắn số mockup vào UI |
| NDVI/ảnh EO | Nguồn EO thật khi có asset/metadata | Ngày ảnh, độ phân giải, legend và QA | Lớp bản đồ tùy chọn, không thêm một ô số mặc định. Sentinel-2 là ESA/Copernicus |
| pH/EC/chỉ số đất khác | Phép đo hoặc nguồn đất cụ thể khi có | Phương pháp, đơn vị, độ sâu/ngày đo; phân biệt mô hình đất với mẫu đo | Không thuộc dải số đo bắt buộc hiện tại; chỉ hiện khi có nguồn. Không tạo ô giả để lấp giao diện |

Tách ba lớp: **đo tại điểm / bối cảnh lịch sử vùng / output model**. Không trộn thời gian hoặc độ phân giải của chúng. Các số liệu lịch sử đã cache từ nguồn thật vẫn dùng được, kèm mốc dữ liệu; “dữ liệu thật” không đồng nghĩa mọi ô đều live.

## 4. Sensor và trang Hardware

### Liên kết bản đồ → thiết bị → số đo

- Hai marker dự kiến: **đầu đo đất** và **đầu đo không khí**. Đầu đo không khí có thể cung cấp cả nhiệt độ và RH; một bo mạch có thể đọc nhiều đầu đo, không mặc định mỗi chỉ số là một thiết bị.
- Cho phép đặt vị trí minh họa hợp lý **bên trong polygon**, lưu ổn định để các lần xem không nhảy chỗ. Dùng point-in-polygon để kiểm; không lấy điểm ngẫu nhiên trong bounding box rồi coi là nằm trong ruộng.
- Marker mặc định ghi “Vị trí minh họa”; chỉ thể hiện vị trí lắp thật khi có thông tin xác nhận. **Vị trí minh họa không biến giá trị đo thật thành dữ liệu giả; giá trị đo thật cũng không chứng minh thiết bị đang ở ruộng.** Đo tại bàn demo giữ nhãn “Đo tại bàn”.
- Chọn marker làm nổi ô số tương ứng và mở device ID, thời điểm, vị trí/môi trường khai báo. Chưa có thiết bị liên kết thì marker không tự có giá trị.

### Kết nối thật

Giữ trang **Hardware/Thiết bị** và có đường quay lại dashboard, giữ thửa/vụ/kết quả đang làm. Dashboard có nút “Kết nối thiết bị” ngắn; Hardware chứa chọn cổng, baud, kết nối/ngắt, trạng thái, kiểm packet và ghi phiên thật. Không bắt người dùng đọc log kỹ thuật trước khi xem số đo.

Code hiện có: `frontend/src/features/hardware/state.tsx` dùng `navigator.serial.requestPort()`, mở cổng theo baud đã chọn (UI mặc định 115200), đọc UTF-8; `LineDecoder` trong `model.ts` tách JSON theo dòng. Packet có `device_id`, `event_type`, `timestamp_utc`, `value`, `unit`, `quality`, `data_mode`; một metric một event. `HardwareProvider` giữ các event để các màn dùng chung. Cần ánh xạ đúng `event_type`/đơn vị từ firmware thật, chưa tự giả định model cảm biến.

**Demo chính ưu tiên thật:** bỏ nút phát synthetic, nhập fixture và replay khỏi dashboard và Hardware dành cho trình diễn chính. Giữ fixture trong tests/dev; không xóa lịch sử chứng cứ. Chưa nhận số đo → “Đang chờ số đo”, mất kết nối → giữ giá trị cuối kèm giờ đo/nhãn cũ, không điền số hoặc tiếp tục phát giả. Phân biệt đã mở cổng với đang có packet mới; hạn cũ dựa chu kỳ gửi được xác nhận.

Kết nối bo mạch và kiểm đơn vị/hiệu chuẩn vẫn cần thử trên thiết bị thật. Tài liệu này không khẳng định đã thử.

## 5. Output hỗ trợ quyết định và vai trò model

Mỗi kết quả gắn với cùng thửa, khoảng vụ và snapshot đầu vào. NASA/model phải giúp trả lời một vấn đề cụ thể về thời điểm/điều kiện của vụ, thay vì chỉ là các con số trưng bày.

```text
Thửa + khoảng vụ + điều kiện/ưu tiên đã khai báo
  → nguồn theo geometry/thời gian + kiểm chất lượng
  → thống kê lịch sử và inference từ model đủ artifact/đúng contract
  → đối chiếu lịch cây/đất/nước qua quy tắc có căn cứ và đúng phạm vi
  → khác biệt từng phương án + lý do + việc cần kiểm
  → người dùng cân nhắc, điều chỉnh và lưu bản dự kiến

Sensor thật → số đo tại điểm + giờ/đơn vị/hiệu chuẩn/môi trường
  → bối cảnh theo dõi riêng
  → chỉ tham gia tiêu chí khi có phép nối được kiểm và cho phép
```

| Lớp | Đầu ra đúng vai trò | Không tự suy diễn |
|---|---|---|
| Nguồn lịch sử | Thống kê đúng giai đoạn, coverage và giá trị thiếu | Mưa vùng là mưa đo tại ruộng; lịch sử là thời tiết sắp tới |
| Model khí hậu | Target/đơn vị/mục tiêu/horizon/cutoff, baseline và bất định nếu có | Nhiệt/mưa dự báo là điểm phù hợp cây |
| Quy tắc/catalog | Điều kiện đạt/chưa đạt/cần kiểm, reason và phạm vi áp dụng | Tự bật approval hoặc mượn quy tắc vùng khác để có winner |
| UI | So cùng tiêu chí, hiển thị và phép tính trình bày kiểm được | Sinh prediction, lợi nhuận, năng suất hoặc % tiết kiệm nước |
| Người dùng | Khai báo, sửa, cân nhắc và chọn nháp | Khai báo tự động thành quan trắc được xác minh |

Mỗi nhận xét trên UI cần truy được: **geometry → khoảng vụ → đầu vào → nguồn/model/quy tắc → kết quả → giới hạn → bước tiếp theo**. Kết luận liên quan cây cần phép nối thật; thống kê khí hậu đơn thuần ghi là thống kê khí hậu. Nếu chưa có phép nối thì không dùng câu chung chung để giả thành phân tích cá nhân hóa.

- Ví dụ diễn giải có thể kiểm: khoảng mưa/nhiệt trong các tháng tương ứng vụ dự định; tháng nhiều/ít mưa nhất trong dữ liệu đang xem. Nêu đúng giai đoạn đối chiếu, không gọi lịch sử là dự báo.
- Forecast được nối vào bối cảnh để cân nhắc lịch/nguồn nước. Chỉ biến thành kết luận về cây khi có quy tắc/quan hệ phù hợp và đã được kiểm. Không lấy một ngưỡng mưa tùy ý để tự chọn cây.
- So phương án bằng timeline, khác biệt tưới–tiêu/lịch giống/đất và ưu tiên người dùng; status, lý do và dữ liệu thiếu ngắn gọn. Không bịa điểm, lợi nhuận, năng suất hoặc % tiết kiệm nước.
- R0 lúa–lúa–lúa, R1 lúa–bắp non–lúa, R2 lúa–đậu xanh–lúa là tham chiếu Mỹ Thành hiện có; R0 chưa mặc nhiên là hiện trạng. Hồ sơ demo có thể nhập hiện trạng để kể câu chuyện, nhưng phải gắn đúng vai trò khai báo. Vùng khác dùng lịch người dùng nhập và catalog đúng phạm vi.
- Bản lưu gồm phương án người dùng chọn, lịch dự kiến, đầu vào, việc cần làm, dữ liệu/model/run liên quan. Reload không trộn thửa, kết quả đổi điều kiện phải được cập nhật trước khi lưu.

**Tích hợp Việt v2:** đã nhận DATA xử lý và output snapshot, xem mục 18. Cần thêm runtime artifacts/cache nếu chạy inference mới; kiểm contract gồm target, đơn vị, định nghĩa horizon, khoảng mục tiêu, source cutoff, trạng thái, baseline/bất định. V2 h3 là tháng đích; các artifact cũ có thể dùng cửa sổ ba tháng, không ghép chung nhãn. Backend chịu trách nhiệm dữ liệu/inference/rules; UI hiển thị và giải thích đúng, không tự sinh prediction. Snapshot không cho phép tuyên bố đã chạy inference v2 tại máy này.

## 6. Sửa gì trên dashboard hiện có?

1. Thống nhất một đường vào dashboard mẫu Mỹ Thành; giữ nút đổi/vẽ khu vực. Không để người dùng lạc giữa dashboard cũ, planner mới và hai bố cục Farmer/Power khác nhau. Đường `/plan` thử nghiệm cần hợp nhất hoặc điều hướng rõ khi triển khai; phần chuyên sâu mở cùng kết quả, không là một engine khác.
2. Giữ style/tương tác bản đồ hiện có, chuyển nền mặc định sang vệ tinh tự nhiên, thu về khối có thể mở rộng; thêm hai marker đầu đo theo chính sách trên.
3. Thêm dải ba số đo thật dùng chung HardwareProvider; nối lựa chọn marker ↔ ô số; giữ trang Hardware nhưng làm gọn luồng demo thật.
4. Đưa khí hậu/model theo vụ cạnh bản đồ; chuyển chi tiết kỹ thuật xuống disclosure.
5. Tái tổ chức phần so phương án quanh timeline và khác biệt có ích; giảm các câu “cần xác minh” lặp lại, giữ giới hạn ngắn đúng chỗ.
6. Giữ một nút lưu bản dự kiến sau khi chọn. Không thêm module, chart hay indicator chỉ vì có thư viện/có dữ liệu.

Không triển khai thêm trong lượt viết đặc tả này. Thay đổi code hiện có chưa được tài liệu này mặc nhiên nghiệm thu.

## 7. Kiểm tra chấp nhận trước bàn giao

- Mở app thấy Mỹ Thành, vụ và tác vụ chính; đổi/vẽ vùng mới thì geometry truy vấn thay thật, không mượn dữ liệu mẫu.
- Gắn thiết bị thật: kiểm ba metric, đúng đơn vị/thời điểm; đổi trang vẫn nhận packet; mất cổng và packet lỗi thể hiện đúng. Chưa có cảm biến thì không xuất hiện số giả.
- Marker luôn trong ranh và ổn định; nhãn vị trí minh họa/đo tại bàn tách biệt dữ liệu đo.
- Một thao tác input → API → source/model/rules → UI có thể truy vết. Output đúng khoảng mục tiêu, lỗi không lấy số cũ khác scope để thế vào.
- So ba phương án cùng tiêu chí, chọn/lưu/mở lại bản đọc được; thay thửa/vụ/ưu tiên không trộn kết quả. Sensor chưa hiệu chuẩn không tự đi vào điểm/ranking.
- Xem desktop/mobile, keyboard, contrast, lỗi/loading/stale; kiểm một người mới giải thích được mình đang xem gì và làm gì tiếp. Chưa có user test thì không tuyên bố đã chứng minh dễ dùng.

## 8. Các điểm còn chờ dữ liệu, không chờ thiết kế lại từ đầu

- Việt: đã nhận gói processed DATA + UI snapshot; còn runtime artifacts/weights/cache để tái chạy đầy đủ. Contract và scope cụ thể ở review v2 và mục 18.
- Thiết bị: firmware packet thực, tên sensor, chu kỳ gửi và hiệu chuẩn đầu dò đất; xác nhận nguồn đo tại bàn hay tại ruộng.
- Chuyên môn địa phương: dữ liệu hiện trạng/lịch giống/đất/nước để nâng mức kết luận về phương án.

Mục tiêu cuộc thi là minh họa rõ phương pháp, giá trị cho nông dân và một pipeline thật; không chờ hoàn thiện nền tảng thương mại để trình bày giải pháp. Mọi phần chưa chạy được vẫn ghi đúng trạng thái.

## 9. Flow A — từ mở Mỹ Thành đến lưu một phương án

### A1. Mở app và nhận diện thửa

**Người dùng làm:** mở dashboard.

**Người dùng thấy:** “Ruộng của tôi · Mỹ Thành”, ranh đã chọn, diện tích xấp xỉ, nút “Đổi/thêm thửa”, ngữ cảnh vụ, phần điều kiện và so lịch. Sensor chưa có dữ liệu hiện “— · Chưa có số đo”. Không bắt điền toàn bộ form trước khi xem được dữ liệu đã có.

**Hệ thống làm:** nạp hồ sơ/geometry và kết quả khớp hồ sơ. Nếu là cache/bản lưu, ghi “Bản phân tích đã lưu · dữ liệu đến …”. Có thời điểm tính khác thời điểm dữ liệu thì chi tiết tách riêng. Không mặc định ngày trong ảnh mockup là vụ dự định thật.

**Đạt khi:** người mới biết đang xem thửa nào, đang cân nhắc việc gì và bấm đâu tiếp. Tên vùng không bị các nhãn “Regional research data”, hash hoặc QA lấn át.

### A2. Chọn vụ và xác nhận điều kiện tối thiểu

**Người dùng làm:** mở “Sửa điều kiện”. Form ngắn, các mục nâng cao mở thêm.

| Đầu vào | Cách hỏi | Dùng vào đâu? |
|---|---|---|
| Khoảng vụ dự định | Bắt đầu/kết thúc; có thể chưa biết | Xác định tháng cần xem và khoảng so lịch |
| Cây hiện tại | Chọn cây hoặc “Chưa xác nhận” | Phân biệt hiện trạng với lịch tham chiếu |
| Cây vụ trước | Chọn hoặc “Chưa rõ” | Quy tắc luân canh khi có hiệu lực |
| Nguồn tưới | Có / hạn chế / không có / chưa rõ | Đối chiếu điều kiện nước có căn cứ |
| Thoát nước | Tốt / kém / chưa rõ | Đối chiếu điều kiện tưới–tiêu khi có quy tắc |
| Ưu tiên chính | Nguồn nước / đất / thu nhập / khám phá | Đặt trọng tâm giải thích; chỉ đổi rank nếu có logic backend hợp lệ |

Lịch sử ngập và kế hoạch quản lý là mục mở thêm. Không hỏi người dùng mã dataset, source mode, tên model hoặc QA. Trường chưa rõ giữ null/unknown, không tự coi là đạt hoặc không đạt.

**Hệ thống làm:** lưu đầu vào dưới dạng khai báo, không thành dữ liệu quan trắc. Backend hiện có một số trường chuỗi tổng quát; nếu UI bổ sung ngày vụ có cấu trúc thì cần adapter/schema được kiểm, không gửi extra key tùy ý.

**Đường đi tiếp:** “Xem so sánh” chạy với thông tin hiện có và giới hạn phù hợp. Chưa chọn vụ thì vẫn xem lịch sử/tham chiếu, nhưng chưa tạo kết luận “cho vụ tới”; có lời mời chọn khoảng vụ ngay tại phần liên quan.

### A3. Chạy và nhận kết quả

**Người dùng làm:** bấm “Xem so sánh”.

**Hệ thống làm:** chụp snapshot đầu vào, truy vấn đúng nguồn, kiểm chất lượng, chạy/đọc model hợp lệ, đối chiếu catalog/quy tắc và trả cùng một kết quả có run. Analyze không train model mỗi lần bấm.

**Trong lúc chờ:** giữ thửa/vụ nhìn được, chặn gửi trùng; tiến trình chỉ mô tả bước runtime thực biết. Người dùng sửa tiếp thì response cũ không được ghi đè yêu cầu mới. Lỗi phần nào báo phần ấy, giữ input và có “Thử lại”.

**Đạt khi:** truy được một thao tác từ input → API → nguồn/model/quy tắc → output trên màn. Có code hoặc có chart tĩnh chưa đủ chứng minh bước này.

### A4. Hiểu điều kiện liên quan đến vụ

**Người dùng thấy:** một hoặc hai câu tóm tắt đúng khoảng thời gian trước, biểu đồ sau. Ví dụ cấu trúc, không phải số liệu/khuyến nghị thực: “Trong các tháng [X–Y] của giai đoạn lịch sử [P], lượng mưa [đại lượng đã tính được].”

Nếu có model, hiện đúng đại lượng cho tháng/cửa sổ mục tiêu và nền tương thích; có bất định thì hiển thị, không có thì không tự vẽ dải tin cậy. Nhãn nghiên cứu/mô phỏng/dự báo theo contract thật, không chỉ đổi nhãn để trông sẵn sàng vận hành.

**Người dùng làm:** chọn tháng/giai đoạn để xem giá trị hoặc mở “Vì sao liên quan?”. Chuyển Lịch sử/Kết quả model vẫn giữ vụ đang chọn. Khí hậu tháng không cho phép tự suy ra ngày gieo an toàn hoặc lịch tưới từng ngày.

### A5. So và cân nhắc

**Người dùng làm:** nhìn ba timeline cùng tiêu chí, mở lý do khi cần, chọn một phương án.

**Hệ thống làm:** cho thấy vụ nào đổi và khác biệt nào có căn cứ, điều kiện riêng nào còn vướng. Việc chung chỉ xuất hiện một lần. Bấm chọn chỉ đổi “Bạn đang cân nhắc”, chưa cam kết gieo trồng và không biến phương án thành khuyến nghị model.

**Đạt khi:** người dùng hiểu vì sao một phương án đáng cân nhắc hoặc vì sao chưa thể phân biệt. Nếu chỉ có tên cây + câu chung “kiểm tra đất/nguồn nước” thì chưa đạt phân tích cá nhân hóa.

### A6. Giữ bản dự kiến

**Người dùng thấy:** phương án đang chọn, lịch nếu đã xác định và tối đa ba việc cần làm tiếp có liên quan.

**Người dùng làm:** bấm “Lưu bản dự kiến”.

**Hệ thống làm:** lưu snapshot theo mục 13; thông báo “Đã lưu bản dự kiến”, có đường mở lại. Thiếu thông tin vẫn có thể lưu nháp với nhãn “Còn thông tin cần bổ sung”; không đổi thành kế hoạch được khuyến nghị. Không tự gửi cho người khác.

## 10. Flow B — đổi hoặc vẽ thửa mới

1. Chọn “Đổi/thêm thửa”; giữ nháp hiện tại và mở map lớn.
2. Chọn hồ sơ có sẵn hoặc tìm khu vực rồi vẽ polygon; có sửa điểm, hoàn tác, hủy và xác nhận. Chưa xác nhận thì chưa đổi thửa.
3. Kiểm geometry/diện tích, hiện ranh và tên đặt cho thửa; lỗi chỉ rõ thao tác sửa. Giới hạn API là giới hạn kỹ thuật, không phải khuyến nghị diện tích canh tác.
4. Xác nhận → chuyển scope và query theo geometry mới. Không mang kết quả, lịch cây, nguồn hoặc sensor placement của Mỹ Thành sang như thuộc thửa mới.
5. Nạp từng phần có nguồn hỗ trợ. Nếu catalog/model chưa phủ vùng, báo ngắn tại phần đó; không khóa toàn bộ app. Không sinh R0/R1/R2 cho mọi nơi để lấp màn. Lịch do người dùng nhập chỉ khả dụng nếu chức năng đã triển khai và có cách xử lý hợp lệ.
6. Chọn vụ/điều kiện rồi tiếp tục A3–A6.

**Đạt khi:** đổi geometry làm request/source/cache đổi thật. Chỉ đổi tên hoặc di chuyển map trong khi giữ dữ liệu cũ là lỗi chặn bàn giao.

## 11. Flow C — kết nối sensor và quay lại quyết định

1. Chưa có thiết bị: ba ô hiện “— · Chưa có số đo”; khí hậu/so lịch vẫn sử dụng được.
2. Chọn “Kết nối thiết bị” → trang/panel Thiết bị; giữ thửa, vụ, phương án. Hướng dẫn ngắn cắm bo mạch/chọn cổng; baud và log mở thêm.
3. Chọn cổng qua hộp thoại trình duyệt. Mở cổng thành công chỉ là “Đã kết nối · chờ số đo”, chưa phải đang có số đo tốt.
4. Nhận packet hợp lệ → hiện metric, đơn vị, giờ đo, device ID. Nhiệt độ/RH có thể cùng đầu đo B; đất là A. Ánh xạ tên event phải khớp firmware thật.
5. Khai báo môi trường “Tại bàn” hoặc thông tin lắp đặt khi có. Marker minh họa không tự xác nhận vị trí thật.
6. Quay lại dashboard vẫn thấy phiên đo trong phạm vi phiên app được hỗ trợ. Chọn A làm nổi ô đất; B làm nổi nhiệt độ/RH; chọn ô mở chi tiết đầu đo.
7. Ngắt cổng hoặc không còn packet → giữ số cuối kèm giờ/nhãn cũ và “Kết nối lại”. Reload không hứa giữ Web Serial nếu runtime chưa hỗ trợ; chỉ rõ khi cần kết nối lại.

Code hiện tại có ngưỡng freshness 30 giây; đây là chi tiết implementation, chưa phải chu kỳ đo đã được xác nhận. Cần chốt cadence, kiểm clock skew và mất packet. Packet hợp lệ hoặc `data_mode: observed` không tự chứng minh hiệu chuẩn/vị trí ngoài đồng. Nếu firmware cần adapter, giữ đúng ý nghĩa và provenance.

Sensor là bối cảnh đo tại điểm. Chưa có phép nối được kiểm thì không đưa ADC/nhiệt độ hiện tại vào crop score hoặc suy điều kiện toàn vụ. Lịch sử đo thật có thể xem lại với nhãn lịch sử, không phát như live.

## 12. Đặc tả chi tiết phần so phương án

### 12.1. Một phương án phải có gì?

| Thành phần | Trên màn chính | Khi mở thêm |
|---|---|---|
| Tên dễ hiểu | Giữ lịch lúa / Bắp non ở vụ giữa / Đậu xanh ở vụ giữa, khi đúng catalog | Mã R0/R1/R2 chỉ là định danh phụ |
| Timeline | Thứ tự cây theo vụ, làm nổi vụ đang đổi | Calendar/giống/nguồn nếu đã có |
| Điều thay đổi | Vụ nào/cây nào thay so với lịch đã xác nhận hoặc lịch tham chiếu | Khác biệt theo từng tiêu chí |
| Liên quan mục tiêu | Một nhận xét có nguồn và phạm vi hợp lệ | Input, quy tắc và giới hạn |
| Điều còn vướng | Một hoặc hai điều kiện ưu tiên, có thao tác bổ sung khi được | Danh sách thiếu đầy đủ |
| Tác vụ | “Cân nhắc phương án” / “Bạn đang cân nhắc” | Sửa đầu vào / xem căn cứ |

R0 chỉ được gọi là “Hiện trạng của bạn” khi người dùng xác nhận đúng lịch. Hiện trạng khác thì hiện đúng lịch đã khai báo và xác định lại cách so, không ép người dùng thành R0.

Chưa có calendar/giống hợp lệ thì timeline chỉ là **thứ tự vụ**. Không vẽ ba đoạn bằng nhau thành lịch năm, tự đặt ngày gieo/thu hoặc coi khoảng vụ đang chọn là lịch hoàn chỉnh của cả chuỗi.

### 12.2. So theo cùng tiêu chí

| Tiêu chí | Dữ liệu/quy tắc cần có | Khi chưa đủ |
|---|---|---|
| Khớp khoảng vụ | Khoảng chọn + lịch/giống và quy tắc đúng vùng | Cần xác nhận lịch giống, không tự gắn nhãn phù hợp |
| Tưới–tiêu/nguồn nước | Khai báo ruộng + đặc tính cây có nguồn + khí hậu đúng khoảng | Nêu điều cần kiểm; không đổi mưa tháng thành nhu cầu tưới |
| Đất | Nguồn/phương pháp/độ sâu + quan hệ cây–đất được duyệt | Chưa có thông tin đất phù hợp; không suy sức khỏe đất từ đầu dò ẩm |
| Ưu tiên | Mục tiêu + logic hợp lệ | Đưa tiêu chí liên quan lên trước; không tạo rank/điểm bằng màu |
| Khả thi địa phương | Giống, quản lý, thị trường khi được cung cấp | Câu hỏi cần trao đổi, không ước lợi nhuận |

Không hiện mọi hàng trống. Giữ tiêu chí có ích trên màn, phần thiếu chung chỉ nói một lần. Nếu chưa đủ để phân biệt ba phương án, ghi “Hiện có lịch tham chiếu; chưa đủ dữ liệu để phân biệt mức phù hợp” và bước bổ sung cụ thể. Không ngụy trang ba mô tả cây chung thành kết quả cá nhân hóa.

### 12.3. Ví dụ ý nghĩa đúng, không phải khuyến nghị thực tế

Cấu trúc có thể kiểm: “Phương án [P] cần [điều kiện] theo [quy tắc R]. Bạn đang khai báo [giá trị]. Vì vậy cần [việc kiểm] trước khi chốt.” Nếu R chưa được duyệt hoặc ngoài phạm vi thì vẫn là cần xem xét. Nội dung thực tế chỉ được sinh từ rule/response có căn cứ, không hardcode ví dụ này thành kết quả.

## 13. Flow D — sửa, lưu và mở lại

| Người dùng thay đổi | Hệ thống cần làm |
|---|---|
| Thửa/geometry | Đổi scope, hủy/chặn response cũ, tải nguồn/kết quả đúng thửa |
| Vụ/cây/tưới–tiêu/ưu tiên | Giữ input mới, đánh dấu kết quả cũ “Cần cập nhật”; cập nhật trước khi lưu thành kết quả mới |
| Phương án cân nhắc | Đổi lựa chọn và việc tiếp; không inference lại nếu input phân tích không đổi |
| Ngôn ngữ hoặc mở chi tiết | Giữ run/lựa chọn; không tạo kết quả mới |

Ưu tiên chỉ đổi thứ hạng nếu backend có logic đó. Nếu chỉ đổi trọng tâm giải thích thì nói đúng điều ấy. Có thể lưu input nháp riêng; không gắn run cũ vào input mới như đã phân tích.

### Snapshot cần lưu

- Thửa, geometry/định danh và phiên bản ranh.
- Khoảng vụ, cây/lịch/điều kiện/ưu tiên đã khai báo và các trường chưa rõ.
- Phương án chọn, timeline thứ tự vụ hoặc calendar đã xác nhận, đúng loại.
- Tóm tắt căn cứ, việc cần kiểm và giới hạn còn hiệu lực.
- Run ID, contract/model/catalog version, mốc dữ liệu, thời điểm lưu ở phần chi tiết.
- Sensor context chỉ khi liên kết đúng; nếu lưu snapshot phải có giờ và môi trường, không biến số cũ thành hiện tại lúc mở lại.

Chốt cơ chế persistence khi triển khai. Nếu local thì ghi “Lưu trên trình duyệt này”, không hứa đồng bộ tài khoản. Nút lưu chỉ báo thành công sau khi lưu thật. Mở bản cũ có trạng thái lúc lưu và “Cập nhật với dữ liệu hiện có”; không âm thầm thay nội dung bản cũ. Xuất/chia sẻ là bổ sung sau luồng lưu, không tự gửi ra ngoài.

## 14. Trạng thái, lỗi và đường đi tiếp

| Tình huống | Hiển thị/hành động | Không được làm |
|---|---|---|
| Loading | Skeleton đúng khối, giữ thửa/vụ, tiến trình có thực | Giả báo đã chạy model |
| Cache khớp scope | Bản đã lưu + mốc dữ liệu, thử cập nhật | Gọi là live |
| Khí hậu thiếu một phần | Giữ khoảng trống, nêu phạm vi dùng được | Đổi null thành 0 hoặc nội suy không ghi |
| Không có forecast | Giữ lịch sử/tham chiếu, nêu thiếu model cho vụ | Dùng baseline như dự báo mới |
| Quy tắc chưa duyệt/ngoài vùng | Điều cần kiểm và bước tiếp | Tạo score hoặc nhãn phù hợp giả |
| Chưa chọn vụ | Xem lịch sử/tham chiếu, mời chọn vụ | Tự nhận ngày mockup là thật |
| Chưa có sensor | Chờ số đo và kết nối | Phát số synthetic |
| Mở cổng chưa có packet | Chờ số đo | Gọi đang đo tốt |
| Số cũ/mất kết nối | Số cuối + thời điểm + nhãn cũ, kết nối lại | Tiếp tục cập nhật giả |
| Packet/đồng hồ/đơn vị lỗi | Nhãn ngắn; chi tiết ở Thiết bị | Biến lỗi thành 0 hoặc nhận sai đơn vị |
| Timeout/API lỗi | Giữ input, thử lại; bản cũ khớp scope có nhãn | Mượn kết quả khác thửa/vụ |
| Input đã thay đổi | “Điều kiện đã đổi · cập nhật so sánh” | Lưu run cũ như output cho input mới |
| Model/catalog chưa hỗ trợ | Giữ phần có nguồn hợp lệ, nêu giới hạn cục bộ | Khóa toàn app hoặc áp R0/R1/R2 mọi nơi |
| Tải nền map lỗi | Ranh + fallback hợp lệ, thử lại | Tạo ảnh địa lý giả |

## 15. Mức độ chi tiết và copy trên màn

**Luôn thấy:** thửa/vụ, tác vụ đang làm, giá trị có đơn vị/thời gian, khác biệt phương án, giới hạn ảnh hưởng trực tiếp và bước tiếp.

**Mở khi cần:** nguồn/độ phân giải, giải thích tiêu chí, bất định, danh sách thiếu đầy đủ, thông tin model và log thiết bị. Đóng chi tiết không mất vị trí/lựa chọn.

**Không đặt ở luồng chính:** hash, JSON, mã pipeline, benchmark, Research/Sandbox, raw run trace hoặc đoạn miễn trừ dài. Giữ provenance ở chi tiết của cùng kết quả.

| Tránh làm nhãn chính | Thay bằng nội dung đúng tình huống |
|---|---|
| Readiness / Needs review / Score unavailable | Điều kiện cụ thể, ví dụ “Cần xác nhận nguồn tưới” |
| Regional research data làm tiêu đề thửa | Tên thửa; “Khí hậu vùng” cạnh dữ liệu tương ứng |
| Analyze confirmed inputs | “Xem so sánh” / “Cập nhật so sánh” |
| Đề xuất tốt nhất khi chưa có căn cứ | “Bạn đang cân nhắc” |
| 26 khoảng trống bằng chứng ở đầu màn | Một đến ba thông tin ưu tiên; danh sách đầy đủ mở thêm |

Không thay cảnh báo dài bằng câu sáo rỗng. Nếu chưa có căn cứ cho nhận xét riêng, dùng trạng thái chung trung thực và thao tác bổ sung hữu ích. Không dùng màu xanh để ngầm chứng nhận phương án đạt khi chỉ đang được chọn.

## 16. Thứ tự triển khai và kịch bản nghiệm thu

### Thứ tự làm trên code hiện có

1. Một đường vào dashboard; giữ nhận diện AgroTwin, map tự nhiên gọn và ngữ cảnh thửa/vụ.
2. Form ngắn, input snapshot và lifecycle đúng; sửa scope không trộn kết quả.
3. Nối nguồn/model/quy tắc thực với phần điều kiện và so; kiểm trace cho một kết quả trước khi mở rộng.
4. Timeline cùng tiêu chí; cân nhắc/lưu/mở lại có persistence thật.
5. Nối ba ô số đo/marker với HardwareProvider và packet thật; giữ trang Thiết bị, kiểm trạng thái chờ/cũ/lỗi.
6. Drawer căn cứ, lớp map và luồng vùng mới có giới hạn đúng. Mobile, keyboard và lỗi cơ bản phải được kiểm ngay ở từng bước, không đợi cuối mới xử lý.

Nếu thời gian không đủ, cắt module mở rộng và nội dung phụ; không cắt phép nối model→ý nghĩa, tính đúng scope hay trạng thái thiếu để có màn hình trông hoàn chỉnh.

### Kịch bản kiểm cụ thể

| Kịch bản | Điều phải chứng minh |
|---|---|
| Lần đầu mở Mỹ Thành | Nhận diện thửa, hiểu tác vụ so lịch; không bị chặn bởi QA/form dài |
| Map mặc định | Nền tự nhiên có nguồn, ranh rõ, layers/mở rộng hoạt động |
| Chọn vụ và chạy | Input→API→nguồn/model/quy tắc→UI đúng phạm vi, mở được căn cứ |
| So ba lịch | Cùng tiêu chí; lịch thứ tự không giả thành ngày gieo; khác biệt có nguồn |
| Chưa đủ căn cứ | Có bước tiếp cụ thể, không winner/điểm/hiệu quả định lượng giả |
| Chọn/lưu/mở lại | Đúng lựa chọn, input và run; rõ nơi lưu và thông tin còn thiếu |
| Sửa khi request chưa xong | Response cũ không ghi đè scope/lựa chọn mới |
| Đổi/vẽ vùng | Query/source/cache đổi thật, giới hạn catalog xử lý cục bộ |
| Không có sensor | Không số giả, khí hậu/so lịch vẫn hoạt động |
| Cắm bo mạch | Đúng ba metric/đơn vị/giờ, A/B tương ứng, rõ đo tại bàn hay ruộng |
| Ngắt/packet lỗi | Nhãn cũ/lỗi đúng, kết nối lại được, không đổi lỗi thành 0 |
| Mobile/keyboard | Chọn thửa, sửa input, so, lưu và mở/đóng căn cứ thực hiện được |

Kiểm với người mới: họ nói được **đang so điều gì, dữ liệu nào liên quan, vì sao cân nhắc/chưa thể chọn, cần làm gì tiếp**. Nếu chỉ kể lại nhiệt độ và tên ba cây thì chưa đạt. Mục tiêu hiểu nhanh là giả thuyết thiết kế; chưa user test thì không gọi là đã chứng minh dễ dùng.

### Kịch bản demo ngắn

Mở thửa → chọn vụ/ưu tiên → chạy → chỉ một thông tin khí hậu/model liên quan → so một khác biệt thật và một điều cần kiểm → chọn/lưu/mở lại. Cắm sensor bổ sung bối cảnh tại điểm và nói rõ môi trường đo. Không có model/thiết bị thì giữ đúng trạng thái thiếu, không diễn một pipeline giả. Đường chọn/vẽ khu vực khác cho thấy hướng mở rộng; phần chưa chạy phải được phân biệt với phần đang chạy.

## 17. Ranh giới triển khai và căn cứ của tài liệu

| Hạng mục | Cần chốt/nhận | Trước khi có |
|---|---|---|
| Engine Việt | DATA/output snapshot đã nhận; còn weights/full cache để chạy mới, cần adapter contract riêng | V2 snapshot có nhãn bản lưu; không claim inference v2 mới hoặc phân tích form mới từ output empty farm |
| Nông học | Quan hệ cây–đất–nước–giống, nguồn, phạm vi và approval | So tham chiếu/điều kiện, không chọn cây tốt nhất |
| Hardware | Packet, tên đầu đo, đơn vị, cadence, hiệu chuẩn, môi trường | Chờ số đo; đúng ADC nếu chưa hiệu chuẩn |
| Vệ tinh nền | Provider/quyền dùng/attribution/token và tải trên máy demo | Fallback hợp lệ, không ảnh tạo giả |
| Lưu | Local/backend và version snapshot | Không báo đã lưu nếu chưa persistence |
| Hiện trạng demo | Cây/vụ đã xác nhận hay khai báo trong kịch bản | Chưa xác nhận, không tự gán R0 |

Đây là việc tích hợp/kiểm chứng cụ thể, không yêu cầu owner mô tả lại dự án. Mỗi milestone phải ghi phần đã chạy, kiểm đã làm và giới hạn còn lại.

Trang `/w/my-thanh/farmer` đã được quan sát trực tiếp ngày 15/11/2026: map đang 3D, chart chồng trên map và panel phân tích dài ở bên phải. Đặc tả này yêu cầu giữ tương tác hữu ích, đổi phân bổ không gian và nội dung; không đồng nghĩa giữ mọi nhãn nghiên cứu hiện tại. Walkthrough đối thủ chỉ có phạm vi ghi trong tài liệu tham chiếu, không xác nhận thuật toán của họ. Contract v5 cần đối chiếu với Engine phiên bản nhận thực tế.

Contract v5 đã đọc không có phép nối forecast→A1 hoặc H1→crop có hiệu lực; readiness không phải suitability. Đây là căn cứ để yêu cầu kiểm adapter và ý nghĩa kết quả khi nối phiên bản mới, không phải lý do để gắn một con số forecast cạnh thẻ cây rồi gọi là đã hỗ trợ quyết định.

Lượt cập nhật này chỉ thay tài liệu; chưa sửa UI, nối thêm model hoặc thử bo mạch. Các mục nghiệm thu là yêu cầu cần kiểm, không phải test đã pass.

## 18. Cập nhật sau khi nhận gói Việt — 15/11/2026

Nguồn pin: `neurax-fieldshift-lab`, branch `data/v2-hung-handoff`, commit `02e3de3f0ac2883f29e19183524c4c767de7c5b8`. Đã tự kiểm 27 file theo hash/size và 514 tháng liên tục (1984-01–2026-10). [Chi tiết và field mapping](VIET_V2_HANDOFF_REVIEW.md).

- Có DATA xử lý, LOCAL references/candidates, corpus/index, `overview.json` và `analyze-empty-farm.json` thật. Không có joblib/full runtime cache; chưa tự tái chạy inference/live backend v2 trong lượt này.
- `overview.months` chỉ có 24 tháng gần nhất; CSV có 514. Sáu forecast rain/nhiệt/RH cho tháng đích 12/2026 và 02/2027, cutoff 10/2026. Đọc giá trị/range từ snapshot, không lấy số trong ảnh mockup trước.
- UI phân biệt nguồn A1 hiện tại và v2 `fieldshift-2` qua schema/provider versioned. Product A1 vẫn `forecast=null`; không ép response v2 vào schema cũ.
- API v2 chỉ nhận pilot `MT-BLOCK-01`, chưa nhận geometry tùy ý. Không làm mất luồng chọn/vẽ của product; không tự gắn forecast pilot cho vùng mới.
- Form đích vẫn theo flow mục 9, nhưng adapter phải theo contract: v2 có `window_start/end`, pH/method/date, mặn/phèn, crop interests; chưa có previous crop/depth riêng hoặc goal income. Không gửi extra field hoặc đổi income thành yield âm thầm. Trường chưa hỗ trợ có nhãn/đường lưu riêng hoặc mở rộng contract được kiểm.
- Thêm mục mở rộng “Thông tin đất” cho pH/method/date, mặn/phèn khi cần giải quyết `missing_inputs`. Không biến nó thành dải KPI giả hoặc bắt điền mới cho xem lịch sử.
- Status phương án `blocked` / `needs_information` / `conditional_reference` lần lượt thể hiện vướng điều kiện / cần bổ sung / tham khảo có điều kiện. Tất cả chưa domain-approved; rank/score/probability null. Goal thay việc tiếp theo, crop interests thay thứ tự; không gọi là rank lợi ích.
- Forecast hiện là climate context, không trực tiếp tính eligibility từ mưa hoặc tính nhu cầu tưới. Dải thiếu độ phủ, RH không cải thiện baseline; chi tiết kiểm chứng mở thêm, giới hạn ảnh hưởng cách hiểu giữ gần kết quả.
- Snapshot empty farm chỉ đúng cho input rỗng. Chỉnh input phải stale và cần provider thực phân tích lại; không giả lập request thành công bằng JSON cũ.
- Lưu bản dự kiến ghi rõ mode/provider/source run và input; bản tham chiếu chưa cập nhật không được mô tả như kết quả phân tích cho form mới.

Đủ dữ liệu để xây UI dựa trên output thật ở chế độ snapshot; chưa đủ gói để gọi hoàn thành full inference integration. [Start here](UI_REMAKE_START_HERE.md) cung cấp checkout, code map, runtime, thứ tự làm và prompt cho chat tiếp theo.

### Tài liệu đối chiếu

- [Product purpose](../../PRODUCT.md)
- [Điểm bắt đầu cho chat remake](UI_REMAKE_START_HERE.md)
- [Review bàn giao DATA v2](VIET_V2_HANDOFF_REVIEW.md)
- [Khảo sát OneSoil/EOSDA trên tài khoản owner](COMPETITOR_TASK_REVIEW.md)
- Lab repo `docs/handoff/v5/AI_TO_DASHBOARD_CONTRACT.md`: contract/readiness và giới hạn phép nối ở phiên bản tài liệu đó.
- `frontend/src/features/hardware/{model.ts,state.tsx,Hardware.tsx}`: code đã đọc để xác nhận đường kết nối và event schema.
- `docs/execution/AGROTWIN_HARDWARE_DISCORD_DRAFT.md`: thông tin phần cứng đã ghi trước; chưa là xác nhận inventory hiện tại.
- Bản đề do owner cung cấp: docs repo `nasa-space-apps-2026/challenges/07-field-shift.md`. Không coi live challenge/thể lệ 2026 đã được xác minh khi nguồn live chưa truy cập được.
