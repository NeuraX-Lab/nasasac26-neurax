import { featureMessages } from "./features";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const phrases: Record<string, [string, string]> = {
  ...featureMessages,
  attribution: ["Map attribution", "Ghi công nguồn bản đồ"],
  restoreTerrain: ["Restore 3D view", "Khôi phục góc nhìn 3D"],
  mapCanvas: ["Interactive map canvas", "Bản đồ tương tác"],
  lowDetail: ["Lower render detail", "Giảm chi tiết hiển thị"],
  zoomIn: ["Zoom in", "Phóng to"],
  zoomOut: ["Zoom out", "Thu nhỏ"],
  pendingAOI: ["BÍCH / BOUNDARY PENDING", "BÍCH / CHỜ RANH"],
  demo: ["DEMO", "BẢN DEMO"],
  tagline: [
    "Field intelligence, in perspective.",
    "Hiểu vùng đất, nhìn rõ lựa chọn.",
  ],
  intro: [
    "Explore your land. Understand your options.",
    "Khám phá vùng đất. Hiểu các lựa chọn.",
  ],
  entryIntro: [
    "A shared view of landscape, climate and crop rotation. Start with a prepared study area, or draw your own.",
    "Cùng một góc nhìn về địa hình, khí hậu và luân canh. Mở mẫu có sẵn hoặc vẽ vùng của bạn.",
  ],
  samples: ["Study areas", "Mẫu nghiên cứu"],
  mainSample: ["Prepared research sample", "Mẫu nghiên cứu đã chuẩn bị"],
  mythanh: ["Mỹ Thành, Đồng Tháp", "Mỹ Thành, Đồng Tháp"],
  sampleTwo: ["Second study area", "Mẫu nghiên cứu thứ hai"],
  preparing: ["Preparing sample", "Đang chuẩn bị mẫu"],
  bichPending: [
    "Bích is preparing the location and study boundary. This sample opens when its inputs are verified.",
    "Bích đang chuẩn bị vị trí và ranh nghiên cứu. Mẫu sẽ mở khi đầu vào được xác minh.",
  ],
  openSample: ["Explore study area", "Mở mẫu nghiên cứu"],
  digitized: [
    "Image-digitised cultivation block. Not a surveyed or cadastral boundary.",
    "Block số hóa theo ảnh. Không phải địa chính hoặc ranh đã khảo sát.",
  ],
  myArea: ["Draw my area", "Vẽ vùng của tôi"],
  saved: ["Saved workspaces", "Workspace đã lưu"],
  noSaved: ["No personal areas saved yet.", "Chưa có vùng riêng được lưu."],
  references: ["Regional references", "Tư liệu tham chiếu vùng"],
  referenceIntro: [
    "Cai Lậy and Long Khánh provide historical research context, not additional analysis-ready fields.",
    "Cai Lậy và Long Khánh cung cấp bối cảnh lịch sử, không phải ruộng có phân tích riêng.",
  ],
  farmer: ["Farmer", "Nông dân"],
  power: ["Power user", "Chuyên gia"],
  research: ["Research", "Nghiên cứu"],
  sandbox: ["Sandbox", "Giả lập"],
  synthetic: ["Synthetic UI data", "Dữ liệu UI giả lập"],
  observed: ["Regional research data", "Dữ liệu nghiên cứu vùng"],
  changeArea: ["Change area", "Đổi vùng"],
  source: ["Sources & limits", "Nguồn & giới hạn"],
  climate: ["Regional climate", "Khí hậu vùng"],
  monthly: ["Monthly observations", "Chuỗi theo tháng"],
  climatology: ["12-month average", "Trung bình 12 tháng"],
  table: ["Table", "Bảng"],
  chart: ["Chart", "Biểu đồ"],
  rain: ["Rainfall", "Lượng mưa"],
  temp: ["Temperature", "Nhiệt độ"],
  month: ["Month", "Tháng"],
  year: ["Period", "Giai đoạn"],
  coverage: ["Coverage", "Độ phủ"],
  qa: ["Data & QA", "Dữ liệu & QA"],
  options: ["Explore rotation options", "Khám phá lựa chọn luân canh"],
  optionsIntro: [
    "Regional reference schedules. Inspect the evidence before deciding what fits your field.",
    "Các lịch tham chiếu vùng. Kiểm bằng chứng trước khi quyết định cho ruộng.",
  ],
  currentUnknown: [
    "Current field rotation is unknown.",
    "Chưa rõ lịch canh tác hiện tại.",
  ],
  reference: ["Reference", "Tham chiếu"],
  inspecting: [
    "Inspecting — not a recommendation",
    "Đang xem — không phải khuyến nghị",
  ],
  rice: ["Rice", "Lúa"],
  babycorn: ["Baby corn", "Bắp non"],
  mungbean: ["Mung bean", "Đậu xanh"],
  why: ["Why inspect this option?", "Vì sao xem phương án này?"],
  whyText: [
    "A regional study reference with a different crop between two rice seasons. Applicability to this block remains unreviewed.",
    "Lịch tham chiếu vùng với cây khác giữa hai vụ lúa. Chưa review khả năng áp dụng tại block.",
  ],
  checks: ["What needs checking", "Điều cần kiểm"],
  checksText: [
    "Current rotation, soil, water supply, drainage and seasonal timing.",
    "Lịch hiện tại, đất, nguồn nước, thoát nước và lịch mùa vụ.",
  ],
  needsReview: [
    "Field conditions need review before any recommendation.",
    "Cần review điều kiện ruộng trước khi khuyến nghị.",
  ],
  evidence: ["Evidence", "Bằng chứng"],
  inspectEvidence: ["Inspect evidence", "Xem bằng chứng"],
  assumptions: ["Assumptions", "Giả định"],
  scenario: ["Explore an assumption", "Khám phá giả định"],
  scenarioHelp: [
    "Changes are saved as a draft only. No validated response rule is available.",
    "Chỉ lưu thay đổi dạng nháp. Chưa có quy tắc phản hồi đã kiểm.",
  ],
  rainChange: ["Rainfall adjustment", "Điều chỉnh mưa"],
  tempChange: ["Temperature adjustment", "Điều chỉnh nhiệt"],
  notCalculated: [
    "Impact not calculated · Not a forecast",
    "Chưa tính tác động · Không phải dự báo",
  ],
  reset: ["Reset", "Đặt lại"],
  terrain: ["3D terrain", "Địa hình 3D"],
  flat: ["2D", "2D"],
  layers: ["Layers", "Lớp"],
  imagery: ["Research imagery", "Ảnh nghiên cứu"],
  boundary: ["Block boundary", "Ranh block"],
  terrainLimit: [
    "Elevation context only · 1× · Not a drainage assessment",
    "Bối cảnh độ cao · 1× · Không đánh giá thoát nước",
  ],
  terrainLoading: ["Loading elevation…", "Đang nạp độ cao…"],
  terrainFailed: [
    "Terrain unavailable. 2D remains usable.",
    "Không có terrain. Vẫn dùng được 2D.",
  ],
  mapFailed: ["Map unavailable", "Không tải được bản đồ"],
  mapFallback: [
    "Use the outline and coordinates below. All analysis panels remain available.",
    "Dùng ranh và tọa độ bên dưới. Các panel phân tích vẫn dùng được.",
  ],
  retry: ["Retry", "Thử lại"],
  fullscreen: ["Expand map", "Mở rộng bản đồ"],
  exitFullscreen: ["Close expanded map", "Đóng bản đồ mở rộng"],
  resetCamera: ["Reset view", "Đặt lại góc nhìn"],
  draw: ["Draw boundary", "Vẽ ranh"],
  edit: ["Edit boundary", "Chỉnh ranh"],
  clear: ["Clear drawing", "Xóa nét vẽ"],
  drawingHelp: [
    "Draw in 2D. Click vertices, then close the polygon. Use the coordinate table as a keyboard alternative.",
    "Vẽ ở 2D. Chọn đỉnh rồi đóng polygon. Có thể nhập bảng tọa độ bằng bàn phím.",
  ],
  createArea: ["Create your area", "Tạo vùng của bạn"],
  areaName: ["Area name", "Tên vùng"],
  coordinates: ["Coordinates (longitude, latitude)", "Tọa độ (kinh độ, vĩ độ)"],
  coordinateHelp: [
    "One vertex per line. At least three distinct vertices; the ring closes automatically.",
    "Mỗi dòng một đỉnh. Tối thiểu ba đỉnh khác nhau; vòng ranh tự đóng.",
  ],
  saveArea: ["Save & open area", "Lưu và mở vùng"],
  invalidGeometry: [
    "Enter a name and a valid, non-intersecting polygon with at least three distinct vertices.",
    "Nhập tên và polygon hợp lệ, không tự cắt, có ít nhất ba đỉnh khác nhau.",
  ],
  noData: [
    "No research dataset for this area",
    "Chưa có dữ liệu nghiên cứu cho vùng này",
  ],
  noDataText: [
    "Your boundary is saved. My Thanh data is not assigned to this area.",
    "Ranh đã được lưu. Dữ liệu Mỹ Thành không được gán cho vùng này.",
  ],
  unknown: ["Unknown", "Chưa rõ"],
  loading: ["Loading workspace…", "Đang nạp workspace…"],
  loadError: ["Unable to load the dataset", "Không nạp được dữ liệu"],
  keepResearch: [
    "Research has not been replaced with sandbox data.",
    "Dữ liệu nghiên cứu không bị thay bằng giả lập.",
  ],
  noA1: ["Rotation ranking unavailable", "Chưa có xếp hạng luân canh"],
  noA1Text: [
    "There is no verified A1 producer for this dataset. Reference schedules are not ranking results.",
    "Chưa có producer A1 đã kiểm cho dữ liệu này. Lịch tham chiếu không phải kết quả xếp hạng.",
  ],
  qaWarn: [
    "Source warning retained: 488.17 mm/day on 14 Jun 2020. Requires independent review.",
    "Giữ cảnh báo nguồn: 488,17 mm/ngày 14/06/2020. Cần review độc lập.",
  ],
  sandboxWarn: [
    "Synthetic values for interface exploration; not NASA observations.",
    "Số giả lập để khám phá giao diện; không phải quan sát NASA.",
  ],
  coarse: [
    "POWER is regional gridded climate, not measurements within each corner of a field.",
    "POWER là khí hậu lưới vùng, không đo tại từng góc ruộng.",
  ],
  qaTechnical: [
    "Complete coverage is not independent scientific approval.",
    "Đủ coverage không phải phê duyệt khoa học độc lập.",
  ],
  dock: ["Analysis dock", "Bảng phân tích"],
  closeDock: ["Close analysis", "Đóng bảng phân tích"],
  openDock: ["Open analysis", "Mở bảng phân tích"],
  constraints: ["Criteria & constraints", "Tiêu chí & ràng buộc"],
  provenance: ["Provenance", "Truy xuất nguồn"],
  status: ["Status", "Trạng thái"],
  score: ["Score", "Điểm"],
  unavailable: ["Unavailable", "Chưa khả dụng"],
  needsCheck: ["Needs inspection", "Cần kiểm"],
  sourceInfo: ["Source details", "Thông tin nguồn"],
  dataset: ["Dataset version", "Phiên bản dữ liệu"],
  scope: ["Spatial scope", "Phạm vi không gian"],
  resolution: ["Native resolution", "Độ phân giải gốc"],
  resolutionText: [
    "Original POWER grid; not field scale. See the product metadata.",
    "Lưới POWER gốc; không phải cấp ruộng. Xem metadata sản phẩm.",
  ],
  retrieved: ["Retrieved", "Ngày truy xuất"],
  sourceLink: ["Open original source", "Mở nguồn gốc"],
  reviewer: ["Applicable field reviewer", "Reviewer áp dụng tại ruộng"],
  unconfirmed: ["Not confirmed", "Chưa xác nhận"],
  sourceLanguage: [
    "Original source language: Vietnamese",
    "Ngôn ngữ nguồn gốc: Tiếng Việt",
  ],
  referenceLimit: [
    "Historical studies are not field verification at MT-BLOCK-01. No crop calendar or suitability is inferred.",
    "Nghiên cứu lịch sử không xác minh ruộng MT-BLOCK-01. Không suy lịch gieo hoặc suitability.",
  ],
  terrainSource: [
    "Terrain: Mapzen / USGS / NOAA",
    "Terrain: Mapzen / USGS / NOAA",
  ],
  terrainMetadata: [
    "Composite DEM. Local native resolution and accuracy are unverified. Not a field survey.",
    "DEM tổng hợp. Chưa xác minh độ phân giải gốc và độ chính xác tại chỗ. Không phải khảo sát ruộng.",
  ],
  forecast: [
    "Forecast: unavailable without task-matched E1.",
    "Forecast: chưa khả dụng khi thiếu E1 đúng task.",
  ],
  device: [
    "H1: no recent lab device readings. HCM context, not My Thanh telemetry.",
    "H1: chưa có số đo lab mới. Context HCM, không phải telemetry Mỹ Thành.",
  ],
  api: ["Lab API status", "Trạng thái API lab"],
  apiMissing: [
    "API is optional. Local snapshots remain available.",
    "API là tùy chọn. Vẫn dùng được snapshot local.",
  ],
  checkApi: ["Check configured lab API", "Kiểm API lab đã cấu hình"],
  close: ["Close", "Đóng"],
  back: ["Back to study areas", "Về bộ chọn vùng"],
  allYears: ["2015–2025", "2015–2025"],
  areaUnavailable: ["Workspace not found", "Không tìm thấy workspace"],
  localOnly: ["Saved on this browser only", "Chỉ lưu trên trình duyệt này"],
  deleteArea: ["Delete saved area", "Xóa vùng đã lưu"],
  deleteConfirm: ["Delete this local workspace?", "Xóa workspace local này?"],
  skip: ["Skip to main content", "Đến nội dung chính"],
  showData: ["Show data table", "Xem bảng dữ liệu"],
  sourceReview: ["View regional research", "Xem nghiên cứu vùng"],
  fullTable: ["Expand table", "Mở rộng bảng"],
  earth: ["Landscape workspace", "Workspace không gian"],
  drawDone: ["Use drawn polygon", "Dùng polygon đã vẽ"],
  researchNote: [
    "Remote research · Current field conditions unverified",
    "Nghiên cứu từ xa · Chưa xác minh hiện trạng ruộng",
  ],
  photoscope: [
    "Imagery dated 07 Aug 2025 · Esri, Vantor, Earthstar Geographics, GIS User Community",
    "Ảnh 07/08/2025 · Esri, Vantor, Earthstar Geographics, GIS User Community",
  ],
  noMeasurements: [
    "No independent field measurements",
    "Chưa có số đo thực địa độc lập",
  ],
  date: ["Date", "Ngày"],
  none: ["None", "Không có"],
  invalidWorkspace: [
    "This workspace ID is invalid. Choose an available area.",
    "ID workspace không hợp lệ. Hãy chọn vùng có sẵn.",
  ],
  storageError: [
    "Browser storage is unavailable. Changes last for this session only.",
    "Không dùng được bộ nhớ trình duyệt. Thay đổi chỉ giữ trong phiên này.",
  ],
  saveProblem: [
    "Could not save this area. Browser storage may be full.",
    "Không lưu được vùng. Bộ nhớ trình duyệt có thể đã đầy.",
  ],
};
phrases.geometryIllustration = ["Team-authored research geometry illustration; not current field imagery", "Minh họa geometry nghiên cứu do team dựng; không phải ảnh hiện trạng ruộng"];
phrases.contextGuide = ["Contextual guide (templates)", "Hướng dẫn theo bối cảnh (mẫu giải thích)"];
phrases.simulatedPlacement = ["SIMULATED PLACEMENT / unverified field link. Device location is not field evidence.", "VỊ TRÍ MINH HỌA / liên kết chưa xác minh. Vị trí marker không là bằng chứng đo tại ruộng."];
phrases.noA1Text = ["A readiness A1 producer is available; crop ranking remains unavailable pending reviewed rules. Reference schedules are not recommendations.", "Đã có producer A1 kiểm điều kiện; chưa có xếp hạng cây khi quy tắc chưa được duyệt. Lịch tham chiếu không là khuyến nghị."];
phrases.declaredPhysicalLocation = ["Physical location (unverified declaration)", "Vị trí vật lý (khai báo chưa xác minh)"];
phrases.depthCm = ["Placement depth, cm (optional)", "Độ sâu đặt, cm (tùy chọn)"];
export const resources = {
  en: {
    translation: Object.fromEntries(
      Object.entries(phrases).map(([k, v]) => [k, v[0]]),
    ),
  },
  vi: {
    translation: Object.fromEntries(
      Object.entries(phrases).map(([k, v]) => [k, v[1]]),
    ),
  },
};
let language = "en";
try {
  language = localStorage.getItem("agrotwin-language") === "vi" ? "vi" : "en";
} catch {
  /* session only */
}
void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
export default i18n;
