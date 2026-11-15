# Bộ skill và cách dùng cho remake AgroTwin

Chuẩn bị ngày 15/11/2026 bằng `find-skills`. Đây là phân công công cụ cho tác vụ UI, không thay [DASHBOARD_SPEC.md](DASHBOARD_SPEC.md). Skill không tự bảo đảm hiểu đúng sản phẩm; kiểm flow và kết quả trên browser vẫn là điều kiện bàn giao.

## 1. Đã tìm và cài gì?

Đã xem leaderboard skills.sh, trang từng skill, metadata repository chính chủ và source ở commit pin. Không cần cài thêm frontend-design, Impeccable, UI/UX Pro Max, Emil, Web Design Guidelines hoặc React best practices vì đã có.

| Skill mới | Nguồn và pin | Mục đích |
|---|---|---|
| `vercel-composition-patterns` | Vercel, `vercel-labs/agent-skills`, `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`, path `skills/composition-patterns` | Tách UI khỏi provider/state, chia component theo tác vụ, tránh một component dashboard ôm nhiều chế độ |
| `webapp-testing` | Anthropic, `anthropics/skills`, `1780c5e5a552fd4d1c9d6a7b0cab26b0c2bef064`, path `skills/webapp-testing` | Kiểm luồng thực trong browser, DOM/screenshot/log và các trạng thái lỗi |

Đường cài:

- `C:/Users/ghcoo/.codex/skills/vercel-composition-patterns/SKILL.md`
- `C:/Users/ghcoo/.codex/skills/webapp-testing/SKILL.md`

Đã dùng installer có sẵn của Codex, pin commit và không ghi đè skill cũ. Sau khi cài cần một lượt nhắn tiếp theo để catalog skill được nhận; có thể dùng chat hiện tại hoặc chat mới.

### Nguồn tìm kiếm/độ phổ biến tại lúc kiểm

- [Composition trên skills.sh](https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns): khoảng 454,7K installs theo directory; [repo Vercel](https://github.com/vercel-labs/agent-skills) có 34.062 stars theo API khi kiểm.
- [Webapp testing trên skills.sh](https://skills.sh/anthropics/skills/webapp-testing): khoảng 205,3K installs; [repo Anthropic](https://github.com/anthropics/skills) có 194.558 stars theo API khi kiểm.
- [Redesign existing projects](https://skills.sh/leonxlnx/taste-skill/redesign-existing-projects) đã retired và chuyển về design-taste-frontend, vốn đã có. Không cài bản retired hoặc bản trùng.

Độ phổ biến chỉ là tín hiệu chọn nguồn, không chứng minh chất lượng hoặc an toàn. Chưa chạy script ứng dụng/test của các skill mới trong lượt cài này.

## 2. Review trước cài

Máy không có `skillspector` trên PATH; **không chạy SkillSpector**, không cài scanner hoặc gọi LLM bên ngoài. Đã tải vào staging ngoài thư mục skill hoạt động, đọc SKILL.md, script/examples, metadata và rà các tham chiếu nhạy cảm trước khi cài.

| Skill | Kết luận manual | Phạm vi cần lưu ý |
|---|---|---|
| Composition | **APPROVE** | Nội dung Markdown/TSX minh họa, không có executable helper hoặc tự cài dependency; không thấy hành vi đọc secret/gửi dữ liệu/persistence không giải thích |
| Webapp testing | **CAUTION** | `with_server.py` chạy shell command do người gọi đưa vào và terminate child process; examples ghi screenshot/log ra đường Linux mẫu. Không thấy truy cập secret hoặc gửi tới dịch vụ ngoài; vẫn cần điều khiển lifecycle và path đúng project |

Đây là review nguồn thủ công, không phải chứng nhận an toàn tuyệt đối. Không chạy helper hoặc example như black box chỉ vì đã cài skill.

**Áp dụng vào AgroTwin:** giữ browser connector/CUA và bộ Playwright TypeScript hiện có. Không cài Python Playwright hoặc chuyển test framework chỉ để khớp ví dụ của skill. Không gọi server wrapper trên 5174/8000 đang chạy, không kill server của người dùng. Nếu thật sự cần helper thì kiểm `--help`, ownership và lệnh trước; ưu tiên launcher của project. Wait theo trạng thái UI cần kiểm, tránh dựa riêng `networkidle` khi map có request nền.

Lệnh ecosystem tương đương để tham khảo (lượt này đã cài bằng installer Codex với commit pin):

```text
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns -g -y
npx skills add anthropics/skills --skill webapp-testing -g -y
```

Không cần chạy lại. `npm/npx` hiện không có trên PATH của shell này; không sửa hệ thống hoặc tạo bản cài trùng vì vậy.

## 3. Phân vai skill trong quá trình remake

| Giai đoạn | Skill | Cách dùng cho AgroTwin |
|---|---|---|
| Hiểu tác vụ và giữ hướng thiết kế | **Impeccable — skill chính** | Mode Operate, đọc product context, xem incumbent, tổ chức flow và giảm tải. Concept hiện có là khung AgroTwin + map tự nhiên + so lịch + sensor, không xin chọn lại từ đầu |
| Bố cục, responsive và khả năng tiếp cận | `ui-ux-pro-max` | Tra nguyên tắc phù hợp dashboard thao tác, hierarchy, form, mobile/keyboard. Không áp bảng màu/font mới thay identity đã chốt |
| Kiểm chất lượng thị giác | `frontend-design` | Rà tính chủ đích, nội dung thật và tránh template chung. Không dùng cấu trúc landing/hero/marketing cho màn thao tác |
| Component và state/provider | **`vercel-composition-patterns`** | Chia theo tác vụ, dùng interface rõ cho A1/v2/sensor; tránh component nhiều boolean. Không overengineer hoặc thay mọi hook chỉ vì ví dụ React 19 |
| React và hiệu năng | `vercel-react-best-practices` | Giữ map/chart không chặn phần quyết định, tránh rerender/thêm dependency không cần; xem đúng quy tắc liên quan |
| Interaction sau khi flow đã chạy | `emil-design-eng` | Focus, feedback, loading, đóng/mở panel, trạng thái chọn/lưu. Motion nhẹ có mục đích, tôn trọng reduced motion |
| Rà UI cuối | `web-design-guidelines` | Form labels, contrast, focus, keyboard, touch và error states |
| Browser verification | **`webapp-testing`** | Reconnaissance→action→verify; kiểm flow A/B/C/D, network/data mode và screenshot desktop/mobile bằng công cụ project đang có |

Các skill sẵn có ở `C:/Users/ghcoo/.codex/skills/`; React best practices nằm trong thư mục `react-best-practices`, tên frontmatter là `vercel-react-best-practices`. Không tạo bản trùng do khác tên thư mục.

## 4. Cách phối hợp để không tự gây nhiễu

- Một hướng thẩm mỹ: AgroTwin đã chốt. Impeccable giữ vai trò chính; không chạy nhiều bộ sinh art direction, thay palette/font hoặc tạo ba concept mới.
- Nạp skill đúng giai đoạn; không đọc toàn bộ thư viện upfront. Spec quyết định người dùng cần làm gì; skill giúp làm điều ấy rõ và đẹp hơn.
- Không cài thêm shadcn/MUI/chart/map library để tạo dashboard mẫu khi stack hiện tại đủ. Nếu có nhu cầu thật thì kiểm dependency và phạm vi trước.
- Không thêm animation, chỉ số, source badge hoặc cards chỉ để giao diện trông đầy. So sánh có căn cứ và bước tiếp theo phải nổi hơn chi tiết nghiên cứu.
- Không khởi động agents/subagents, bridge Gemini hoặc phiên LLM ngoài để “kết hợp nhiều skills”. Tác vụ hiện là một chat phụ trách; chỉ delegate khi owner yêu cầu rõ.
- Mỗi milestone phải thấy kết quả thật trên browser và ghi giới hạn. Viết code xong hoặc build pass chưa thay cho kiểm hữu ích của flow.

## 5. Dùng trong chat tiếp theo

Đọc [UI_REMAKE_START_HERE.md](UI_REMAKE_START_HERE.md), rồi dùng nguyên nội dung [UI_REMAKE_PROMPT.md](UI_REMAKE_PROMPT.md) để giao việc. Chat Codex mới trên cùng máy sẽ có catalog skill mới và đường dẫn source/WIP rõ. Chat hiện tại cũng dùng được từ lượt tiếp theo.

Không cần cài thêm skill để bắt đầu. Những thiếu hụt còn lại là runtime artifacts/cache, provider map và xác nhận thiết bị/nông học đã ghi trong review, không phải thiếu một bộ template giao diện.
