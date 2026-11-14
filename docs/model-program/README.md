# Model Completion — local research integration

Nhánh `research/model-completion`, tiếp nối product V5 pin `728249bf6f92fa64df213c88f1e7539a25ab48bc`. Chưa push, chưa V5.1 và chưa có owner acceptance.

Power có `ModelProgramEvidence.tsx`: đọc `GET /api/v1/research/model-program` từ sibling lab, validate schema `agrotwin-model-program-1`, hiển thị benchmark/temp/rain và EO coverage. Đây là recorded evaluation report, không request-time forecast. API lỗi thì unavailable, unsupported geometry không mượn Mỹ Thành. Farmer/Power vẫn dùng chung A1; `forecast` vẫn null, K1 draft và score null được giữ.

Canonical review packet ở sibling lab `docs/model-program/MODEL_PROGRAM_START_HERE.md`; code training và EO ở `neurax/agrotwin/model_program.py`, `eo_program.py`. `frontend/public/research/model-program.json` là bản dẫn xuất phục vụ reproducibility/download/tests; component không dùng nó để giả API/inference khi mạng lỗi.

Tại frontend: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; start `./Start-AgroTwin.ps1 -NoBrowser`, dùng installed Edge qua `PLAYWRIGHT_CHANNEL=msedge`, chạy `npm run test:e2e`; stop `./Stop-AgroTwin.ps1`. Native Windows/Node24; sibling lab .venv Python3.12. Các kết quả và lỗi đã sửa được ghi trong lab verification receipt.
