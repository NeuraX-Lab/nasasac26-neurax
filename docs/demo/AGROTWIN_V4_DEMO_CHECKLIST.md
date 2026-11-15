# AgroTwin V4 — checklist trình bày

## Trước buổi demo

- [ ] Đúng nhánh Dashboard và backend triển khai; không có WIP bị ghi đè.
- [ ] Gói runtime selected V4 đúng hash, sáu artifact và nguồn RAG sẵn sàng.
- [ ] `./Start-AgroTwin.ps1 -NoBrowser` thành công; preflight không có BLOCKED.
- [ ] `./Test-AgroTwinV4.ps1` qua API và browser; xem report mới, không dùng báo cáo cũ.
- [ ] Mở localhost5174 bằng Chrome/Edge, map/AOI hiển thị hoặc fallback được ghi rõ; font Be Vietnam Pro tải được.
- [ ] NASA history có năm, nguồn và phạm vi; không diễn giải cache là truy cập NASA mới.
- [ ] Chuẩn bị input mẫu: 12/2026–02/2027, lúa, tưới hạn chế, thoát nước kém, ưu tiên nước.
- [ ] Chuẩn bị hai câu hỏi: `T2M là gì?` và `What is field EC at this plot?`.
- [ ] USB CH343 đúng cổng máy, 115200; user tự cấp quyền Web Serial. Không flash firmware.
- [ ] Xem đủ °C, %RH, ADC, thời gian nhận; ngắt/cắm lại hoạt động; REAL_USB không đồng nghĩa đã calibration/field deployment.
- [ ] Nếu không có board: readiness PARTIAL, replay có nhãn rõ.

## Trong demo

- [ ] Chỉ ranh nghiên cứu Mỹ Thành, marker A đất/B không khí minh họa.
- [ ] Xem NASA history, nhập điều kiện, bấm phân tích V4 thật.
- [ ] Kiểm run `v4-*`, model version, sáu prediction và bounds đúng.
- [ ] Giải thích h1/h3 là tháng đích, nominal 80% không phải accuracy.
- [ ] RAG có citation kiểm nguồn; câu thiếu bằng chứng từ chối.
- [ ] So R0/R1/R2 với blocked/needs_information; không có winner hoặc điểm giả.
- [ ] Xem ESP32 cập nhật thật; không đưa số đo vào crop score.
- [ ] Chọn nháp, lưu, ghi run ID; reload/mở lại giữ run/input/citation gốc.

## Sau demo

- [ ] Nếu cần, giữ log/screenshot/trace của chính phiên vừa chạy.
- [ ] `./Stop-AgroTwinV4.ps1 -WhatIf` kiểm danh sách trước khi dừng.
- [ ] `./Stop-AgroTwin.ps1` chỉ dừng service do launcher đó quản lý; service tái sử dụng tiếp tục chạy.
- [ ] Nêu rõ phần mềm, phần cứng bench, replay, nghiên cứu và field validation là các mức bằng chứng khác nhau.
