import { useState, useMemo } from "react";

const FORMULES = [
  { id: "prod_001", name: "5 à 8 - Découvrir la voile", type: "slot", format: "Soirée", maxPersonnes: 4, niveaux: ["DEB"], duree: 4, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_002", name: "Balade à Voile", type: "slot", format: "Journalier", maxPersonnes: 4, niveaux: ["IN2"], duree: 7, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_003", name: "Cap sur l'Instructeur IVQ et élémentaire", type: "formule", format: "Journée et soirée", maxPersonnes: 4, niveaux: ["INST1","INST2","INST3","INST4","INST5","INST6"], duree: null, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_004", name: "Cap sur l'Avancé", type: "formule", format: "Journée et soirée", maxPersonnes: null, niveaux: ["CADV1","CADV2","CADV3","CADV4","CADV5"], duree: null, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_005", name: "Cap sur l'Intermédiaire", type: "formule", format: "Journée et soirée", maxPersonnes: 8, niveaux: ["CINT1","CINT2","CINT3","CINT4","CINT5"], duree: null, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_006", name: "Croisière Avancée", type: "formule", format: "Voyage à Vie à bord", maxPersonnes: 4, niveaux: ["CADV1","CADV2","CADV3","CADV4","CADV5","CADV6","CADV7","CADV8","CADV9","CADV10"], duree: null, lieu: "Destination sur mesure" },
  { id: "prod_007", name: "Croisière Intermédiaire", type: "formule", format: "Voyage à Vie à bord", maxPersonnes: 6, niveaux: ["INTER1","INTER2","INTER3","INTER4","INTER5","INTER6","INTER7"], duree: null, lieu: "Destination sur mesure" },
  { id: "prod_008", name: "Croisière élémentaire", type: "formule", format: "Journalier", maxPersonnes: 4, niveaux: ["EQUIEL1","EQUIEL2","EQUIEL3","EQUIEL4","VE1","VE2","VE3","VE4"], duree: 32, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_009", name: "Initiation à la Navigation de Nuit", type: "slot", format: "Soirée", maxPersonnes: 4, niveaux: ["VE4"], duree: 5, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_010", name: "Initiation à la voile", type: "formule", format: "Journalier", maxPersonnes: 4, niveaux: ["IN1","IN2"], duree: 14, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_011", name: "Journée de Nav. - complexes", type: "slot", format: "Journalier", maxPersonnes: 4, niveaux: ["VE3","VE4"], duree: 7, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_012", name: "Journée de Nav. - élémentaire", type: "slot", format: "Journalier", maxPersonnes: 4, niveaux: ["IN1","IN2"], duree: 7, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_013", name: "Manoeuvre de Port & Pilotage", type: "slot", format: "Soirée", maxPersonnes: 4, niveaux: ["MP1","MP2","MP3","MP4"], duree: 3, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_014", name: "Pratique de Navigation - Soirée", type: "slot", format: "Soirée", maxPersonnes: 4, niveaux: ["IN2","VE2"], duree: 3, lieu: "Yacht Club de Beaconsfield" },
  { id: "prod_015", name: "Voyage Accompagné", type: "formule", format: "Voyage à Vie à bord", maxPersonnes: 10, niveaux: ["DEB2"], duree: null, lieu: "Destination sur mesure" },
  { id: "prod_016", name: "Voyager autrement à la voile", type: "formule", format: "Voyage à Vie à bord", maxPersonnes: 10, niveaux: ["DEB"], duree: null, lieu: "Destination sur mesure" },
];

const ALL_NIVEAUX = [...new Set(FORMULES.flatMap(f => f.niveaux))].sort();

function generateSlots(formules) {
  const slots = [];
  let id = 1;
  formules.forEach(f => {
    const count = f.type === "slot" ? 10 : 4;
    for (let i = 0; i < count; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const isEvening = f.format === "Soirée";
      const hour = isEvening ? 17 + Math.floor(Math.random() * 2) : 9 + Math.floor(Math.random() * 3);
      const date = new Date(2026, 5, day, hour, 0);
      const spotsLeft = Math.floor(Math.random() * (f.maxPersonnes || 4)) + 1;
      slots.push({ id: `slot_${id++}`, productId: f.id, productName: f.name, type: f.type, format: f.format, niveaux: f.niveaux, date, spotsLeft, maxSpots: f.maxPersonnes || 4, duree: f.duree, lieu: f.lieu });
    }
  });
  return slots.sort((a, b) => a.date - b.date);
}

const SLOTS = generateSlots(FORMULES);
const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function getWeekDates(base) {
  const d = new Date(base);
  const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(sun); x.setDate(sun.getDate() + i); return x; });
}

const fmt = (format) => {
  switch (format) {
    case "Soirée": return { bg: "#1a1a2e", text: "#a78bfa", border: "#4c1d95" };
    case "Journalier": return { bg: "#0a1628", text: "#38bdf8", border: "#0c4a6e" };
    case "Journée et soirée": return { bg: "#0f1f1a", text: "#34d399", border: "#065f46" };
    case "Voyage à Vie à bord": return { bg: "#1f0f0f", text: "#fb923c", border: "#7c2d12" };
    default: return { bg: "#1a1a1a", text: "#a1a1aa", border: "#3f3f46" };
  }
};
const typeClr = (t) => t === "slot" ? { bg: "#164e63", text: "#67e8f9" } : { bg: "#4a1d6e", text: "#c084fc" };

function SlotCard({ s, onBook }) {
  const fc = fmt(s.format); const tc = typeClr(s.type);
  return (
    <div style={{ background: "#0f172a", borderRadius: "10px", padding: "14px", border: "1px solid #1e293b", transition: "all 0.2s", cursor: "pointer" }}
      onClick={() => onBook(s)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", flex: 1, lineHeight: "1.4" }}>{s.productName}</div>
        <div style={{ fontSize: "11px", fontWeight: "600", fontFamily: "'Space Mono', monospace", color: s.spotsLeft <= 2 ? "#f87171" : "#34d399", whiteSpace: "nowrap", marginLeft: "8px" }}>{s.spotsLeft}/{s.maxSpots}</div>
      </div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: fc.bg, color: fc.text, border: `1px solid ${fc.border}`, fontWeight: "500" }}>{s.format}</span>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: tc.bg, color: tc.text, fontWeight: "500" }}>{s.type}</span>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: "#1e293b", color: "#94a3b8", fontWeight: "500", fontFamily: "'Space Mono', monospace" }}>{String(s.date.getHours()).padStart(2, "0")}:00</span>
      </div>
      {s.lieu && <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>📍 {s.lieu}</div>}
      <button style={{ width: "100%", padding: "7px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", transition: "opacity 0.2s" }}
        onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}
        onClick={e => { e.stopPropagation(); onBook(s); }}>Réserver →</button>
    </div>
  );
}

export default function BookingScheduler() {
  const [currentMonth, setCurrentMonth] = useState(5);
  const [currentYear, setCurrentYear] = useState(2026);
  const [weekBase, setWeekBase] = useState(new Date(2026, 5, 7));
  const [userNiveau, setUserNiveau] = useState("DEB");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("month");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredSlots = useMemo(() => SLOTS.filter(s => {
    return s.niveaux.includes(userNiveau) && (filterFormat === "all" || s.format === filterFormat) && (filterType === "all" || s.type === filterType);
  }), [userNiveau, filterFormat, filterType]);

  const slotsThisMonth = useMemo(() => filteredSlots.filter(s => s.date.getMonth() === currentMonth && s.date.getFullYear() === currentYear), [filteredSlots, currentMonth, currentYear]);
  const slotsByDay = useMemo(() => { const m = {}; slotsThisMonth.forEach(s => { const d = s.date.getDate(); if (!m[d]) m[d] = []; m[d].push(s); }); return m; }, [slotsThisMonth]);

  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);
  const slotsThisWeek = useMemo(() => filteredSlots.filter(s => weekDates.some(wd => isSameDay(wd, s.date))), [filteredSlots, weekDates]);
  const weekSlotGrid = useMemo(() => { const g = {}; slotsThisWeek.forEach(s => { const k = `${s.date.getDay()}-${s.date.getHours()}`; if (!g[k]) g[k] = []; g[k].push(s); }); return g; }, [slotsThisWeek]);
  const activeHours = useMemo(() => { const h = new Set(); slotsThisWeek.forEach(s => h.add(s.date.getHours())); return HOURS.filter(x => h.has(x)); }, [slotsThisWeek]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const daySlots = selectedDay !== null
    ? (view === "week" ? slotsThisWeek.filter(s => isSameDay(s.date, selectedDay)) : (slotsByDay[selectedDay] || []))
    : [];

  const handleBook = (slot) => { setSelectedSlot(slot); setShowConfirm(true); };
  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => { setCheckoutLoading(false); setShowConfirm(false); setSelectedSlot(null);
      alert("✓ Stripe Checkout redirect\n\nPOST /api/booking/checkout\n{ slotId: '" + selectedSlot.id + "' }");
    }, 1500);
  };

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };
  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); setSelectedDay(null); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); setSelectedDay(null); };

  const uniqueFormats = [...new Set(FORMULES.map(f => f.format))];
  const visibleCount = view === "week" ? slotsThisWeek.length : slotsThisMonth.length;

  const weekLabel = useMemo(() => {
    const s = weekDates[0]; const e = weekDates[6];
    if (s.getMonth() === e.getMonth()) return `${s.getDate()} – ${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    return `${s.getDate()} ${MONTHS[s.getMonth()].slice(0,3)} – ${e.getDate()} ${MONTHS[e.getMonth()].slice(0,3)} ${e.getFullYear()}`;
  }, [weekDates]);

  const sel = { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: "8px", padding: "7px 28px 7px 10px", fontSize: "13px", fontWeight: "500", cursor: "pointer", outline: "none", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(165deg, #020617 0%, #0c1222 40%, #091520 100%)", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⛵</div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>Réservation — Été 2026</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 48px" }}>Sélectionnez une date pour voir les formules disponibles</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px", padding: "14px 16px", borderRadius: "14px", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.08)", backdropFilter: "blur(12px)", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Votre niveau</label>
            <select value={userNiveau} onChange={e => setUserNiveau(e.target.value)} style={sel}>{ALL_NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}</select>
          </div>
          <div style={{ width: "1px", height: "36px", background: "#1e293b" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Format</label>
            <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} style={sel}>
              <option value="all">Tous les formats</option>
              {uniqueFormats.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ width: "1px", height: "36px", background: "#1e293b" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Type</label>
            <div style={{ display: "flex", gap: "4px" }}>
              {["all", "slot", "formule"].map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", border: "1px solid", borderColor: filterType === t ? "#38bdf8" : "#334155", background: filterType === t ? "rgba(56,189,248,0.12)" : "transparent", color: filterType === t ? "#38bdf8" : "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}>
                  {t === "all" ? "Tous" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: "2px", background: "#1e293b", borderRadius: "8px", padding: "3px" }}>
            {[{ key: "month", label: "Mois", icon: "📅" }, { key: "week", label: "Semaine", icon: "📆" }, { key: "list", label: "Liste", icon: "📋" }].map(v => (
              <button key={v.key} onClick={() => { setView(v.key); setSelectedDay(null); }} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "500", border: "none", background: view === v.key ? "#334155" : "transparent", color: view === v.key ? "#e2e8f0" : "#64748b", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <div style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", background: "rgba(56,189,248,0.08)", color: "#38bdf8", fontWeight: "600", fontFamily: "'Space Mono', monospace" }}>{visibleCount} dispo.</div>
        </div>

        {/* Main */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 640px", minWidth: "320px" }}>

            {/* ===== MONTH VIEW ===== */}
            {view === "month" && (
              <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.08)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  <button onClick={prevMonth} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>←</button>
                  <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "600" }}>{MONTHS[currentMonth]} {currentYear}</h2>
                  <button onClick={nextMonth} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>→</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: "center", padding: "10px 0", fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} style={{ padding: "8px", minHeight: "72px" }} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1; const dayS = slotsByDay[day] || []; const isSelected = selectedDay === day; const hasSlots = dayS.length > 0;
                    return (
                      <div key={day} onClick={() => hasSlots && setSelectedDay(isSelected ? null : day)} style={{ padding: "6px 8px", minHeight: "72px", cursor: hasSlots ? "pointer" : "default", background: isSelected ? "rgba(56,189,248,0.08)" : "transparent", borderRadius: "4px", border: isSelected ? "1px solid rgba(56,189,248,0.25)" : "1px solid transparent", transition: "all 0.2s" }}>
                        <div style={{ fontSize: "13px", fontWeight: hasSlots ? "600" : "400", color: hasSlots ? "#e2e8f0" : "#334155", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>{day}</div>
                        {dayS.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {dayS.slice(0, 3).map(s => { const fc = fmt(s.format); return <div key={s.id} style={{ fontSize: "9px", padding: "2px 5px", borderRadius: "4px", background: fc.bg, color: fc.text, border: `1px solid ${fc.border}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "500" }}>{s.productName.length > 18 ? s.productName.slice(0, 18) + "…" : s.productName}</div>; })}
                          {dayS.length > 3 && <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "500", paddingLeft: "4px" }}>+{dayS.length - 3} de plus</div>}
                        </div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== WEEK VIEW ===== */}
            {view === "week" && (
              <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.08)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  <button onClick={prevWeek} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>←</button>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Semaine du {weekLabel}</h2>
                  <button onClick={nextWeek} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>→</button>
                </div>
                {/* Day column headers */}
                <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  <div />
                  {weekDates.map((wd, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "10px 4px", borderLeft: "1px solid rgba(148,163,184,0.04)" }}>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>{DAYS_SHORT[i]}</div>
                      <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "'Space Mono', monospace", color: isSameDay(wd, new Date()) ? "#38bdf8" : "#94a3b8", marginTop: "2px" }}>{wd.getDate()}</div>
                    </div>
                  ))}
                </div>
                {/* Time grid */}
                <div style={{ maxHeight: "520px", overflowY: "auto" }}>
                  {activeHours.length === 0 ? (
                    <div style={{ padding: "48px 24px", textAlign: "center", color: "#475569", fontSize: "13px" }}>Aucune disponibilité cette semaine pour votre niveau.</div>
                  ) : activeHours.map(hour => (
                    <div key={hour} style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: "60px", borderBottom: "1px solid rgba(148,163,184,0.04)" }}>
                      <div style={{ padding: "8px 4px 8px 10px", fontSize: "11px", fontWeight: "600", color: "#475569", fontFamily: "'Space Mono', monospace", borderRight: "1px solid rgba(148,163,184,0.06)", display: "flex", alignItems: "flex-start", paddingTop: "10px" }}>{String(hour).padStart(2, "0")}h</div>
                      {weekDates.map((wd, dayIdx) => {
                        const cellSlots = weekSlotGrid[`${dayIdx}-${hour}`] || [];
                        const cellSelected = selectedDay && isSameDay(wd, selectedDay);
                        return (
                          <div key={dayIdx} onClick={() => {
                            if (cellSlots.length > 0) setSelectedDay(cellSelected ? null : wd);
                          }} style={{ padding: "3px 4px", borderLeft: "1px solid rgba(148,163,184,0.04)", cursor: cellSlots.length > 0 ? "pointer" : "default", background: cellSelected ? "rgba(56,189,248,0.06)" : "transparent", transition: "background 0.15s" }}>
                            {cellSlots.map(s => {
                              const fc = fmt(s.format);
                              return (
                                <div key={s.id} onClick={e => { e.stopPropagation(); handleBook(s); }} style={{
                                  fontSize: "9px", padding: "4px 5px", borderRadius: "5px", marginBottom: "3px",
                                  background: fc.bg, color: fc.text, border: `1px solid ${fc.border}`,
                                  fontWeight: "500", lineHeight: "1.35", cursor: "pointer",
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                  transition: "all 0.15s",
                                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                  {s.productName.length > 20 ? s.productName.slice(0, 20) + "…" : s.productName}
                                  <div style={{ fontSize: "8px", opacity: 0.7, marginTop: "1px" }}>{s.spotsLeft}/{s.maxSpots} places</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== LIST VIEW ===== */}
            {view === "list" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(15,23,42,0.6)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.08)", marginBottom: "4px" }}>
                  <button onClick={prevMonth} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>←</button>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>{MONTHS[currentMonth]} {currentYear}</span>
                  <button onClick={nextMonth} style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}>→</button>
                </div>
                {slotsThisMonth.length === 0 && <div style={{ padding: "48px 24px", textAlign: "center", color: "#475569", background: "rgba(15,23,42,0.6)", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.08)" }}>Aucune disponibilité pour votre niveau ce mois-ci.</div>}
                {slotsThisMonth.map(s => {
                  const fc = fmt(s.format); const tc = typeClr(s.type);
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 18px", borderRadius: "12px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.08)", cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => handleBook(s)} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(148,163,184,0.08)"}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#94a3b8", minWidth: "70px", textAlign: "center", lineHeight: "1.6" }}>
                        <div style={{ fontWeight: "700", color: "#e2e8f0", fontSize: "18px" }}>{s.date.getDate()}</div>
                        <div>{MONTHS[s.date.getMonth()].slice(0, 3)}</div>
                        <div>{String(s.date.getHours()).padStart(2, "0")}:00</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>{s.productName}</div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: fc.bg, color: fc.text, border: `1px solid ${fc.border}`, fontWeight: "500" }}>{s.format}</span>
                          <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: tc.bg, color: tc.text, fontWeight: "500" }}>{s.type}</span>
                          {s.lieu && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", background: "#1a1a2e", color: "#94a3b8", fontWeight: "500" }}>📍 {s.lieu}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: s.spotsLeft <= 2 ? "#f87171" : "#34d399" }}>{s.spotsLeft}/{s.maxSpots}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== RIGHT PANEL ===== */}
          <div style={{ flex: "0 0 340px", minWidth: "280px" }}>
            {showConfirm && selectedSlot ? (
              <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: "16px", border: "1px solid rgba(56,189,248,0.2)", padding: "24px", backdropFilter: "blur(12px)" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600" }}>Confirmer la réservation</h3>
                <div style={{ background: "#0f172a", borderRadius: "10px", padding: "16px", marginBottom: "16px", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>{selectedSlot.productName}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.8" }}>
                    📅 {selectedSlot.date.getDate()} {MONTHS[selectedSlot.date.getMonth()]} {selectedSlot.date.getFullYear()}<br/>
                    🕐 {String(selectedSlot.date.getHours()).padStart(2, "0")}:00<br/>
                    📍 {selectedSlot.lieu || "À définir"}<br/>
                    👥 {selectedSlot.spotsLeft} places restantes
                  </div>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "11px", color: "#a5b4fc", lineHeight: "1.6" }}>
                  💳 Vous serez redirigé vers Stripe Checkout pour finaliser le paiement.
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setShowConfirm(false); setSelectedSlot(null); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Annuler</button>
                  <button onClick={handleCheckout} disabled={checkoutLoading} style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", background: checkoutLoading ? "#334155" : "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", opacity: checkoutLoading ? 0.7 : 1 }}>
                    {checkoutLoading ? "Chargement..." : "Réserver →"}
                  </button>
                </div>
              </div>
            ) : (daySlots.length > 0 && selectedDay !== null) ? (
              <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.08)", padding: "20px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>
                  {view === "week" ? `${DAYS_FULL[selectedDay.getDay()]} ${selectedDay.getDate()} ${MONTHS[selectedDay.getMonth()]}` : `${selectedDay} ${MONTHS[currentMonth]}`}
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b" }}>{daySlots.length} formule{daySlots.length > 1 ? "s" : ""} disponible{daySlots.length > 1 ? "s" : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
                  {daySlots.map(s => <SlotCard key={s.id} s={s} onBook={handleBook} />)}
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: "16px", border: "1px dashed rgba(148,163,184,0.12)", padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.4 }}>{view === "week" ? "📆" : "📅"}</div>
                <p style={{ color: "#475569", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                  {view === "week" ? "Cliquez sur un créneau dans la grille horaire ou sur un jour pour voir les détails." : "Cliquez sur un jour avec des formules disponibles pour voir les détails et réserver."}
                </p>
              </div>
            )}

            {/* Legend */}
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", background: "rgba(15,23,42,0.4)", border: "1px solid rgba(148,163,184,0.06)" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Légende des formats</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {["Soirée", "Journalier", "Journée et soirée", "Voyage à Vie à bord"].map(f => {
                  const c = fmt(f);
                  return <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "10px", height: "10px", borderRadius: "3px", background: c.text, opacity: 0.8 }} /><span style={{ fontSize: "11px", color: "#94a3b8" }}>{f}</span></div>;
                })}
              </div>
            </div>
            <div style={{ marginTop: "12px", padding: "14px", borderRadius: "12px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)", fontSize: "10px", color: "#818cf8", lineHeight: "1.7", fontFamily: "'Space Mono', monospace" }}>
              <strong>Data flow:</strong><br/>
              GET /api/slots?month=6&year=2026<br/>
              → Laravel joins DB slots + Stripe metadata<br/>
              POST /api/booking/checkout {"{"} slotId {"}"}<br/>
              → Stripe Checkout Session → redirect<br/>
              WEBHOOK checkout.session.completed<br/>
              → Confirm booking, decrement capacity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
