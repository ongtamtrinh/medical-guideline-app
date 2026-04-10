import { useState, useRef, useEffect, useCallback } from "react";

const DARK = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e", text: "#e2e8f0",
  muted: "#94a3b8", accent: "#3b82f6", danger: "#ef4444", warn: "#f59e0b",
  success: "#10b981", surface: "#141720", input: "#1e2130"
};
const LIGHT = {
  bg: "#f0f4f8", card: "#ffffff", border: "#e2e8f0", text: "#1e293b",
  muted: "#64748b", accent: "#2563eb", danger: "#dc2626", warn: "#d97706",
  success: "#059669", surface: "#f8fafc", input: "#f1f5f9"
};

const GUIDELINE = {
  id: "sep-001", title: "Phác đồ Sốc Nhiễm Khuẩn", version: "3.2",
  updatedAt: "2024-11-15", department: "Hồi sức cấp cứu",
  authors: ["TS. Nguyễn Văn An", "PGS. Trần Thị Bình"],
  sections: [
    { id: "dinh-nghia", title: "1. Định nghĩa & Tiêu chuẩn chẩn đoán" },
    { id: "red-flags", title: "2. Dấu hiệu nguy hiểm (Red Flags)" },
    { id: "xu-tri", title: "3. Xử trí ban đầu (Golden Hour)" },
    { id: "khang-sinh", title: "4. Liều kháng sinh" },
    { id: "dich-truyen", title: "5. Hồi sức dịch truyền" },
    { id: "nursing", title: "6. Hướng dẫn điều dưỡng" },
    { id: "theo-doi", title: "7. Theo dõi & Đánh giá" },
  ],
  versions: [
    { v: "3.2", date: "2024-11-15", note: "Cập nhật liều Noradrenalin theo cân nặng" },
    { v: "3.1", date: "2024-08-02", note: "Bổ sung tiêu chuẩn SOFA score" },
    { v: "3.0", date: "2024-01-10", note: "Tái cấu trúc theo hướng dẫn SSC 2024" },
    { v: "2.9", date: "2023-07-20", note: "Phiên bản trước" },
  ]
};

const DRUGS = [
  { id: "nora", name: "Noradrenalin", dosePerKg: 0.1, unit: "mcg/kg/phút", min: 0.05, max: 2.0, dilution: "4mg/50ml NaCl 0.9%", rate: "Bắt đầu 0.1 mcg/kg/phút, tăng 0.05 mỗi 5 phút" },
  { id: "dopa", name: "Dopamin", dosePerKg: 5, unit: "mcg/kg/phút", min: 2, max: 20, dilution: "200mg/50ml Glucose 5%", rate: "5-10 mcg/kg/phút liều vận mạch" },
  { id: "amp", name: "Ampicillin-Sulbactam", dosePerKg: 50, unit: "mg/kg (mỗi 6h)", min: null, max: 3000, dilution: "Pha trong 100ml NaCl 0.9%", rate: "Truyền TM trong 30 phút" },
];

function useTheme() {
  const [dark, setDark] = useState(true);
  const c = dark ? DARK : LIGHT;
  return { dark, setDark, c };
}

function Badge({ color, children, style }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, ...style }}>
      {children}
    </span>
  );
}

function RedFlagBox({ c }) {
  const flags = [
    "Huyết áp tâm thu < 90 mmHg hoặc giảm > 40 mmHg so với ban đầu",
    "Lactate máu ≥ 2 mmol/L",
    "Nước tiểu < 0.5 ml/kg/giờ trong 2 giờ liên tiếp",
    "Điểm SOFA tăng ≥ 2 điểm so với nền",
    "Rối loạn ý thức cấp tính (GCS giảm ≥ 2 điểm)",
    "SpO₂ < 90% dù thở Oxy lưu lượng cao",
  ];
  return (
    <div id="red-flags" style={{ background: c.danger + "15", border: `2px solid ${c.danger}`, borderRadius: 10, padding: 16, margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ color: c.danger, fontWeight: 700, fontSize: 15 }}>DẤU HIỆU NGUY HIỂM — CẦN XỬ TRÍ NGAY</span>
      </div>
      {flags.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
          <span style={{ color: c.danger, fontWeight: 700, minWidth: 18 }}>!</span>
          <span style={{ color: c.text, fontSize: 13.5 }}>{f}</span>
        </div>
      ))}
      <div style={{ marginTop: 10, padding: "8px 12px", background: c.danger + "22", borderRadius: 6, color: c.danger, fontSize: 12, fontWeight: 600 }}>
        CHỐNG CHỈ ĐỊNH: Không dùng corticosteroid liều cao; Không trì hoãn kháng sinh &gt; 1 giờ sau khi nhận diện sốc
      </div>
    </div>
  );
}

function DosageCalc({ drug, c }) {
  const [weight, setWeight] = useState(60);
  const dose = (drug.dosePerKg * weight).toFixed(2);
  const capped = drug.max ? Math.min(parseFloat(dose), drug.max) : dose;
  return (
    <div style={{ background: c.accent + "12", border: `1px solid ${c.accent}44`, borderRadius: 8, padding: 12, margin: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: c.accent, fontWeight: 600, fontSize: 13 }}>{drug.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ color: c.muted, fontSize: 12 }}>Cân nặng:</label>
          <input type="number" value={weight} min={1} max={200} onChange={e => setWeight(+e.target.value)}
            style={{ width: 60, padding: "2px 6px", borderRadius: 5, border: `1px solid ${c.border}`, background: c.input, color: c.text, fontSize: 13, textAlign: "center" }} />
          <span style={{ color: c.muted, fontSize: 12 }}>kg</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: c.muted }}>→ Liều:</span>
          <span style={{ color: c.accent, fontWeight: 700, fontSize: 15 }}>{capped}</span>
          <span style={{ color: c.muted, fontSize: 12 }}>{drug.unit}</span>
          {drug.max && parseFloat(dose) > drug.max && <Badge color={c.warn}>Đã giới hạn tối đa</Badge>}
        </div>
      </div>
      {drug.min && (
        <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>
          Khoảng điều trị: {(drug.min * weight).toFixed(2)} – {Math.min(drug.max, drug.max).toFixed(0)} {drug.unit}
        </div>
      )}
    </div>
  );
}

function NursingPanel({ c }) {
  return (
    <div id="nursing" style={{ background: c.success + "10", border: `1px solid ${c.success}44`, borderRadius: 10, padding: 14, margin: "16px 0" }}>
      <div style={{ color: c.success, fontWeight: 700, fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span>🩺</span> CHẾ ĐỘ XEM ĐIỀU DƯỠNG
      </div>
      {DRUGS.map(d => (
        <div key={d.id} style={{ marginBottom: 10, padding: "8px 12px", background: c.card, borderRadius: 7, border: `0.5px solid ${c.border}` }}>
          <div style={{ fontWeight: 600, color: c.text, fontSize: 13, marginBottom: 4 }}>{d.name}</div>
          <div style={{ fontSize: 12, color: c.muted }}><b style={{ color: c.success }}>Pha thuốc:</b> {d.dilution}</div>
          <div style={{ fontSize: 12, color: c.muted }}><b style={{ color: c.success }}>Tốc độ truyền:</b> {d.rate}</div>
        </div>
      ))}
    </div>
  );
}

function FlowChart({ c }) {
  const steps = [
    { id: "A", label: "Nghi ngờ Sốc NK", note: "HA tụt, sốt/hạ thân nhiệt, lơ mơ", color: c.warn },
    { id: "B", label: "Lấy máu cấy × 2 + XN cơ bản", note: "Lactate, CBC, CRP, PCT, Creatinine", color: c.accent },
    { id: "C", label: "Kháng sinh ngay trong 1 giờ", note: "Broad-spectrum theo phác đồ BV", color: c.danger },
    { id: "D", label: "Bù dịch 30ml/kg Crystalloid", note: "Trong 3 giờ đầu, đánh giá đáp ứng", color: c.accent },
    { id: "E", label: "HA vẫn < 65 mmHg?", note: "Sau bù đủ dịch", color: c.warn, decision: true },
    { id: "F", label: "Noradrenalin qua đường TM trung tâm", note: "Target MAP ≥ 65 mmHg", color: c.danger },
    { id: "G", label: "Theo dõi SOFA, Lactate mỗi 2h", note: "Target: Lactate < 2, UO > 0.5ml/kg/h", color: c.success },
  ];
  return (
    <div id="xu-tri" style={{ margin: "16px 0" }}>
      <div style={{ fontWeight: 600, color: c.text, fontSize: 14, marginBottom: 10 }}>Sơ đồ xử trí — Sốc Nhiễm Khuẩn (Septic Shock)</div>
      {steps.map((s, i) => (
        <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: "100%", maxWidth: 400, padding: "8px 14px",
            background: s.color + "18", border: `2px solid ${s.color}`,
            borderRadius: s.decision ? 40 : 8, textAlign: "center"
          }}>
            <div style={{ fontWeight: 600, color: s.color, fontSize: 13 }}>{s.id}. {s.label}</div>
            <div style={{ color: c.muted, fontSize: 11 }}>{s.note}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 16, width: 2, background: c.border, margin: "1px 0" }} />
          )}
          {s.decision && (
            <div style={{ fontSize: 11, color: c.warn, fontWeight: 700, marginTop: -10 }}>CÓ ↓ | KHÔNG → Tiếp tục bù dịch</div>
          )}
        </div>
      ))}
    </div>
  );
}

function QRDisplay({ c }) {
  const url = "https://benhvien.vn/phac-do/sep-001";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(url)}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: 8 }}>
      <img src={qrUrl} alt="QR" style={{ width: 72, height: 72, borderRadius: 4 }} />
      <div>
        <div style={{ fontWeight: 600, color: c.text, fontSize: 12 }}>QR Code phác đồ</div>
        <div style={{ color: c.muted, fontSize: 11, wordBreak: "break-all" }}>{url}</div>
        <div style={{ color: c.muted, fontSize: 10, marginTop: 2 }}>Scan để truy cập nhanh trên điện thoại</div>
      </div>
    </div>
  );
}

function VersionHistory({ c }) {
  return (
    <div id="theo-doi" style={{ margin: "12px 0" }}>
      <div style={{ fontWeight: 600, color: c.text, fontSize: 13, marginBottom: 8 }}>Lịch sử cập nhật</div>
      {GUIDELINE.versions.map((v, i) => (
        <div key={v.v} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ minWidth: 32, fontSize: 11, fontWeight: 700, color: i === 0 ? c.accent : c.muted }}>v{v.v}</div>
          <div style={{ fontSize: 11, color: c.muted }}>{v.date}</div>
          <div style={{ fontSize: 12, color: i === 0 ? c.text : c.muted, flex: 1 }}>{v.note}</div>
          {i === 0 && <Badge color={c.accent}>Hiện tại</Badge>}
        </div>
      ))}
    </div>
  );
}

function PatientSheet({ c, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: c.card, borderRadius: 12, border: `1px solid ${c.border}`, maxWidth: 480, width: "100%", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, color: c.text, fontSize: 16 }}>📋 Phiếu hướng dẫn bệnh nhân</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: c.muted, fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ background: c.surface, borderRadius: 8, padding: 14, fontSize: 13.5, color: c.text, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: c.accent }}>Thông tin về tình trạng của bạn</div>
          <p><b>Bạn đang được điều trị nhiễm trùng nặng</b> (sốc nhiễm khuẩn). Đây là tình trạng nguy hiểm nhưng có thể điều trị được nếu phát hiện sớm.</p>
          <div style={{ fontWeight: 600, marginTop: 10, color: c.warn }}>⚡ Điều quan trọng cần biết:</div>
          <ul style={{ paddingLeft: 18, margin: "6px 0" }}>
            <li>Bạn đang được truyền kháng sinh và dịch để hỗ trợ huyết áp</li>
            <li>Máy theo dõi tim và huyết áp sẽ hoạt động liên tục</li>
            <li>Hãy báo ngay cho y tá nếu cảm thấy khó thở, đau ngực</li>
          </ul>
          <div style={{ fontWeight: 600, marginTop: 10, color: c.success }}>✅ Việc bạn có thể làm:</div>
          <ul style={{ paddingLeft: 18, margin: "6px 0" }}>
            <li>Nằm nghỉ ngơi, tránh vận động mạnh</li>
            <li>Uống nước khi bác sĩ cho phép</li>
            <li>Thông báo ngay nếu có triệu chứng bất thường</li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ flex: 1, padding: "8px 0", background: c.accent, color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🖨️ In phiếu</button>
          <button style={{ flex: 1, padding: "8px 0", background: c.success, color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>📱 Chia sẻ Zalo</button>
        </div>
      </div>
    </div>
  );
}

function PDFEditor({ c, onClose }) {
  const [stage, setStage] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [fields, setFields] = useState({
    title: "Phác đồ Điều trị Viêm phổi Cộng đồng",
    version: "2.1", department: "Nội hô hấp",
    drugs: "Amoxicillin 500mg mỗi 8 giờ, Azithromycin 500mg/ngày",
    redFlags: "SpO₂ < 92%, Nhịp thở > 30 lần/phút, CURB-65 ≥ 3",
    duration: "5-7 ngày với bệnh nhẹ; 10-14 ngày với bệnh nặng"
  });

  const simulate = () => {
    setStage("parsing"); setProgress(0);
    const t = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(t); setStage("review"); return 100; } return p + 8; });
    }, 120);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: c.card, borderRadius: 12, border: `1px solid ${c.border}`, maxWidth: 520, width: "100%", padding: 20, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: c.text, fontSize: 15 }}>📄 Nhập phác đồ từ PDF</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: c.muted, fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {stage === "upload" && (
          <div>
            <div style={{ border: `2px dashed ${c.accent}55`, borderRadius: 10, padding: 32, textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <div style={{ color: c.muted, fontSize: 13 }}>Kéo thả file PDF hoặc</div>
              <button style={{ marginTop: 10, padding: "8px 20px", background: c.accent, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }} onClick={simulate}>
                Chọn file PDF
              </button>
            </div>
            <div style={{ color: c.muted, fontSize: 11, textAlign: "center" }}>AI sẽ tự động trích xuất nội dung phác đồ</div>
          </div>
        )}
        {stage === "parsing" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
            <div style={{ color: c.text, fontWeight: 600, marginBottom: 12 }}>AI đang phân tích PDF...</div>
            <div style={{ height: 6, background: c.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: c.accent, borderRadius: 99, transition: "width 0.1s" }} />
            </div>
            <div style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>
              {progress < 40 ? "Đang nhận dạng văn bản..." : progress < 70 ? "Trích xuất cấu trúc phác đồ..." : "Phân loại thuốc & liều dùng..."}
            </div>
          </div>
        )}
        {stage === "review" && (
          <div>
            <div style={{ color: c.success, fontWeight: 600, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>✅</span> AI đã trích xuất thành công — Vui lòng xác nhận lại:
            </div>
            {Object.entries(fields).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ color: c.muted, fontSize: 11, display: "block", marginBottom: 3 }}>
                  {{ title: "Tên phác đồ", version: "Phiên bản", department: "Khoa", drugs: "Thuốc sử dụng", redFlags: "Red Flags", duration: "Thời gian điều trị" }[k]}
                </label>
                <input value={v} onChange={e => setFields({ ...fields, [k]: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", background: c.input, border: `1px solid ${c.border}`, borderRadius: 6, color: c.text, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, padding: "8px 0", background: c.success, color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>💾 Lưu phác đồ</button>
              <button onClick={() => setStage("upload")} style={{ flex: 1, padding: "8px 0", background: c.surface, color: c.text, border: `1px solid ${c.border}`, borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>↩ Tải lại</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidelineDashboard() {
  const { dark, setDark, c } = useTheme();
  const [nursingMode, setNursingMode] = useState(false);
  const [activeSection, setActiveSection] = useState("dinh-nghia");
  const [showPatient, setShowPatient] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
      {showPatient && <PatientSheet c={c} onClose={() => setShowPatient(false)} />}
      {showPDF && <PDFEditor c={c} onClose={() => setShowPDF(false)} />}

      {/* Top Bar */}
      <div style={{ background: c.card, borderBottom: `1px solid ${c.border}`, padding: "10px 16px", position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", fontSize: 18 }}>☰</button>
        <span style={{ fontWeight: 700, color: c.accent, fontSize: 15 }}>🏥 ClinicalGuide</span>
        <span style={{ color: c.border, fontSize: 18 }}>|</span>
        <span style={{ color: c.text, fontWeight: 600, fontSize: 13, flex: 1 }}>{GUIDELINE.title}</span>
        <Badge color={c.accent}>v{GUIDELINE.version}</Badge>
        <Badge color={c.success}>{GUIDELINE.department}</Badge>

        {/* Nursing Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: c.muted }}>Điều dưỡng</span>
          <div onClick={() => setNursingMode(!nursingMode)} style={{
            width: 38, height: 20, borderRadius: 99, background: nursingMode ? c.success : c.border,
            cursor: "pointer", position: "relative", transition: "background 0.2s"
          }}>
            <div style={{ position: "absolute", top: 2, left: nursingMode ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </div>
        </div>

        <button onClick={() => setDark(!dark)} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
          {dark ? "☀️ Sáng" : "🌙 Tối"}
        </button>
        <button onClick={() => setShowPDF(true)} style={{ background: c.accent, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          📄 Nhập PDF
        </button>
      </div>

      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto" }}>
        {/* Sidebar TOC */}
        {sidebarOpen && (
          <div style={{ width: 210, minWidth: 210, position: "sticky", top: 49, height: "calc(100vh - 49px)", overflowY: "auto", background: c.card, borderRight: `1px solid ${c.border}`, padding: "14px 10px", boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>MỤC LỤC</div>
            {GUIDELINE.sections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{
                display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 2,
                background: activeSection === s.id ? c.accent + "22" : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer",
                color: activeSection === s.id ? c.accent : c.muted,
                fontSize: 12, fontWeight: activeSection === s.id ? 600 : 400,
                borderLeft: `3px solid ${activeSection === s.id ? c.accent : "transparent"}`
              }}>
                {s.title}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 14, paddingTop: 14 }}>
              <div style={{ fontSize: 11, color: c.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CÔNG CỤ</div>
              <button onClick={() => setShowPatient(true)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", marginBottom: 4, background: c.success + "18", border: `1px solid ${c.success}33`, borderRadius: 6, cursor: "pointer", color: c.success, fontSize: 12, fontWeight: 600 }}>
                👤 Phiếu bệnh nhân
              </button>
              <button onClick={() => setShowPDF(true)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", background: c.accent + "18", border: `1px solid ${c.accent}33`, borderRadius: 6, cursor: "pointer", color: c.accent, fontSize: 12, fontWeight: 600 }}>
                📄 Nhập từ PDF
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, padding: "16px 20px", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>

          {/* Header Card */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <Badge color={c.accent}>ICD-10: A41.9</Badge>
              <Badge color={c.warn}>Ưu tiên: Khẩn cấp</Badge>
              <Badge color={c.muted}>Cập nhật: {GUIDELINE.updatedAt}</Badge>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: c.text }}>{GUIDELINE.title}</h1>
            <div style={{ color: c.muted, fontSize: 12 }}>Tác giả: {GUIDELINE.authors.join(" • ")}</div>
          </div>

          {/* Section 1 */}
          <div id="dinh-nghia" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>1. Định nghĩa & Tiêu chuẩn chẩn đoán</h2>
            <p style={{ color: c.muted, fontSize: 13.5, lineHeight: 1.7, margin: "0 0 8px" }}>
              Sốc nhiễm khuẩn là trường hợp nhiễm khuẩn huyết (sepsis) có hạ huyết áp kéo dài dù đã bù đủ dịch, cần sử dụng thuốc vận mạch để duy trì MAP ≥ 65 mmHg, và lactate máu &gt; 2 mmol/L (theo định nghĩa Sepsis-3, 2016).
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ padding: "8px 14px", background: c.accent + "15", borderRadius: 7, border: `1px solid ${c.accent}33`, fontSize: 12 }}>
                <div style={{ color: c.muted, fontSize: 11 }}>Tiêu chuẩn SOFA</div>
                <div style={{ color: c.accent, fontWeight: 700 }}>≥ 2 điểm</div>
              </div>
              <div style={{ padding: "8px 14px", background: c.danger + "15", borderRadius: 7, border: `1px solid ${c.danger}33`, fontSize: 12 }}>
                <div style={{ color: c.muted, fontSize: 11 }}>Lactate máu</div>
                <div style={{ color: c.danger, fontWeight: 700 }}>&gt; 2 mmol/L</div>
              </div>
              <div style={{ padding: "8px 14px", background: c.warn + "15", borderRadius: 7, border: `1px solid ${c.warn}33`, fontSize: 12 }}>
                <div style={{ color: c.muted, fontSize: 11 }}>MAP mục tiêu</div>
                <div style={{ color: c.warn, fontWeight: 700 }}>≥ 65 mmHg</div>
              </div>
            </div>
          </div>

          {/* Red Flags */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>2. Dấu hiệu nguy hiểm</h2>
            <RedFlagBox c={c} />
          </div>

          {/* Flowchart */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>3. Sơ đồ xử trí</h2>
            <FlowChart c={c} />
          </div>

          {/* Drug Dosage Calculator */}
          <div id="khang-sinh" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 6px" }}>4. Tính liều thuốc theo cân nặng</h2>
            <div style={{ color: c.muted, fontSize: 12, marginBottom: 10 }}>Nhập cân nặng bệnh nhân để tính liều tự động:</div>
            {DRUGS.map(d => <DosageCalc key={d.id} drug={d} c={c} />)}
          </div>

          {/* Nursing Panel */}
          {nursingMode && (
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>5. Hồi sức dịch truyền</h2>
              <NursingPanel c={c} />
            </div>
          )}

          {/* Patient Sheet Button */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 8px" }}>Hướng dẫn bệnh nhân</h2>
            <p style={{ color: c.muted, fontSize: 13, marginBottom: 12 }}>Tạo phiếu hướng dẫn bằng ngôn ngữ dễ hiểu để đưa cho bệnh nhân và thân nhân.</p>
            <button onClick={() => setShowPatient(true)} style={{
              padding: "10px 20px", background: `linear-gradient(90deg, ${c.success}, ${c.accent})`,
              color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
            }}>
              👤 Tạo phiếu cho bệnh nhân
            </button>
          </div>

          {/* QR + Version */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>📱 Mã QR phác đồ</h2>
              <QRDisplay c={c} />
            </div>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: "0 0 10px" }}>🕐 Lịch sử phiên bản</h2>
              <VersionHistory c={c} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
