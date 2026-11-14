# Nháp duy nhất cho Tiểu An — chưa gửi

An ơi, P0 đã tách cảm biến khỏi evaluator luân canh. Home chỉ hiển thị latest có nguồn; Hardware giữ history, recording, calibration và live/replay. Chưa có thiết bị thì hiện unavailable, không lấy zero làm số đo.

Em xác nhận giúp ba việc: **(1)** BOM/model thực và giao tiếp/baud; **(2)** sensor đang ở venue hay field, điều kiện đặt/độ sâu và calibration/reference; **(3)** một log UTC mẫu, gồm rút USB/mất kết nối và replay.

Metric ưu tiên nếu phần cứng thực có: air temperature °C và air RH %RH (SHT31 nếu đúng model), capacitive probe raw ADC hoặc relative scale đã hiệu chuẩn. Chưa gọi VWC %. pH chưa mua: tạm DEFER; chỉ cân nhắc mượn/lab khi criterion cần và có method/buffer/reference, không mua chỉ để đủ card. Không có EC/NPK thì để unavailable.

Event cần device ID, measurement/event type, measured timestamp UTC, value/unit, quality, calibration ID, source context và delivery live/replay. Đề xuất bench cadence 5 giây, stale 30 giây rồi chỉnh theo log; đây là UI freshness policy, không phải ngưỡng nông học. pH manual dùng date/method riêng, không áp freshness 30 giây.

Nếu ghép marker vào Mỹ Thành để demo, label luôn là BENCH DEMO / SIMULATED PLACEMENT; đo thật ở venue không thành số đo của AOI. UI/session hiện lưu cục bộ trên browser, không phải database lịch sử ruộng. Em giữ nguồn/context trong log để Luật kiểm và mình bàn giao đúng phạm vi nhé.
