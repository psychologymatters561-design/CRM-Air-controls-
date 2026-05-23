import { useState, useEffect, useCallback } from "react";

// ─── Storage: works in claude.ai artifact AND standalone ─────────────────────
const store = {
  async get(key) {
    try { if (window.storage) { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; } } catch {}
    try { const v = localStorage?.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async set(key, value) {
    try { if (window.storage) { await window.storage.set(key, JSON.stringify(value)); return; } } catch {}
    try { localStorage?.setItem(key, JSON.stringify(value)); } catch {}
  }
};

// ─── Default Prospects ────────────────────────────────────────────────────────
const DEFAULT_PROSPECTS = [
  { id:1,  name:"Nukleus Coworking",     company:"Nukleus Office Solutions", segment:"Coworking",    location:"Saket, New Delhi",       email:"info@nukleus.work",          phone:"918587013119",  dm:"Center Manager",          acs:18, estValue:65000,  priority:"hot",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:2,  name:"91springboard",         company:"91springboard",            segment:"Coworking",    location:"Okhla Phase II, Delhi",   email:"hello@91springboard.com",    phone:null,            dm:"Facility Manager",        acs:28, estValue:100000, priority:"hot",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:3,  name:"Innov8 Coworking",      company:"Innov8",                   segment:"Coworking",    location:"Connaught Place, Delhi",  email:"info@innov8.work",           phone:"919999466688",  dm:"Operations Head",         acs:40, estValue:145000, priority:"hot",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:4,  name:"Awfis Space Solutions", company:"Awfis",                    segment:"Coworking",    location:"Qutab, New Delhi",        email:null,                         phone:null,            dm:"Facilities Head",         acs:60, estValue:218000, priority:"warm", status:"new",       notes:"Walk in to HQ required", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:5,  name:"Investopad",            company:"Investopad",               segment:"Coworking",    location:"Hauz Khas, New Delhi",    email:null,                         phone:"919821567564",  dm:"Owner / Manager",         acs:8,  estValue:14400,  priority:"low",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:6,  name:"Dr. Lal PathLabs",      company:"Dr Lal PathLabs Ltd",      segment:"Healthcare",   location:"Gurgaon (Corporate HQ)",  email:"info@lalpathlabs.com",       phone:null,            dm:"Admin / Procurement Head",acs:75, estValue:430000, priority:"warm", status:"new",       notes:"Corporate AMC covers all Delhi branches", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:7,  name:"Max Healthcare",        company:"Max Healthcare",           segment:"Healthcare",   location:"Saket, New Delhi",        email:null,                         phone:null,            dm:"Facility Manager",        acs:35, estValue:280000, priority:"warm", status:"new",       notes:"Walk in — ask for Estate Dept", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:8,  name:"Fortis Hospital",       company:"Fortis Healthcare",        segment:"Healthcare",   location:"Vasant Kunj, New Delhi",  email:null,                         phone:null,            dm:"Estate / Facility Head",  acs:30, estValue:240000, priority:"warm", status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:9,  name:"Select Citywalk Mall",  company:"Select Infrastructure",    segment:"Retail",       location:"Saket, New Delhi",        email:null,                         phone:null,            dm:"Facility / Ops Manager",  acs:80, estValue:760000, priority:"warm", status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:10, name:"Artemis Hospital",      company:"Artemis Health Sciences",  segment:"Healthcare",   location:"Sector 51, Gurgaon",      email:null,                         phone:null,            dm:"Estate Manager",          acs:50, estValue:400000, priority:"warm", status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:11, name:"DLF Cyber Hub",         company:"DLF Ltd",                  segment:"Corporate",    location:"Phase 2, Gurgaon",        email:null,                         phone:null,            dm:"Property Manager",        acs:45, estValue:164000, priority:"warm", status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:12, name:"Shangri-La Hotel",      company:"Shangri-La Hotels",        segment:"Hospitality",  location:"Connaught Place, Delhi",  email:null,                         phone:null,            dm:"Chief Engineer",          acs:55, estValue:440000, priority:"warm", status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:13, name:"WeWork Nehru Place",    company:"WeWork",                   segment:"Coworking",    location:"Nehru Place, New Delhi",  email:null,                         phone:"918069331234",  dm:"Community Manager",       acs:35, estValue:127000, priority:"hot",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:14, name:"ISB Delhi Centre",      company:"ISB",                      segment:"Education",    location:"Pushp Vihar, New Delhi",  email:null,                         phone:null,            dm:"Campus Facilities Mgr",   acs:20, estValue:110000, priority:"low",  status:"new",       notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
  { id:15, name:"CP Office Complex",     company:"Various",                  segment:"Corporate",    location:"Connaught Place, Delhi",  email:null,                         phone:null,            dm:"Admin / Office Manager",  acs:15, estValue:54000,  priority:"low",  status:"new",       notes:"Walk in to individual offices", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false },
];

const STATUSES = [
  { key:"new",       label:"New",            color:"#64748b", bg:"#0f172a" },
  { key:"contacted", label:"Contacted",      color:"#60a5fa", bg:"#1e3a5f22" },
  { key:"replied",   label:"Replied",        color:"#34d399", bg:"#14532d22" },
  { key:"meeting",   label:"Meeting Booked", color:"#fbbf24", bg:"#92400e22" },
  { key:"proposal",  label:"Proposal Sent",  color:"#a78bfa", bg:"#4c1d9522" },
  { key:"won",       label:"Closed Won",     color:"#4ade80", bg:"#14532d44" },
  { key:"lost",      label:"Closed Lost",    color:"#f87171", bg:"#7f1d1d22" },
];

const SEGMENTS = ["Coworking","Healthcare","Retail","Corporate","Hospitality","Education","Other"];
const PRIORITIES = ["hot","warm","low"];
const SEG_COLORS = { Coworking:"#3b82f6", Healthcare:"#10b981", Retail:"#ec4899", Corporate:"#f59e0b", Hospitality:"#f97316", Education:"#8b5cf6", Other:"#64748b" };
const PRIO = { hot:{icon:"🔴",label:"Hot"}, warm:{icon:"🟡",label:"Warm"}, low:{icon:"🟢",label:"Low"} };

const today = () => new Date().toISOString().split("T")[0];

function gmailLink(email, subject, body) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function waLink(phone, msg) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [prospects, setProspects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProspect, setEditProspect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await store.get("ac_prospects");
      const key = await store.get("ac_apikey");
      setProspects(saved && saved.length ? saved : DEFAULT_PROSPECTS);
      if (key) setApiKey(key);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) store.set("ac_prospects", prospects);
  }, [prospects, loaded]);

  const save = useCallback((updated) => setProspects(updated), []);

  const toast$ = (msg, type="ok") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3200);
  };

  const updateProspect = (id, patch) => {
    setProspects(prev => prev.map(p => p.id === id ? {...p, ...patch} : p));
  };

  // ── Claude API call ──────────────────────────────────────────────────────────
  const callClaude = async (prompt) => {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["x-api-key"] = apiKey;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, messages:[{role:"user", content:prompt}] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const generateForOne = async (p) => {
    const prompt = `Write a professional email to get an Annual Maintenance Contract (AMC) for air conditioning systems.

Sender: Air Control, Delhi NCR HVAC company, since 1987, clients include Vatican Embassy and DHL India, contact: +91 93122 64832, aircontrols.in

Recipient: ${p.dm} at ${p.name} (${p.company}), ${p.segment} sector, located at ${p.location}, estimated ${p.acs} AC units.

Write:
1. EMAIL: Professional email. Subject line first (format: "Subject: ..."), then blank line, then body. 4-5 paragraphs. Mention their segment pain point specifically. End with call to action for a 15-minute call.

2. WHATSAPP: Conversational WhatsApp message (3-4 short paragraphs, use *bold* sparingly). Same pitch, casual tone.

Return ONLY this JSON (no markdown):
{"email": "Subject: ...\n\n[body here]", "wa": "[whatsapp message here]"}`;

    try {
      const raw = await callClaude(prompt);
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      return { msgEmail: parsed.email || "", msgWA: parsed.wa || "" };
    } catch {
      const subject = `Subject: AC Annual Maintenance Contract — Air Control (38 Years, Embassy Trusted)\n\nDear ${p.dm},\n\nI'm reaching out from Air Control, Delhi NCR's most trusted HVAC engineering company since 1987. We maintain AC systems for the Vatican Embassy and DHL India.\n\nWith approximately ${p.acs} AC units at your ${p.location} facility, a single summer breakdown costs more than an entire year's AMC.\n\nOur AMC includes: 2-hour emergency response (guaranteed in writing), scheduled servicing, priority dispatch, and a full SLA.\n\nCould we connect for 15 minutes this week?\n\nWarm regards,\nAjay Kumar | Air Control\naircontrols.in | +91 93122 64832`;
      const wa = `Hi, I'm Ajay from Air Control — we've maintained AC systems in Delhi NCR since 1987, including for the *Vatican Embassy* and *DHL India*.\n\nI understand ${p.name} manages a facility in ${p.location}. With ~${p.acs} AC units running through Delhi summers, one breakdown costs more than a full year's AMC.\n\nWe offer Annual Maintenance Contracts with a *2-hour emergency response guarantee in writing.*\n\nWould you be the right person to discuss this?\n\n— Ajay Kumar | aircontrols.in | +91 93122 64832`;
      return { msgEmail: subject, msgWA: wa };
    }
  };

  const generateOne = async (id) => {
    const p = prospects.find(x => x.id === id);
    setGenerating(true);
    try {
      const msgs = await generateForOne(p);
      updateProspect(id, msgs);
      toast$(`✓ Messages generated for ${p.name}`);
    } catch { toast$("Failed — check API key in Settings", "err"); }
    setGenerating(false);
  };

  const generateAll = async () => {
    const targets = prospects.filter(p => !p.msgEmail);
    if (!targets.length) { toast$("All messages already generated"); return; }
    setGenerating(true);
    setGenProgress(0);
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      try {
        const msgs = await generateForOne(p);
        setProspects(prev => prev.map(x => x.id === p.id ? {...x, ...msgs} : x));
        setGenProgress(Math.round(((i+1)/targets.length)*100));
      } catch {}
      await new Promise(r => setTimeout(r, 400));
    }
    setGenerating(false);
    setGenProgress(0);
    toast$(`✓ Generated messages for ${targets.length} prospects`);
  };

  const sendEmail = (p) => {
    if (!p.email || !p.msgEmail) return;
    const lines = p.msgEmail.split("\n");
    const subjectLine = lines[0].replace("Subject: ","").trim();
    const body = lines.slice(2).join("\n");
    window.open(gmailLink(p.email, subjectLine, body), "_blank");
    updateProspect(p.id, { sentEmail:true, lastContact:today(), status: p.status === "new" ? "contacted" : p.status });
    toast$("Gmail opened — just hit Send ✓");
  };

  const sendWA = (p) => {
    if (!p.phone || !p.msgWA) return;
    window.open(waLink(p.phone, p.msgWA), "_blank");
    updateProspect(p.id, { sentWA:true, lastContact:today(), status: p.status === "new" ? "contacted" : p.status });
    toast$("WhatsApp opened — just hit Send ✓");
  };

  const addOrUpdateProspect = (data) => {
    if (data.id) {
      setProspects(prev => prev.map(p => p.id === data.id ? {...p,...data} : p));
      toast$("Prospect updated ✓");
    } else {
      const newP = { ...data, id: Date.now(), status:"new", notes:"", lastContact:"", nextFollowup:"", msgEmail:"", msgWA:"", sentEmail:false, sentWA:false };
      setProspects(prev => [...prev, newP]);
      toast$("Prospect added ✓");
    }
    setShowAddForm(false);
    setEditProspect(null);
  };

  const deleteProspect = (id) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    toast$("Prospect removed");
  };

  if (!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0d0d14",color:"#475569",fontFamily:"monospace"}}>Loading...</div>;

  const stats = {
    total: prospects.length,
    pipeline: prospects.filter(p => !["won","lost"].includes(p.status)).reduce((s,p) => s+p.estValue, 0),
    won: prospects.filter(p => p.status==="won").reduce((s,p) => s+p.estValue, 0),
    hot: prospects.filter(p => p.priority==="hot").length,
    contacted: prospects.filter(p => p.status==="contacted").length,
    replied: prospects.filter(p => p.status==="replied").length,
    msgReady: prospects.filter(p => p.msgEmail).length,
  };

  return (
    <div style={{minHeight:"100vh",background:"#0d0d14",fontFamily:"'Georgia',serif",color:"#e2e8f0",display:"flex",flexDirection:"column"}}>

      {toast && <div style={{position:"fixed",top:16,right:16,zIndex:9999,background:toast.type==="err"?"#7f1d1d":"#14532d",color:"#fff",padding:"11px 18px",borderRadius:10,fontSize:12,fontFamily:"monospace",boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>{toast.msg}</div>}

      {/* NAV */}
      <div style={{background:"#080810",borderBottom:"1px solid #1e293b",padding:"0 20px",display:"flex",alignItems:"center",gap:0,position:"sticky",top:0,zIndex:100}}>
        <div style={{marginRight:24,padding:"14px 0"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#38bdf8",fontFamily:"monospace"}}>AIR CONTROL</div>
          <div style={{fontSize:12,color:"#94a3b8",fontFamily:"monospace"}}>CRM & Outreach</div>
        </div>
        {[["dashboard","📊 Dashboard"],["prospects","👥 Prospects"],["campaign","🚀 Campaign"],["crm","📋 Pipeline"]].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{padding:"18px 16px",border:"none",background:"none",color:tab===key?"#38bdf8":"#475569",cursor:"pointer",fontSize:12,fontFamily:"monospace",fontWeight:tab===key?"bold":"normal",borderBottom:tab===key?"2px solid #38bdf8":"2px solid transparent",transition:"all 0.15s"}}>{label}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={() => setShowAddForm(true)} style={{padding:"8px 14px",background:"rgba(56,189,248,0.1)",border:"1px solid #38bdf8",borderRadius:7,color:"#38bdf8",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>+ Add Prospect</button>
          <button onClick={() => setShowSettings(!showSettings)} style={{padding:"8px 12px",background:"transparent",border:"1px solid #1e293b",borderRadius:7,color:"#475569",cursor:"pointer",fontSize:14}}>⚙</button>
        </div>
      </div>

      {/* SETTINGS DRAWER */}
      {showSettings && (
        <div style={{background:"#0f172a",borderBottom:"1px solid #1e293b",padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:11,color:"#64748b",fontFamily:"monospace"}}>Anthropic API Key (for standalone use — leave blank in claude.ai):</span>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} onBlur={()=>store.set("ac_apikey",apiKey)} type="password" placeholder="sk-ant-..." style={{flex:1,maxWidth:340,background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"7px 12px",fontSize:12,fontFamily:"monospace"}} />
          <span style={{fontSize:10,color:"#334155",fontFamily:"monospace"}}>Blank = uses claude.ai proxy (no cost to you)</span>
        </div>
      )}

      <div style={{flex:1,padding:"20px",maxWidth:1100,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && <Dashboard stats={stats} prospects={prospects} setTab={setTab} generating={generating} generateAll={generateAll} genProgress={genProgress} />}

        {/* ── PROSPECTS ── */}
        {tab==="prospects" && <ProspectsView prospects={prospects} onEdit={(p)=>{setEditProspect(p);setShowAddForm(true);}} onDelete={deleteProspect} onGenOne={generateOne} generating={generating} updateProspect={updateProspect} selectedId={selectedId} setSelectedId={setSelectedId} />}

        {/* ── CAMPAIGN ── */}
        {tab==="campaign" && <CampaignView prospects={prospects} generating={generating} generateAll={generateAll} generateOne={generateOne} genProgress={genProgress} sendEmail={sendEmail} sendWA={sendWA} updateProspect={updateProspect} />}

        {/* ── CRM PIPELINE ── */}
        {tab==="crm" && <CRMView prospects={prospects} updateProspect={updateProspect} sendEmail={sendEmail} sendWA={sendWA} />}
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddForm && <ProspectForm prospect={editProspect} onSave={addOrUpdateProspect} onClose={()=>{setShowAddForm(false);setEditProspect(null);}} />}
    </div>
  );
}

// ─── DASHBOARD VIEW ────────────────────────────────────────────────────────────
function Dashboard({ stats, prospects, setTab, generating, generateAll, genProgress }) {
  const recentActivity = prospects.filter(p=>p.lastContact).sort((a,b)=>b.lastContact.localeCompare(a.lastContact)).slice(0,5);
  const followups = prospects.filter(p=>p.nextFollowup && p.nextFollowup >= today()).sort((a,b)=>a.nextFollowup.localeCompare(b.nextFollowup)).slice(0,5);

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:3,color:"#475569",fontFamily:"monospace",marginBottom:6}}>OVERVIEW</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          {[
            {label:"Total Prospects", val:stats.total, color:"#94a3b8", icon:"👥"},
            {label:"Pipeline Value", val:"₹"+Math.round(stats.pipeline/1000)+"K", color:"#38bdf8", icon:"💰"},
            {label:"Won Value", val:"₹"+Math.round(stats.won/1000)+"K", color:"#4ade80", icon:"🏆"},
            {label:"Hot Leads", val:stats.hot, color:"#f87171", icon:"🔴"},
            {label:"Contacted", val:stats.contacted, color:"#60a5fa", icon:"📤"},
            {label:"Replied", val:stats.replied, color:"#34d399", icon:"💬"},
            {label:"Msgs Ready", val:stats.msgReady+"/"+stats.total, color:"#a78bfa", icon:"✉️"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:18}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:"bold",color:s.color,fontFamily:"monospace",marginTop:6}}>{s.val}</div>
              <div style={{fontSize:9,color:"#475569",letterSpacing:1,marginTop:3}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px"}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#475569",fontFamily:"monospace",marginBottom:12}}>QUICK ACTIONS</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>setTab("campaign")} style={{padding:"10px 16px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"monospace",fontWeight:"bold",textAlign:"left"}}>🚀 Start Sending Campaign →</button>
            <button onClick={generateAll} disabled={generating} style={{padding:"10px 16px",background:generating?"#1e293b":"rgba(56,189,248,0.1)",border:"1px solid #38bdf8",borderRadius:8,color:generating?"#475569":"#38bdf8",cursor:generating?"not-allowed":"pointer",fontSize:12,fontFamily:"monospace",fontWeight:"bold",textAlign:"left"}}>
              {generating ? `⟳ Generating... ${genProgress}%` : "✦ AI Generate All Messages"}
            </button>
            <button onClick={()=>setTab("crm")} style={{padding:"10px 16px",background:"rgba(74,222,128,0.08)",border:"1px solid #166534",borderRadius:8,color:"#4ade80",cursor:"pointer",fontSize:12,fontFamily:"monospace",fontWeight:"bold",textAlign:"left"}}>📋 View Pipeline Board →</button>
          </div>
        </div>

        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px"}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#475569",fontFamily:"monospace",marginBottom:12}}>FOLLOW-UPS DUE</div>
          {followups.length ? followups.map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1e293b",fontSize:11}}>
              <span style={{color:"#cbd5e1"}}>{p.name}</span>
              <span style={{color:"#fbbf24",fontFamily:"monospace"}}>{p.nextFollowup}</span>
            </div>
          )) : <div style={{color:"#334155",fontSize:11,fontFamily:"monospace"}}>No follow-ups scheduled</div>}
        </div>
      </div>

      {/* Pipeline by status */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px"}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#475569",fontFamily:"monospace",marginBottom:12}}>PIPELINE BY STATUS</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {STATUSES.map(s=>{
            const count = prospects.filter(p=>p.status===s.key).length;
            const val = prospects.filter(p=>p.status===s.key).reduce((a,p)=>a+p.estValue,0);
            return (
              <div key={s.key} style={{flex:1,minWidth:90,background:s.bg||"#0f172a",border:`1px solid ${s.color}33`,borderRadius:8,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:"bold",color:s.color,fontFamily:"monospace"}}>{count}</div>
                <div style={{fontSize:9,color:s.color,letterSpacing:1,marginTop:2}}>{s.label.toUpperCase()}</div>
                <div style={{fontSize:9,color:"#475569",fontFamily:"monospace",marginTop:2}}>₹{Math.round(val/1000)}K</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PROSPECTS VIEW ────────────────────────────────────────────────────────────
function ProspectsView({ prospects, onEdit, onDelete, onGenOne, generating, updateProspect, selectedId, setSelectedId }) {
  const [search, setSearch] = useState("");
  const [filterSeg, setFilterSeg] = useState("all");
  const [filterPrio, setFilterPrio] = useState("all");

  const filtered = prospects.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.segment.toLowerCase().includes(q);
    const matchS = filterSeg==="all" || p.segment===filterSeg;
    const matchP = filterPrio==="all" || p.priority===filterPrio;
    return matchQ && matchS && matchP;
  });

  const selected = selectedId ? prospects.find(p=>p.id===selectedId) : null;

  return (
    <div style={{display:"grid",gridTemplateColumns:selected?"1fr 380px":"1fr",gap:16}}>
      <div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search prospects..." style={{flex:1,minWidth:160,background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#e2e8f0",padding:"8px 12px",fontSize:12,fontFamily:"monospace"}} />
          <select value={filterSeg} onChange={e=>setFilterSeg(e.target.value)} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#94a3b8",padding:"8px 10px",fontSize:11,fontFamily:"monospace"}}>
            <option value="all">All Segments</option>
            {SEGMENTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPrio} onChange={e=>setFilterPrio(e.target.value)} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#94a3b8",padding:"8px 10px",fontSize:11,fontFamily:"monospace"}}>
            <option value="all">All Priority</option>
            {PRIORITIES.map(p=><option key={p} value={p}>{PRIO[p].icon} {PRIO[p].label}</option>)}
          </select>
          <span style={{fontSize:10,color:"#334155",fontFamily:"monospace"}}>{filtered.length} shown</span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtered.map(p => {
            const statusCfg = STATUSES.find(s=>s.key===p.status);
            return (
              <div key={p.id} onClick={()=>setSelectedId(selectedId===p.id?null:p.id)} style={{background:selectedId===p.id?"#1a1a2e":"#0f172a",border:`1px solid ${selectedId===p.id?"#38bdf8":"#1e293b"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontWeight:"bold",fontSize:13,color:"#f8fafc"}}>{p.name}</span>
                    <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:SEG_COLORS[p.segment]+"22",color:SEG_COLORS[p.segment],fontFamily:"monospace"}}>{p.segment}</span>
                    <span style={{fontSize:9,fontFamily:"monospace",color:statusCfg?.color}}>{statusCfg?.label}</span>
                  </div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:3,fontFamily:"monospace"}}>📍 {p.location} · 👤 {p.dm} · ❄️ {p.acs} ACs · ₹{Math.round(p.estValue/1000)}K/yr</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <span style={{fontSize:9,padding:"3px 7px",borderRadius:4,background:p.msgEmail?"rgba(74,222,128,0.1)":"#1e293b",color:p.msgEmail?"#4ade80":"#334155",fontFamily:"monospace"}}>✉ {p.msgEmail?"Ready":"No msg"}</span>
                  <span style={{fontSize:9,padding:"3px 7px",borderRadius:4,background:p.sentEmail?"rgba(96,165,250,0.1)":"transparent",color:p.sentEmail?"#60a5fa":"#334155",fontFamily:"monospace"}}>{p.sentEmail?"Sent":"—"}</span>
                  <span style={{fontSize:12}}>{PRIO[p.priority]?.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <ProspectDetail prospect={selected} onEdit={onEdit} onDelete={onDelete} onGenOne={onGenOne} generating={generating} updateProspect={updateProspect} onClose={()=>setSelectedId(null)} />
      )}
    </div>
  );
}

// ─── PROSPECT DETAIL PANEL ────────────────────────────────────────────────────
function ProspectDetail({ prospect: p, onEdit, onDelete, onGenOne, generating, updateProspect, onClose }) {
  const [editNotes, setEditNotes] = useState(p.notes);
  const [editFollowup, setEditFollowup] = useState(p.nextFollowup);
  const [editStatus, setEditStatus] = useState(p.status);

  useEffect(() => { setEditNotes(p.notes); setEditFollowup(p.nextFollowup); setEditStatus(p.status); }, [p.id]);

  const saveDetail = () => {
    updateProspect(p.id, { notes: editNotes, nextFollowup: editFollowup, status: editStatus });
  };

  return (
    <div style={{background:"#0f172a",border:"1px solid #38bdf8",borderRadius:12,padding:"18px",position:"sticky",top:70,alignSelf:"start",maxHeight:"calc(100vh - 100px)",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontWeight:"bold",fontSize:14,color:"#f8fafc"}}>{p.name}</div>
          <div style={{fontSize:10,color:"#64748b",fontFamily:"monospace",marginTop:3}}>{p.location}</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:16}}>✕</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14,fontSize:10,fontFamily:"monospace"}}>
        {[["DM",p.dm],["Segment",p.segment],["ACs",p.acs],["Est Value","₹"+p.estValue.toLocaleString()],["Email",p.email||"—"],["Phone",p.phone||"—"]].map(([k,v])=>(
          <div key={k} style={{background:"#080810",borderRadius:6,padding:"8px 10px"}}>
            <div style={{color:"#475569",fontSize:9,letterSpacing:1}}>{k.toUpperCase()}</div>
            <div style={{color:"#cbd5e1",fontSize:11,marginTop:2,wordBreak:"break-all"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:6}}>STATUS</div>
        <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"7px 10px",fontSize:11,fontFamily:"monospace"}}>
          {STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:6}}>FOLLOW-UP DATE</div>
        <input type="date" value={editFollowup} onChange={e=>setEditFollowup(e.target.value)} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"7px 10px",fontSize:11,fontFamily:"monospace",boxSizing:"border-box"}} />
      </div>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:6}}>NOTES</div>
        <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={3} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"8px 10px",fontSize:11,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box"}} />
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        <button onClick={saveDetail} style={{padding:"8px 14px",background:"#166534",border:"none",borderRadius:6,color:"#4ade80",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>Save Changes</button>
        <button onClick={()=>onEdit(p)} style={{padding:"8px 14px",background:"#1e293b",border:"none",borderRadius:6,color:"#94a3b8",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>✎ Edit</button>
        <button onClick={()=>onDelete(p.id)} style={{padding:"8px 14px",background:"transparent",border:"1px solid #7f1d1d",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>Delete</button>
      </div>

      {p.msgEmail && (
        <div style={{background:"#080810",borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:10,color:"#64748b",fontFamily:"monospace",maxHeight:100,overflow:"hidden",position:"relative"}}>
          {p.msgEmail.substring(0,200)}...
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,background:"linear-gradient(transparent,#080810)"}} />
        </div>
      )}

      <button onClick={()=>onGenOne(p.id)} disabled={generating} style={{width:"100%",padding:"9px",background:"rgba(124,58,237,0.15)",border:"1px solid #7c3aed",borderRadius:7,color:"#a78bfa",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>
        {generating?"⟳ Generating...":"✦ Generate AI Messages"}
      </button>
    </div>
  );
}

// ─── CAMPAIGN VIEW ─────────────────────────────────────────────────────────────
function CampaignView({ prospects, generating, generateAll, generateOne, genProgress, sendEmail, sendWA, updateProspect }) {
  const [channel, setChannel] = useState("email");
  const [filterReady, setFilterReady] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const filtered = prospects.filter(p => {
    if (channel==="email" && !p.email) return false;
    if (channel==="wa" && !p.phone) return false;
    if (filterReady && !p.msgEmail) return false;
    return true;
  });

  const notGenerated = prospects.filter(p => !p.msgEmail).length;

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,overflow:"hidden"}}>
          {[["email","✉️ Email"],["wa","📱 WhatsApp"]].map(([key,label])=>(
            <button key={key} onClick={()=>setChannel(key)} style={{padding:"9px 18px",border:"none",background:channel===key?(key==="email"?"#1e3a5f":"#14532d"):"transparent",color:channel===key?"#fff":"#475569",cursor:"pointer",fontSize:12,fontFamily:"monospace",fontWeight:channel===key?"bold":"normal"}}>
              {label}
            </button>
          ))}
        </div>

        {notGenerated > 0 && (
          <button onClick={generateAll} disabled={generating} style={{padding:"9px 18px",background:generating?"#1e293b":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:8,color:"#fff",cursor:generating?"not-allowed":"pointer",fontSize:12,fontFamily:"monospace",fontWeight:"bold"}}>
            {generating ? `⟳ Generating ${genProgress}%` : `✦ Generate Messages (${notGenerated} pending)`}
          </button>
        )}

        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#64748b",fontFamily:"monospace",cursor:"pointer"}}>
          <input type="checkbox" checked={filterReady} onChange={e=>setFilterReady(e.target.checked)} />
          Show ready only
        </label>

        <span style={{marginLeft:"auto",fontSize:10,color:"#334155",fontFamily:"monospace"}}>{filtered.length} contacts · {filtered.filter(p=>p.sentEmail||p.sentWA).length} already sent</span>
      </div>

      {channel==="wa" && (
        <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:"#fbbf24",fontFamily:"monospace"}}>
          ⚡ Only contacts with mobile numbers shown. For landlines, use Email tab.
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(p => {
          const sent = channel==="email" ? p.sentEmail : p.sentWA;
          const msg = channel==="email" ? p.msgEmail : p.msgWA;
          const isEditing = editingId === p.id;

          return (
            <div key={p.id} style={{background:sent?"rgba(20,83,45,0.15)":"#0f172a",border:`1px solid ${sent?"#166534":"#1e293b"}`,borderRadius:10,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isEditing||msg?10:0,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <span style={{fontWeight:"bold",fontSize:13,color:"#f8fafc"}}>{p.name}</span>
                  <span style={{fontSize:10,color:"#64748b",fontFamily:"monospace",marginLeft:10}}>· {channel==="email"?p.email:p.phone} · {p.dm}</span>
                </div>
                {sent && <span style={{fontSize:10,padding:"3px 8px",background:"#14532d",color:"#4ade80",borderRadius:4,fontFamily:"monospace"}}>SENT ✓</span>}

                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {!msg && (
                    <button onClick={()=>generateOne(p.id)} disabled={generating} style={{padding:"7px 12px",background:"rgba(124,58,237,0.15)",border:"1px solid #7c3aed",borderRadius:6,color:"#a78bfa",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>
                      ✦ Generate
                    </button>
                  )}
                  {msg && !isEditing && (
                    <button onClick={()=>{setEditingId(p.id);setEditText(channel==="email"?p.msgEmail:p.msgWA);}} style={{padding:"7px 12px",background:"transparent",border:"1px solid #334155",borderRadius:6,color:"#64748b",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>✎ Edit</button>
                  )}
                  {msg && channel==="email" && (
                    <button onClick={()=>sendEmail(p)} style={{padding:"7px 16px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:6,color:"#93c5fd",cursor:"pointer",fontSize:11,fontFamily:"monospace",fontWeight:"bold"}}>
                      Open Gmail →
                    </button>
                  )}
                  {msg && channel==="wa" && (
                    <button onClick={()=>sendWA(p)} style={{padding:"7px 16px",background:"#14532d",border:"1px solid #16a34a",borderRadius:6,color:"#4ade80",cursor:"pointer",fontSize:11,fontFamily:"monospace",fontWeight:"bold"}}>
                      Open WhatsApp →
                    </button>
                  )}
                  {sent && (
                    <button onClick={()=>updateProspect(p.id,{status:"replied"})} style={{padding:"7px 12px",background:"transparent",border:"1px solid #166534",borderRadius:6,color:"#4ade80",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>Mark Replied</button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div>
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={6} style={{width:"100%",background:"#080810",border:"1px solid #38bdf8",borderRadius:7,color:"#cbd5e1",fontSize:11,padding:"10px",fontFamily:"monospace",resize:"vertical",boxSizing:"border-box"}} />
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <button onClick={()=>{updateProspect(p.id,channel==="email"?{msgEmail:editText}:{msgWA:editText});setEditingId(null);}} style={{padding:"7px 14px",background:"#166534",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>Save</button>
                    <button onClick={()=>setEditingId(null)} style={{padding:"7px 14px",background:"#1e293b",border:"none",borderRadius:6,color:"#94a3b8",cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>Cancel</button>
                  </div>
                </div>
              ) : msg ? (
                <div style={{background:"#080810",borderRadius:7,padding:"10px 12px",fontSize:11,color:"#94a3b8",fontFamily:"monospace",lineHeight:1.7,maxHeight:80,overflow:"hidden",position:"relative",whiteSpace:"pre-wrap"}}>
                  {msg.substring(0,220)}{msg.length>220?"...":""}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:20,background:"linear-gradient(transparent,#080810)"}} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CRM PIPELINE VIEW ─────────────────────────────────────────────────────────
function CRMView({ prospects, updateProspect, sendEmail, sendWA }) {
  const [sortBy, setSortBy] = useState("priority");
  const [search, setSearch] = useState("");

  const sorted = [...prospects]
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==="value") return b.estValue - a.estValue;
      if (sortBy==="name") return a.name.localeCompare(b.name);
      if (sortBy==="priority") { const o={hot:0,warm:1,low:2}; return o[a.priority]-o[b.priority]; }
      if (sortBy==="status") return a.status.localeCompare(b.status);
      return 0;
    });

  const totalPipeline = prospects.filter(p=>!["won","lost"].includes(p.status)).reduce((s,p)=>s+p.estValue,0);
  const totalWon = prospects.filter(p=>p.status==="won").reduce((s,p)=>s+p.estValue,0);

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#e2e8f0",padding:"8px 12px",fontSize:12,fontFamily:"monospace",width:180}} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#94a3b8",padding:"8px 10px",fontSize:11,fontFamily:"monospace"}}>
          <option value="priority">Sort: Priority</option>
          <option value="value">Sort: Value</option>
          <option value="status">Sort: Status</option>
          <option value="name">Sort: Name</option>
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:16,fontSize:11,fontFamily:"monospace"}}>
          <span style={{color:"#38bdf8"}}>Pipeline: <strong>₹{Math.round(totalPipeline/1000)}K</strong></span>
          <span style={{color:"#4ade80"}}>Won: <strong>₹{Math.round(totalWon/1000)}K</strong></span>
        </div>
      </div>

      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,overflow:"hidden"}}>
        {/* Table header */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 100px 150px",gap:0,background:"#080810",borderBottom:"1px solid #1e293b"}}>
          {["Company","Segment","ACs","Est. Value","Priority","Status","Actions"].map(h=>(
            <div key={h} style={{padding:"10px 12px",fontSize:9,color:"#475569",letterSpacing:2,fontFamily:"monospace"}}>{h.toUpperCase()}</div>
          ))}
        </div>

        {sorted.map((p,i)=>{
          const statusCfg = STATUSES.find(s=>s.key===p.status);
          return (
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 100px 150px",borderBottom:"1px solid #1e293b",background:i%2===0?"#0f172a":"#080810",alignItems:"center"}}>
              <div style={{padding:"10px 12px"}}>
                <div style={{fontSize:12,fontWeight:"bold",color:"#f8fafc"}}>{p.name}</div>
                <div style={{fontSize:9,color:"#64748b",fontFamily:"monospace",marginTop:2}}>{p.location}</div>
                {p.nextFollowup && <div style={{fontSize:9,color:"#fbbf24",fontFamily:"monospace",marginTop:1}}>📅 {p.nextFollowup}</div>}
              </div>
              <div style={{padding:"10px 12px",fontSize:10,color:SEG_COLORS[p.segment]||"#64748b",fontFamily:"monospace"}}>{p.segment}</div>
              <div style={{padding:"10px 12px",fontSize:13,fontWeight:"bold",color:"#94a3b8",fontFamily:"monospace"}}>{p.acs}</div>
              <div style={{padding:"10px 12px",fontSize:11,color:"#38bdf8",fontFamily:"monospace"}}>₹{Math.round(p.estValue/1000)}K</div>
              <div style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace"}}>{PRIO[p.priority]?.icon} {PRIO[p.priority]?.label}</div>
              <div style={{padding:"10px 12px"}}>
                <select value={p.status} onChange={e=>updateProspect(p.id,{status:e.target.value})} style={{background:"transparent",border:`1px solid ${statusCfg?.color||"#334155"}33`,borderRadius:5,color:statusCfg?.color||"#64748b",padding:"4px 6px",fontSize:9,fontFamily:"monospace",width:"100%"}}>
                  {STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div style={{padding:"8px 10px",display:"flex",gap:5}}>
                {p.email && p.msgEmail && (
                  <button onClick={()=>sendEmail(p)} style={{padding:"5px 8px",background:"#1e3a5f",border:"none",borderRadius:5,color:"#93c5fd",cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>✉</button>
                )}
                {p.phone && p.msgWA && (
                  <button onClick={()=>sendWA(p)} style={{padding:"5px 8px",background:"#14532d",border:"none",borderRadius:5,color:"#4ade80",cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>WA</button>
                )}
                {p.notes && (
                  <span title={p.notes} style={{padding:"5px 7px",background:"#1e293b",borderRadius:5,cursor:"default",fontSize:10}}>📝</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADD / EDIT FORM ───────────────────────────────────────────────────────────
function ProspectForm({ prospect, onSave, onClose }) {
  const blank = { name:"", company:"", segment:"Coworking", location:"", email:"", phone:"", dm:"Facility Manager", acs:10, estValue:36000, priority:"warm" };
  const [form, setForm] = useState(prospect ? {...prospect} : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:14,padding:"24px",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:"bold",color:"#f8fafc"}}>{prospect?"Edit Prospect":"Add New Prospect"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["Company / Short Name","name","text"],["Full Company Name","company","text"],["Location","location","text"],["Email","email","email"],["Phone (with country code, e.g. 919XXXXXXXXX)","phone","text"],["Decision Maker Title","dm","text"],["Est. AC Units","acs","number"],["Est. Annual AMC Value (₹)","estValue","number"]].map(([label,key,type])=>(
            <div key={key} style={{gridColumn:key==="location"?"1/-1":"auto"}}>
              <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:5}}>{label.toUpperCase()}</div>
              <input type={type} value={form[key]} onChange={e=>set(key,type==="number"?+e.target.value:e.target.value)} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"8px 10px",fontSize:12,fontFamily:"monospace",boxSizing:"border-box"}} />
            </div>
          ))}
          <div>
            <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:5}}>SEGMENT</div>
            <select value={form.segment} onChange={e=>set("segment",e.target.value)} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"8px 10px",fontSize:12,fontFamily:"monospace"}}>
              {SEGMENTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:9,color:"#475569",letterSpacing:1,fontFamily:"monospace",marginBottom:5}}>PRIORITY</div>
            <select value={form.priority} onChange={e=>set("priority",e.target.value)} style={{width:"100%",background:"#080810",border:"1px solid #334155",borderRadius:6,color:"#e2e8f0",padding:"8px 10px",fontSize:12,fontFamily:"monospace"}}>
              {PRIORITIES.map(p=><option key={p} value={p}>{PRIO[p].icon} {PRIO[p].label}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={()=>onSave(form)} style={{flex:1,padding:"11px",background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"monospace",fontWeight:"bold"}}>
            {prospect?"Save Changes ✓":"Add Prospect ✓"}
          </button>
          <button onClick={onClose} style={{padding:"11px 18px",background:"#1e293b",border:"none",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"monospace"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
