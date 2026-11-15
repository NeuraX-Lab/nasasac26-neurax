# AgroTwin V4 — demo readiness 15/11/2026

**READY cho kịch bản live demo nghiên cứu Mỹ Thành đã kiểm chứng trong phiên này.** Không phải nghiệm thu sản xuất, calibration ngoài đồng hoặc full historical test suite.

Script `Test-AgroTwinV4.ps1 -HardwareEvidence ../docs/integration/evidence/physical-hardware.json` thực thi thành công lúc **12:25 ngày15/11/2026 (Asia/Saigon)**. Report trả `SOFTWARE_VERIFIED` và tham chiếu `PHYSICAL_HARDWARE_VERIFIED`; không dùng USB mock làm proof thiết bị. Inference smoke run `v4-817c7126371d4729a677a44b7981cd4d`.

[Readiness JSON](../integration/evidence/demo-readiness.json) · [Verification JSON và39cases](../integration/evidence/verification.json) · [Backend Draft PR#4](https://github.com/NeuraX-Lab/neurax-fieldshift-lab/pull/4). Backend triển khai pin `c01519e6257a0788c453964f8dfe12c754c7cfed`; chưa merge/deploy.

| Điều kiện | Trạng thái | Bằng chứng |
|---|---|---|
| Dashboard Hưng | READY | Giữ UI/map-first/compare-first/branding; typecheck/lint/build/unit qua; desktop1440/1920, mobile390,VI/EN và axe trong scope đã kiểm |
| API V4 | READY | status/overview/forecasts/metrics/evidence/analyze qua HTTP thật qua proxy5174→8184; identity và schema đúng |
| Model inference | READY / RESEARCH_ONLY | Sáu artifact, sáu prediction/request, run mới, pooled intervals và SHA provenance;86backendtests |
| NASA cho demo | READY từ cache có nguồn | A1 history2025 và V4 input1984-01→2026-10; không nói vừa tải NASA trực tiếp; ranh ngoài pilot không mượn dữ liệu |
| RAG/evidence | READY với evidence gate |17/17source cards kiểm bytes; câuT2M có citation, câuEC tại ruộng từ chối |
| So luân canh | READY với giới hạn | R0/R1/R2, poor drainage chặnR1/R2, good vẫnneeds_information; null rank/score/probability,domain_approved=false |
| USB ESP32 | PHYSICAL_HARDWARE_VERIFIED bench | CH343COM3/115200; user tự grant WebSerial; agent quan sát °C/%RH/rawADC cập nhật,sourceREAL_USB; reconnect user xác nhận và live sau đó được chụp |
| Save/reload/reopen | READY | Giữ input/run/model/citations/hashes;0POST V4 khi mở lại; không phục hồi sensor cũ thànhlive |
| Launcher | READY | One-commandStart, preflight, smokeTest, Stop theo PID/time/command/child; reuse service tương thích, không kill service lạ |
| Automated journey | READY trongscope |39/39E2E,0skip/0flaky; smoke5case chạy lại sau restart quaTestscript |

## Những gì chưa được kiểm chứng

- Calibration ADC, device measurement UTC/ID, pinout và vị trí sensor ngoài ruộng. H1 chặn clock chưa xác minh, sensor không tự đi vào V4.
- Field user study, hiệu quả năng suất/lợi nhuận/nước và external agronomy approval.
-37 E2E khác trong inventory76 thuộc các workflow/selector lịch sử, chưa chạy trên phiên bản cuối; không có full legacy-suite PASS.
- Lần cài môi trường sạch trên máy khác và browser khác ngoài Edge/Chromium của phiên này. Gói artifact và pin đã có, nhưng máy khác phải preflight/Test lại.

## Dùng lại

Từ `<dashboard>/frontend`: `./Start-AgroTwin.ps1`, rồi mở http://127.0.0.1:5174/w/my-thanh/farmer nếu browser không tự mở. Sau reload, user phải chọn cổng USB lại; bản đang mở sẵn không được coi là còn kết nối chỉ từ receipt.

`./Test-AgroTwinV4.ps1` mặc định trả PARTIAL khi chưa có bằng chứng hardware mới cho buổi đó; đó là hành vi đúng. Receipt phiên này chỉ được script nhận trong24h và khi Windows còn nhận cổng/USB VID/PID phù hợp. Khi đổi máy/ngày, xác minh vật lý lại và ghi receipt mới; không đổi nhãn replay/synthetic để lấyREADY.

[Kịch bản8phút](AGROTWIN_V4_LIVE_DEMO_SCRIPT.md) · [Checklist](AGROTWIN_V4_DEMO_CHECKLIST.md) · [Troubleshooting](AGROTWIN_V4_TROUBLESHOOTING.md) · [Verification chi tiết](../integration/V4_ESP32_VERIFICATION.md).
