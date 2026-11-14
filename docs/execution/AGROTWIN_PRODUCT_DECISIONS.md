# AgroTwin V4 — quyết định sản phẩm và coverage Q01–Q20

Ngày 14/11/2026. Đây là quyết định implementation và giả thuyết thiết kế; không phải nghiên cứu người dùng. Mỹ Thành giữ primary case, Cai Lậy/Long Khánh là tham chiếu lịch sử.

## Theo vai trò và công việc cần làm

| Vai trò / giả thuyết | Quyết định được hỗ trợ | Đã làm | Chưa chứng minh |
|---|---|---|---|
| Nông dân có kinh nghiệm, có thể dùng điện thoại | Còn cần xác nhận gì trước khi thay một vụ lúa? | Đầu vào có unknown; ba bước tiếp theo trước; tiếng Việt; nguồn mở thêm; không ép chọn cây | Mức dễ hiểu, chữ/kích thước phù hợp thực tế, khả năng tự hoàn thành ngoài đồng |
| Chuyên gia / QA | Điều kiện nào thiếu, nguồn nào dùng, tại sao chưa đề xuất? | Farmer/Power cùng A1; criterion/source/scope; QA fail; so run và xuất JSON | Áp dụng nông học và kiểm số liệu độc lập |
| Doanh nghiệp / điều phối | So các vùng/run mà không trộn bằng chứng | Nhóm vùng lưu cục bộ, scope/hash, lịch sử phiên, dữ liệu khác vùng không bị mượn | Multi-user, phân quyền, dữ liệu doanh nghiệp đồng bộ |
| Hardware | Số đo này đến từ đâu và có dùng cho ruộng không? | Context/latest, history, replay, raw units/calibration metadata, simulated placement | Thiết bị thật, calibration, deployment ngoài đồng |

Không tạo thêm skill toàn cục chỉ để giả lập vai trò. Review theo bảng và browser scenarios có thể lặp lại. Script user test đề xuất: người tham gia tự mở mẫu, chọn unknown đúng tình huống, đổi điều kiện, phân tích, giải thích vì sao needs_review, tìm nguồn và phân biệt bench/field. Ghi thời gian, lỗi, diễn giải bằng lời; chỉ kết luận hiểu khi có dữ liệu thật. Chưa chạy user test này.

## Ba sản phẩm tham chiếu

Hai nguồn ngoài CropX đã có trong repo trước V4: OneSoil và EOSDA (`docs/uiux-case-selection.md`, `docs/uiux-v4-review.md`). Đọc lại nguồn chính thức ngày 14/11/2026; đây là mô tả nhà cung cấp, không phải benchmark độc lập.

| Công cụ | Chức năng được nguồn mô tả | Pattern dùng trong AgroTwin | Ranh giới |
|---|---|---|---|
| [CropX](https://cropx.com/cropx-platform/) | Kết hợp cảm biến, khí tượng, vệ tinh; theo dõi ruộng và lập kế hoạch tưới/nông học | Gắn số đo với context, nguồn và lịch sử | AgroTwin chưa có chất lượng tư vấn, hardware integration hay bằng chứng lợi ích tương đương |
| [OneSoil](https://help.onesoil.ai/en/articles/5235420-how-to-plan-crop-rotation-with-onesoil) | Bảng cây theo ruộng/mùa; phân bổ cây có xét cây trước | Mẫu mở sẵn, mùa/cây/lịch sử theo vùng | Không sao chép automatic crop allocation khi chưa có K1 phù hợp |
| [EOSDA](https://eos.com/products/crop-monitoring/) | Theo dõi vệ tinh/thời tiết, lịch sử và scout/report | Map + kỳ quan sát + QA/provenance | Chưa có crop-stage/risk response hay NDVI classifier được kiểm |

AgroTwin hiện cung cấp một luồng kiểm điều kiện minh bạch cho case nghiên cứu Việt Nam, hai cách xem cùng core, và hoạt động từ real cache. Đây là định hướng giá trị, chưa chứng minh mới hơn/tốt hơn đối thủ. Không dẫn phần trăm tiết kiệm/năng suất của nhà cung cấp thành kết quả NeuraX.

## Nguyên tắc luân canh và trạng thái runtime

| Nguyên tắc cần xét | Nguồn/định vị đang có | Runtime |
|---|---|---|
| Mùa, giống, lịch gieo/thu hoạch | VAAS-MUNG-2014, AGRO-BABY-2008; locator ở registry | Draft; thiếu lịch áp dụng tại ruộng |
| Nguồn tưới, giai đoạn cây, thoát nước/ngập | S4, EXT-MUNG-2018, AGRO-BABY-2008 | Kiểm thiếu input; không chạy ngưỡng giờ ngập chưa duyệt |
| Đất, dinh dưỡng, cấu trúc, tàn dư | SOIL-01, S4/S5; phân biệt vùng lịch sử và ruộng | Không biến soil map/model thành phép đo |
| Họ cây, sâu bệnh, cây trước và quản lý | Catalog yêu cầu bằng chứng đúng crop/pest/context | Unknown nếu chưa có phương pháp và nguồn áp dụng |
| Cân bằng hữu cơ/nitrogen và hiệu quả kinh tế | Cần biomass/residue/management và dữ liệu địa phương | Chưa tính benefit/score; cây chết không chứng minh dưỡng đất |

Nguồn locator đầy đủ: `../../../neurax-fieldshift-lab/neurax/resources/agrotwin/sources.json`. Mỗi rule giữ draft + reviewer null; các kiểm completeness, QA và scope chỉ là policy kỹ thuật. Chỉ predicate đã duyệt, đủ input và đúng scope mới chạy; test SYNTHETIC không cấp approval production.

## Coverage

| ID | Trạng thái | Quyết định / bằng chứng |
|---|---|---|
| Q01 | decision | Review vai trò trên; không cài skill mới, user test chưa chạy |
| Q02 | implemented | Home latest có source/mode/time/quality; Hardware history/replay; không thiết bị → unavailable |
| Q03 | decision | Bảng CropX/OneSoil/EOSDA trên; không chứng minh superiority |
| Q04 | implemented | Mỹ Thành MT-BLOCK-01 giữ primary; polygon nghiên cứu và coarse climate có nhãn |
| Q05 | implemented | Catalog theo scope; input đổi tạo run/trace; AOI B không mượn R0–R2; chưa đủ outcome labels để học pattern |
| Q06 | implemented | Farmer ưu tiên ba next actions; Power chứa trace và so sánh; không vanity score |
| Q07 | decision | Giá trị giả thuyết là evidence-gap workflow Việt Nam; chưa có so sánh hiệu quả độc lập |
| Q08 | decision | P0 dùng POWER khí tượng + context SoilGrids/papers; spectral/thermal/radar chỉ khi cần giải quyết bare-field/stress và QA phù hợp |
| Q09 | implemented | Deterministic readiness/rule-gating; guide là template; không LLM hay trained crop ML |
| Q10 | decision | AWS/credit $200 chưa xác minh; local P0 đủ, không cấp phát/chi tiền |
| Q11 | decision | SOIL-01 8 trang, 276 mũi khoan, 2009/2011, lịch sử Tiền Giang; scientific limitations ghi hash/locator |
| Q12 | decision | pH chưa mua; DEFER; mượn/lab khi criterion cần, giữ method/depth/date/calibration |
| Q13 | implemented | Sample Mỹ Thành + vẽ/nhập AOI + phân tích; map 34 tỉnh P1 cần geometry/license |
| Q14 | implemented | Saved preload; chỉ Analyze gọi API; computed/cache/offline/stale riêng, race/cancel guard |
| Q15 | implemented | Simulated placement rõ ràng, unverified deployment; bench không vào A1 |
| Q16 | blocked | Field soil/current rotation/applicability chưa xác nhận; output needs_review chạy được |
| Q17 | decision | Demo vào sample; cá nhân tạo vùng local; nhóm workspace chỉ metadata, chưa auth/admin quyền mới |
| Q18 | implemented | Next actions/source/warnings đã chạy; mức hiểu của người thật chưa kiểm |
| Q19 | decision | Bảng nguyên tắc trên; trace/catalog giữ source scope; không dùng ngưỡng chưa duyệt |
| Q20 | decision | Manifest/attribution/commit history thật; NASA legal indexed source, chưa xác nhận toàn bộ Resources; không public submit |

Q16 cần Bích xác minh phạm vi cây/giống/mùa/đất/nước, Luật kiểm số liệu và Hưng/Việt thống nhất phương pháp trước khi mở khuyến nghị. P0 hiện tại vẫn hỗ trợ quyết định thu thập/kiểm bằng chứng trước khi đổi vụ.
