"""Import presentation only from the verified Lab v2; models/data remain in Lab."""
from pathlib import Path
import hashlib,json
ui=Path(__file__).resolve().parents[2];lab=ui.parents[1]/'neurax-fieldshift-lab'
source=lab/'frontend-v2/src/App.tsx'
text=source.read_text(encoding='utf-8')
text="import './styles/fieldshift-v2.css';\nimport i18n from 'i18next';\n"+text
text=text.replace('export default function App(){','export default function FieldShiftV2(){\n useEffect(()=>{void i18n.changeLanguage("vi")},[]);')
(ui/'frontend/src/FieldShiftV2.tsx').write_text(text,encoding='utf-8')
(ui/'frontend/src/styles/fieldshift-v2.css').write_bytes((lab/'frontend-v2/src/styles/v2.css').read_bytes())
(ui/'frontend/FIELDSHIFT_V2_SOURCE.json').write_text(json.dumps({'Lab_repository':'NeuraX-Lab/neurax-fieldshift-lab','Lab_code_commit':'173bbb86896583495a2036bf880e17e8212ae37e','Lab_handoff_commit':'32cb1bf','UI_base_commit':'728249bf6f92fa64df213c88f1e7539a25ab48bc','scope':'presentation import only; no model/data copied; local Lab API','source_App_sha256':hashlib.sha256(source.read_bytes()).hexdigest()},indent=2),encoding='utf-8')
