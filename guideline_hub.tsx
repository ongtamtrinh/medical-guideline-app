import { useState, useMemo } from "react";

/* ─── THEME ─── */
const T = {
  dark:  { bg:"#0f1117", card:"#1a1d27", border:"#2a2d3e", text:"#e2e8f0", muted:"#94a3b8", accent:"#3b82f6", danger:"#ef4444", warn:"#f59e0b", success:"#10b981", surface:"#141720", input:"#1e2130", purple:"#a78bfa", teal:"#14b8a6" },
  light: { bg:"#f0f4f8", card:"#ffffff", border:"#e2e8f0", text:"#1e293b", muted:"#64748b", accent:"#2563eb", danger:"#dc2626", warn:"#d97706", success:"#059669", surface:"#f8fafc", input:"#f1f5f9", purple:"#7c3aed", teal:"#0d9488" },
};

/* ─── DATA ─── */
const GUIDELINES = [
  {
    id:"sep-001", title:"Sốc Nhiễm Khuẩn", subtitle:"Septic Shock",
    icd:"A41.9", dept:"Hồi sức cấp cứu", version:"3.2",
    updated:"2024-11-15", priority:"emergency",
    authors:["TS. Nguyễn Văn An","PGS. Trần Thị Bình"],
    tags:["Nhiễm khuẩn","Vận mạch","ICU","Lactate","SOFA"],
    color:"#ef4444", icon:"🫀",
    sections:["Định nghĩa & Tiêu chuẩn","Dấu hiệu nguy hiểm","Xử trí ban đầu","Liều kháng sinh","Hồi sức dịch","Hướng dẫn điều dưỡng","Theo dõi"],
    drugs:["Noradrenalin","Dopamin","Ampicillin-Sulbactam"],
    refs:4, views:1284, saves:312,
    relatedIds:["cap-001","se-001"],
  },
  {
    id:"cap-001", title:"Viêm phổi Cộng đồng", subtitle:"Community-Acquired Pneumonia",
    icd:"J18.9", dept:"Nội hô hấp", version:"2.1",
    updated:"2024-09-10", priority:"urgent",
    authors:["ThS. Lê Quang Hưng","TS. Phạm Thị Lan"],
    tags:["Hô hấp","Kháng sinh","CURB-65","Nội trú","Ngoại trú"],
    color:"#3b82f6", icon:"🫁",
    sections:["Chẩn đoán & CURB-65","Dấu hiệu nguy hiểm","Sơ đồ xử trí","Phác đồ kháng sinh","Hướng dẫn điều dưỡng","Theo dõi & Xuất viện"],
    drugs:["Amoxicillin-Clavulanate","Azithromycin","Ceftriaxone"],
    refs:4, views:987, saves:241,
    relatedIds:["sep-001","se-001"],
  },
  {
    id:"se-001", title:"Trạng thái Động kinh", subtitle:"Status Epilepticus",
    icd:"G41.9", dept:"Thần kinh / ICU", version:"2.0",
    updated:"2024-10-01", priority:"emergency",
    authors:["PGS. Nguyễn Đình Toàn","ThS. Trần Minh Khoa"],
    tags:["Thần kinh","Benzodiazepine","EEG","Gây mê","Kháng trị"],
    color:"#8b5cf6", icon:"🧠",
    sections:["Định nghĩa & Phân loại","Dấu hiệu nguy hiểm","Đồng hồ xử trí","Phác đồ theo thời gian","Tính liều thuốc","Hướng dẫn điều dưỡng"],
    drugs:["Lorazepam","Fosphenytoin","Levetiracetam","Midazolam"],
    refs:5, views:743, saves:189,
    relatedIds:["sep-001","cap-001"],
  },
  {
    id:"ami-001", title:"Nhồi máu cơ tim cấp", subtitle:"Acute Myocardial Infarction",
    icd:"I21.9", dept:"Tim mạch can thiệp", version:"1.8",
    updated:"2024-08-20", priority:"emergency",
    authors:["GS. Phạm Gia Khải","TS. Ngô Thị Thu"],
    tags:["Tim mạch","PCI","Aspirin","Heparin","STEMI","NSTEMI"],
    color:"#f59e0b", icon:"❤️",
    sections:["Phân loại STEMI/NSTEMI","ECG chẩn đoán","Xử trí cấp cứu","Chiến lược tái tưới máu","Thuốc chống đông","Phục hồi chức năng"],
    drugs:["Aspirin","Clopidogrel","Heparin","Tenecteplase"],
    refs:6, views:1102, saves:298,
    relatedIds:["sep-001"],
  },
  {
    id:"dm2-001", title:"Đái tháo đường type 2", subtitle:"Type 2 Diabetes Mellitus",
    icd:"E11.9", dept:"Nội tiết", version:"4.0",
    updated:"2024-07-01", priority:"routine",
    authors:["PGS. Tạ Văn Bình","ThS. Lê Thị Hoa"],
    tags:["Nội tiết","Insulin","HbA1c","Metformin","Lối sống"],
    color:"#10b981", icon:"🩸",
    sections:["Tiêu chuẩn chẩn đoán","Mục tiêu điều trị","Phác đồ thuốc uống","Liệu pháp Insulin","Theo dõi biến chứng","Giáo dục bệnh nhân"],
    drugs:["Metformin","Glipizide","Insulin Glargine","Empagliflozin"],
    refs:5, views:856, saves:220,
    relatedIds:["sep-001"],
  },
  {
    id:"stroke-001", title:"Đột quỵ thiếu máu cục bộ", subtitle:"Ischemic Stroke",
    icd:"I63.9", dept:"Thần kinh mạch máu", version:"2.3",
    updated:"2024-06-15", priority:"emergency",
    authors:["TS. Lê Văn Thành","BS. Nguyễn Kim Châu"],
    tags:["Thần kinh","tPA","Thrombectomy","NIHSS","IV Alteplase"],
    color:"#14b8a6", icon:"🧬",
    sections:["NIHSS & Đánh giá ban đầu","Chẩn đoán hình ảnh","Tiêu sợi huyết IV tPA","Can thiệp lấy huyết khối","Chăm sóc đơn vị đột quỵ","Phòng ngừa thứ phát"],
    drugs:["Alteplase (tPA)","Aspirin","Atorvastatin","Clopidogrel"],
    refs:7, views:934, saves:267,
    relatedIds:["se-001","ami-001"],
  },
];

const DEPTS = ["Tất cả", "Hồi sức cấp cứu", "Nội hô hấp", "Thần kinh / ICU", "Tim mạch can thiệp", "Nội tiết", "Thần kinh mạch máu"];
const PRIORITIES = { emergency:"Khẩn cấp", urgent:"Ưu tiên", routine:"Thông thường" };
const PCOLORS = { emergency:"#ef4444", urgent:"#f59e0b", routine:"#10b981" };

/* ─── COMPONENTS ─── */
function Badge({ color, children, sm }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:6, padding: sm?"1px 7px":"2px 10px", fontSize: sm?10:11, fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>;
}

function StatPill({ icon, value, label, c }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:12 }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:600, color:c.text }}>{value}</span>
      <span style={{ fontSize:11, color:c.muted }}>{label}</span>
    </div>
  );
}

/* ─── GUIDELINE CARD ─── */
function GuidelineCard({ g, c, onSelect, onCompare, compareList }) {
  const inCompare = compareList.includes(g.id);
  return (
    <div onClick={() => onSelect(g)} style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:12, padding:16, cursor:"pointer", transition:"border-color 0.2s", borderTop:`3px solid ${g.color}`, position:"relative" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=g.color}
      onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
      {/* Priority */}
      <div style={{ position:"absolute", top:12, right:12 }}>
        <Badge color={PCOLORS[g.priority]} sm>{PRIORITIES[g.priority]}</Badge>
      </div>
      {/* Icon + Title */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, paddingRight:70 }}>
        <div style={{ fontSize:28, lineHeight:1 }}>{g.icon}</div>
        <div>
          <div style={{ fontWeight:700, color:c.text, fontSize:14 }}>{g.title}</div>
          <div style={{ color:c.muted, fontSize:11 }}>{g.subtitle} • {g.icd}</div>
        </div>
      </div>
      {/* Meta */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        <Badge color={g.color} sm>{g.dept}</Badge>
        <Badge color={c.muted} sm>v{g.version}</Badge>
        <Badge color={c.muted} sm>📚 {g.refs} tài liệu</Badge>
      </div>
      {/* Tags */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
        {g.tags.slice(0,4).map(t=>(
          <span key={t} style={{ fontSize:10, color:c.muted, background:c.surface, border:`0.5px solid ${c.border}`, borderRadius:4, padding:"1px 6px" }}>{t}</span>
        ))}
      </div>
      {/* Drugs */}
      <div style={{ fontSize:11, color:c.muted, marginBottom:10 }}>
        💊 {g.drugs.join(" • ")}
      </div>
      {/* Stats + Compare */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10 }}>
          <StatPill icon="👁️" value={g.views.toLocaleString()} label="lượt xem" c={c}/>
          <StatPill icon="🔖" value={g.saves} label="lưu" c={c}/>
        </div>
        <button onClick={e=>{e.stopPropagation();onCompare(g.id);}}
          style={{ padding:"4px 10px", background: inCompare ? g.color+"22" : c.surface, border:`1px solid ${inCompare?g.color:c.border}`, borderRadius:6, color: inCompare ? g.color : c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
          {inCompare ? "✓ So sánh" : "+ So sánh"}
        </button>
      </div>
    </div>
  );
}

/* ─── DETAIL PANEL ─── */
function DetailPanel({ g, all, c, onClose, onSelect }) {
  const related = all.filter(x => g.relatedIds.includes(x.id));
  const [tab, setTab] = useState("overview");
  const tabs = [{ id:"overview", label:"Tổng quan" }, { id:"sections", label:"Mục lục" }, { id:"drugs", label:"Thuốc" }, { id:"related", label:`Liên quan (${related.length})` }];
  return (
    <div style={{ position:"fixed", inset:0, background:"#000b", zIndex:200, display:"flex", alignItems:"stretch", justifyContent:"flex-end" }}>
      <div style={{ width:"min(520px,100vw)", background:c.card, borderLeft:`1px solid ${c.border}`, display:"flex", flexDirection:"column", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}`, borderTop:`4px solid ${g.color}`, position:"sticky", top:0, background:c.card, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:10 }}>
              <span style={{ fontSize:32 }}>{g.icon}</span>
              <div>
                <div style={{ fontWeight:700, color:c.text, fontSize:16 }}>{g.title}</div>
                <div style={{ color:c.muted, fontSize:12 }}>{g.subtitle} • {g.icd}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:c.muted, fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            <Badge color={g.color}>{g.dept}</Badge>
            <Badge color={PCOLORS[g.priority]}>{PRIORITIES[g.priority]}</Badge>
            <Badge color={c.muted}>v{g.version}</Badge>
            <Badge color={c.muted}>Cập nhật: {g.updated}</Badge>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${c.border}`, padding:"0 20px" }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 14px", background:"none", border:"none", borderBottom:`2px solid ${tab===t.id?g.color:"transparent"}`, color: tab===t.id ? g.color : c.muted, fontWeight: tab===t.id?700:400, fontSize:13, cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ padding:20, flex:1 }}>
          {tab==="overview" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
                {[{label:"Lượt xem",val:g.views.toLocaleString(),icon:"👁️"},{label:"Đã lưu",val:g.saves,icon:"🔖"},{label:"Tài liệu TK",val:g.refs,icon:"📚"}].map(s=>(
                  <div key={s.label} style={{ background:c.surface, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:20 }}>{s.icon}</div>
                    <div style={{ fontWeight:700, color:c.text, fontSize:18 }}>{s.val}</div>
                    <div style={{ color:c.muted, fontSize:11 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, color:c.text, fontSize:13, marginBottom:8 }}>Tác giả biên soạn</div>
                {g.authors.map(a=>(
                  <div key={a} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:g.color+"22", border:`1px solid ${g.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:g.color }}>
                      {a.split(".").pop().trim()[0]}
                    </div>
                    <span style={{ color:c.text, fontSize:13 }}>{a}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, color:c.text, fontSize:13, marginBottom:8 }}>Từ khoá</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {g.tags.map(t=>(
                    <span key={t} style={{ background:g.color+"15", color:g.color, border:`1px solid ${g.color}33`, borderRadius:5, padding:"2px 8px", fontSize:12 }}>{t}</span>
                  ))}
                </div>
              </div>
              <button style={{ width:"100%", padding:"12px 0", background:g.color, color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                📖 Mở phác đồ đầy đủ
              </button>
            </div>
          )}
          {tab==="sections" && (
            <div>
              <div style={{ color:c.muted, fontSize:12, marginBottom:12 }}>Danh sách mục trong phác đồ này</div>
              {g.sections.map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:c.surface, borderRadius:7, marginBottom:6, border:`0.5px solid ${c.border}` }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:g.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:g.color }}>{i+1}</div>
                  <span style={{ color:c.text, fontSize:13 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="drugs" && (
            <div>
              <div style={{ color:c.muted, fontSize:12, marginBottom:12 }}>Thuốc được sử dụng trong phác đồ</div>
              {g.drugs.map((d,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:c.surface, borderRadius:7, marginBottom:6, border:`0.5px solid ${c.border}` }}>
                  <span style={{ fontSize:18 }}>💊</span>
                  <span style={{ color:c.text, fontSize:13, fontWeight:500 }}>{d}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="related" && (
            <div>
              <div style={{ color:c.muted, fontSize:12, marginBottom:12 }}>Phác đồ liên quan — thường dùng phối hợp hoặc trong cùng bối cảnh lâm sàng</div>
              {related.map(r=>(
                <div key={r.id} onClick={()=>onSelect(r)} style={{ padding:"12px 14px", background:c.surface, borderRadius:8, marginBottom:8, border:`1px solid ${c.border}`, cursor:"pointer", borderLeft:`4px solid ${r.color}` }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=r.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:18 }}>{r.icon}</span>
                    <span style={{ fontWeight:600, color:c.text, fontSize:13 }}>{r.title}</span>
                    <Badge color={PCOLORS[r.priority]} sm>{PRIORITIES[r.priority]}</Badge>
                  </div>
                  <div style={{ color:c.muted, fontSize:11 }}>{r.dept} • v{r.version} • 💊 {r.drugs.slice(0,2).join(", ")}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── COMPARE VIEW ─── */
function CompareView({ ids, all, c, onClose }) {
  const gs = all.filter(g => ids.includes(g.id));
  if (gs.length < 2) return null;
  const fields = [
    { label:"Khoa", render: g=><span style={{color:c.text,fontSize:12}}>{g.dept}</span> },
    { label:"Mức độ", render: g=><Badge color={PCOLORS[g.priority]} sm>{PRIORITIES[g.priority]}</Badge> },
    { label:"Phiên bản", render: g=><span style={{color:c.text,fontSize:12}}>v{g.version}</span> },
    { label:"Cập nhật", render: g=><span style={{color:c.muted,fontSize:12}}>{g.updated}</span> },
    { label:"Số mục", render: g=><span style={{color:c.text,fontSize:12}}>{g.sections.length} mục</span> },
    { label:"Thuốc", render: g=><div style={{display:"flex",flexDirection:"column",gap:3}}>{g.drugs.map(d=><span key={d} style={{fontSize:11,color:c.muted}}>• {d}</span>)}</div> },
    { label:"Tài liệu TK", render: g=><span style={{color:c.text,fontSize:12}}>{g.refs} tài liệu</span> },
    { label:"Lượt xem", render: g=><span style={{fontWeight:600,color:c.text,fontSize:12}}>{g.views.toLocaleString()}</span> },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"#000c", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:c.card, borderRadius:14, border:`1px solid ${c.border}`, width:"min(820px,100vw)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontWeight:700, color:c.text, fontSize:15 }}>⚖️ So sánh phác đồ ({gs.length})</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:c.muted, fontSize:18, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${c.border}` }}>
                <th style={{ padding:"12px 16px", textAlign:"left", color:c.muted, fontSize:12, fontWeight:600, width:120 }}>Tiêu chí</th>
                {gs.map(g=>(
                  <th key={g.id} style={{ padding:"12px 16px", textAlign:"left", borderBottom:`3px solid ${g.color}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span>{g.icon}</span>
                      <span style={{ color:c.text, fontWeight:700, fontSize:13 }}>{g.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f,i)=>(
                <tr key={i} style={{ borderBottom:`0.5px solid ${c.border}`, background: i%2===0 ? "transparent" : c.surface+"88" }}>
                  <td style={{ padding:"10px 16px", color:c.muted, fontSize:12, fontWeight:600 }}>{f.label}</td>
                  {gs.map(g=>(
                    <td key={g.id} style={{ padding:"10px 16px", verticalAlign:"top" }}>{f.render(g)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── DRUG SEARCH ─── */
function DrugIndex({ all, c, onSelectGuideline }) {
  const[q,setQ]=useState("");
  const drugMap = useMemo(()=>{
    const map={};
    all.forEach(g=>g.drugs.forEach(d=>{if(!map[d])map[d]=[];map[d].push(g);}));
    return map;
  },[all]);
  const filtered=Object.entries(drugMap).filter(([d])=>d.toLowerCase().includes(q.toLowerCase()));
  return(
    <div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Tìm theo tên thuốc..."
        style={{width:"100%",padding:"10px 14px",background:c.input,border:`1px solid ${c.border}`,borderRadius:8,color:c.text,fontSize:14,boxSizing:"border-box",marginBottom:14}}/>
      {filtered.map(([drug,gs])=>(
        <div key={drug} style={{marginBottom:10,padding:"10px 14px",background:c.card,border:`0.5px solid ${c.border}`,borderRadius:8}}>
          <div style={{fontWeight:700,color:c.text,fontSize:13,marginBottom:6}}>💊 {drug}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {gs.map(g=>(
              <button key={g.id} onClick={()=>onSelectGuideline(g)} style={{padding:"4px 10px",background:g.color+"18",border:`1px solid ${g.color}44`,borderRadius:6,color:g.color,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {g.icon} {g.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN HUB ─── */
export default function GuidelineHub() {
  const [dark, setDark] = useState(true);
  const c = T[dark?"dark":"light"];
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("Tất cả");
  const [priority, setPriority] = useState("all");
  const [selected, setSelected] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [view, setView] = useState("grid"); // grid | list | drugs
  const [sortBy, setSortBy] = useState("views");

  const toggleCompare = (id) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(x=>x!==id) : prev.length < 4 ? [...prev,id] : prev);
  };

  const filtered = useMemo(() => {
    return GUIDELINES
      .filter(g => {
        const q = search.toLowerCase();
        const matchQ = !q || g.title.toLowerCase().includes(q) || g.subtitle.toLowerCase().includes(q) || g.tags.some(t=>t.toLowerCase().includes(q)) || g.drugs.some(d=>d.toLowerCase().includes(q)) || g.icd.toLowerCase().includes(q);
        const matchDept = dept === "Tất cả" || g.dept === dept;
        const matchP = priority === "all" || g.priority === priority;
        return matchQ && matchDept && matchP;
      })
      .sort((a,b) => sortBy==="views" ? b.views-a.views : sortBy==="updated" ? b.updated.localeCompare(a.updated) : a.title.localeCompare(b.title));
  }, [search, dept, priority, sortBy]);

  const stats = {
    total: GUIDELINES.length,
    emergency: GUIDELINES.filter(g=>g.priority==="emergency").length,
    depts: new Set(GUIDELINES.map(g=>g.dept)).size,
    drugs: new Set(GUIDELINES.flatMap(g=>g.drugs)).size,
  };

  return (
    <div style={{ minHeight:"100vh", background:c.bg, color:c.text, fontFamily:"system-ui,sans-serif", fontSize:14 }}>
      {selected && <DetailPanel g={selected} all={GUIDELINES} c={c} onClose={()=>setSelected(null)} onSelect={g=>{setSelected(g);}} />}
      {showCompare && compareList.length >= 2 && <CompareView ids={compareList} all={GUIDELINES} c={c} onClose={()=>setShowCompare(false)} />}

      {/* Top Nav */}
      <div style={{ background:c.card, borderBottom:`1px solid ${c.border}`, padding:"0 20px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:12, height:52 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:22 }}>🏥</span>
            <span style={{ fontWeight:800, color:c.accent, fontSize:16, letterSpacing:-0.5 }}>ClinicalGuide</span>
            <span style={{ color:c.border }}>|</span>
            <span style={{ color:c.muted, fontSize:12 }}>Hệ thống Phác đồ Y tế</span>
          </div>
          <div style={{ flex:1 }}/>
          {[{id:"grid",icon:"⊞"},{id:"list",icon:"☰"},{id:"drugs",icon:"💊"}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{ padding:"5px 10px", background: view===v.id ? c.accent+"22" : "transparent", border:`1px solid ${view===v.id?c.accent:c.border}`, borderRadius:6, color: view===v.id ? c.accent : c.muted, cursor:"pointer", fontSize:14 }}>
              {v.icon}
            </button>
          ))}
          {compareList.length > 0 && (
            <button onClick={()=>setShowCompare(true)} style={{ padding:"6px 14px", background:c.accent, color:"#fff", border:"none", borderRadius:7, fontWeight:700, cursor:"pointer", fontSize:12 }}>
              ⚖️ So sánh ({compareList.length})
            </button>
          )}
          <button onClick={()=>setDark(!dark)} style={{ background:c.surface, border:`1px solid ${c.border}`, color:c.text, borderRadius:6, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>
            {dark?"☀️":"🌙"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px" }}>
        {/* Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            {label:"Tổng phác đồ", val:stats.total, icon:"📋", color:c.accent},
            {label:"Cấp cứu khẩn", val:stats.emergency, icon:"🚨", color:c.danger},
            {label:"Chuyên khoa", val:stats.depts, icon:"🏥", color:c.success},
            {label:"Loại thuốc", val:stats.drugs, icon:"💊", color:c.purple},
          ].map(s=>(
            <div key={s.label} style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:10, padding:"12px 14px", borderTop:`3px solid ${s.color}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <span style={{ color:c.muted, fontSize:11 }}>{s.label}</span>
              </div>
              <div style={{ fontWeight:800, color:c.text, fontSize:26 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Tìm kiếm phác đồ, thuốc, từ khoá, mã ICD..."
            style={{ width:"100%", padding:"10px 14px", background:c.input, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, fontSize:14, boxSizing:"border-box", marginBottom:12 }}/>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ color:c.muted, fontSize:12 }}>Chuyên khoa:</span>
            {DEPTS.map(d=>(
              <button key={d} onClick={()=>setDept(d)} style={{ padding:"4px 10px", background: dept===d ? c.accent+"22" : c.surface, border:`1px solid ${dept===d?c.accent:c.border}`, borderRadius:6, color: dept===d ? c.accent : c.muted, fontSize:12, cursor:"pointer", fontWeight: dept===d?600:400 }}>
                {d}
              </button>
            ))}
            <div style={{ flex:1 }}/>
            <span style={{ color:c.muted, fontSize:12 }}>Mức độ:</span>
            {[{id:"all",label:"Tất cả"},{id:"emergency",label:"Khẩn"},{id:"urgent",label:"Ưu tiên"},{id:"routine",label:"Thường"}].map(p=>(
              <button key={p.id} onClick={()=>setPriority(p.id)} style={{ padding:"4px 10px", background: priority===p.id ? (PCOLORS[p.id]||c.accent)+"22" : c.surface, border:`1px solid ${priority===p.id?(PCOLORS[p.id]||c.accent):c.border}`, borderRadius:6, color: priority===p.id ? (PCOLORS[p.id]||c.accent) : c.muted, fontSize:12, cursor:"pointer", fontWeight: priority===p.id?600:400 }}>
                {p.label}
              </button>
            ))}
            <span style={{ color:c.muted, fontSize:12, marginLeft:8 }}>Sắp xếp:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"4px 8px", background:c.input, border:`1px solid ${c.border}`, borderRadius:6, color:c.text, fontSize:12, cursor:"pointer" }}>
              <option value="views">Lượt xem</option>
              <option value="updated">Mới nhất</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Result count + compare hint */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ color:c.muted, fontSize:12 }}>Hiển thị <b style={{color:c.text}}>{filtered.length}</b> / {GUIDELINES.length} phác đồ</span>
          {compareList.length > 0 && (
            <span style={{ color:c.muted, fontSize:11 }}>Đã chọn so sánh: {compareList.map(id=>GUIDELINES.find(g=>g.id===id)?.title).join(" vs ")}</span>
          )}
        </div>

        {/* Views */}
        {view === "drugs" ? (
          <DrugIndex all={GUIDELINES} c={c} onSelectGuideline={setSelected}/>
        ) : view === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
            {filtered.map(g=><GuidelineCard key={g.id} g={g} c={c} onSelect={setSelected} onCompare={toggleCompare} compareList={compareList}/>)}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map(g=>(
              <div key={g.id} onClick={()=>setSelected(g)} style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:10, padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, borderLeft:`4px solid ${g.color}` }}>
                <span style={{ fontSize:24 }}>{g.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:c.text, fontSize:14 }}>{g.title} <span style={{ color:c.muted, fontWeight:400, fontSize:12 }}>— {g.subtitle}</span></div>
                  <div style={{ color:c.muted, fontSize:12, marginTop:2 }}>{g.dept} • {g.icd} • v{g.version} • 💊 {g.drugs.slice(0,3).join(", ")}</div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <Badge color={PCOLORS[g.priority]} sm>{PRIORITIES[g.priority]}</Badge>
                  <StatPill icon="👁️" value={g.views.toLocaleString()} label="" c={c}/>
                  <button onClick={e=>{e.stopPropagation();toggleCompare(g.id);}} style={{ padding:"3px 8px", background: compareList.includes(g.id)?g.color+"22":c.surface, border:`1px solid ${compareList.includes(g.id)?g.color:c.border}`, borderRadius:5, color: compareList.includes(g.id)?g.color:c.muted, fontSize:11, cursor:"pointer" }}>
                    {compareList.includes(g.id)?"✓":"+"} SS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:c.muted }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Không tìm thấy phác đồ</div>
            <div style={{ fontSize:13 }}>Thử thay đổi từ khoá hoặc bộ lọc</div>
          </div>
        )}
      </div>
    </div>
  );
}
