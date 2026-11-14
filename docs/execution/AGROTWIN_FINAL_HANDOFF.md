# AgroTwin V4 — bàn giao triển khai Mỹ Thành

**PARTIAL_WITH_EXTERNAL_BLOCKERS — P0 kỹ thuật đã triển khai và kiểm thử; chưa có xác nhận khoa học để khuyến nghị cây hoặc thiết bị thật để xác thực deployment.** Bản đang bàn giao là công cụ kiểm điều kiện và khoảng trống bằng chứng chạy thật. Sáu quy tắc production vẫn draft; không dùng việc hoàn thành phần mềm để ký duyệt nông học.

## Các repository và thay đổi

Cùng branch `build/agrotwin-v4-my-thanh-2026-11-14`, chỉ commit local, **chưa push**:

| Repository | Commit implementation | Nội dung |
|---|---|---|
| `neurax-fieldshift-lab` | `b7be1e63b3ec97f7788068dd46a0c24983b5596a` | NASA acquisition/cache, Q1, catalog có review gate, A1 producer/API/CLI, immutable run, 10 test mới |
| `nasasac26-neurax` | `504e1eea2bac24b811d74734d93a4caa4cb94dc5`, `0c56b41eedeca18adcb773ea03bdc59b434c9c93` | Frontend được đưa vào Git có chủ đích; hai dashboard chung core, recompute/stale/race/cache/offline, provenance/compare/export, sensor honesty, test và launcher |
| `neurax-docs` | `2f9946220e2b3b1277865eebaa1ab7272381b16a` | Bridge implementation và owners; không sửa/xác nhận lại tài liệu khoa học cũ |

Commit tài liệu cuối của product chứa file này, evidence/checkpoint và cải thiện script chụp màn hình; dùng `git log -1 -- docs/execution/AGROTWIN_FINAL_HANDOFF.md` để lấy hash của chính bản bàn giao. Các chỉnh sửa README/planning có sẵn của team vẫn chưa stage/commit, bản ảnh Esri gốc được giữ ngoài commit. Backup trước triển khai ở `C:/Users/ghcoo/.codex/project-memory/agrotwin-v4/20261114T072428Z/`.

## Chạy demo

Runtime đã kiểm: native Windows, Python 3.12.14 trong lab `.venv`, Node 24.22.1. Hướng dẫn máy mới, dependencies và lệnh kiểm: [runbook](AGROTWIN_DEMO_RUNBOOK.md), [frontend README](../../frontend/README.md), [runtime/API](../../../neurax-fieldshift-lab/docs/AGROTWIN-RUNTIME.md). Node lockfile có trong frontend; Python có pyproject và `requirements-runtime-win-py312-20261112.txt` đã có sẵn. Không cần account cloud/LLM/sensor để chạy P0.

```powershell
Set-Location 'C:/Users/ghcoo/Everything/Code/Windows/Organizations/NeuraX/nasasac26-neurax/frontend'
./Start-AgroTwin.ps1
# Khi xong:
./Stop-AgroTwin.ps1
```

Mở [demo local](http://127.0.0.1:5174). Launcher kiểm/reuse service phù hợp hoặc tạo process local mới, lưu PID + creation time và log; Stop chỉ dừng process do launcher tạo sau khi kiểm identity. Các service do phiên triển khai tạo đã được dừng sau kiểm thử; server của người dùng ở 5173 không bị can thiệp.

Flow đã chạy: Entry → Mỹ Thành saved/cached → nhập điều kiện hoặc unknown → **Phân tích** → POST `/api/v1/analysis` → A1 thật → Farmer/Power cùng run → xem nguồn/QA/criterion → so run/xuất JSON → vẽ AOI B, offline → không mượn nguồn/catalog Mỹ Thành → Hardware synthetic/replay/no-device có nhãn. API bound 127.0.0.1:8000, Vite proxy từ 5174. Đây không phải deployment production.

## Kết quả nghiệm thu

**41 backend + 21 frontend unit + 24 browser test PASS**, typecheck/lint/build PASS. Browser Edge; không tắt chính sách bảo mật để chạy Chromium. 10/10 acceptance scenarios PASS, không skip/flaky. [Ma trận từng scenario, lệnh/log/artifact và các lỗi đã sửa](AGROTWIN_BUILD_EVIDENCE.md#mandatory-scenario-matrix), [kết quả máy đọc được](evidence/verification.json).

| DoD | Kết quả |
|---|---|
| AC-01 workspace/setup | PASS: backup trước sửa, branch riêng, giữ thay đổi có sẵn |
| AC-02 data/provenance | PASS: curated NASA cache và một yêu cầu POWER thực; không trộn satellite/model/field |
| AC-03 real core | PASS: A1 producer có trace, rule gate, null score; unknown không thành pass |
| AC-04 hybrid/recompute | PASS: saved preload, meaningful input, new AOI, stale, cancel/race, cache/offline |
| AC-05 hai dashboard | PASS phần mềm: chung run, next actions, source/compare/export; chưa user study |
| AC-06 sensor honesty | PASS software/mock/no-device; calibrated physical hardware NOT_TESTED |
| AC-07 demo/tests | PASS: browser/console/network/Axe/mobile, curated reconstruction/build, Python wheel |
| AC-08 docs | PASS: plan/evidence/manifest/limitations, interface/runbook, pitch 7 slide, Q01–Q20, draft Hardware |

Fresh source được dựng từ index chỉ gồm file dự kiến commit, không có raw cache/PDF/ảnh chưa rõ quyền. Tái tạo cùng `a1-69fff89f2af0fcc5fe4870cf`, scientific SHA `3b84e7ab94dfeda5fede34ecc54341ab9555a77b4255c6674d9bb4672896a76c`. Fresh build và production preview đã kiểm; dùng lại dependency cùng OS, **chưa thực hiện npm ci trên máy sạch** vì npm không có trên PATH phiên này. Python wheel build thành công bằng isolated build tools và chứa đủ bốn resource JSON. Một cảnh báo Starlette/httpx cũ vẫn còn; không ảnh hưởng các test đã qua.

## Điều có thể kết luận

| Bằng chứng | Có thể nói | Vẫn unknown / không được suy ra | Owner sign-off |
|---|---|---|---|
| Research geometry Mỹ Thành | Polygon WGS84 nghiên cứu ~2 ha, có hash/scope | Ranh pháp lý/đất đồng nhất, hiện trạng cây | Hưng + nguồn khảo sát/chủ ruộng |
| NASA POWER | Khí tượng lịch sử coarse; source/query/period/hash và QA | Số đo tại ruộng, nguồn tưới, crop suitability | Việt/Luật kiểm kỹ thuật; domain review khi dùng cho quyết định |
| SoilGrids | Model 250 m/độ sâu/quantile, có bất định | Phép đo pH/EC/soil class thực | Bích + phép đo có provenance |
| SOIL-01/S4/S5 | Bối cảnh vùng lịch sử và thí nghiệm đúng nơi/năm đã dẫn | Đất/hiện trạng/hiệu quả luân canh của chính thửa Mỹ Thành hiện nay | Bích; Luật kiểm số liệu |
| A1 | Tính completeness, QA, scope, approval gate, trace và bước cần xác minh | Cây tốt nhất, tỷ lệ tăng năng suất/tiết kiệm nước, dự báo đã kiểm | Bích/Luật + Hưng/Việt cho phương pháp |
| H1 | Đọc/ghi/replay/hiển thị context theo event | Probe tại venue đang đo AOI, calibrated VWC hoặc pH chưa có | Tiểu An + Luật |

Quyết định cụ thể phần mềm hiện hỗ trợ: trước khi thay một vụ trong chuỗi lúa, xác định điều kiện còn thiếu, tách thông tin người dùng đã cung cấp khỏi quy tắc chưa duyệt, và biết cần nhờ ai kiểm tiếp. Đổi drainage cập nhật input/trace và run; không ép kết luận đổi cây khi chưa có phương pháp. Chưa chứng minh crop optimality, hiệu quả kinh tế/nước/năng suất hoặc mức hiểu của nông dân thật. Guide chỉ dùng template, không có LLM hay crop ML được huấn luyện.

## Blocker bên ngoài và fallback đang chạy

| Blocker | Owner / cách gỡ | Fallback |
|---|---|---|
| K1 chưa có agronomic + numerical approval | Bích xác nhận source/page/year/region/crop/variety/season/condition/method; Luật kiểm độc lập; Hưng/Việt chốt phương pháp, thêm test trước nâng approval | Sáu draft không thực thi như suitability; needs_review, score null |
| Chưa có field soil/current rotation/calendar/water có provenance | Bích/Hưng cùng nguồn địa phương; ghi vị trí/depth/date/method, đối chiếu applicability | Farmer được chọn unknown; model soil và paper chỉ context |
| Chưa có device/calibration/deployment/log thực để kiểm | Tiểu An cung cấp BOM/baud/log UTC/rút USB/calibration và physical location; Luật kiểm số | No device unavailable; synthetic/replay/bench tách A1, marker chỉ minh họa |

Không chờ ba blocker này để chạy demo readiness. User study thật là bước xác nhận sản phẩm tiếp theo, chưa thực hiện. pH purchase, AWS credits/provisioning, 34 tỉnh, additional spectral layers, nationwide rules và public submission được DEFER; không phải công việc P0 đang bỏ dở.

## Tài liệu và bước tiếp theo

[Q01–Q20 + review vai trò/đối thủ/nguyên tắc luân canh](AGROTWIN_PRODUCT_DECISIONS.md), [science limits/SOIL-01](AGROTWIN_SCIENCE_LIMITATIONS.md), [sources/license/actual access](AGROTWIN_SOURCE_MANIFEST.md), [demo/pitch 7 slide](AGROTWIN_DEMO_RUNBOOK.md), [nháp duy nhất cho Tiểu An — chưa gửi](AGROTWIN_HARDWARE_DISCORD_DRAFT.md), [checkpoint](AGROTWIN_BUILD_PLAN.md).

Changelog V4: từ frontend snapshot/reference-only sang real local evaluator; thêm request/Q1/approval/cache identities; nối hai modes; sửa null/QA; tách lazy visuals khỏi core; thêm hardware context/dedup/placement labels; đóng gói asset allowlist; thêm tests, launcher và bộ bàn giao. Chưa push/deploy/gửi message/chi tiền hay sửa lịch sử dự án. Người nhận EDA có thể review các commit local hoặc bản bundle sau khi người dùng quyết định kênh chia sẻ; phiên này không tự push.
