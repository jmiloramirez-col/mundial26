// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL2FV0gfT5b58f5mXmAPJMqSbwKde0IV0",
  authDomain: "mundial2026-2026.firebaseapp.com",
  projectId: "mundial2026-2026",
  storageBucket: "mundial2026-2026.firebasestorage.app",
  messagingSenderId: "76029862427",
  appId: "1:76029862427:web:23f21566a32e1c40610ebe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { useState, useEffect, useCallback } from "react";

// Dentro de tu componente principal App:
useEffect(() => {
  async function init() {
    const data = await loadDataFromFirebase();
    if (data) {
      setParticipants(data.participants || []);
      setMatches(data.matches || INITIAL_MATCHES);
    }
  }
  init();
}, []);
// ─── DATA ────────────────────────────────────────────────────────────────────
// Grupos oficiales — Sorteo realizado el 5 de diciembre de 2025, Kennedy Center, Washington D.C.
// 6 plazas pendientes de repechaje (marzo 2026): UEFA A, UEFA B, UEFA C, UEFA D, Intercontinental 1, Intercontinental 2
const GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Rep. UEFA D*"],        // *Dinamarca, Macedonia del Norte, Rep. Checa o Irlanda
  B: ["Canadá", "Suiza", "Qatar", "Rep. UEFA A*"],                    // *Italia, Irlanda del Norte, Gales o Bosnia
  C: ["Brasil", "Marruecos", "Escocia", "Haití"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Rep. UEFA C*"],     // *Turquía, Rumanía, Eslovaquia o Kosovo
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Túnez", "Rep. UEFA B*"],              // *Ucrania, Suecia, Polonia o Albania
  G: ["Bélgica", "Egipto", "Nueva Zelanda", "Rep. Intercont. 2*"],    // *Bolivia, Surinam o Irak
  H: ["España", "Uruguay", "Arabia Saudita", "Cabo Verde"],
  I: ["Francia", "Senegal", "Noruega", "Rep. Intercont. 2*"],         // *Bolivia, Surinam o Irak
  J: ["Argentina", "Austria", "Argelia", "Jordania"],
  K: ["Portugal", "Colombia", "Uzbekistán", "Rep. Intercont. 1*"],    // *Jamaica, Nueva Caledonia o RD Congo
  L: ["Inglaterra", "Croacia", "Panamá", "Ghana"],
};

// ─── LOCK DATES ──────────────────────────────────────────────────────────────
// Los pronósticos se bloquean 1 día antes de que empiece cada fase
const LOCK_DATES = {
  groups:  new Date("2026-06-10T00:00:00"), // 1 día antes del 11 Jun (inicio grupos)
  round32: new Date("2026-07-01T00:00:00"), // 1 día antes del 2 Jul (octavos)
  quarters:new Date("2026-07-03T00:00:00"), // 1 día antes del 4 Jul (cuartos)
  semis:   new Date("2026-07-14T00:00:00"), // 1 día antes del 15 Jul (semis)
  third:   new Date("2026-07-17T00:00:00"), // 1 día antes del 18 Jul
  final:   new Date("2026-07-18T00:00:00"), // 1 día antes del 19 Jul
};

function isPhaseLocked(phase, adminUnlocked = {}) {
  if (adminUnlocked[phase]) return false; // admin desbloqueó manualmente
  const lockDate = LOCK_DATES[phase];
  if (!lockDate) return false;
  return new Date() >= lockDate;
}

function getPhaseOfMatch(match) {
  return match.phase; // "groups", "round32", "quarters", "semis", "third", "final"
}

const GROUP_COLORS = {
  A:"#1A5276",B:"#1F618D",C:"#117A65",D:"#1E8449",
  E:"#7D6608",F:"#784212",G:"#6E2FD6",H:"#943126",
  I:"#7B241C",J:"#4A235A",K:"#1B2631",L:"#0B6E4F",
};

function generateGroupMatches() {
  const matches = [];
  let id = 1;
  const dates = {
    A:["11 Jun","12 Jun","16 Jun","16 Jun","20 Jun","24 Jun"],  // México vs Sudáfrica abre el torneo
    B:["12 Jun","16 Jun","17 Jun","20 Jun","21 Jun","25 Jun"],
    C:["13 Jun","17 Jun","18 Jun","21 Jun","22 Jun","26 Jun"],
    D:["12 Jun","13 Jun","17 Jun","18 Jun","22 Jun","26 Jun"],
    E:["15 Jun","15 Jun","19 Jun","19 Jun","23 Jun","27 Jun"],
    F:["14 Jun","14 Jun","18 Jun","18 Jun","22 Jun","26 Jun"],
    G:["13 Jun","13 Jun","17 Jun","17 Jun","21 Jun","25 Jun"],
    H:["14 Jun","15 Jun","18 Jun","19 Jun","22 Jun","26 Jun"],
    I:["15 Jun","16 Jun","19 Jun","20 Jun","23 Jun","27 Jun"],
    J:["16 Jun","16 Jun","20 Jun","20 Jun","24 Jun","28 Jun"],
    K:["14 Jun","15 Jun","18 Jun","19 Jun","23 Jun","27 Jun"],
    L:["13 Jun","14 Jun","17 Jun","18 Jun","21 Jun","25 Jun"],
  };
  Object.entries(GROUPS).forEach(([grp, teams]) => {
    const combos = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
    combos.forEach(([i,j], idx) => {
      matches.push({ id: id++, phase:"groups", group:grp,
        date: dates[grp]?.[idx] || "TBD",
        home: teams[i], away: teams[j],
        realHome:null, realAway:null });
    });
  });
  return matches;
}

function generateElimMatches() {
  const rounds = [
    { phase:"round32", label:"Octavos de Final", count:16, date:"2-3 Jul" },
    { phase:"quarters", label:"Cuartos de Final", count:8, date:"4-5 Jul" },
    { phase:"semis", label:"Semifinales", count:4, date:"15-16 Jul" },
    { phase:"third", label:"Tercer Lugar", count:1, date:"18 Jul" },
    { phase:"final", label:"🏆 Gran Final", count:1, date:"19 Jul" },
  ];
  const matches = [];
  let id = 1000;
  rounds.forEach(r => {
    for (let k = 0; k < r.count; k++) {
      matches.push({ id: id++, phase:r.phase, label:r.label,
        date: r.date, matchNum: k+1,
        home:`Por definir`, away:`Por definir`,
        realHome:null, realAway:null });
    }
  });
  return matches;
}

const INITIAL_MATCHES = [...generateGroupMatches(), ...generateElimMatches()];

// ─── SCORING ─────────────────────────────────────────────────────────────────
function calcPoints(predH, predA, realH, realA) {
  if (realH === null || realA === null || predH === null || predA === null) return null;
  const ph = Number(predH), pa = Number(predA), rh = Number(realH), ra = Number(realA);
  if (isNaN(ph)||isNaN(pa)||isNaN(rh)||isNaN(ra)) return null;
  if (ph === rh && pa === ra) return 5;
  const predWinner = ph > pa ? "H" : ph < pa ? "A" : "D";
  const realWinner = rh > ra ? "H" : rh < ra ? "A" : "D";
  if (predWinner === realWinner) return 3;
  return 0;
}

function calcParticipantPoints(predictions, matches) {
  let total = 0, exact = 0, correct = 0;
  matches.forEach(m => {
    const pred = predictions?.[m.id];
    if (!pred) return;
    const pts = calcPoints(pred.home, pred.away, m.realHome, m.realAway);
    if (pts === null) return;
    total += pts;
    if (pts === 5) exact++;
    if (pts >= 3) correct++;
  });
  return { total, exact, correct };
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
import { doc, setDoc, getDoc } from "firebase/firestore";

// Reemplaza tus funciones antiguas por estas:
async function loadDataFromFirebase() {
  try {
    const docRef = doc(db, "mundial", "predicciones");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data(); // Esto traerá { participants: [...], matches: [...] }
    }
    return null;
  } catch (error) {
    console.error("Error cargando datos:", error);
    return null;
  }
}

async function saveDataToFirebase(participants, matches) {
  try {
    await setDoc(doc(db, "mundial", "predicciones"), {
      participants,
      matches,
      lastUpdate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error guardando datos:", error);
    return false;
  }
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  Trophy: () => <span style={{fontSize:"1.2em"}}>🏆</span>,
  Soccer: () => <span style={{fontSize:"1.2em"}}>⚽</span>,
  User: () => <span style={{fontSize:"1.2em"}}>👤</span>,
  Admin: () => <span style={{fontSize:"1.2em"}}>⚙️</span>,
  Chart: () => <span style={{fontSize:"1.2em"}}>📊</span>,
  Check: () => <span style={{fontSize:"1em"}}>✅</span>,
  Medal1: () => <span>🥇</span>,
  Medal2: () => <span>🥈</span>,
  Medal3: () => <span>🥉</span>,
  Flag: (c) => <span style={{fontSize:"1em"}}>{c}</span>,
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight:"100vh", background:"#0a0e1a",
    fontFamily:"'Barlow Condensed', 'Barlow', sans-serif",
    color:"#e8eaf0",
  },
  header: {
    background:"linear-gradient(135deg,#0d1b2a 0%,#1a2744 50%,#0d2137 100%)",
    borderBottom:"2px solid #c9a84c",
    padding:"0",
    position:"sticky", top:0, zIndex:100,
    boxShadow:"0 4px 30px rgba(0,0,0,0.5)",
  },
  headerInner: {
    maxWidth:1100, margin:"0 auto",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"12px 20px",
  },
  logo: {
    display:"flex", alignItems:"center", gap:10,
    fontSize:"1.6rem", fontWeight:700,
    letterSpacing:2, color:"#c9a84c",
    textTransform:"uppercase",
  },
  nav: { display:"flex", gap:6 },
  navBtn: (active) => ({
    background: active ? "#c9a84c" : "transparent",
    color: active ? "#0a0e1a" : "#8899bb",
    border:"1px solid " + (active ? "#c9a84c" : "#2a3a5e"),
    borderRadius:6, padding:"7px 14px",
    cursor:"pointer", fontSize:"0.82rem",
    fontWeight:700, letterSpacing:1,
    textTransform:"uppercase",
    transition:"all .2s",
  }),
  main: { maxWidth:1100, margin:"0 auto", padding:"24px 16px" },
  card: {
    background:"#111827", border:"1px solid #1e2d4a",
    borderRadius:12, padding:20, marginBottom:16,
    boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    fontSize:"1.1rem", fontWeight:800, letterSpacing:3,
    textTransform:"uppercase", color:"#c9a84c",
    borderBottom:"1px solid #1e2d4a",
    paddingBottom:10, marginBottom:16,
    display:"flex", alignItems:"center", gap:8,
  },
  input: {
    background:"#1a2540", border:"1px solid #2a3a5e",
    color:"#e8eaf0", borderRadius:6, padding:"8px 12px",
    fontSize:"0.95rem", width:"100%",
    fontFamily:"inherit", outline:"none",
  },
  scoreInput: {
    background:"#1a2540", border:"1px solid #2a3a5e",
    color:"#e8eaf0", borderRadius:6, padding:"6px 0",
    fontSize:"1.1rem", fontWeight:700, width:52,
    textAlign:"center", fontFamily:"inherit", outline:"none",
  },
  btn: (color="#c9a84c", outline=false) => ({
    background: outline ? "transparent" : color,
    color: outline ? color : "#0a0e1a",
    border:"2px solid " + color,
    borderRadius:8, padding:"9px 22px",
    cursor:"pointer", fontSize:"0.9rem",
    fontWeight:800, letterSpacing:1,
    textTransform:"uppercase",
    transition:"all .2s", fontFamily:"inherit",
  }),
  badge: (pts) => ({
    display:"inline-block",
    background: pts===5?"#27ae60": pts===3?"#2980b9": pts===0?"#c0392b":"#2a3a5e",
    color:"#fff", borderRadius:20,
    padding:"2px 10px", fontSize:"0.8rem", fontWeight:700,
    minWidth:28, textAlign:"center",
  }),
  leaderRow: (i) => ({
    background: i===0?"linear-gradient(90deg,#2a2000,#1a1400)":
                i===1?"linear-gradient(90deg,#1e1e1e,#141414)":
                i===2?"linear-gradient(90deg,#1a1008,#110a05)":"#111827",
    border:"1px solid " + (i===0?"#c9a84c":i===1?"#9e9e9e":i===2?"#cd7f32":"#1e2d4a"),
    borderRadius:10, padding:"12px 18px",
    display:"flex", alignItems:"center", gap:14,
    marginBottom:8,
    transition:"transform .15s",
  }),
  groupHeader: (color) => ({
    background:`linear-gradient(90deg,${color}22,transparent)`,
    borderLeft:`4px solid ${color}`,
    padding:"8px 14px", borderRadius:"0 8px 8px 0",
    marginBottom:8, marginTop:16,
    fontSize:"1rem", fontWeight:800,
    letterSpacing:3, textTransform:"uppercase",
    color: color,
  }),
  matchRow: {
    display:"grid",
    gridTemplateColumns:"1fr 52px 10px 52px 1fr",
    gap:6, alignItems:"center",
    background:"#0d1520", border:"1px solid #1e2d4a",
    borderRadius:8, padding:"8px 12px", marginBottom:6,
  },
  phaseHeader: (color) => ({
    background:`linear-gradient(90deg,${color},${color}99)`,
    borderRadius:8, padding:"10px 16px",
    fontSize:"1rem", fontWeight:800,
    letterSpacing:2, marginBottom:10, marginTop:18,
    color:"#fff", textTransform:"uppercase",
  }),
};

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=number] { -moz-appearance:textfield; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:#0a0e1a; }
    ::-webkit-scrollbar-thumb { background:#2a3a5e; border-radius:3px; }
    .nav-btn:hover { opacity:.85; transform:translateY(-1px); }
    .match-row-hover:hover { border-color:#c9a84c44 !important; background:#111827 !important; }
    .btn-hover:hover { opacity:.85; transform:translateY(-1px); }
    .leader-row:hover { transform:translateX(3px); }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .fade-in { animation:fadeIn .3s ease forwards; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .pulse { animation:pulse 2s infinite; }
  `}</style>
);

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD VIEW
// ══════════════════════════════════════════════════════════════════════════════
function Leaderboard({ participants, matches }) {
  const ranked = [...participants]
    .map(p => ({ ...p, ...calcParticipantPoints(p.predictions, matches) }))
    .sort((a,b) => b.total - a.total || b.exact - a.exact);

  const medals = ["🥇","🥈","🥉"];

  return (
    <div className="fade-in">
      <div style={S.sectionTitle}><Icon.Chart /> Tabla de Clasificación</div>
      {ranked.length === 0 && (
        <div style={{textAlign:"center",color:"#4a5a7e",padding:40,fontSize:"1.1rem"}}>
          Aún no hay participantes registrados
        </div>
      )}
      {ranked.map((p, i) => (
        <div key={p.id} className="leader-row" style={S.leaderRow(i)}>
          <div style={{fontSize:"1.6rem",width:32,textAlign:"center"}}>
            {i < 3 ? medals[i] : <span style={{color:"#4a5a7e",fontSize:"1rem",fontWeight:700}}>#{i+1}</span>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:"1.05rem",letterSpacing:1}}>{p.name}</div>
            <div style={{color:"#4a5a7e",fontSize:"0.78rem",marginTop:2}}>
              {p.exact} exactos · {p.correct} acertados
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"2rem",fontWeight:800,color: i===0?"#c9a84c":i===1?"#9e9e9e":i===2?"#cd7f32":"#e8eaf0",lineHeight:1}}>
              {p.total}
            </div>
            <div style={{color:"#4a5a7e",fontSize:"0.72rem",letterSpacing:1}}>PUNTOS</div>
          </div>
        </div>
      ))}

      <div style={{...S.card, marginTop:24}}>
        <div style={S.sectionTitle}>⚽ Sistema de Puntos</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {[["5 pts","Resultado exacto","#27ae60"],["3 pts","Ganador correcto","#2980b9"],["0 pts","Resultado fallado","#c0392b"]].map(([pts,desc,color])=>(
            <div key={pts} style={{background:"#0d1520",border:`1px solid ${color}44`,borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
              <div style={{fontSize:"2rem",fontWeight:800,color}}>{pts}</div>
              <div style={{color:"#8899bb",fontSize:"0.85rem",marginTop:4}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PARTICIPANT FORM
// ══════════════════════════════════════════════════════════════════════════════
function ParticipantForm({ participants, setParticipants, matches, adminUnlocked }) {
  const [step, setStep] = useState("login"); // login | form | done
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [preds, setPreds] = useState({});
  const [activeGroup, setActiveGroup] = useState("A");
  const [activePhase, setActivePhase] = useState("groups");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const groupMatches = matches.filter(m => m.phase === "groups");
  const elimMatches = matches.filter(m => m.phase !== "groups");
  const phases = [...new Set(elimMatches.map(m=>m.phase))];
  const phaseLabels = {round32:"Octavos de Final",quarters:"Cuartos de Final",semis:"Semifinales",third:"Tercer Lugar",final:"🏆 Gran Final"};
  const phaseColors = {round32:"#c0392b",quarters:"#8e44ad",semis:"#e67e22",third:"#2980b9",final:"#c9a84c"};

  const groupsLocked = isPhaseLocked("groups", adminUnlocked);
  const elimPhaseLocked = (ph) => isPhaseLocked(ph, adminUnlocked);

  function getLockMessage(phase) {
    const locked = phase === "groups" ? groupsLocked : elimPhaseLocked(phase);
    if (!locked) {
      const d = LOCK_DATES[phase];
      if (d) {
        const diff = Math.ceil((d - new Date()) / (1000*60*60*24));
        if (diff > 0) return { locked: false, msg: `🔓 Abierto — se bloquea en ${diff} día${diff!==1?"s":""}` };
      }
      return { locked: false, msg: "🔓 Abierto" };
    }
    return { locked: true, msg: "🔒 Bloqueado — ya no se pueden editar estos pronósticos" };
  }

  function handleLogin() {
    setError("");
    if (!name.trim()) { setError("Ingresa tu nombre"); return; }
    if (!pin.trim() || pin.length < 4) { setError("PIN debe tener al menos 4 dígitos"); return; }
    const existing = participants.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      if (existing.pin !== pin) { setError("PIN incorrecto"); return; }
      setCurrentUser(existing);
      setPreds(existing.predictions || {});
      setStep("form");
    } else {
      const newUser = { id: Date.now(), name: name.trim(), pin, predictions:{}, createdAt: new Date().toISOString() };
      const updated = [...participants, newUser];
      setParticipants(updated);
      saveData("participants", updated);
      setCurrentUser(newUser);
      setPreds({});
      setStep("form");
    }
  }

  function setPred(matchId, side, val) {
    const v = val === "" ? "" : Math.max(0, parseInt(val) || 0);
    setPreds(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId]||{}), [side]: v === "" ? null : v }
    }));
  }

  async function handleSave() {
    setSaving(true);
    const updated = participants.map(p =>
      p.id === currentUser.id ? {...p, predictions: preds} : p
    );
    setParticipants(updated);
    await saveData("participants", updated);
    setSaving(false);
    setStep("done");
  }

  function renderMatchRow(m, showResult=false, locked=false) {
    const pred = preds[m.id] || {};
    const pts = showResult ? calcPoints(pred.home, pred.away, m.realHome, m.realAway) : null;
    return (
      <div key={m.id} className="match-row-hover" style={{...S.matchRow, opacity: m.home==="Por definir"?.6:1}}>
        <div style={{textAlign:"right",fontSize:"0.9rem",fontWeight:600,color:"#c8d0e0"}}>{m.home}</div>
        <input type="number" min="0" max="99" placeholder="–"
          style={{...S.scoreInput, background: locked?"#0d1520":"#1a2540", cursor: locked?"not-allowed":"text", opacity: locked?.6:1}}
          value={pred.home ?? ""}
          disabled={locked}
          onChange={e => !locked && setPred(m.id, "home", e.target.value)}
        />
        <div style={{textAlign:"center",color:"#4a5a7e",fontWeight:700,fontSize:"0.7rem"}}>VS</div>
        <input type="number" min="0" max="99" placeholder="–"
          style={{...S.scoreInput, background: locked?"#0d1520":"#1a2540", cursor: locked?"not-allowed":"text", opacity: locked?.6:1}}
          value={pred.away ?? ""}
          disabled={locked}
          onChange={e => !locked && setPred(m.id, "away", e.target.value)}
        />
        <div style={{textAlign:"left",fontSize:"0.9rem",fontWeight:600,color:"#c8d0e0"}}>{m.away}</div>
        {showResult && pts !== null && <div style={{...S.badge(pts), marginLeft:8}}>{pts}pts</div>}
      </div>
    );
  }

  if (step === "login") return (
    <div className="fade-in" style={{maxWidth:420,margin:"0 auto"}}>
      <div style={S.card}>
        <div style={S.sectionTitle}><Icon.User /> Acceso al Concurso</div>
        <p style={{color:"#8899bb",marginBottom:20,lineHeight:1.6}}>
          Si eres nuevo, escribe tu nombre y crea un PIN de 4+ dígitos.<br/>
          Si ya participas, usa el mismo nombre y PIN.
        </p>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"0.8rem",letterSpacing:2,color:"#c9a84c",textTransform:"uppercase"}}>Tu Nombre</label>
          <input style={{...S.input,marginTop:6}} placeholder="Ej: Carlos Pérez"
            value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:"0.8rem",letterSpacing:2,color:"#c9a84c",textTransform:"uppercase"}}>PIN (mínimo 4 dígitos)</label>
          <input style={{...S.input,marginTop:6}} type="password" placeholder="••••"
            value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        {error && <div style={{color:"#e74c3c",marginBottom:12,fontSize:"0.9rem"}}>⚠ {error}</div>}
        <button className="btn-hover" style={S.btn()} onClick={handleLogin}>
          Entrar / Registrarse →
        </button>
        <div style={{marginTop:12,color:"#4a5a7e",fontSize:"0.78rem"}}>
          {participants.length} participante{participants.length!==1?"s":""} registrado{participants.length!==1?"s":""}
        </div>
      </div>
    </div>
  );

  if (step === "done") return (
    <div className="fade-in" style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
      <div style={S.card}>
        <div style={{fontSize:"4rem",marginBottom:16}}>✅</div>
        <div style={{fontSize:"1.4rem",fontWeight:800,color:"#c9a84c",marginBottom:8}}>¡Pronósticos guardados!</div>
        <div style={{color:"#8899bb",marginBottom:20}}>Hola <strong style={{color:"#e8eaf0"}}>{currentUser?.name}</strong>, tus predicciones quedaron guardadas.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-hover" style={S.btn()} onClick={()=>setStep("form")}>Editar Pronósticos</button>
          <button className="btn-hover" style={S.btn("#8899bb",true)} onClick={()=>{setStep("login");setName("");setPin("");}}>Cambiar Usuario</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <span style={{color:"#c9a84c",fontWeight:800,fontSize:"1.1rem"}}>⚽ {currentUser?.name}</span>
          <span style={{color:"#4a5a7e",marginLeft:8,fontSize:"0.85rem"}}>· Ingresa tus pronósticos</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-hover" style={{...S.btn("#27ae60"),fontSize:"0.82rem",padding:"7px 16px"}} onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "💾 Guardar Todo"}
          </button>
          <button className="btn-hover" style={{...S.btn("#8899bb",true),fontSize:"0.82rem",padding:"7px 14px"}} onClick={()=>{setStep("login");setName("");setPin("");}}>Salir</button>
        </div>
      </div>

      {/* Phase Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["groups","elim"].map(ph => (
          <button key={ph} className="nav-btn" style={S.navBtn(activePhase===ph)}
            onClick={()=>setActivePhase(ph)}>
            {ph==="groups" ? "⚽ Fase de Grupos" : "🏆 Eliminatorias"}
          </button>
        ))}
      </div>

      {activePhase === "groups" && (
        <>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {Object.keys(GROUPS).map(g => (
              <button key={g} className="nav-btn" style={{
                ...S.navBtn(activeGroup===g),
                background: activeGroup===g ? GROUP_COLORS[g] : "transparent",
                borderColor: GROUP_COLORS[g],
                color: activeGroup===g ? "#fff" : GROUP_COLORS[g],
                padding:"5px 12px", fontSize:"0.8rem",
              }} onClick={()=>setActiveGroup(g)}>Grupo {g}</button>
            ))}
          </div>
          {/* Lock banner */}
          {(() => { const lk = getLockMessage("groups"); return (
            <div style={{background: lk.locked?"#2a0a0a":"#0a2215", border:`1px solid ${lk.locked?"#c0392b88":"#27ae6066"}`, borderRadius:8, padding:"8px 14px", marginBottom:12, fontSize:"0.83rem", color: lk.locked?"#e74c3c":"#2ecc71"}}>
              {lk.locked
                ? "🔒 Pronósticos de grupos cerrados — ya no se pueden modificar"
                : lk.msg}
            </div>
          ); })()}
          <div style={S.groupHeader(GROUP_COLORS[activeGroup])}>Grupo {activeGroup} — {GROUPS[activeGroup].join(" · ")}</div>
          {groupMatches.filter(m=>m.group===activeGroup).map(m => renderMatchRow(m, false, groupsLocked))}
          {!groupsLocked && (
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
              <button className="btn-hover" style={{...S.btn("#27ae60"),fontSize:"0.82rem"}} onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          )}
        </>
      )}

      {activePhase === "elim" && (
        <>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {phases.map(ph => (
              <button key={ph} className="nav-btn" style={{
                ...S.navBtn(activeGroup===ph),
                background: activeGroup===ph ? phaseColors[ph] : "transparent",
                borderColor: phaseColors[ph]+"88",
                color: activeGroup===ph ? "#fff" : phaseColors[ph],
                fontSize:"0.78rem", padding:"5px 10px",
              }} onClick={()=>setActiveGroup(ph)}>{phaseLabels[ph]}</button>
            ))}
          </div>
          {/* Lock banner for current elim phase */}
          {(activeGroup||phases[0]) && (() => { const ph = activeGroup||phases[0]; const lk = getLockMessage(ph); return (
            <div style={{background: lk.locked?"#2a0a0a":"#0a2215", border:`1px solid ${lk.locked?"#c0392b88":"#27ae6066"}`, borderRadius:8, padding:"8px 14px", marginBottom:12, fontSize:"0.83rem", color: lk.locked?"#e74c3c":"#2ecc71"}}>
              {lk.locked
                ? `🔒 ${phaseLabels[ph]} cerrado — ya no se pueden modificar estos pronósticos`
                : lk.msg}
            </div>
          ); })()}
          {(() => { const ph = activeGroup||phases[0]; const phaseLocked = elimPhaseLocked(ph);
            return (
              <>
                {elimMatches.filter(m=>m.phase===ph).map(m => renderMatchRow(m, false, phaseLocked))}
                {!phaseLocked && (
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                    <button className="btn-hover" style={{...S.btn("#27ae60"),fontSize:"0.82rem"}} onClick={handleSave} disabled={saving}>
                      {saving ? "Guardando..." : "💾 Guardar"}
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FIXTURE VIEW (read-only for participants)
// ══════════════════════════════════════════════════════════════════════════════
function FixtureView({ matches }) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [activePhase, setActivePhase] = useState("groups");
  const phaseLabels = {round32:"Octavos",quarters:"Cuartos",semis:"Semis",third:"3er Lugar",final:"Final"};
  const phaseColors = {round32:"#c0392b",quarters:"#8e44ad",semis:"#e67e22",third:"#2980b9",final:"#c9a84c"};
  const groupMatches = matches.filter(m=>m.phase==="groups");
  const elimMatches = matches.filter(m=>m.phase!=="groups");
  const phases = [...new Set(elimMatches.map(m=>m.phase))];

  function renderMatch(m) {
    const hasResult = m.realHome !== null && m.realAway !== null;
    return (
      <div key={m.id} className="match-row-hover" style={{
        ...S.matchRow, gridTemplateColumns:"1fr auto auto auto 1fr",
        opacity: m.home==="Por definir"?.55:1,
      }}>
        <div style={{textAlign:"right",fontWeight:600,fontSize:"0.88rem",color:"#c8d0e0"}}>{m.home}</div>
        <div style={{
          background: hasResult?"#1e3a2e":"#1a2540",
          border:"1px solid "+(hasResult?"#27ae6066":"#2a3a5e"),
          borderRadius:6, padding:"4px 10px",
          fontSize:"1.1rem",fontWeight:800,
          color: hasResult?"#27ae60":"#4a5a7e",
          minWidth:36, textAlign:"center",
        }}>{hasResult ? m.realHome : "–"}</div>
        <div style={{color:"#4a5a7e",fontWeight:700,fontSize:"0.7rem",padding:"0 4px"}}>VS</div>
        <div style={{
          background: hasResult?"#1e3a2e":"#1a2540",
          border:"1px solid "+(hasResult?"#27ae6066":"#2a3a5e"),
          borderRadius:6, padding:"4px 10px",
          fontSize:"1.1rem",fontWeight:800,
          color: hasResult?"#27ae60":"#4a5a7e",
          minWidth:36, textAlign:"center",
        }}>{hasResult ? m.realAway : "–"}</div>
        <div style={{textAlign:"left",fontWeight:600,fontSize:"0.88rem",color:"#c8d0e0"}}>{m.away}</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["groups","elim"].map(ph=>(
          <button key={ph} className="nav-btn" style={S.navBtn(activePhase===ph)} onClick={()=>setActivePhase(ph)}>
            {ph==="groups"?"⚽ Grupos":"🏆 Eliminatorias"}
          </button>
        ))}
      </div>

      {activePhase==="groups" && (
        <>
          <div style={{background:"#0d1520",border:"1px solid #c9a84c44",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:"0.8rem",color:"#8899bb",lineHeight:1.7}}>
            ⚠️ <strong style={{color:"#c9a84c"}}>6 plazas por repechaje (marzo 2026):</strong> UEFA A (Ita/NIrl/Gal/Bos) · UEFA B (Ucr/Sue/Pol/Alb) · UEFA C (Tur/Rum/Esl/Kos) · UEFA D (Din/Mac/CZE/Irl) · Intercont.1 (Jam/NCal/RDC) · Intercont.2 (Bol/Sur/Irak)
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {Object.keys(GROUPS).map(g=>(
              <button key={g} className="nav-btn" style={{
                ...S.navBtn(activeGroup===g),
                background:activeGroup===g?GROUP_COLORS[g]:"transparent",
                borderColor:GROUP_COLORS[g],
                color:activeGroup===g?"#fff":GROUP_COLORS[g],
                padding:"5px 12px",fontSize:"0.8rem",
              }} onClick={()=>setActiveGroup(g)}>Grp {g}</button>
            ))}
          </div>
          <div style={S.groupHeader(GROUP_COLORS[activeGroup])}>
            Grupo {activeGroup}
          </div>
          {groupMatches.filter(m=>m.group===activeGroup).map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{color:"#4a5a7e",fontSize:"0.75rem",minWidth:40}}>{m.date}</span>
              {renderMatch(m)}
            </div>
          ))}
        </>
      )}

      {activePhase==="elim" && (
        <>
          {phases.map(ph=>(
            <div key={ph}>
              <div style={S.phaseHeader(phaseColors[ph])}>{phaseLabels[ph]}</div>
              {elimMatches.filter(m=>m.phase===ph).map(m=>(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{color:"#4a5a7e",fontSize:"0.75rem",minWidth:40}}>{m.date}</span>
                  {renderMatch(m)}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ matches, setMatches, participants, setParticipants, adminUnlocked, setAdminUnlocked }) {
  const [adminPin, setAdminPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [activeGroup, setActiveGroup] = useState("A");
  const [activePhase, setActivePhase] = useState("groups");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [editingTeams, setEditingTeams] = useState({});
  const ADMIN = "2026";

  const phaseColors = {round32:"#c0392b",quarters:"#8e44ad",semis:"#e67e22",third:"#2980b9",final:"#c9a84c"};
  const phaseLabels = {round32:"Octavos de Final",quarters:"Cuartos de Final",semis:"Semifinales",third:"Tercer Lugar",final:"🏆 Gran Final"};
  const groupMatches = matches.filter(m=>m.phase==="groups");
  const elimMatches = matches.filter(m=>m.phase!=="groups");
  const phases = [...new Set(elimMatches.map(m=>m.phase))];

  function handleAuth() {
    if (pinInput === ADMIN) { setAuthed(true); setAdminPin(ADMIN); }
    else alert("PIN incorrecto");
  }

  function setResult(matchId, side, val) {
    const v = val === "" ? null : Math.max(0, parseInt(val)||0);
    setMatches(prev => prev.map(m => m.id===matchId ? {...m, [side==="home"?"realHome":"realAway"]: v} : m));
  }

  function setTeamName(matchId, side, val) {
    setMatches(prev => prev.map(m => m.id===matchId ? {...m, [side==="home"?"home":"away"]: val} : m));
  }

  async function handleSave() {
    await saveData("matches", matches);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  function toggleUnlock(phase) {
    const updated = { ...adminUnlocked, [phase]: !adminUnlocked[phase] };
    setAdminUnlocked(updated);
    saveData("adminUnlocked", updated);
  }

  function removeParticipant(id) {
    if (!window.confirm("¿Eliminar este participante?")) return;
    const updated = participants.filter(p=>p.id!==id);
    setParticipants(updated);
    saveData("participants", updated);
  }

  if (!authed) return (
    <div style={{maxWidth:380,margin:"0 auto"}}>
      <div style={S.card}>
        <div style={S.sectionTitle}><Icon.Admin /> Panel de Administrador</div>
        <p style={{color:"#8899bb",marginBottom:16}}>PIN de admin requerido (defecto: <strong style={{color:"#c9a84c"}}>2026</strong>)</p>
        <input style={{...S.input,marginBottom:14}} type="password" placeholder="PIN administrador"
          value={pinInput} onChange={e=>setPinInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleAuth()} />
        <button className="btn-hover" style={S.btn()} onClick={handleAuth}>Entrar como Admin</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:8}}>
          {[["results","⚽ Resultados"],["teams","🔧 Equipos Elim."],["locks","🔒 Bloqueos"],["users","👥 Participantes"]].map(([t,l])=>(
            <button key={t} className="nav-btn" style={S.navBtn(activeTab===t)} onClick={()=>setActiveTab(t)}>{l}</button>
          ))}
        </div>
        <button className="btn-hover" style={{...S.btn(saved?"#27ae60":"#c9a84c"),transition:"all .3s"}} onClick={handleSave}>
          {saved ? "✅ Guardado!" : "💾 Guardar Resultados"}
        </button>
      </div>

      {activeTab==="results" && (
        <>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {["groups","elim"].map(ph=>(
              <button key={ph} className="nav-btn" style={S.navBtn(activePhase===ph)} onClick={()=>setActivePhase(ph)}>
                {ph==="groups"?"⚽ Grupos":"🏆 Eliminatorias"}
              </button>
            ))}
          </div>

          {activePhase==="groups" && (
            <>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {Object.keys(GROUPS).map(g=>(
                  <button key={g} className="nav-btn" style={{
                    ...S.navBtn(activeGroup===g),
                    background:activeGroup===g?GROUP_COLORS[g]:"transparent",
                    borderColor:GROUP_COLORS[g], color:activeGroup===g?"#fff":GROUP_COLORS[g],
                    padding:"5px 12px",fontSize:"0.8rem",
                  }} onClick={()=>setActiveGroup(g)}>Grupo {g}</button>
                ))}
              </div>
              <div style={S.groupHeader(GROUP_COLORS[activeGroup])}>Grupo {activeGroup}</div>
              {groupMatches.filter(m=>m.group===activeGroup).map(m=>(
                <div key={m.id} style={{...S.matchRow,gridTemplateColumns:"auto 1fr auto auto auto 1fr auto",gap:8,marginBottom:6}}>
                  <span style={{color:"#4a5a7e",fontSize:"0.75rem",minWidth:40}}>{m.date}</span>
                  <div style={{textAlign:"right",fontWeight:600,fontSize:"0.88rem"}}>{m.home}</div>
                  <input type="number" min="0" max="99" placeholder="–" style={S.scoreInput}
                    value={m.realHome ?? ""}
                    onChange={e=>setResult(m.id,"home",e.target.value)} />
                  <span style={{color:"#4a5a7e",fontWeight:700,fontSize:"0.7rem"}}>VS</span>
                  <input type="number" min="0" max="99" placeholder="–" style={S.scoreInput}
                    value={m.realAway ?? ""}
                    onChange={e=>setResult(m.id,"away",e.target.value)} />
                  <div style={{fontWeight:600,fontSize:"0.88rem"}}>{m.away}</div>
                  <span style={{fontSize:"0.8rem",color:m.realHome!==null?"#27ae60":"#4a5a7e"}}>
                    {m.realHome!==null?"✅":"⏳"}
                  </span>
                </div>
              ))}
            </>
          )}

          {activePhase==="elim" && (
            <>
              {phases.map(ph=>(
                <div key={ph}>
                  <div style={S.phaseHeader(phaseColors[ph])}>{phaseLabels[ph]}</div>
                  {elimMatches.filter(m=>m.phase===ph).map(m=>(
                    <div key={m.id} style={{...S.matchRow,gridTemplateColumns:"auto 1fr auto auto auto 1fr auto",gap:8,marginBottom:6}}>
                      <span style={{color:"#4a5a7e",fontSize:"0.75rem",minWidth:40}}>{m.date}</span>
                      <div style={{textAlign:"right",fontWeight:600,fontSize:"0.88rem",color:"#8899bb"}}>{m.home}</div>
                      <input type="number" min="0" max="99" placeholder="–" style={S.scoreInput}
                        value={m.realHome??""} onChange={e=>setResult(m.id,"home",e.target.value)} />
                      <span style={{color:"#4a5a7e",fontWeight:700,fontSize:"0.7rem"}}>VS</span>
                      <input type="number" min="0" max="99" placeholder="–" style={S.scoreInput}
                        value={m.realAway??""} onChange={e=>setResult(m.id,"away",e.target.value)} />
                      <div style={{fontWeight:600,fontSize:"0.88rem",color:"#8899bb"}}>{m.away}</div>
                      <span style={{fontSize:"0.8rem",color:m.realHome!==null?"#27ae60":"#4a5a7e"}}>
                        {m.realHome!==null?"✅":"⏳"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}

      {activeTab==="teams" && (
        <div>
          <div style={{...S.card, background:"#0d1520", border:"1px solid #c9a84c44"}}>
            <p style={{color:"#8899bb",marginBottom:16,lineHeight:1.7}}>
              Actualiza los nombres de los equipos en la fase eliminatoria a medida que avanzan.
            </p>
          </div>
          {phases.map(ph=>(
            <div key={ph}>
              <div style={S.phaseHeader(phaseColors[ph])}>{phaseLabels[ph]}</div>
              {elimMatches.filter(m=>m.phase===ph).map((m,i)=>(
                <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 40px 1fr auto",gap:8,alignItems:"center",marginBottom:8}}>
                  <input style={{...S.input,textAlign:"right"}} value={m.home}
                    onChange={e=>setTeamName(m.id,"home",e.target.value)} placeholder="Equipo local" />
                  <div style={{textAlign:"center",color:"#4a5a7e",fontWeight:700}}>VS</div>
                  <input style={S.input} value={m.away}
                    onChange={e=>setTeamName(m.id,"away",e.target.value)} placeholder="Equipo visitante" />
                  <span style={{color:"#4a5a7e",fontSize:"0.75rem"}}>P{i+1}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{marginTop:16}}>
            <button className="btn-hover" style={S.btn()} onClick={handleSave}>💾 Guardar Equipos</button>
          </div>
        </div>
      )}

      {activeTab==="locks" && (
        <div>
          <div style={{...S.card, background:"#0d1520", border:"1px solid #c9a84c44", marginBottom:16}}>
            <p style={{color:"#8899bb",lineHeight:1.7, margin:0}}>
              Aquí puedes <strong style={{color:"#c9a84c"}}>desbloquear manualmente</strong> una fase si un participante cometió un error legítimo antes del cierre.<br/>
              Los bloqueos se activan automáticamente según las fechas configuradas.
            </p>
          </div>
          {[
            {phase:"groups",  label:"⚽ Fase de Grupos",   lockDate:"10 Jun 2026", color:"#1F618D"},
            {phase:"round32", label:"🏆 Octavos de Final", lockDate:"1 Jul 2026",  color:"#c0392b"},
            {phase:"quarters",label:"🏆 Cuartos de Final", lockDate:"3 Jul 2026",  color:"#8e44ad"},
            {phase:"semis",   label:"🏆 Semifinales",      lockDate:"14 Jul 2026", color:"#e67e22"},
            {phase:"third",   label:"🏆 Tercer Lugar",     lockDate:"17 Jul 2026", color:"#2980b9"},
            {phase:"final",   label:"🏆 Gran Final",       lockDate:"18 Jul 2026", color:"#c9a84c"},
          ].map(({phase, label, lockDate, color}) => {
            const autoLocked = isPhaseLocked(phase, {});
            const manuallyUnlocked = !!adminUnlocked[phase];
            const currentlyLocked = autoLocked && !manuallyUnlocked;
            return (
              <div key={phase} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                background:"#0d1520", border:`1px solid ${color}44`,
                borderRadius:10, padding:"14px 18px", marginBottom:10,
              }}>
                <div>
                  <div style={{fontWeight:700, fontSize:"1rem", color:"#e8eaf0"}}>{label}</div>
                  <div style={{fontSize:"0.78rem", color:"#4a5a7e", marginTop:3}}>
                    Se bloquea automáticamente: <strong style={{color:"#8899bb"}}>{lockDate}</strong>
                  </div>
                  <div style={{fontSize:"0.82rem", marginTop:4, color: currentlyLocked?"#e74c3c":"#2ecc71"}}>
                    {currentlyLocked ? "🔒 Bloqueado" : autoLocked ? "🔓 Desbloqueado manualmente por admin" : "🔓 Abierto (fecha no alcanzada)"}
                  </div>
                </div>
                {autoLocked && (
                  <button className="btn-hover"
                    style={{
                      ...S.btn(manuallyUnlocked ? "#27ae60" : "#c0392b", true),
                      fontSize:"0.8rem", padding:"7px 14px", whiteSpace:"nowrap"
                    }}
                    onClick={()=>toggleUnlock(phase)}>
                    {manuallyUnlocked ? "🔒 Volver a Bloquear" : "🔓 Desbloquear"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab==="users" && (
        <div>
          <div style={{...S.sectionTitle,marginBottom:12}}>
            👥 {participants.length} Participantes
          </div>
          {participants.length===0 && <div style={{color:"#4a5a7e",padding:20}}>Sin participantes aún</div>}
          {[...participants].sort((a,b)=>{
            const pa=calcParticipantPoints(a.predictions,matches);
            const pb=calcParticipantPoints(b.predictions,matches);
            return pb.total-pa.total;
          }).map((p,i)=>{
            const pts = calcParticipantPoints(p.predictions, matches);
            const predCount = Object.keys(p.predictions||{}).length;
            return (
              <div key={p.id} style={{...S.leaderRow(i),justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{color:"#4a5a7e",fontWeight:700,minWidth:28}}>#{i+1}</span>
                  <div>
                    <div style={{fontWeight:700}}>{p.name}</div>
                    <div style={{fontSize:"0.75rem",color:"#4a5a7e"}}>{predCount} pronósticos · registrado {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"1.4rem",fontWeight:800,color:"#c9a84c"}}>{pts.total}</div>
                    <div style={{fontSize:"0.7rem",color:"#4a5a7e"}}>pts</div>
                  </div>
                  <button onClick={()=>removeParticipant(p.id)}
                    style={{background:"transparent",border:"1px solid #c0392b44",color:"#c0392b",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:"0.8rem"}}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("leaderboard");
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [participants, setParticipants] = useState([]);
  const [adminUnlocked, setAdminUnlocked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [savedMatches, savedParticipants, savedUnlocked] = await Promise.all([
        loadData("matches"), loadData("participants"), loadData("adminUnlocked")
      ]);
      if (savedMatches) setMatches(savedMatches);
      if (savedParticipants) setParticipants(savedParticipants);
      if (savedUnlocked) setAdminUnlocked(savedUnlocked);
      setLoading(false);
    })();
  }, []);

  const tabs = [
    { id:"leaderboard", label:"📊 Clasificación" },
    { id:"form", label:"⚽ Mis Pronósticos" },
    { id:"fixture", label:"📅 Fixture" },
    { id:"admin", label:"⚙️ Admin" },
  ];

  const totalMatches = matches.filter(m=>m.realHome!==null).length;
  const totalPossible = matches.filter(m=>m.home!=="Por definir").length;

  if (loading) return (
    <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <FontLink />
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:12}} className="pulse">⚽</div>
        <div style={{color:"#c9a84c",fontSize:"1.1rem",letterSpacing:3}}>CARGANDO...</div>
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      <FontLink />
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <span style={{fontSize:"1.8rem"}}>⚽</span>
            <div>
              <div>Mundial 2026</div>
              <div style={{fontSize:"0.65rem",letterSpacing:4,color:"#8899bb",fontWeight:400}}>
                USA · CANADA · MEXICO
              </div>
            </div>
          </div>
          <nav style={S.nav}>
            {tabs.map(t => (
              <button key={t.id} className="nav-btn" style={S.navBtn(view===t.id)} onClick={()=>setView(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{background:"#0a0e1a",borderTop:"1px solid #1e2d4a",padding:"5px 20px",textAlign:"center",fontSize:"0.75rem",color:"#4a5a7e",letterSpacing:1}}>
          🏟 {participants.length} PARTICIPANTES &nbsp;·&nbsp; ⚽ {totalMatches}/{totalPossible} PARTIDOS COMPLETADOS &nbsp;·&nbsp; 11 JUN – 19 JUL 2026
        </div>
      </header>

      <main style={S.main}>
        {view==="leaderboard" && <Leaderboard participants={participants} matches={matches} />}
        {view==="form" && <ParticipantForm participants={participants} setParticipants={setParticipants} matches={matches} adminUnlocked={adminUnlocked} />}
        {view==="fixture" && <FixtureView matches={matches} />}
        {view==="admin" && <AdminPanel matches={matches} setMatches={setMatches} participants={participants} setParticipants={setParticipants} adminUnlocked={adminUnlocked} setAdminUnlocked={setAdminUnlocked} />}
      </main>
    </div>
  );
}
