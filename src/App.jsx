import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ─── 1. CONFIGURACIÓN DE FIREBASE ───────────────────────────────────────────
// PEGA AQUÍ TUS CREDENCIALES (El objeto firebaseConfig que copiaste de Google)

const firebaseConfig = {
  apiKey: "AIzaSyDL2FV0gfT5b58f5mXmAPJMqSbwKde0IV0",
  authDomain: "mundial2026-2026.firebaseapp.com",
  projectId: "mundial2026-2026",
  storageBucket: "mundial2026-2026.firebasestorage.app",
  messagingSenderId: "76029862427",
  appId: "1:76029862427:web:23f21566a32e1c40610ebe"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const DATA_DOC = doc(db, "tournament", "globalData");

// ─── 2. ESTILOS ─────────────────────────────────────────────────────────────
const S = {
  app: { minHeight:"100vh", background:"#0a0e1a", fontFamily:"sans-serif", color:"#e8eaf0", padding: "20px" },
  card: { background:"#111827", border:"1px solid #1e2d4a", borderRadius:12, padding:20, marginBottom:16, maxWidth: "500px", margin: "auto" },
  input: { background:"#1a2540", border:"1px solid #2a3a5e", color:"#fff", borderRadius:6, padding:"10px", width:"100%", marginBottom: "10px", boxSizing: "border-box" },
  btn: (col="#c9a84c") => ({ background: col, color: "#0a0e1a", border:"none", borderRadius:8, padding:"12px", cursor:"pointer", fontWeight:800, width: "100%" }),
  match: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1520", padding: "10px", borderRadius: "8px", marginBottom: "5px" },
  score: { width: "40px", textAlign: "center", background: "#1a2540", color: "#fff", border: "1px solid #2a3a5e", borderRadius: "4px", padding: "5px" }
};

// ─── 3. COMPONENTE PRINCIPAL ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("login");
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [preds, setPreds] = useState({});
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  // Escuchar datos de Firebase en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(DATA_DOC, (docSnap) => {
      if (docSnap.exists()) {
        setParticipants(docSnap.data().participants || []);
      }
    });
    return () => unsub();
  }, []);

  // Función para entrar o crear usuario
  const handleLogin = () => {
    if (!name || !pin) return alert("Llena todos los campos");
    const found = participants.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (found) {
      if (found.pin !== pin) return alert("PIN incorrecto");
      setCurrentUser(found);
      setPreds(found.predictions || {});
    } else {
      const newUser = { id: Date.now(), name, pin, predictions: {} };
      setCurrentUser(newUser);
    }
    setView("form");
  };

  // FUNCIÓN DE GUARDADO (La que fallaba)
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = { ...currentUser, predictions: preds };
      const newParticipants = [...participants.filter(p => p.id !== currentUser.id), updatedUser];
      
      await setDoc(DATA_DOC, { participants: newParticipants });
      
      setParticipants(newParticipants);
      alert("✅ ¡GUARDADO CON ÉXITO!");
      setView("list");
    } catch (error) {
      alert("❌ ERROR DE FIREBASE: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // VISTA: LOGIN
  if (view === "login") return (
    <div style={S.app}>
      <div style={S.card}>
        <h2>🏆 QUINIELA 2026</h2>
        <input style={S.input} placeholder="Tu Nombre" onChange={e => setName(e.target.value)} />
        <input style={S.input} type="password" placeholder="PIN (4 dígitos)" onChange={e => setPin(e.target.value)} />
        <button style={S.btn()} onClick={handleLogin}>ENTRAR</button>
      </div>
    </div>
  );

  // VISTA: FORMULARIO
  if (view === "form") return (
    <div style={S.app}>
      <div style={S.card}>
        <h3>Hola, {currentUser.name}</h3>
        <p>Ingresa tus resultados:</p>
        <div style={S.match}>
          <span>México</span>
          <input style={S.score} type="number" onChange={e => setPreds({...preds, m1_h: e.target.value})} />
          <span>-</span>
          <input style={S.score} type="number" onChange={e => setPreds({...preds, m1_a: e.target.value})} />
          <span>Sudáfrica</span>
        </div>
        <button 
          style={S.btn(saving ? "#555" : "#27ae60")} 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? "GUARDANDO..." : "💾 GUARDAR TODO"}
        </button>
      </div>
    </div>
  );

  // VISTA: LISTA (TABLA)
  return (
    <div style={S.app}>
      <div style={S.card}>
        <h3>TABLA DE POSICIONES</h3>
        {participants.map(p => (
          <div key={p.id} style={{padding: "10px", borderBottom: "1px solid #2a3a5e"}}>
            {p.name} - {Object.keys(p.predictions || {}).length / 2} partidos llenos
          </div>
        ))}
        <button style={{...S.btn(), marginTop: "10px"}} onClick={() => setView("form")}>VOLVER A EDITAR</button>
      </div>
    </div>
  );
}
