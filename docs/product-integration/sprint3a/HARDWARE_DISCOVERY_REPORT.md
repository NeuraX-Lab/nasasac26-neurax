# HARDWARE_DISCOVERY_REPORT

> Cập nhật owner — 15/11/2026: Hưng xác nhận đã kiểm kỹ và hardware đang hoạt động. Ghi nhận `HARDWARE_WORKING_OWNER_CONFIRMED`; không coi board/cảm biến là đang lỗi. Các capture lỗi dưới đây là lịch sử tại thời điểm agent đọc, không phải chẩn đoán hiện tại. Agent chưa xác minh đầy đủ đường board → Web Serial → Dashboard và reconnect thật. Không yêu cầu kiểm lại hardware, flash hoặc đổi driver để tiếp tục. Không chạy thêm kiểm thử trong lần cập nhật tài liệu này.

Ngày kiểm: 15/11/2026. Runtime: Windows native, PowerShell/.NET SerialPort. Không flash, đọc flash, sửa firmware, driver, bootloader hoặc partition.

## REAL_HARDWARE_VERIFIED

- Windows PnP: `USB-Enhanced-SERIAL CH343 (COM5)`, `USB\VID_1A86&PID_55D3\5B3D072735`, status OK, problem code 0.
- Driver WCH `CH343SER_A64`, version `2.1.2025.7`, INF `oem98.inf`; USB Single Serial, Port_#0002.Hub_#0001.
- Interface là USB-UART bridge; không phải bằng chứng native USB CDC/JTAG. ROM đọc được sau đó xác nhận MCU ESP32-S3: `ESP-ROM:esp32s3-20210327`.
- COM3/COM4 là Bluetooth, không mở. COM5 mở độc quyền thành công ở thời điểm kiểm, không bị ứng dụng khác chiếm lúc đó. Cổng được đóng trong finally.
- Serial 115200, 8N1, handshake none, DTR=false, RTS=false trước Open; chỉ đọc, không ghi lệnh. App text đọc rõ ở baud này.
- Hai lần đọc: khoảng 8 giây và 24 giây. Cả hai có ROM boot và `[LOI] Khong tim thay cam bien GY-21! Kiem tra day SDA/SCL.`; không có dòng measurement. Không kết luận cảm biến hỏng.
- Boot xuất hiện sau Open dù DTR/RTS=false. Không khẳng định mở cổng không reset hoặc suy nguyên nhân reset từ log `POWERON`.

Evidence: [device-discovery.json](../../../artifacts/sprint3a/device-discovery.json), [COM5 capture lần 2](../../../artifacts/sprint3a/com5-capture-2.txt). Lần 1 được ghi trong tool transcript, không có file raw riêng.

## Firmware/protocol evidence

Source tìm thấy ở checkout KHÁC: `C:/Users/ghcoo/Everything/Code/Windows/Organizations/NeuraX/nasasac26-neurax/docs/firmware-fieldshift-ndjson.ino`. Không sửa/flash file này. Source này có NDJSON, Serial.begin(115200), analogReadResolution(12), GPIO1, I2C8/9, cadence 2000ms; timestamp cố định theo uptime và các hằng ADC_DRY/ADC_WET. Không chứng minh đây là firmware đang nạp. Boot text thực tế khác header của source đó.

Owner cung cấp mô tả firmware hiện tại ở máy Mac của Tiểu An và ví dụ text: `Do am dat: 38.0% (Raw ADC: 3086)` / `Nhiet do KK: 24.63 C | Do am KK: 47.39 %`. Đây là OWNER_SUPPLIED evidence, chưa được agent tái nhận ở COM5; không đưa các số này lên Dashboard như live. Metadata build/flash owner mô tả chưa được agent độc lập kiểm chứng. Không đọc flash để xác minh vì không cần cho software adapter.

Framing được đọc bằng ReadLine (LF, có CR trước LF trong tool output); chưa lưu raw byte dump để kết luận chính xác CRLF hay CRCRLF. UTF-8 decoder; log hiện nhận chủ yếu ASCII. Cadence 2s là source/owner khai báo, chưa đo được từ measurement thật. Chưa xác minh ID sensor/channel, ADC bit depth hay clock firmware đang chạy.

## BLOCKED / NOT_TESTED

- Telemetry thật, cảm biến GY-21 hoạt động và ADC input: chưa xác minh trong hai capture hiện tại. Không có sensor nào được chứng nhận đo đúng hoặc hiệu chuẩn.
- Quyền Web Serial thật và đường board→website: chưa thực hiện được; owner phải trực tiếp chọn COM5 trên Chromium. Browser connector của chat báo unavailable. Không bypass chooser qua CDP/flags.
- Rút/cắm USB, recovery phần cứng, reopen browser với board: NOT_TESTED. Không rút/cắm vật lý thay owner.
- Mất mạng không ảnh hưởng serial transport theo thiết kế nhưng chưa xác minh vật lý kết hợp cả hai.

Bước ngắn trước demo: dùng hardware đang hoạt động đã được owner xác nhận; đóng Serial Monitor nếu đang giữ cổng, mở Quan sát → Kết nối ESP32-S3 → chọn 115200 → chọn COM5 bằng quyền trình duyệt. Chỉ xác nhận số đo lên đúng ô Dashboard khi cần demo; không lặp audit hardware. Không đề nghị flash/driver change.

## Kiểm thêm trên trình duyệt người dùng

Đã đọc native accessibility state của cửa sổ Edge đang mở đúng `127.0.0.1:5174/w/my-thanh/farmer`: ESP32-S3 Disconnected, cả ba metric No readings yet. CUA browser connector không khả dụng; native Windows read-only observation vẫn hoạt động. Chưa thấy người dùng hoàn tất chooser. Không dùng trạng thái của Playwright test context để suy quyền của Edge thật.

