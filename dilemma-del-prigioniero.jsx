import React, { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================
   MOTORE — Dilemma del Prigioniero iterato
   Le mosse dipendono solo dallo storico (non dai payoff).
   ============================================================ */

const C = "C";
const D = "D";

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// en = nome originale inglese · it = traduzione (solo il nome)
const STRATEGIES = [
  {
    id: "allc", en: "Always Cooperate", it: "Sempre Coopera", abbr: "ALLC",
    tags: ["Gentile", "Ingenua"], tendency: 100,
    tagline: "Coopera sempre, qualunque cosa accada.",
    play: () => C,
    pseudo: ["restituisci COOPERA"],
    intuizione: "La fiducia incondizionata. Non punisce mai e non impara mai dai tradimenti.",
    forti: ["Massimizza il guadagno reciproco con partner leali", "Non innesca mai spirali di vendetta"],
    deboli: ["Viene sfruttata all'infinito da chi tradisce", "Non possiede alcun deterrente"],
    controChi: "Prospera in un mondo di cooperatori, crolla contro chi la sfrutta.",
  },
  {
    id: "alld", en: "Always Defect", it: "Sempre Tradisci", abbr: "ALLD",
    tags: ["Ostile"], tendency: 0,
    tagline: "Tradisce sempre, senza eccezioni.",
    play: () => D,
    pseudo: ["restituisci TRADISCI"],
    intuizione: "L'aggressore puro. Sfrutta i cooperatori ma si condanna alla punizione reciproca contro chi reagisce.",
    forti: ["Spreme al massimo gli ingenui", "Non viene mai sorpresa alle spalle"],
    deboli: ["Contro le reattive resta bloccata sulla punizione minima", "Distrugge il valore complessivo del gioco"],
    controChi: "Devastante contro i gentili ingenui, mediocre contro tutto il resto.",
  },
  {
    id: "tft", en: "Tit for Tat", it: "Occhio per Occhio", abbr: "TFT",
    tags: ["Gentile", "Reattiva", "Indulgente"], tendency: 60,
    tagline: "Inizia cooperando, poi copia l'ultima mossa dell'altro.",
    play: (me, opp) => (opp.length === 0 ? C : opp[opp.length - 1]),
    pseudo: ["se è il primo round: COOPERA", "altrimenti: copia l'ultima mossa dell'avversario"],
    intuizione: "La strategia che vinse i tornei di Axelrod: gentile, reattiva, indulgente e chiara.",
    forti: ["Non tradisce mai per prima", "Punisce subito ma perdona appena l'altro torna a cooperare", "Leggibile: l'avversario impara a fidarsi"],
    deboli: ["Vulnerabile al rumore: un errore innesca vendette a catena", "Non sfrutta gli ingenui puri"],
    controChi: "Pareggia o vince quasi ovunque; soffre solo con avversari rumorosi o sospettosi.",
  },
  {
    id: "tf2t", en: "Tit for Two Tats", it: "Occhio per Due Occhi", abbr: "TF2T",
    tags: ["Gentile", "Indulgente"], tendency: 72,
    tagline: "Reagisce solo dopo due tradimenti di fila.",
    play: (me, opp) => { const n = opp.length; if (n < 2) return C; return opp[n - 1] === D && opp[n - 2] === D ? D : C; },
    pseudo: ["se gli ultimi DUE round l'avversario ha tradito: TRADISCI", "altrimenti: COOPERA"],
    intuizione: "Una versione più tollerante di Tit for Tat. Assorbe gli errori isolati senza scatenare rappresaglie.",
    forti: ["Immune alle spirali di vendetta da singolo errore", "Ottima in ambienti rumorosi"],
    deboli: ["Un profittatore può tradire a round alterni impunemente", "Più lenta a difendersi"],
    controChi: "Brilla contro chi sbaglia; sfruttabile da chi tradisce con parsimonia calcolata.",
  },
  {
    id: "grim", en: "Grim Trigger", it: "Rancore Eterno", abbr: "GRIM",
    tags: ["Gentile", "Rancorosa"], tendency: 45,
    tagline: "Coopera finché non la tradisci una volta. Poi tradisce per sempre.",
    play: (me, opp) => (opp.includes(D) ? D : C),
    pseudo: ["se l'avversario ha tradito ANCHE UNA SOLA VOLTA: TRADISCI per sempre", "altrimenti: COOPERA"],
    intuizione: "Il deterrente massimo. Una sola violazione fa scattare la punizione irreversibile.",
    forti: ["Deterrente fortissimo: conviene non tradirla mai", "Non si fa sfruttare due volte"],
    deboli: ["Nessun perdono: un errore rovina la relazione per sempre", "In ambienti rumorosi collassa nella guerra totale"],
    controChi: "Tiene testa agli aggressori, ma spreca ottime relazioni al primo incidente.",
  },
  {
    id: "pavlov", en: "Pavlov", it: "Vinci-Resta / Perdi-Cambia", abbr: "PAV",
    tags: ["Adattiva"], tendency: 55,
    tagline: "Se l'ultima mossa ha funzionato la ripete, altrimenti cambia.",
    play: (me, opp) => { const n = me.length; if (n === 0) return C; return me[n - 1] === opp[n - 1] ? C : D; },
    pseudo: ["se al round scorso abbiamo fatto la STESSA mossa: COOPERA", "altrimenti: TRADISCI"],
    intuizione: "Impara dall'esito, non dall'intenzione: ripete ciò che ha pagato e corregge ciò che ha perso.",
    forti: ["Sfrutta gli ingenui: capisce di poterli tradire impunemente", "Recupera in fretta la cooperazione reciproca"],
    deboli: ["Comportamento meno leggibile: genera diffidenza", "Oscilla contro strategie casuali"],
    controChi: "Punisce Always Cooperate e collabora con i suoi simili; instabile contro il caos.",
  },
  {
    id: "random", en: "Random", it: "Casuale", abbr: "RND",
    tags: ["Casuale"], tendency: 50,
    tagline: "Lancia una moneta a ogni round.",
    play: (me, opp, rng) => (rng() < 0.5 ? C : D),
    pseudo: ["se testa: COOPERA", "se croce: TRADISCI"],
    intuizione: "Nessuna strategia, puro rumore. Battere il caso è il minimo sindacale.",
    forti: ["Imprevedibile: nessuno può leggerla", "Utile come riferimento neutro"],
    deboli: ["Non costruisce fiducia né sfrutta nessuno", "Rende quasi sempre poco"],
    controChi: "Perde terreno contro tutte le strategie strutturate.",
  },
  {
    id: "sustft", en: "Suspicious Tit for Tat", it: "Occhio Sospettoso", abbr: "STFT",
    tags: ["Ostile", "Reattiva"], tendency: 42,
    tagline: "Come Tit for Tat, ma parte tradendo.",
    play: (me, opp) => (opp.length === 0 ? D : opp[opp.length - 1]),
    pseudo: ["se è il primo round: TRADISCI", "altrimenti: copia l'ultima mossa dell'avversario"],
    intuizione: "Stessa logica reattiva, ma con apertura diffidente. Mostra quanto conti la prima mossa.",
    forti: ["Non regala il primo round agli sfruttatori", "Difensiva fin da subito"],
    deboli: ["Contro un'altra reattiva innesca una guerra evitabile", "Perde le occasioni di cooperazione immediata"],
    controChi: "Stesso motore di Tit for Tat, ma esito peggiore per colpa dell'apertura ostile.",
  },
  {
    id: "gtft", en: "Generous Tit for Tat", it: "Occhio Generoso", abbr: "GTFT",
    tags: ["Gentile", "Indulgente"], tendency: 68,
    tagline: "Copia l'avversario, ma ogni tanto perdona un tradimento.",
    play: (me, opp, rng) => { if (opp.length === 0) return C; const last = opp[opp.length - 1]; if (last === C) return C; return rng() < 0.1 ? C : D; },
    pseudo: ["se l'avversario ha cooperato: COOPERA", "se ha tradito: perdona col 10%, altrimenti TRADISCI"],
    intuizione: "Aggiunge perdono casuale a Tit for Tat per spezzare le spirali di vendetta da errore.",
    forti: ["Rompe i cicli di rappresaglia reciproca", "Eccellente in ambienti rumorosi"],
    deboli: ["Il perdono può essere sfruttato dagli opportunisti", "Leggermente più cedevole"],
    controChi: "Spesso supera Tit for Tat quando c'è rumore; concede qualcosa contro i predatori.",
  },
  {
    id: "detective", en: "Detective", it: "Il Sondatore", abbr: "DET",
    tags: ["Adattiva", "Ostile"], tendency: 40,
    tagline: "Sonda l'avversario, poi lo sfrutta o si adegua.",
    play: (me, opp) => { const opening = [C, D, C, C]; const r = me.length; if (r < 4) return opening[r]; const reagito = opp.slice(0, 4).includes(D); return reagito ? opp[opp.length - 1] : D; },
    pseudo: ["primi 4 round: COOPERA, TRADISCI, COOPERA, COOPERA", "se l'avversario ha reagito: gioca Tit for Tat", "se non ha reagito: TRADISCI sempre"],
    intuizione: "Prima raccoglie informazioni, poi decide. Sfrutta i deboli e rispetta i forti.",
    forti: ["Individua e spreme gli ingenui", "Si difende contro chi sa reagire"],
    deboli: ["Il tradimento di prova rovina i rapporti con i suscettibili", "Apertura rischiosa"],
    controChi: "Domina Always Cooperate; contro le reattive ripiega su Tit for Tat.",
  },
  {
    id: "greedy", en: "Greedy", it: "L'Ingordo", abbr: "GRDY",
    tags: ["Adattiva", "Ostile"], tendency: 32,
    tagline: "Gioca la mossa che finora le ha reso di più.",
    play: (me, opp, rng, M) => {
      if (me.length === 0) return C;
      if (me.length === 1) return D;
      let sumC = 0, nC = 0, sumD = 0, nD = 0;
      for (let i = 0; i < me.length; i++) { const p = payoff(me[i], opp[i], M); if (me[i] === C) { sumC += p; nC++; } else { sumD += p; nD++; } }
      const avgC = nC ? sumC / nC : Infinity, avgD = nD ? sumD / nD : Infinity;
      return avgD >= avgC ? D : C;
    },
    pseudo: ["primi due round: prova COOPERA, poi TRADISCI", "poi: gioca la mossa che ti ha reso di più in media"],
    intuizione: "Un opportunista che impara: massimizza in base a ciò che ha osservato. Se tradire paga, tradisce; se un avversario reattivo lo punisce, scopre che conviene cooperare.",
    forti: ["Sfrutta senza pietà chi non reagisce", "Si adatta: contro le reattive impara a cooperare"],
    deboli: ["I due round di 'prova' possono guastare rapporti fragili", "Guarda solo i payoff medi, ignora le intenzioni"],
    controChi: "Spreme Always Cooperate; contro Tit for Tat e Grim Trigger converge sulla cooperazione.",
  },
  {
    id: "minimax", en: "Minimax", it: "Il Prudente", abbr: "MMAX",
    tags: ["Ostile", "Difensiva"], tendency: 28,
    tagline: "Sceglie la mossa che rende meno grave lo scenario peggiore.",
    play: (me, opp, rng, M) => {
      const worstC = Math.min(payoff(C, C, M), payoff(C, D, M));
      const worstD = Math.min(payoff(D, C, M), payoff(D, D, M));
      return worstD >= worstC ? D : C;
    },
    pseudo: ["per ogni mia mossa, guarda il risultato PEGGIORE possibile", "gioca la mossa il cui scenario peggiore è meno grave"],
    intuizione: "La logica della sicurezza pura: non punta a vincere, ma a non perdere troppo. Nel dilemma classico questo coincide con tradire sempre — ed è esattamente ciò che rende il dilemma un dilemma.",
    forti: ["Mai colta di sorpresa: ottimizza il caso peggiore", "Immune allo sfruttamento"],
    deboli: ["Rinuncia in partenza ai guadagni della cooperazione", "Con i payoff standard è indistinguibile da Always Defect"],
    controChi: "Con la matrice classica tradisce sempre; cambia idea solo se modifichi i payoff così che cooperare diventi la scelta sicura.",
  },
];

const byId = Object.fromEntries(STRATEGIES.map((s) => [s.id, s]));

function payoff(mine, theirs, M) {
  if (mine === C && theirs === C) return M.R;
  if (mine === C && theirs === D) return M.S;
  if (mine === D && theirs === C) return M.T;
  return M.P;
}
function simulateMatch(idA, idB, rounds, seed, M) {
  const rng = mulberry32(seed);
  const A = byId[idA], B = byId[idB];
  const movesA = [], movesB = [];
  for (let r = 0; r < rounds; r++) {
    const a = A.play(movesA, movesB, rng, M);
    const b = B.play(movesB, movesA, rng, M);
    movesA.push(a); movesB.push(b);
  }
  return { movesA, movesB };
}
function scoreMoves(mine, theirs, M) { let s = 0; for (let i = 0; i < mine.length; i++) s += payoff(mine[i], theirs[i], M); return s; }
function seedFor(i, j, base) { return (base * 73856093) ^ ((i + 1) * 19349663) ^ ((j + 1) * 83492791); }
function runTournament(rounds, M, base) {
  const n = STRATEGIES.length;
  const grid = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const { movesA, movesB } = simulateMatch(STRATEGIES[i].id, STRATEGIES[j].id, rounds, seedFor(i, j, base), M);
      grid[i][j] = scoreMoves(movesA, movesB, M);
      grid[j][i] = scoreMoves(movesB, movesA, M);
    }
  const totals = grid.map((row, i) => ({ i, strat: STRATEGIES[i], total: row.reduce((a, b) => a + b, 0) }));
  const ranking = [...totals].sort((a, b) => b.total - a.total);
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { min = Math.min(min, grid[i][j]); max = Math.max(max, grid[i][j]); }
  return { grid, totals, ranking, min, max };
}

/* ============================================================
   DESIGN
   ============================================================ */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";
const ROOT_VARS = {
  "--bg": "#14161b", "--surface": "#1b1e26", "--surface2": "#232733",
  "--line": "rgba(236,231,219,0.10)", "--line-strong": "rgba(236,231,219,0.18)",
  "--text": "#ECE7DB", "--muted": "#8f897c",
  "--coop": "#38C39A", "--coop-dim": "rgba(56,195,154,0.16)",
  "--defect": "#F26B4E", "--defect-dim": "rgba(242,107,78,0.16)",
  "--amber": "#EBB552", "--amber-dim": "rgba(235,181,82,0.14)",
  fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text)", background: "var(--bg)",
};
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const mono = { fontFamily: "'Space Mono', ui-monospace, monospace" };

const CSS = `
.ipd * { box-sizing: border-box; }
.ipd { -webkit-font-smoothing: antialiased; line-height: 1.5; }
.ipd ::selection { background: var(--amber-dim); }
.ipd button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.ipd button:disabled { cursor: default; }
.ipd button:focus-visible, .ipd select:focus-visible, .ipd input:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
.ipd .eyebrow { font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
.ipd .tab { padding:9px 16px; border-radius:999px; font-size:14px; font-weight:500; color:var(--muted); transition:color .18s,background .18s; border:1px solid transparent; white-space:nowrap; }
.ipd .tab:hover { color:var(--text); }
.ipd .tab.active { color:var(--bg); background:var(--amber); font-weight:600; }
.ipd .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; }
.ipd .stratcard { transition:transform .18s,border-color .18s; text-align:left; width:100%; }
.ipd .stratcard:hover { transform:translateY(-3px); border-color:var(--line-strong); }
.ipd .stratcard.open { border-color:var(--amber); }
.ipd .chip { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:999px; border:1px solid var(--line-strong); color:var(--muted); }
.ipd .btn { padding:10px 16px; border-radius:10px; font-weight:600; font-size:14px; background:var(--surface2); border:1px solid var(--line-strong); transition:background .16s,transform .1s; }
.ipd .btn:hover { background:#2b3040; }
.ipd .btn:active { transform:scale(.97); }
.ipd .btn.primary { background:var(--amber); color:#201a0a; border-color:transparent; }
.ipd .btn.primary:hover { background:#f2c264; }
.ipd .bar { transition:width .8s cubic-bezier(.22,1,.36,1); }
.ipd .cell { transition:transform .12s; }
.ipd .cell:hover { transform:scale(1.14); z-index:3; position:relative; }
.ipd .slidein { animation:slidein .45s cubic-bezier(.22,1,.36,1); }
@keyframes slidein { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:none;} }
.ipd .pop { animation:pop .8s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes pop { 0%{opacity:0;transform:translateY(6px) scale(.8);} 25%{opacity:1;transform:translateY(-4px) scale(1.1);} 100%{opacity:0;transform:translateY(-26px) scale(1);} }
.ipd .choice { transition:transform .12s,background .16s,border-color .16s; }
.ipd .choice:hover { transform:translateY(-3px); }
.ipd .choice:active { transform:scale(.97); }
.ipd .choice:disabled { opacity:.4; transform:none; }
.ipd input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:999px; background:var(--line-strong); }
.ipd input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:var(--amber); cursor:pointer; border:3px solid var(--bg); box-shadow:0 0 0 1px var(--amber); }
.ipd input[type=range]::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:var(--amber); cursor:pointer; border:3px solid var(--bg); }
.ipd select { background:var(--surface2); color:var(--text); border:1px solid var(--line-strong); border-radius:10px; padding:9px 12px; font-size:14px; font-family:inherit; }
@media (prefers-reduced-motion:reduce){ .ipd *{animation:none!important;transition:none!important;} }
`;

/* ============================================================
   UTILITY UI
   ============================================================ */
function MoveDot({ move, size = 22, label = false }) {
  const coop = move === C;
  return (
    <span title={coop ? "Coopera" : "Tradisci"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: 6, fontSize: size * 0.45, fontWeight: 700, ...mono, color: coop ? "var(--coop)" : "var(--defect)", background: coop ? "var(--coop-dim)" : "var(--defect-dim)", border: `1px solid ${coop ? "var(--coop)" : "var(--defect)"}` }}>
      {label ? (coop ? "C" : "T") : ""}
    </span>
  );
}
function StratName({ s, big }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ ...serif, fontWeight: 600, fontSize: big ? 22 : 20 }}>{s.en}</span>
      <span style={{ ...mono, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>{s.it}</span>
    </span>
  );
}
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 24, maxWidth: 720 }}>
      <div className="eyebrow" style={{ color: "var(--amber)" }}>{eyebrow}</div>
      <h2 style={{ ...serif, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 600, margin: "8px 0 10px", lineHeight: 1.08 }}>{title}</h2>
      <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>{sub}</p>
    </div>
  );
}

function PayoffMatrix({ M, compact = false }) {
  const cell = (mine, theirs, big) => {
    const mePts = payoff(mine, theirs, M), themPts = payoff(theirs, mine, M);
    return (
      <div style={{ padding: compact ? "10px 8px" : "16px 12px", textAlign: "center", borderRadius: 10, background: "var(--surface2)", border: `1px solid ${big ? "var(--line-strong)" : "var(--line)"}` }}>
        <div style={{ ...mono, fontSize: compact ? 18 : 24, fontWeight: 700 }}>
          <span style={{ color: "var(--coop)" }}>{mePts}</span>
          <span style={{ color: "var(--muted)", margin: "0 4px" }}>/</span>
          <span style={{ color: "var(--defect)" }}>{themPts}</span>
        </div>
        <div style={{ ...mono, fontSize: 9, color: "var(--muted)", marginTop: 4, letterSpacing: ".08em" }}>TU / L'ALTRO</div>
      </div>
    );
  };
  const H = ({ children, coop }) => (<div style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: coop ? "var(--coop)" : "var(--defect)", textAlign: "center", padding: "6px 0" }}>{children}</div>);
  const V = ({ children, coop }) => (<div style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: coop ? "var(--coop)" : "var(--defect)", writingMode: "vertical-rl", transform: "rotate(180deg)", justifySelf: "center" }}>{children}</div>);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 8, alignItems: "center" }}>
      <div /><H coop>L'altro coopera</H><H>L'altro tradisce</H>
      <V coop>Tu cooperi</V>{cell(C, C, true)}{cell(C, D)}
      <V>Tu tradisci</V>{cell(D, C)}{cell(D, D, true)}
    </div>
  );
}

function tagColor(tag) {
  if (["Gentile", "Indulgente"].includes(tag)) return "var(--coop)";
  if (["Ostile", "Rancorosa"].includes(tag)) return "var(--defect)";
  return "var(--muted)";
}

/* ============================================================
   INTRO
   ============================================================ */
function Intro({ onDone }) {
  const [i, setI] = useState(0);
  const slides = [
    { eyebrow: "Il dilemma · 1 / 5", title: "Due prigionieri, una scelta", body: (<>
      <p>Due complici vengono arrestati e interrogati in celle separate, senza potersi parlare. Ciascuno può <strong style={{ color: "var(--coop)" }}>tacere</strong> (cooperare) o <strong style={{ color: "var(--defect)" }}>accusare</strong> il compagno (tradirlo).</p>
      <ul style={{ paddingLeft: 18, margin: "14px 0" }}>
        <li>Se <strong>tacciono entrambi</strong>, se la cavano con poco.</li>
        <li>Se <strong>uno accusa e l'altro tace</strong>, chi accusa esce libero e l'altro si prende la colpa.</li>
        <li>Se <strong>si accusano a vicenda</strong>, condanna pesante per entrambi.</li>
      </ul>
      <p>Il paradosso: per ciascuno, da solo, <em>conviene sempre tradire</em>. Ma se lo fanno entrambi finiscono peggio che se avessero cooperato.</p></>) },
    { eyebrow: "Il dilemma · 2 / 5", title: "La matrice dei guadagni", body: (<>
      <p style={{ marginBottom: 18 }}>Traduciamo la storia in punti: più punti = meno anni di carcere. Ecco cosa guadagni in base alla tua mossa e a quella dell'altro:</p>
      <PayoffMatrix M={{ T: 5, R: 3, P: 1, S: 0 }} />
      <p style={{ marginTop: 18 }}>Qualunque cosa faccia l'altro, <strong style={{ color: "var(--defect)" }}>tradire</strong> ti dà un punto in più. È la scelta "razionale". Ma se ragionate così entrambi, finite su <strong>1 e 1</strong> invece che su <strong>3 e 3</strong>: l'equilibrio di Nash è il risultato peggiore per tutti.</p></>) },
    { eyebrow: "Il dilemma · 3 / 5", title: "L'ombra del futuro", body: (<>
      <p>In una partita <strong>singola</strong>, tradire è imbattibile: non c'è un domani in cui pagare le conseguenze.</p>
      <p style={{ marginTop: 14 }}>Ma se i due si incontrano <strong>ancora e ancora</strong>, il calcolo cambia. Tradire oggi può costare la cooperazione di domani. È l'<em>ombra del futuro</em>: l'aspettativa di rivedersi rende conveniente la fiducia.</p>
      <p style={{ marginTop: 14 }}>È da qui che nasce la cooperazione — non dalla bontà, ma dalla ripetizione. Ed è il gioco che stai per giocare: il dilemma <strong>iterato</strong>.</p></>) },
    { eyebrow: "Il dilemma · 4 / 5", title: "La ricetta di Axelrod", body: (<>
      <p style={{ marginBottom: 16 }}>Nel 1980 Robert Axelrod fece giocare tra loro decine di strategie. La vincitrice, <strong>Tit for Tat</strong>, incarnava quattro qualità:</p>
      {[["Gentile", "non tradire mai per prima", "coop"], ["Reattiva", "rispondi subito al tradimento", "defect"], ["Indulgente", "torna a cooperare appena l'altro lo fa", "coop"], ["Chiara", "sii prevedibile, così l'altro può fidarsi", "amber"]].map(([k, v, c]) => (
        <div key={k} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span style={{ ...mono, fontSize: 13, fontWeight: 700, minWidth: 104, color: `var(--${c})` }}>{k}</span>
          <span style={{ color: "var(--muted)" }}>{v}</span>
        </div>))}</>) },
    { eyebrow: "Il dilemma · 5 / 5", title: "La mappa delle strategie", body: (<>
      <p style={{ marginBottom: 16 }}>Ogni strategia si colloca lungo due assi. Tenerli a mente aiuta a capire chi batte chi:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["Gentili", "non tradiscono mai per prime", "coop"], ["Ostili", "aprono col tradimento", "defect"], ["Indulgenti", "perdonano e ricostruiscono", "coop"], ["Rancorose", "non dimenticano un torto", "defect"]].map(([k, v, c]) => (
          <div key={k} className="card" style={{ padding: 14 }}>
            <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: `var(--${c})`, textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{v}</div>
          </div>))}
      </div>
      <p style={{ marginTop: 16 }}>Ora tocca a te: scopri le dodici strategie, poi mettile alla prova.</p></>) },
  ];
  const s = slides[i], last = i === slides.length - 1;
  return (
    <div className="card slidein" style={{ padding: "clamp(24px,4vw,44px)", maxWidth: 760, margin: "0 auto" }}>
      <div className="eyebrow" style={{ color: "var(--amber)" }}>{s.eyebrow}</div>
      <h2 style={{ ...serif, fontSize: "clamp(28px,4vw,40px)", fontWeight: 600, margin: "10px 0 20px", lineHeight: 1.1 }}>{s.title}</h2>
      <div style={{ fontSize: 16 }}>{s.body}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
        <button className="btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} style={{ opacity: i === 0 ? 0.35 : 1 }}>← Indietro</button>
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, k) => (<button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} style={{ width: 8, height: 8, borderRadius: 999, padding: 0, background: k === i ? "var(--amber)" : "var(--line-strong)" }} />))}
        </div>
        {last ? <button className="btn primary" onClick={onDone}>Scopri le strategie →</button> : <button className="btn primary" onClick={() => setI(i + 1)}>Avanti →</button>}
      </div>
    </div>
  );
}

/* ============================================================
   ARENA — la modalità giocabile
   ============================================================ */
const LADDER = ["allc", "random", "alld", "greedy", "tft", "sustft", "tf2t", "gtft", "pavlov", "grim", "detective"];
const ARENA_ROUNDS = 10;
const M0 = { T: 5, R: 3, P: 1, S: 0 };

function scorePair(myMoves, oppMoves) {
  let me = 0, opp = 0;
  for (let i = 0; i < myMoves.length; i++) { me += payoff(myMoves[i], oppMoves[i], M0); opp += payoff(oppMoves[i], myMoves[i], M0); }
  return { me, opp };
}

function Arena() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("briefing"); // briefing | play | result | done
  const [myMoves, setMy] = useState([]);
  const [oppMoves, setOpp] = useState([]);
  const [pop, setPop] = useState(null);
  const [record, setRecord] = useState([]);
  const rng = useRef(mulberry32(999));

  const opp = byId[LADDER[idx]];
  const { me: myScore, opp: oppScore } = scorePair(myMoves, oppMoves);

  function start() {
    rng.current = mulberry32(90210 + idx * 1337);
    setMy([]); setOpp([]); setPop(null); setPhase("play");
  }
  function play(move) {
    if (phase !== "play") return;
    const oppMove = opp.play(oppMoves, myMoves, rng.current, M0);
    const nm = [...myMoves, move], no = [...oppMoves, oppMove];
    setMy(nm); setOpp(no);
    setPop({ me: payoff(move, oppMove, M0), opp: payoff(oppMove, move, M0), k: nm.length });
    if (nm.length >= ARENA_ROUNDS) {
      const s = scorePair(nm, no);
      setRecord((r) => { const c = [...r]; c[idx] = s; return c; });
      setTimeout(() => setPhase("result"), 650);
    }
  }
  function next() {
    if (idx >= LADDER.length - 1) { setPhase("done"); return; }
    setIdx(idx + 1); setPhase("briefing");
  }
  function restart() { setIdx(0); setRecord([]); setMy([]); setOpp([]); setPhase("briefing"); }

  const Rail = () => (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
      {LADDER.map((id, k) => {
        const r = record[k];
        let bg = "var(--surface2)", col = "var(--muted)", bd = "var(--line-strong)";
        if (r) { const win = r.me > r.opp; bg = win ? "var(--coop-dim)" : r.me === r.opp ? "var(--amber-dim)" : "var(--defect-dim)"; col = win ? "var(--coop)" : r.me === r.opp ? "var(--amber)" : "var(--defect)"; bd = col; }
        if (k === idx && phase !== "done") bd = "var(--amber)";
        return (<div key={id} title={byId[id].en} style={{ ...mono, fontSize: 10, padding: "5px 8px", borderRadius: 8, background: bg, color: col, border: `1px solid ${bd}`, fontWeight: k === idx ? 700 : 400 }}>{byId[id].abbr}</div>);
      })}
    </div>
  );

  if (phase === "done") {
    const wins = record.filter((r) => r && r.me > r.opp).length;
    const totMe = record.reduce((a, r) => a + (r ? r.me : 0), 0);
    const totOpp = record.reduce((a, r) => a + (r ? r.opp : 0), 0);
    const n = LADDER.length;
    const title = wins >= n - 1 ? "Leggenda della cooperazione" : wins >= Math.ceil(n * 0.7) ? "Stratega provetto" : wins >= Math.ceil(n * 0.5) ? "Diplomatico navigato" : wins >= Math.ceil(n * 0.3) ? "Apprendista" : "Ancora da rodare";
    return (
      <div className="slidein">
        <SectionHead eyebrow="Solitario · risultato finale" title="Fine della scalata" sub={`Hai affrontato tutti e ${LADDER.length} gli avversari. Ecco come è andata.`} />
        <Rail />
        <div className="card" style={{ padding: 28, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div className="eyebrow" style={{ color: "var(--amber)" }}>Il tuo titolo</div>
          <div style={{ ...serif, fontSize: 34, fontWeight: 700, margin: "8px 0 20px" }}>{title}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 22, flexWrap: "wrap" }}>
            <div><div style={{ ...serif, fontSize: 40, fontWeight: 700, color: "var(--coop)" }}>{wins}</div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>SCONTRI VINTI / {LADDER.length}</div></div>
            <div><div style={{ ...serif, fontSize: 40, fontWeight: 700, color: "var(--amber)" }}>{totMe}</div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>PUNTI TUOI</div></div>
            <div><div style={{ ...serif, fontSize: 40, fontWeight: 700, color: "var(--muted)" }}>{totOpp}</div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>PUNTI AVVERSARI</div></div>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
            La lezione di Axelrod: chi accumula di più nel lungo periodo non è chi vince ogni singolo scontro, ma chi sa costruire cooperazione con i partner giusti e difendersi dai predatori.
          </p>
          <button className="btn primary" onClick={restart}>↺ Rigioca la scalata</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead eyebrow={`Solitario · avversario ${idx + 1} / ${LADDER.length}`} title="Sei tu al tavolo" sub={`Scegli a ogni round se cooperare o tradire. Dieci round a testa, ${LADDER.length} avversari. Massimizza il tuo punteggio.`} />
      <Rail />

      {phase === "briefing" && (
        <div className="card slidein" style={{ padding: 28, maxWidth: 620, margin: "0 auto" }}>
          <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 8 }}>Dossier avversario</div>
          <StratName s={opp} big />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
            {opp.tags.map((t) => (<span key={t} className="chip" style={{ color: tagColor(t), borderColor: tagColor(t) === "var(--muted)" ? "var(--line-strong)" : tagColor(t) }}>{t}</span>))}
          </div>
          <p style={{ fontSize: 15, marginBottom: 6 }}>{opp.tagline}</p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{opp.intuizione}</p>
          <button className="btn primary" style={{ marginTop: 18 }} onClick={start}>⚔ Inizia lo scontro</button>
        </div>
      )}

      {(phase === "play" || phase === "result") && (
        <div className="card slidein" style={{ padding: "clamp(18px,3vw,28px)" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 16, marginBottom: 20 }}>
            <ScorePane label="TU" score={myScore} color="var(--coop)" pop={pop && pop.me} pk={pop && pop.k} side="me" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11, color: "var(--muted)" }}>
              <div>ROUND</div>
              <div style={{ ...serif, fontSize: 24, color: "var(--amber)", fontWeight: 700 }}>{Math.min(myMoves.length, ARENA_ROUNDS)}<span style={{ color: "var(--muted)", fontSize: 15 }}>/{ARENA_ROUNDS}</span></div>
            </div>
            <ScorePane label={opp.en} score={oppScore} color="var(--defect)" pop={pop && pop.opp} pk={pop && pop.k} side="opp" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Ribbon moves={myMoves} align="left" />
            <Ribbon moves={oppMoves} align="right" />
          </div>

          <div style={{ textAlign: "center", minHeight: 24, marginBottom: 18, fontSize: 14, color: "var(--muted)" }}>
            {myMoves.length > 0 && <LastOutcome myMove={myMoves[myMoves.length - 1]} oppMove={oppMoves[oppMoves.length - 1]} oppName={opp.en} />}
          </div>

          {phase === "play" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 560, margin: "0 auto" }}>
              <ChoiceButton move={C} onClick={() => play(C)} hints={["3 se coopera", "0 se tradisce"]} />
              <ChoiceButton move={D} onClick={() => play(D)} hints={["5 se coopera", "1 se tradisce"]} />
            </div>
          ) : (
            <ResultBlock opp={opp} myScore={myScore} oppScore={oppScore} myMoves={myMoves} oppMoves={oppMoves} onNext={next} isLast={idx >= LADDER.length - 1} />
          )}
        </div>
      )}
    </div>
  );
}

function ScorePane({ label, score, color, pop, pk, side }) {
  return (
    <div className="card" style={{ flex: 1, padding: "14px 16px", position: "relative", textAlign: side === "opp" ? "right" : "left", background: "var(--surface2)" }}>
      <div style={{ ...mono, fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ ...serif, fontSize: 38, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
      {pop != null && (<span key={pk} className="pop" style={{ position: "absolute", top: 8, [side === "opp" ? "left" : "right"]: 14, ...mono, fontWeight: 700, fontSize: 20, color: "var(--amber)" }}>+{pop}</span>)}
    </div>
  );
}
function Ribbon({ moves, align }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: align === "right" ? "flex-end" : "flex-start", minHeight: 24 }}>
      {Array.from({ length: ARENA_ROUNDS }).map((_, k) => {
        const m = moves[k];
        return (<span key={k} style={{ width: 20, height: 20, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 10, fontWeight: 700, background: m ? (m === C ? "var(--coop-dim)" : "var(--defect-dim)") : "var(--bg)", color: m === C ? "var(--coop)" : "var(--defect)", border: `1px solid ${m ? (m === C ? "var(--coop)" : "var(--defect)") : "var(--line)"}` }}>{m ? (m === C ? "C" : "T") : ""}</span>);
      })}
    </div>
  );
}
function ChoiceButton({ move, onClick, hints }) {
  const coop = move === C;
  return (
    <button className="choice" onClick={onClick} style={{ padding: "18px 16px", borderRadius: 14, background: coop ? "var(--coop-dim)" : "var(--defect-dim)", border: `1.5px solid ${coop ? "var(--coop)" : "var(--defect)"}`, textAlign: "center" }}>
      <div style={{ ...serif, fontSize: 26, fontWeight: 700, color: coop ? "var(--coop)" : "var(--defect)" }}>{coop ? "Coopera" : "Tradisci"}</div>
      <div style={{ ...mono, fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{hints[0]} · {hints[1]}</div>
    </button>
  );
}
function LastOutcome({ myMove, oppMove, oppName }) {
  if (myMove === C && oppMove === C) return <span>Cooperazione reciproca: <strong style={{ color: "var(--coop)" }}>+3 a testa</strong>. State costruendo fiducia.</span>;
  if (myMove === D && oppMove === D) return <span>Tradimento reciproco: <strong style={{ color: "var(--defect)" }}>+1 a testa</strong>. Nessuno guadagna davvero.</span>;
  if (myMove === D && oppMove === C) return <span>Hai sfruttato la fiducia di {oppName}: <strong style={{ color: "var(--amber)" }}>+5 per te</strong>, +0 per lui.</span>;
  return <span>{oppName} ti ha sfruttato: <strong style={{ color: "var(--defect)" }}>+0 per te</strong>, +5 per lui.</span>;
}
function ResultBlock({ opp, myScore, oppScore, myMoves, oppMoves, onNext, isLast }) {
  const win = myScore > oppScore, draw = myScore === oppScore;
  const myC = myMoves.filter((m) => m === C).length;
  const cc = myMoves.filter((m, i) => m === C && oppMoves[i] === C).length;
  let comment;
  if (cc >= 7) comment = "Avete costruito una solida cooperazione reciproca.";
  else if (myC <= 3 && myScore > oppScore) comment = "Hai giocato aggressivo e ti ha pagato.";
  else if (myScore < oppScore) comment = "Ti sei fatto sfruttare più di quanto tu abbia sfruttato.";
  else comment = "Uno scontro equilibrato, deciso ai dettagli.";
  const col = win ? "var(--coop)" : draw ? "var(--amber)" : "var(--defect)";
  return (
    <div className="slidein" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", border: `1px solid ${col}`, borderRadius: 14, padding: 22, background: win ? "var(--coop-dim)" : draw ? "var(--amber-dim)" : "var(--defect-dim)" }}>
      <div style={{ ...serif, fontSize: 26, fontWeight: 700, color: col }}>
        {win ? `Hai battuto ${opp.en}!` : draw ? `Pareggio con ${opp.en}` : `${opp.en} ha avuto la meglio`}
      </div>
      <div style={{ ...mono, fontSize: 15, margin: "8px 0 4px" }}>{myScore} <span style={{ color: "var(--muted)" }}>vs</span> {oppScore}</div>
      <p style={{ color: "var(--muted)", fontSize: 14, margin: "6px 0 16px" }}>{comment}</p>
      <div style={{ ...mono, fontSize: 12, color: "var(--muted)", background: "var(--bg)", borderRadius: 8, padding: "8px 10px", marginBottom: 16 }}>
        La sua regola — {opp.pseudo.join(" · ")}
      </div>
      <button className="btn primary" onClick={onNext}>{isLast ? "Vedi il risultato finale →" : "Prossimo avversario →"}</button>
    </div>
  );
}

/* ============================================================
   STRATEGIE
   ============================================================ */
function StrategyCard({ s, open, onToggle }) {
  return (
    <div className={`card stratcard ${open ? "open" : ""}`} style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={onToggle} style={{ padding: 18, display: "block", width: "100%" }} aria-expanded={open}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <StratName s={s} />
          <span style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{s.abbr}</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "6px 0 12px" }}>{s.tagline}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {s.tags.map((t) => (<span key={t} className="chip" style={{ color: tagColor(t), borderColor: tagColor(t) === "var(--muted)" ? "var(--line-strong)" : tagColor(t) }}>{t}</span>))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontSize: 10, color: "var(--muted)", minWidth: 74 }}>INDOLE COOP.</span>
          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--line-strong)", overflow: "hidden" }}>
            <div className="bar" style={{ width: `${s.tendency}%`, height: "100%", background: "linear-gradient(90deg,var(--defect),var(--amber),var(--coop))" }} />
          </div>
        </div>
      </button>
      {open && (
        <div className="slidein" style={{ padding: "0 18px 18px", borderTop: "1px solid var(--line)" }}>
          <div style={{ ...mono, background: "var(--bg)", borderRadius: 10, padding: 14, margin: "14px 0", fontSize: 13, color: "var(--amber)" }}>
            {s.pseudo.map((line, k) => (<div key={k} style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--muted)" }}>{String(k + 1).padStart(2, "0")}</span><span>{line}</span></div>))}
          </div>
          <p style={{ fontSize: 14, marginBottom: 14 }}>{s.intuizione}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ ...mono, fontSize: 10, letterSpacing: ".1em", color: "var(--coop)", marginBottom: 6 }}>PUNTI DI FORZA</div>
              {s.forti.map((f) => (<div key={f} style={{ fontSize: 13, color: "var(--muted)", paddingLeft: 12, position: "relative", marginBottom: 5 }}><span style={{ position: "absolute", left: 0, color: "var(--coop)" }}>+</span>{f}</div>))}
            </div>
            <div>
              <div style={{ ...mono, fontSize: 10, letterSpacing: ".1em", color: "var(--defect)", marginBottom: 6 }}>PUNTI DEBOLI</div>
              {s.deboli.map((f) => (<div key={f} style={{ fontSize: 13, color: "var(--muted)", paddingLeft: 12, position: "relative", marginBottom: 5 }}><span style={{ position: "absolute", left: 0, color: "var(--defect)" }}>−</span>{f}</div>))}
            </div>
          </div>
          <div style={{ background: "var(--amber-dim)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
            <span style={{ ...mono, fontSize: 10, letterSpacing: ".1em", color: "var(--amber)" }}>QUANDO CONVIENE · </span>{s.controChi}
          </div>
        </div>
      )}
    </div>
  );
}
function StrategyGallery() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <SectionHead eyebrow="Le strategie" title="Dodici modi di affrontare l'altro" sub="Ognuna insegna un principio diverso. Tocca una card per vederne la regola, l'intuizione e contro chi conviene." />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
        {STRATEGIES.map((s) => (<StrategyCard key={s.id} s={s} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />))}
      </div>
    </div>
  );
}

/* ============================================================
   TORNEO
   ============================================================ */
function SliderRow({ label, sub, value, min, max, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13 }}>{label} <span style={{ color: "var(--muted)", fontSize: 12 }}>{sub}</span></span>
        <span style={{ ...mono, fontWeight: 700, color: "var(--amber)" }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
}
function Badge({ ok, text, note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", background: ok ? "var(--coop-dim)" : "var(--defect-dim)", color: ok ? "var(--coop)" : "var(--defect)", border: `1px solid ${ok ? "var(--coop)" : "var(--defect)"}`, fontSize: 11, fontWeight: 700 }}>{ok ? "✓" : "!"}</span>
      <span style={{ ...mono, fontSize: 11 }}>{text}</span>
      <span style={{ color: "var(--muted)" }}>· {note}</span>
    </div>
  );
}
function Heatmap({ res, setHover, hover }) {
  const n = STRATEGIES.length;
  const { grid, min, max } = res;
  const range = max - min || 1;
  return (
    <div style={{ overflowX: "auto", paddingTop: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: `52px repeat(${n}, 1fr)`, gap: 3, minWidth: 460 }}>
        <div />
        {STRATEGIES.map((s, j) => (<div key={j} style={{ ...mono, fontSize: 9, color: hover?.j === j ? "var(--amber)" : "var(--muted)", textAlign: "center", transform: "rotate(-40deg)", height: 34, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>{s.abbr}</div>))}
        {STRATEGIES.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ ...mono, fontSize: 9, color: hover?.i === i ? "var(--amber)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>{s.abbr}</div>
            {STRATEGIES.map((_, j) => {
              const v = grid[i][j], t = (v - min) / range, isDiag = i === j;
              return (<div key={j} className="cell" onMouseEnter={() => setHover({ i, j })} onMouseLeave={() => setHover(null)} style={{ aspectRatio: "1", borderRadius: 4, background: `rgba(235,181,82,${0.08 + 0.92 * t})`, border: isDiag ? "1px solid var(--line-strong)" : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 9, fontWeight: 700, color: t > 0.55 ? "#201a0a" : "var(--muted)" }}>{v}</div>);
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
function Tournament() {
  const [M, setM] = useState({ T: 5, R: 3, P: 1, S: 0 });
  const [rounds, setRounds] = useState(150);
  const [seed, setSeed] = useState(7);
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(null);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const res = useMemo(() => runTournament(rounds, M, seed), [rounds, M, seed]);
  const maxTotal = res.ranking[0].total;
  const validDilemma = M.T > M.R && M.R > M.P && M.P > M.S;
  const validCoop = 2 * M.R > M.T + M.S;
  return (
    <div>
      <SectionHead eyebrow="Il torneo" title="Tutte contro tutte" sub="Ogni strategia gioca contro ogni altra (e contro se stessa). Cambia i payoff e osserva la classifica riscriversi dal vivo." />
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(280px,340px) 1fr", alignItems: "start" }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>La matrice del mondo</div>
          <PayoffMatrix M={M} compact />
          <div style={{ marginTop: 18 }}>
            <SliderRow label="Tentazione (T)" sub="tradisci chi coopera" value={M.T} min={0} max={10} onChange={(v) => setM({ ...M, T: v })} />
            <SliderRow label="Ricompensa (R)" sub="cooperate entrambi" value={M.R} min={0} max={10} onChange={(v) => setM({ ...M, R: v })} />
            <SliderRow label="Punizione (P)" sub="tradite entrambi" value={M.P} min={0} max={10} onChange={(v) => setM({ ...M, P: v })} />
            <SliderRow label="Fesso (S)" sub="cooperi con chi tradisce" value={M.S} min={0} max={10} onChange={(v) => setM({ ...M, S: v })} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0 16px" }}>
            <Badge ok={validDilemma} text="T > R > P > S" note="è un vero dilemma" />
            <Badge ok={validCoop} text="2R > T + S" note="cooperare batte lo sfruttamento alterno" />
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <SliderRow label="Round per match" sub="" value={rounds} min={20} max={300} onChange={setRounds} />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setSeed((x) => x + 1)}>↻ Rimescola casuali</button>
              <button className="btn" onClick={() => setM({ T: 5, R: 3, P: 1, S: 0 })}>Ripristina</button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Classifica</div>
            {res.ranking.map((r, rank) => (
              <div key={r.i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                <span style={{ ...mono, fontSize: 12, color: rank === 0 ? "var(--amber)" : "var(--muted)", minWidth: 20 }}>{rank + 1}</span>
                <span style={{ fontSize: 14, minWidth: 180, fontWeight: rank === 0 ? 600 : 400 }}>{r.strat.en} <span style={{ ...mono, fontSize: 10, color: "var(--muted)", fontStyle: "italic" }}>{r.strat.it}</span></span>
                <div style={{ flex: 1, height: 22, borderRadius: 6, background: "var(--bg)", overflow: "hidden" }}>
                  <div className="bar" style={{ width: mounted ? `${(r.total / maxTotal) * 100}%` : "0%", height: "100%", background: rank === 0 ? "var(--amber)" : "linear-gradient(90deg,var(--surface2),var(--coop))", opacity: rank === 0 ? 1 : 0.55 + 0.45 * (r.total / maxTotal) }} />
                </div>
                <span style={{ ...mono, fontSize: 13, fontWeight: 700, minWidth: 52, textAlign: "right" }}>{r.total}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div className="eyebrow">Griglia degli scontri</div>
              <div style={{ fontSize: 12, color: "var(--muted)", ...mono }}>riga = punti che fa · colonna = contro chi</div>
            </div>
            <Heatmap res={res} hover={hover} setHover={setHover} />
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 12, minHeight: 20 }}>
              {hover ? (<span><strong style={{ color: "var(--text)" }}>{STRATEGIES[hover.i].en}</strong> contro <strong style={{ color: "var(--text)" }}>{STRATEGIES[hover.j].en}</strong>{hover.i === hover.j ? " (contro un suo clone)" : ""}: <strong style={{ color: "var(--amber)", ...mono }}>{res.grid[hover.i][hover.j]}</strong> punti.</span>) : "Passa sopra una cella per il dettaglio di un singolo scontro."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DUELLO
   ============================================================ */
function Duel() {
  const [a, setA] = useState("tft");
  const [b, setB] = useState("alld");
  const rounds = 30;
  const M = { T: 5, R: 3, P: 1, S: 0 };
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  const match = useMemo(() => {
    const { movesA, movesB } = simulateMatch(a, b, rounds, seedFor(0, 1, 42), M);
    const cumA = [], cumB = []; let sa = 0, sb = 0;
    for (let r = 0; r < rounds; r++) { sa += payoff(movesA[r], movesB[r], M); sb += payoff(movesB[r], movesA[r], M); cumA.push(sa); cumB.push(sb); }
    return { movesA, movesB, cumA, cumB };
  }, [a, b]);
  useEffect(() => { setStep(0); setPlaying(false); }, [a, b]);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => { setStep((s) => { if (s >= rounds - 1) { setPlaying(false); return s; } return s + 1; }); }, 420);
    return () => clearInterval(timer.current);
  }, [playing]);
  const cur = step, ma = match.movesA[cur], mb = match.movesB[cur];
  const pa = payoff(ma, mb, M), pb = payoff(mb, ma, M);
  const Agent = ({ id, isA, moves, cumScore, moveNow, ptsNow, color }) => (
    <div className="card" style={{ padding: 16, flex: 1, minWidth: 220 }}>
      <select value={id} onChange={(e) => (isA ? setA(e.target.value) : setB(e.target.value))} style={{ width: "100%", marginBottom: 12 }}>
        {STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.en} · {s.it}</option>)}
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <MoveDot move={moveNow} size={40} label />
        <div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>PUNTI TOTALI</div><div style={{ ...serif, fontSize: 30, fontWeight: 600, color }}>{cumScore}</div></div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>QUESTO ROUND</div><div style={{ ...mono, fontSize: 18, fontWeight: 700, color: "var(--amber)" }}>+{ptsNow}</div></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {moves.map((m, k) => (<span key={k} style={{ width: 14, height: 14, borderRadius: 3, background: m === C ? "var(--coop)" : "var(--defect)", opacity: k <= cur ? 1 : 0.16, boxShadow: k === cur ? "0 0 0 2px var(--amber)" : "none" }} />))}
      </div>
    </div>
  );
  return (
    <div>
      <SectionHead eyebrow="Il duello" title="Uno contro uno, round per round" sub="Scegli due strategie e guarda come si comportano mossa dopo mossa. Il nastro colorato è la loro storia; l'ambra segna il round corrente." />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <Agent id={a} isA moves={match.movesA} cumScore={match.cumA[cur]} moveNow={ma} ptsNow={pa} color="var(--coop)" />
        <div style={{ display: "flex", alignItems: "center", ...serif, fontSize: 24, color: "var(--muted)" }}>vs</div>
        <Agent id={b} isA={false} moves={match.movesB} cumScore={match.cumB[cur]} moveNow={mb} ptsNow={pb} color="var(--defect)" />
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => { if (cur >= rounds - 1) setStep(0); setPlaying((p) => !p); }}>{playing ? "❚❚ Pausa" : "▶ Riproduci"}</button>
          <button className="btn" onClick={() => { setPlaying(false); setStep(Math.max(0, cur - 1)); }}>◀ Round</button>
          <button className="btn" onClick={() => { setPlaying(false); setStep(Math.min(rounds - 1, cur + 1)); }}>Round ▶</button>
          <button className="btn" onClick={() => { setPlaying(false); setStep(0); }}>↺ Inizio</button>
          <span style={{ ...mono, marginLeft: "auto", fontSize: 13, color: "var(--muted)" }}>round <span style={{ color: "var(--amber)", fontWeight: 700 }}>{cur + 1}</span> / {rounds}</span>
        </div>
        <input type="range" min={0} max={rounds - 1} value={cur} onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }} style={{ width: "100%" }} />
        <div style={{ marginTop: 14, fontSize: 14, color: "var(--muted)" }}>
          {ma === C && mb === C && <span>Cooperano entrambi: <strong style={{ color: "var(--coop)" }}>ricompensa reciproca</strong> (+{M.R} a testa).</span>}
          {ma === D && mb === D && <span>Si tradiscono a vicenda: <strong style={{ color: "var(--defect)" }}>punizione</strong> (+{M.P} a testa).</span>}
          {ma === D && mb === C && <span><strong style={{ color: "var(--defect)" }}>{byId[a].en}</strong> sfrutta {byId[b].en}: +{M.T} contro +{M.S}.</span>}
          {ma === C && mb === D && <span><strong style={{ color: "var(--defect)" }}>{byId[b].en}</strong> sfrutta {byId[a].en}: +{M.T} contro +{M.S}.</span>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DUE GIOCATORI — stesso schermo + online (storage condivisa)
   ============================================================ */
function scorePairLen(mine, theirs, len) {
  let me = 0, opp = 0;
  for (let i = 0; i < len; i++) { me += payoff(mine[i], theirs[i], M0); opp += payoff(theirs[i], mine[i], M0); }
  return { me, opp };
}
function OutcomeLine({ mine, theirs, meLabel, themLabel }) {
  if (mine === C && theirs === C) return <span>Cooperazione reciproca: <strong style={{ color: "var(--coop)" }}>+3 a testa</strong>.</span>;
  if (mine === D && theirs === D) return <span>Tradimento reciproco: <strong style={{ color: "var(--defect)" }}>+1 a testa</strong>.</span>;
  if (mine === D && theirs === C) return <span>{meLabel} ha sfruttato {themLabel}: <strong style={{ color: "var(--amber)" }}>+5</strong> contro +0.</span>;
  return <span>{themLabel} ha sfruttato {meLabel}: +0 contro <strong style={{ color: "var(--amber)" }}>+5</strong>.</span>;
}
function Pill({ state }) {
  const map = { coop: ["var(--coop-dim)", "var(--coop)", "C"], defect: ["var(--defect-dim)", "var(--defect)", "T"], hidden: ["var(--surface2)", "var(--muted)", "•"], empty: ["var(--bg)", "var(--muted)", ""] };
  const [bg, col, ch] = map[state];
  return <span style={{ width: 22, height: 22, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11, fontWeight: 700, background: bg, color: col, border: `1px solid ${state === "coop" ? "var(--coop)" : state === "defect" ? "var(--defect)" : "var(--line)"}` }}>{ch}</span>;
}
function MoveTrack({ moves, total, reveal, mine, align }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      {Array.from({ length: total }).map((_, i) => {
        let state = "empty";
        if (i < moves.length) { const shown = mine || i < reveal; state = shown ? (moves[i] === C ? "coop" : "defect") : "hidden"; }
        return <Pill key={i} state={state} />;
      })}
    </div>
  );
}
function RoundPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[5, 10, 20].map((n) => (
        <button key={n} onClick={() => onChange(n)} className="btn" style={{ flex: 1, background: value === n ? "var(--amber)" : "var(--surface2)", color: value === n ? "#201a0a" : "var(--text)", borderColor: value === n ? "transparent" : "var(--line-strong)" }}>{n} round</button>
      ))}
    </div>
  );
}
/* --- STESSO SCHERMO --- */
function StrategyBox({ s }) {
  return (
    <div className="card" style={{ padding: 16, border: "1px solid var(--amber)", background: "var(--amber-dim)", marginBottom: 18, textAlign: "left" }}>
      <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 6 }}>La tua strategia segreta</div>
      <StratName s={s} big />
      <p style={{ fontSize: 13.5, color: "var(--text)", margin: "8px 0 10px" }}>{s.tagline}</p>
      <div style={{ ...mono, background: "var(--bg)", borderRadius: 8, padding: 10, fontSize: 12, color: "var(--amber)", marginBottom: 8 }}>
        {s.pseudo.map((line, k) => (<div key={k} style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--muted)" }}>{String(k + 1).padStart(2, "0")}</span><span>{line}</span></div>))}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>{s.intuizione}</p>
    </div>
  );
}
function StrategyPicker({ who, onPick }) {
  return (
    <div className="slidein" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span className="eyebrow" style={{ color: "var(--amber)" }}>Scelta segreta</span>
        <div style={{ ...serif, fontSize: 24, fontWeight: 600, marginTop: 6 }}>{who}, scegli la strategia che interpreterai</div>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 6 }}>L'avversario non vedrà la tua scelta. Prova a restarle fedele round dopo round, senza tradirti.</p>
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
        {STRATEGIES.map((s) => (
          <button key={s.id} className="card stratcard" style={{ padding: 14, textAlign: "left" }} onClick={() => onPick(s.id)}>
            <StratName s={s} />
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 0" }}>{s.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
function computeFidelity(stratId, mine, theirs) {
  const s = byId[stratId];
  if (!s || mine.length === 0) return null;
  const rngStub = () => 0.5;
  let match = 0;
  for (let i = 0; i < mine.length; i++) {
    const predicted = s.play(mine.slice(0, i), theirs.slice(0, i), rngStub, M0);
    if (predicted === mine[i]) match++;
  }
  return Math.round((match / mine.length) * 100);
}

/* --- CRONOLOGIA PARTITE (memoria locale del browser) --- */
const LB_KEY = "pd_matches_v1";
const storageAvailable = (() => {
  try {
    const k = "__pd_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch (e) { return false; }
})();
function loadMatches() {
  try { const raw = window.localStorage.getItem(LB_KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}
function saveMatch(record) {
  try {
    const list = loadMatches();
    list.unshift(record);
    window.localStorage.setItem(LB_KEY, JSON.stringify(list.slice(0, 300)));
    return true;
  } catch (e) { return false; }
}
function clearMatches() {
  try { window.localStorage.removeItem(LB_KEY); return true; } catch (e) { return false; }
}
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  } catch (e) { return iso; }
}
function aggregatePlayers(matches) {
  const map = {};
  matches.forEach((m) => {
    [["a", "b"], ["b", "a"]].forEach(([me]) => {
      const name = ((me === "a" ? m.names.a : m.names.b) || "").trim();
      if (!name) return;
      if (!map[name]) map[name] = { name, played: 0, wins: 0, draws: 0, losses: 0, pf: 0, pa: 0 };
      const rec = map[name];
      rec.played++;
      const myScore = me === "a" ? m.scoreA : m.scoreB;
      const oppScore = me === "a" ? m.scoreB : m.scoreA;
      rec.pf += myScore; rec.pa += oppScore;
      if (m.winner === "draw") rec.draws++;
      else if (m.winner === me) rec.wins++;
      else rec.losses++;
    });
  });
  return Object.values(map).sort((x, y) => (y.wins - x.wins) || (y.pf - y.pa) - (x.pf - x.pa));
}

function HotSeat() {
  const [rounds, setRounds] = useState(10);
  const [names, setNames] = useState({ a: "Giocatore 1", b: "Giocatore 2" });
  const [phase, setPhase] = useState("setup"); // setup|pickHandoffA|pickA|pickHandoffB|pickB|handoffA|p1|handoffB|p2|reveal|done
  const [stratA, setStratA] = useState(null);
  const [stratB, setStratB] = useState(null);
  const [A, setA] = useState([]);
  const [B, setB] = useState([]);
  const [tempA, setTempA] = useState(null);
  const { me: scoreA, opp: scoreB } = scorePairLen(A, B, A.length);

  const pickA = (m) => { setTempA(m); setPhase("handoffB"); };
  const pickB = (m) => { setA([...A, tempA]); setB([...B, m]); setTempA(null); setPhase("reveal"); };
  const afterReveal = () => { if (A.length >= rounds) setPhase("done"); else setPhase("handoffA"); };

  const Handoff = ({ who, sub, cta, next }) => (
    <div className="card slidein" style={{ padding: 40, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <div className="eyebrow" style={{ color: "var(--amber)" }}>Passa il dispositivo</div>
      <div style={{ ...serif, fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>{who}</div>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 22 }}>{sub || "Tocca solo tu, l'altro non deve guardare lo schermo."}</p>
      <button className="btn primary" onClick={next}>{cta || `Sono ${who}, tocca a me →`}</button>
    </div>
  );
  const Choose = ({ who, strat }) => (
    <div className="slidein">
      <div style={{ textAlign: "center", marginBottom: 8 }}><span className="eyebrow" style={{ color: "var(--amber)" }}>Round {A.length + 1} / {rounds}</span></div>
      <div style={{ ...serif, fontSize: 24, fontWeight: 600, textAlign: "center", marginBottom: 18 }}>{who}, scegli la tua mossa</div>
      {strat && <StrategyBox s={byId[strat]} />}
      {A.length > 0 && <div style={{ marginBottom: 18 }}><SharedHistory A={A} B={B} names={names} reveal={A.length} /></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 520, margin: "0 auto" }}>
        <ChoiceButton move={C} onClick={() => (who === names.a ? pickA(C) : pickB(C))} hints={["3 se coopera", "0 se tradisce"]} />
        <ChoiceButton move={D} onClick={() => (who === names.a ? pickA(D) : pickB(D))} hints={["5 se coopera", "1 se tradisce"]} />
      </div>
    </div>
  );

  return (
    <div>
      <SectionHead eyebrow="Gioca · due giocatori, stesso schermo" title="Passa e gioca" sub="Un solo dispositivo. Ognuno sceglie in segreto una strategia da interpretare, poi a ogni round decide la mossa restandole fedele (o tradendola)." />

      {phase === "setup" && (
        <div className="card slidein" style={{ padding: 28, maxWidth: 520, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Preparazione</div>
          <label style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>NOME GIOCATORE 1</label>
          <input value={names.a} onChange={(e) => setNames({ ...names, a: e.target.value })} style={{ width: "100%", margin: "6px 0 14px", padding: "9px 12px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--line-strong)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 }} />
          <label style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>NOME GIOCATORE 2</label>
          <input value={names.b} onChange={(e) => setNames({ ...names, b: e.target.value })} style={{ width: "100%", margin: "6px 0 18px", padding: "9px 12px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--line-strong)", color: "var(--text)", fontFamily: "inherit", fontSize: 14 }} />
          <label style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>DURATA DELLA PARTITA</label>
          <div style={{ marginTop: 8, marginBottom: 20 }}><RoundPicker value={rounds} onChange={setRounds} /></div>
          <button className="btn primary" style={{ width: "100%" }} onClick={() => { setNames((n) => ({ a: n.a.trim() || "Giocatore 1", b: n.b.trim() || "Giocatore 2" })); setPhase("pickHandoffA"); }}>Inizia la partita →</button>
        </div>
      )}

      {phase === "pickHandoffA" && <Handoff who={names.a} sub="Tocca solo tu: sceglierai una strategia segreta che l'altro giocatore non vedrà." cta={`Sono ${names.a}, scelgo la mia strategia →`} next={() => setPhase("pickA")} />}
      {phase === "pickA" && <StrategyPicker who={names.a} onPick={(id) => { setStratA(id); setPhase("pickHandoffB"); }} />}
      {phase === "pickHandoffB" && <Handoff who={names.b} sub="Tocca solo tu: sceglierai una strategia segreta che l'altro giocatore non vedrà." cta={`Sono ${names.b}, scelgo la mia strategia →`} next={() => setPhase("pickB")} />}
      {phase === "pickB" && <StrategyPicker who={names.b} onPick={(id) => { setStratB(id); setPhase("handoffA"); }} />}

      {phase === "handoffA" && <Handoff who={names.a} next={() => setPhase("p1")} />}
      {phase === "p1" && <Choose who={names.a} strat={stratA} />}
      {phase === "handoffB" && <Handoff who={names.b} next={() => setPhase("p2")} />}
      {phase === "p2" && <Choose who={names.b} strat={stratB} />}
      {phase === "reveal" && (
        <div className="card slidein" style={{ padding: 28, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--amber)" }}>Round {A.length} · esito</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, alignItems: "center", margin: "16px 0" }}>
            <div><div style={{ ...mono, fontSize: 12, color: "var(--muted)" }}>{names.a}</div><MoveDot move={A[A.length - 1]} size={48} label /></div>
            <span style={{ ...serif, color: "var(--muted)", fontSize: 20 }}>vs</span>
            <div><div style={{ ...mono, fontSize: 12, color: "var(--muted)" }}>{names.b}</div><MoveDot move={B[B.length - 1]} size={48} label /></div>
          </div>
          <p style={{ fontSize: 15, marginBottom: 14 }}><OutcomeLine mine={A[A.length - 1]} theirs={B[B.length - 1]} meLabel={names.a} themLabel={names.b} /></p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 18 }}>
            <div><span style={{ ...serif, fontSize: 26, fontWeight: 700, color: "var(--coop)" }}>{scoreA}</span> <span style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{names.a}</span></div>
            <div><span style={{ ...serif, fontSize: 26, fontWeight: 700, color: "var(--defect)" }}>{scoreB}</span> <span style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{names.b}</span></div>
          </div>
          <div style={{ marginBottom: 18 }}><SharedHistory A={A} B={B} names={names} reveal={A.length} /></div>
          <button className="btn primary" onClick={afterReveal}>{A.length >= rounds ? "Risultato finale →" : "Prossimo round →"}</button>
        </div>
      )}
      {phase === "done" && <DuoResult scoreA={scoreA} scoreB={scoreB} A={A} B={B} names={names} stratA={stratA} stratB={stratB} onRestart={() => { setA([]); setB([]); setTempA(null); setStratA(null); setStratB(null); setPhase("setup"); }} />}
    </div>
  );
}
function SharedHistory({ A, B, names, reveal }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 12px", alignItems: "center", maxWidth: 440, margin: "0 auto" }}>
      <span style={{ ...mono, fontSize: 11, color: "var(--coop)", textAlign: "right" }}>{names.a}</span>
      <MoveTrack moves={A} total={Math.max(A.length, 1)} reveal={reveal} mine />
      <span style={{ ...mono, fontSize: 11, color: "var(--defect)", textAlign: "right" }}>{names.b}</span>
      <MoveTrack moves={B} total={Math.max(B.length, 1)} reveal={reveal} mine />
    </div>
  );
}
function FidelityLine({ label, stratId, fid }) {
  const s = byId[stratId];
  const noisy = stratId === "random" || stratId === "gtft";
  return (
    <div style={{ textAlign: "left", padding: "10px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ ...mono, fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>{label}</div>
      <StratName s={s} />
      {fid != null && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
          Fedeltà alla strategia: <strong style={{ color: "var(--amber)" }}>{fid}%</strong> dei round
          {noisy && <span> · questa strategia ha una componente casuale, il numero è indicativo</span>}
        </div>
      )}
    </div>
  );
}
function DuoResult({ scoreA, scoreB, A, B, names, stratA, stratB, onRestart }) {
  const aWin = scoreA > scoreB, draw = scoreA === scoreB;
  const winner = draw ? "Pareggio" : aWin ? names.a : names.b;
  const col = draw ? "var(--amber)" : aWin ? "var(--coop)" : "var(--defect)";
  const cc = A.filter((m, i) => m === C && B[i] === C).length;
  const fidA = computeFidelity(stratA, A, B);
  const fidB = computeFidelity(stratB, B, A);

  useEffect(() => {
    saveMatch({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      names: { a: names.a, b: names.b },
      scoreA, scoreB, rounds: A.length,
      stratA, stratB, fidA, fidB,
      winner: aWin ? "a" : draw ? "draw" : "b",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card slidein" style={{ padding: 30, maxWidth: 560, margin: "0 auto", textAlign: "center", border: `1px solid ${col}` }}>
      <div className="eyebrow" style={{ color: "var(--amber)" }}>Fine partita</div>
      <div style={{ ...serif, fontSize: 32, fontWeight: 700, color: col, margin: "8px 0 16px" }}>{draw ? "Pareggio!" : `Vince ${winner}`}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 18 }}>
        <div><div style={{ ...serif, fontSize: 40, fontWeight: 700, color: "var(--coop)" }}>{scoreA}</div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{names.a}</div></div>
        <div><div style={{ ...serif, fontSize: 40, fontWeight: 700, color: "var(--defect)" }}>{scoreB}</div><div style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{names.b}</div></div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
        Avete cooperato insieme in {cc} round su {A.length}. {cc >= A.length * 0.6 ? "Avete privilegiato la fiducia reciproca." : cc <= A.length * 0.3 ? "È stata una partita di diffidenza e tradimenti." : "Una partita in equilibrio tra fiducia e opportunismo."}
      </p>
      <div style={{ marginBottom: 20 }}><SharedHistory A={A} B={B} names={names} reveal={A.length} /></div>

      {(stratA || stratB) && (
        <div style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 6 }}>Rivelazione delle strategie segrete</div>
          {stratA && <FidelityLine label={names.a} stratId={stratA} fid={fidA} />}
          {stratB && <FidelityLine label={names.b} stratId={stratB} fid={fidB} />}
        </div>
      )}

      <button className="btn primary" onClick={onRestart}>↺ Nuova partita</button>
    </div>
  );
}


function TwoPlayer() {
  return <HotSeat />;
}

/* ============================================================
   CLASSIFICA — cronologia partite (memoria locale del browser)
   ============================================================ */
function PlayerMatchCol({ name, score, stratId, fid, align }) {
  const s = byId[stratId];
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
      <div style={{ ...serif, fontSize: 24, fontWeight: 700, color: "var(--amber)" }}>{score}</div>
      {s && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
          {s.en} <span style={{ fontStyle: "italic" }}>({s.it})</span>{fid != null ? ` · fedeltà ${fid}%` : ""}
        </div>
      )}
    </div>
  );
}
function Leaderboard() {
  const [matches, setMatches] = useState(() => loadMatches());
  const [confirmClear, setConfirmClear] = useState(false);
  const players = useMemo(() => aggregatePlayers(matches), [matches]);

  function handleClear() {
    clearMatches();
    setMatches([]);
    setConfirmClear(false);
  }

  if (!storageAvailable) {
    return (
      <div>
        <SectionHead eyebrow="Classifica" title="Cronologia non disponibile" sub="Questo browser non consente l'uso della memoria locale (modalità privata o impostazioni di sistema)." />
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Puoi comunque giocare normalmente in "Gioca": i risultati non verranno salvati in questa sessione.
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <SectionHead eyebrow="Classifica" title="Nessuna partita ancora" sub="Gioca una partita in Gioca per iniziare a costruire la cronologia su questo dispositivo." />
      </div>
    );
  }

  return (
    <div>
      <SectionHead eyebrow="Classifica" title="Partite giocate" sub="Cronologia delle sfide a due giocatori su questo dispositivo, con le strategie segrete usate da ciascuno e quanto vi sono rimasti fedeli." />

      <div className="card" style={{ padding: 20, marginBottom: 20, overflowX: "auto" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Classifica giocatori</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line-strong)" }}>
              {["#", "Giocatore", "Partite", "V", "P", "S", "Punti fatti", "Punti subiti"].map((h) => (
                <th key={h} style={{ ...mono, textAlign: h === "Giocatore" ? "left" : "center", padding: "6px 8px", color: "var(--muted)", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.name} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ ...mono, padding: "8px", textAlign: "center", color: i === 0 ? "var(--amber)" : "var(--muted)" }}>{i + 1}</td>
                <td style={{ padding: "8px", fontWeight: i === 0 ? 600 : 400 }}>{p.name}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center" }}>{p.played}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center", color: "var(--coop)" }}>{p.wins}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center", color: "var(--amber)" }}>{p.draws}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center", color: "var(--defect)" }}>{p.losses}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center" }}>{p.pf}</td>
                <td style={{ ...mono, padding: "8px", textAlign: "center" }}>{p.pa}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>Il conteggio si basa sul nome esattamente digitato a ogni partita.</p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div className="eyebrow">Cronologia partite</div>
          {!confirmClear ? (
            <button className="btn" onClick={() => setConfirmClear(true)}>Cancella cronologia</button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Sicuro? Non si può annullare.</span>
              <button className="btn" onClick={() => setConfirmClear(false)}>Annulla</button>
              <button className="btn primary" onClick={handleClear}>Conferma</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {matches.map((m) => {
            const winnerName = m.winner === "draw" ? null : m.winner === "a" ? m.names.a : m.names.b;
            const col = m.winner === "draw" ? "var(--amber)" : "var(--coop)";
            return (
              <div key={m.id} className="card" style={{ padding: 14, background: "var(--surface2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <span style={{ ...mono, fontSize: 11, color: "var(--muted)" }}>{fmtDate(m.date)} · {m.rounds} round</span>
                  <span style={{ ...serif, fontSize: 15, fontWeight: 600, color: col }}>{m.winner === "draw" ? "Pareggio" : `Vince ${winnerName}`}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
                  <PlayerMatchCol name={m.names.a} score={m.scoreA} stratId={m.stratA} fid={m.fidA} align="left" />
                  <span style={{ ...serif, color: "var(--muted)", fontSize: 16 }}>vs</span>
                  <PlayerMatchCol name={m.names.b} score={m.scoreB} stratId={m.stratB} fid={m.fidB} align="right" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SHELL
   ============================================================ */
export default function App() {
  const [tab, setTab] = useState("intro");
  const tabs = [["intro", "Il dilemma"], ["strategie", "Le strategie"], ["duo", "Gioca"], ["classifica", "Classifica"], ["torneo", "Il torneo"], ["duello", "Il duello"], ["arena", "Solitario"]];
  return (
    <div className="ipd" style={{ ...ROOT_VARS, minHeight: "100vh" }}>
      <style>{`@import url('${FONT_LINK}');`}</style>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px) 80px" }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 4 }}><MoveDot move={C} size={16} /><MoveDot move={D} size={16} /></div>
            <span className="eyebrow">Teoria dei giochi · dilemma iterato</span>
          </div>
          <h1 style={{ ...serif, fontSize: "clamp(34px,6vw,62px)", fontWeight: 700, lineHeight: 0.98, margin: 0, letterSpacing: "-0.01em" }}>
            Cooperare o <span style={{ color: "var(--defect)", fontStyle: "italic" }}>tradire?</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: 560, marginTop: 14 }}>
            Un gioco sul dilemma del prigioniero. Impara le regole, sfida le strategie in Solitario e scopri perché, alla lunga, la fiducia batte l'astuzia.
          </p>
          <nav style={{ display: "flex", gap: 8, marginTop: 26, flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 20 }}>
            {tabs.map(([id, label]) => (<button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>))}
          </nav>
        </header>
        <main>
          {tab === "intro" && <Intro onDone={() => setTab("strategie")} />}
          {tab === "arena" && <Arena />}
          {tab === "duo" && <TwoPlayer />}
          {tab === "classifica" && <Leaderboard />}
          {tab === "strategie" && <StrategyGallery />}
          {tab === "torneo" && <Tournament />}
          {tab === "duello" && <Duel />}
        </main>
        <footer style={{ marginTop: 64, paddingTop: 20, borderTop: "1px solid var(--line)", ...mono, fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>Ispirato al torneo di R. Axelrod (1980) e al minigioco di Universal Paperclips.</span>
          <span>@mariomele.ai</span>
        </footer>
      </div>
    </div>
  );
}
