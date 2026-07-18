import React, { useState, useMemo } from "react";

/* ============================================================
   LE LEGGI FONDAMENTALI DELLA STUPIDITA
   Un'avventura 8-bit nel piano cartesiano di Carlo M. Cipolla
   ============================================================ */

const C = {
  notte: "#14102a",
  notte2: "#0c0920",
  pannello: "#241d4a",
  bordo: "#6b5ca5",
  bordoChiaro: "#a58fe0",
  testo: "#efe7ff",
  testoSoft: "#b9aee0",
  ambra: "#f5a623",
  acqua: "#35d1b3",
  rosso: "#e0466e",
  oro: "#ffd75e",
};

/* ---------- SPRITE ENGINE ---------- */
// . = trasparente. Ogni sprite ha la sua palette.

const SPRITES = {
  eroe: {
    px: [
      "....aaaa....",
      "...aaaaaa...",
      "..abbbbbba..",
      "..bcbbbbcb..",
      "..bbbbbbbb..",
      "..bbddddbb..",
      "...bbbbbb...",
      ".eeeeeeeeee.",
      "e.eeffffee.e",
      "e.eeffffee.e",
      "...ee..ee...",
      "..ggg..ggg..",
    ],
    pal: { a: "#8f7ad6", b: "#f0c39a", c: "#1b1230", d: "#b4593f", e: "#5a76d9", f: "#c8d4ff", g: "#3a2f5c" },
  },
  ingenuo: {
    px: [
      ".....aa.....",
      "....abba....",
      "...bcccccb..",
      "..ccdccdcc..",
      "..cccccccc..",
      "..cceeeecc..",
      "...cccccc...",
      "..ffffffff..",
      ".f.ffffff.f.",
      ".f.ffffff.f.",
      "...ff..ff...",
      "..gg....gg..",
    ],
    pal: { a: "#ffd75e", b: "#e0466e", c: "#f7cba6", d: "#1b1230", e: "#c46a5a", f: "#7fd67f", g: "#3a2f5c" },
  },
  bandito: {
    px: [
      "..aaaaaaaa..",
      ".aaaaaaaaaa.",
      "...bbbbbb...",
      "..cccccccc..",
      "..cdddddc...",
      "..cceeeecc..",
      "...cccccc...",
      "..ffffffff..",
      ".f.ffffff.f.",
      ".f.ffffff.f.",
      "...ff..ff...",
      "..gg....gg..",
    ],
    pal: { a: "#2a2450", b: "#1b1230", c: "#e0b48f", d: "#1b1230", e: "#8f3a4a", f: "#8b3d5e", g: "#3a2f5c" },
  },
  stupido: {
    px: [
      "..a..aa..a..",
      "..aaabbaaa..",
      "...cccccc...",
      "..cdcccdcc..",
      "..cccccccc..",
      "..ceeeeeec..",
      "...cccccc...",
      "..ffffffff..",
      ".f.ffffff.f.",
      ".f.ffffff.f.",
      "...ff..ff...",
      "..gg....gg..",
    ],
    pal: { a: "#ffd75e", b: "#e0466e", c: "#f0c39a", d: "#1b1230", e: "#e07a5f", f: "#c9a227", g: "#3a2f5c" },
  },
  intelligente: {
    px: [
      "...aaaaaa...",
      "..aaaaaaaa..",
      "..bbbbbbbb..",
      ".ccdcbbcdcc.",
      "..bbbbbbbb..",
      "..bbeeeebb..",
      "...bbbbbb...",
      "..ffffffff..",
      ".f.ffffff.f.",
      ".f.hhhhhh.f.",
      "...ff..ff...",
      "..gg....gg..",
    ],
    pal: { a: "#3a2f5c", b: "#f0c39a", c: "#35d1b3", d: "#1b1230", e: "#b4593f", f: "#4a63c8", g: "#3a2f5c", h: "#ffd75e" },
  },
};

function Sprite({ name, scale = 6, bob = false, style = {} }) {
  const s = SPRITES[name];
  if (!s) return null;
  return (
    <div
      className={bob ? "cip-bob" : ""}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${s.px[0].length}, ${scale}px)`,
        gridAutoRows: `${scale}px`,
        imageRendering: "pixelated",
        filter: "drop-shadow(0 " + scale + "px 0 rgba(0,0,0,0.35))",
        ...style,
      }}
    >
      {s.px.flatMap((row, y) =>
        row.split("").map((ch, x) => (
          <div key={`${x}-${y}`} style={{ background: ch === "." ? "transparent" : s.pal[ch] || "transparent" }} />
        ))
      )}
    </div>
  );
}

/* ---------- CONTENUTO ---------- */

const TIPI = {
  intelligente: { label: "INTELLIGENTE", col: C.acqua },
  bandito: { label: "BANDITO", col: C.rosso },
  ingenuo: { label: "INGENUO", col: C.oro },
  stupido: { label: "STUPIDO", col: C.ambra },
};

const SCENE = [
  {
    luogo: "Il Ponte di Pietrapixel",
    ambiente:
      "Il ponte e crollato durante la notte. Sulla riva, Elio il traghettatore ha rinunciato alla sua giornata di pesca per portare la gente dall'altra parte. Dietro di te si e formata una fila.",
    npc: "ingenuo",
    npcNome: "ELIO, IL TRAGHETTATORE",
    npcBattuta: "Sali pure, non voglio nulla. La pesca puo aspettare, la gente no.",
    domanda: "Come attraversi il fiume?",
    opzioni: [
      {
        t: "intelligente",
        testo: "Paghi Elio il giusto e organizzi i turni della fila, cosi la barca non torna mai vuota.",
        io: 20,
        altri: 25,
        esito: "Elio guadagna, la fila si smaltisce, tu attraversi comunque. Nessuno ha perso nulla.",
      },
      {
        t: "bandito",
        testo: "Accetti il passaggio gratuito, sali per primo e lasci gli altri ad aspettare sotto il sole.",
        io: 25,
        altri: -15,
        esito: "Sei dall'altra parte. Alle tue spalle, quindici persone e un pescatore senza pesci.",
      },
      {
        t: "ingenuo",
        testo: "Cedi il tuo posto a tutti gli altri e resti a riva ad aspettare che smetta di piovere.",
        io: -20,
        altri: 20,
        esito: "Tutti ti ringraziano mentre partono. La pioggia non smette.",
      },
      {
        t: "stupido",
        testo: "Spingi Elio nel fiume per gioco e attraversi a nuoto, perdendo lo zaino nella corrente.",
        io: -25,
        altri: -20,
        esito: "Zaino perso, traghettatore bagnato, fila bloccata. Non hai guadagnato niente da tutto questo.",
      },
    ],
  },
  {
    luogo: "La Taverna dei Due Boccali",
    ambiente:
      "Vera, la locandiera, allunga la birra con l'acqua del pozzo. Se ne accorge solo chi guarda il fondo del boccale. Lei ti guarda, capisce che hai capito, e ti fa un cenno.",
    npc: "bandito",
    npcNome: "VERA, LA LOCANDIERA",
    npcBattuta: "Sconto del cinquanta per cento sulla cena. E tu non hai visto niente, vero?",
    domanda: "Cosa rispondi a Vera?",
    opzioni: [
      {
        t: "bandito",
        testo: "Accetti lo sconto. Ceni bene mentre gli altri brindano ad acqua torbida.",
        io: 20,
        altri: -25,
        esito: "Pancia piena, coscienza leggera. La taverna intera paga il tuo silenzio.",
      },
      {
        t: "intelligente",
        testo: "Sveli il trucco agli avventori e proponi a Vera un prezzo onesto su una birra vera.",
        io: 15,
        altri: 30,
        esito: "Vera perde un margine e guadagna una reputazione. La taverna si riempie. Il tuo boccale e pieno.",
      },
      {
        t: "ingenuo",
        testo: "Non dici nulla e paghi il conto di tutti pur di evitare una rissa.",
        io: -30,
        altri: 15,
        esito: "Nessuna rissa. La tua borsa e vuota e Vera continua ad annacquare.",
      },
      {
        t: "stupido",
        testo: "Rovesci tutte le botti per terra urlando, e vieni bandito dalla taverna.",
        io: -20,
        altri: -15,
        esito: "L'inganno resta, la birra no. Sei fuori, al freddo, e nessuno ha bevuto.",
      },
    ],
  },
  {
    luogo: "La Foresta di Fungogrigio",
    ambiente:
      "Ottone, il boscaiolo, sta segando con grande impegno il ramo su cui e seduto. Il ramo, cadendo, ostruira l'unico sentiero della foresta. Ottone sorride e continua.",
    npc: "stupido",
    npcNome: "OTTONE, IL BOSCAIOLO",
    npcBattuta: "Quasi fatto! Poi mi siedo a riposare. Su questo ramo qui.",
    domanda: "Ottone e a meta taglio. Che fai?",
    opzioni: [
      {
        t: "stupido",
        testo: "Ti siedi accanto a lui e inizi a segare dall'altro lato per finire prima.",
        io: -25,
        altri: -25,
        esito: "Cadete entrambi. Il sentiero e chiuso. Nessuno dei due sa spiegare perche l'ha fatto.",
      },
      {
        t: "intelligente",
        testo: "Lo avverti, lo tiri giu, e insieme spostate il tronco liberando il sentiero.",
        io: 20,
        altri: 25,
        esito: "Il sentiero resta aperto, Ottone ha la sua legna, tu passi per primo.",
      },
      {
        t: "bandito",
        testo: "Lo ignori, scavalchi e prosegui. Il ramo cadra sui viaggiatori dietro di te.",
        io: 10,
        altri: -20,
        esito: "Hai risparmiato dieci minuti. Il sentiero alle tue spalle e chiuso per tre giorni.",
      },
      {
        t: "ingenuo",
        testo: "Ti offri di finire il taglio al posto suo. Lui va a pranzo, tu ti fai male.",
        io: -25,
        altri: 10,
        esito: "Ottone mangia. Tu hai il polso slogato e la legna e sua.",
      },
    ],
  },
  {
    luogo: "La Torre dell'Orologio",
    ambiente:
      "L'orologio del villaggio si e fermato alle tre e dodici. Ada, ingegnera, ha disegnato il progetto per ripararlo. Le mancano soltanto due mani in piu e un attrezzo.",
    npc: "intelligente",
    npcNome: "ADA, L'INGEGNERA",
    npcBattuta: "So dove sta l'ingranaggio rotto. Non riesco a tenerlo fermo e girarlo insieme.",
    domanda: "Hai in tasca l'attrezzo giusto. Cosa ne fai?",
    opzioni: [
      {
        t: "intelligente",
        testo: "Lavori con lei. Impari il meccanismo mentre l'orologio riparte.",
        io: 25,
        altri: 30,
        esito: "Il villaggio ha di nuovo l'ora. Tu hai imparato a leggere un ingranaggio. Ada ha una collega.",
      },
      {
        t: "bandito",
        testo: "Copi il progetto di nascosto e lo vendi al villaggio vicino.",
        io: 30,
        altri: -20,
        esito: "Sei ricco. Qui l'orologio segna ancora le tre e dodici e Ada ha smesso di disegnare.",
      },
      {
        t: "stupido",
        testo: "Insisti a colpire l'ingranaggio col martello finche non si spezza in due.",
        io: -20,
        altri: -30,
        esito: "Ingranaggio irrecuperabile. Attrezzo rotto. Nessun vantaggio per nessuno, te compreso.",
      },
      {
        t: "ingenuo",
        testo: "Le regali l'attrezzo e torni a casa, perche tanto non sapresti come si usa.",
        io: -20,
        altri: 15,
        esito: "L'orologio riparte. Tu non sai come. E l'attrezzo non ce l'hai piu.",
      },
    ],
  },
  {
    luogo: "Il Consiglio del Villaggio",
    ambiente:
      "Il granaio comune va affidato a qualcuno. Elio, Vera, Ottone e Ada siedono in cerchio. Tocca a te parlare per ultimo, e il tuo voto vale come tutti gli altri messi insieme.",
    npc: "eroe",
    npcNome: "IL CONSIGLIO",
    npcBattuta: "Il grano bastera per l'inverno. Se qualcuno lo custodisce.",
    domanda: "Come voti?",
    opzioni: [
      {
        t: "intelligente",
        testo: "Ti candidi e proponi una custodia a rotazione, con i registri aperti a chiunque.",
        io: 20,
        altri: 30,
        esito: "Nessuno puo rubare senza che si veda. Tutti mangiano, tu compreso, fino a primavera.",
      },
      {
        t: "bandito",
        testo: "Ti candidi promettendo trasparenza, e tieni per te una decima parte del grano.",
        io: 30,
        altri: -25,
        esito: "Il tuo inverno e comodo. Quello del villaggio, un po' meno.",
      },
      {
        t: "ingenuo",
        testo: "Doni la tua parte di grano a tutti e resti senza scorte fino a marzo.",
        io: -25,
        altri: 20,
        esito: "Il villaggio ti ricorda con affetto. A gennaio hai fame.",
      },
      {
        t: "stupido",
        testo: "Voti per bruciare il granaio, cosi nessuno litighera piu su chi lo custodisce.",
        io: -30,
        altri: -30,
        esito: "La lite e finita. Anche il grano. Anche il tuo.",
      },
    ],
  },
];

const MAX_IO = SCENE.reduce((a, s) => a + Math.max(...s.opzioni.map((o) => Math.abs(o.io))), 0);
const MAX_ALTRI = SCENE.reduce((a, s) => a + Math.max(...s.opzioni.map((o) => Math.abs(o.altri))), 0);

const LEGGI = [
  "Sempre e inevitabilmente ciascuno di noi sottovaluta il numero di individui stupidi in circolazione.",
  "La probabilita che una certa persona sia stupida e indipendente da qualsiasi altra caratteristica della stessa persona.",
  "Una persona stupida e una persona che causa un danno a un'altra persona o gruppo di persone senza nel contempo realizzare alcun vantaggio per se, o addirittura subendo un danno.",
  "Le persone non stupide sottovalutano sempre il potenziale nocivo delle persone stupide.",
  "La persona stupida e il tipo di persona piu pericoloso che esista.",
];

const VERDETTI = {
  intelligente: {
    titolo: "SEI UN INTELLIGENTE",
    leggi: [0, 3],
    testo:
      "Nel quadrante nord-est del piano di Cipolla, il tuo guadagno cresce insieme a quello degli altri. Non e altruismo: e la scoperta che la cooperazione non e un gioco a somma zero. Cipolla avverte pero che le persone come te sottovalutano sistematicamente sia il numero degli stupidi sia il danno che possono fare. La tua intelligenza non ti protegge da loro.",
  },
  bandito: {
    titolo: "SEI UN BANDITO",
    leggi: [2],
    testo:
      "Sud-est: guadagni, e qualcun altro paga. Cipolla non ti disprezza, e questo e il punto piu scomodo del suo saggio: il bandito e razionale, il suo bilancio torna, il danno che infligge e almeno pari al vantaggio che ottiene. E un avversario, non una catastrofe. Con te si puo negoziare. Con lo stupido no.",
  },
  ingenuo: {
    titolo: "SEI UN INGENUO",
    leggi: [3],
    testo:
      "Nord-ovest: gli altri guadagnano, tu paghi. Cipolla usa il termine sprovveduto senza cattiveria, ma con un avvertimento. L'ingenuo e la risorsa preferita del bandito e la prima vittima dello stupido. Generosita e sacrificio non sono la stessa cosa, e la differenza si legge sull'asse verticale.",
  },
  stupido: {
    titolo: "SEI UNO STUPIDO",
    leggi: [2, 4],
    testo:
      "Sud-ovest: hai fatto del male agli altri senza ricavarne nulla, a volte danneggiando anche te stesso. E la terza legge, quella che Cipolla chiama aurea. E la quinta spiega perche lo stupido e piu pericoloso del bandito: il bandito ha un movente, quindi e prevedibile. Lo stupido no. Non esiste una contromossa razionale contro un'azione priva di logica.",
  },
  indeciso: {
    titolo: "SEI UN MEDIOCRE",
    leggi: [1],
    testo:
      "Sei vicino all'origine degli assi. Non hai fatto molto male, non hai fatto molto bene. Cipolla lo nota di sfuggita: la maggior parte delle persone sta qui, e la posizione media non e una virtu, e solo un'assenza di direzione. La seconda legge ricorda che nessun titolo, ruolo o istruzione garantisce da quale parte del piano finirai.",
  },
};

/* ---------- COMPONENTI UI ---------- */

function Barra({ label, valore, colore, icona }) {
  const v = Math.max(-100, Math.min(100, valore));
  const left = v >= 0 ? 50 : 50 + v / 2;
  const width = Math.abs(v) / 2;
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span className="cip-ui" style={{ fontSize: 8, color: colore }}>
          {icona} {label}
        </span>
        <span className="cip-ui" style={{ fontSize: 8, color: v === 0 ? C.testoSoft : v > 0 ? colore : C.rosso }}>
          {v > 0 ? "+" : ""}
          {v}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 16,
          background: C.notte2,
          border: `2px solid ${C.bordo}`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: C.bordo, opacity: 0.8 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${left}%`,
            width: `${width}%`,
            background: v >= 0 ? colore : C.rosso,
            transition: "all 420ms steps(8)",
          }}
        />
      </div>
    </div>
  );
}

function Cornice({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.pannello,
        border: `3px solid ${C.bordo}`,
        boxShadow: `0 0 0 3px ${C.notte2}, 0 0 0 5px ${C.bordoChiaro}`,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bottone({ children, onClick, colore = C.bordoChiaro, full }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cip-ui"
      style={{
        display: "block",
        width: full ? "100%" : "auto",
        textAlign: "left",
        background: hover ? colore : "transparent",
        color: hover ? C.notte : C.testo,
        border: `2px solid ${colore}`,
        padding: "12px 14px",
        fontSize: 9,
        lineHeight: 1.9,
        cursor: "pointer",
        transition: "none",
        transform: hover ? "translate(2px,2px)" : "none",
        boxShadow: hover ? "none" : `3px 3px 0 ${C.notte2}`,
      }}
    >
      {children}
    </button>
  );
}

/* ---------- MAPPA FINALE ---------- */

function PianoCartesiano({ x, y, tipo }) {
  const S = 300;
  const px = S / 2 + (x / 100) * (S / 2 - 26);
  const py = S / 2 - (y / 100) * (S / 2 - 26);
  const quad = [
    { x: 0, y: 0, w: S / 2, h: S / 2, c: "#2a2f5e", label: "INGENUI" },
    { x: S / 2, y: 0, w: S / 2, h: S / 2, c: "#23503f", label: "INTELLIGENTI" },
    { x: 0, y: S / 2, w: S / 2, h: S / 2, c: "#54371f", label: "STUPIDI" },
    { x: S / 2, y: S / 2, w: S / 2, h: S / 2, c: "#4d1f33", label: "BANDITI" },
  ];
  return (
    <div style={{ position: "relative", width: S, maxWidth: "100%", margin: "0 auto" }}>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: "100%", display: "block", border: `3px solid ${C.bordo}` }}>
        {quad.map((q, i) => (
          <g key={i}>
            <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={q.c} />
            <text
              x={q.x + q.w / 2}
              y={q.y + (i < 2 ? 20 : q.h - 10)}
              textAnchor="middle"
              fill={C.testoSoft}
              style={{ fontSize: 7, fontFamily: "'Press Start 2P', monospace" }}
            >
              {q.label}
            </text>
          </g>
        ))}
        <line x1={0} y1={S / 2} x2={S} y2={S / 2} stroke={C.bordoChiaro} strokeWidth="2" />
        <line x1={S / 2} y1={0} x2={S / 2} y2={S} stroke={C.bordoChiaro} strokeWidth="2" />
        <text x={S - 6} y={S / 2 - 8} textAnchor="end" fill={C.acqua} style={{ fontSize: 7, fontFamily: "'Press Start 2P', monospace" }}>
          ALTRI +
        </text>
        <text x={S / 2 + 8} y={12} fill={C.ambra} style={{ fontSize: 7, fontFamily: "'Press Start 2P', monospace" }}>
          IO +
        </text>
        <circle cx={px} cy={py} r={10} fill="none" stroke={C.oro} strokeWidth="2" className="cip-pulse" />
      </svg>
      <div style={{ position: "absolute", left: `${(px / S) * 100}%`, top: `${(py / S) * 100}%`, transform: "translate(-50%,-70%)" }}>
        <Sprite name={tipo === "indeciso" ? "eroe" : tipo} scale={4} bob />
      </div>
    </div>
  );
}

/* ---------- APP ---------- */

export default function LeggiDellaStupidita() {
  const [fase, setFase] = useState("intro");
  const [i, setI] = useState(0);
  const [io, setIo] = useState(0);
  const [altri, setAltri] = useState(0);
  const [scelte, setScelte] = useState([]);
  const [esito, setEsito] = useState(null);

  const scena = SCENE[i];

  const opzioniMescolate = useMemo(() => {
    if (!scena) return [];
    const arr = [...scena.opzioni];
    let seed = i * 97 + 13;
    for (let k = arr.length - 1; k > 0; k--) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const j = seed % (k + 1);
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    return arr;
  }, [i, scena]);

  const nIo = Math.round((io / MAX_IO) * 100);
  const nAltri = Math.round((altri / MAX_ALTRI) * 100);

  function scegli(o) {
    setIo((v) => v + o.io);
    setAltri((v) => v + o.altri);
    setScelte((s) => [...s, o.t]);
    setEsito(o);
  }

  function avanti() {
    setEsito(null);
    if (i + 1 >= SCENE.length) setFase("fine");
    else setI(i + 1);
  }

  function ricomincia() {
    setFase("intro");
    setI(0);
    setIo(0);
    setAltri(0);
    setScelte([]);
    setEsito(null);
  }

  const tipoFinale = useMemo(() => {
    if (Math.abs(nIo) < 12 && Math.abs(nAltri) < 12) return "indeciso";
    if (nIo >= 0 && nAltri >= 0) return "intelligente";
    if (nIo >= 0 && nAltri < 0) return "bandito";
    if (nIo < 0 && nAltri >= 0) return "ingenuo";
    return "stupido";
  }, [nIo, nAltri]);

  const conteggio = useMemo(() => {
    const c = { intelligente: 0, bandito: 0, ingenuo: 0, stupido: 0 };
    scelte.forEach((s) => (c[s] += 1));
    return c;
  }, [scelte]);

  return (
    <div style={{ background: C.notte, minHeight: "100vh", padding: "24px 16px", color: C.testo, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .cip-ui { font-family: 'Press Start 2P', 'Courier New', monospace; letter-spacing: 0.5px; }
        .cip-body { font-family: 'Courier New', ui-monospace, monospace; font-size: 15px; line-height: 1.75; }
        .cip-bob { animation: cipbob 900ms steps(2) infinite; }
        @keyframes cipbob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .cip-pulse { animation: cippulse 1200ms steps(4) infinite; }
        @keyframes cippulse { 0%,100% { opacity:1; r:10; } 50% { opacity:0.35; r:14; } }
        .cip-scan { position:fixed; inset:0; pointer-events:none; z-index:50;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px); }
        .cip-blink { animation: cipblink 900ms steps(1) infinite; }
        @keyframes cipblink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
        @media (prefers-reduced-motion: reduce) {
          .cip-bob, .cip-pulse, .cip-blink { animation: none !important; }
        }
      `}</style>
      <div className="cip-scan" />

      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        {/* INTRO */}
        {fase === "intro" && (
          <Cornice>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 22 }}>
              <Sprite name="ingenuo" scale={5} bob />
              <Sprite name="stupido" scale={5} bob />
              <Sprite name="eroe" scale={5} bob />
              <Sprite name="bandito" scale={5} bob />
              <Sprite name="intelligente" scale={5} bob />
            </div>
            <h1 className="cip-ui" style={{ fontSize: 17, lineHeight: 1.7, textAlign: "center", color: C.oro, margin: "0 0 10px" }}>
              LE LEGGI FONDAMENTALI
              <br />
              DELLA STUPIDITA
            </h1>
            <p className="cip-ui" style={{ fontSize: 8, textAlign: "center", color: C.testoSoft, marginBottom: 24 }}>
              un'avventura nel piano cartesiano di carlo m. cipolla
            </p>
            <p className="cip-body" style={{ color: C.testo, marginBottom: 14 }}>
              Nel 1976 lo storico dell'economia Carlo M. Cipolla propose un modello semplice e feroce. Ogni azione umana si
              colloca su due assi: il vantaggio che produce per chi la compie, e il vantaggio che produce per gli altri. Quattro
              quadranti, quattro tipi umani. Nessuna scorciatoia.
            </p>
            <p className="cip-body" style={{ color: C.testo, marginBottom: 24 }}>
              Attraverserai cinque luoghi e incontrerai chi abita quei quadranti. A ogni scelta le due barre si muovono. Alla
              fine scoprirai dove ti sei fermato sul piano, e quale delle cinque leggi ti riguarda piu da vicino.
            </p>
            <div style={{ borderTop: `2px dashed ${C.bordo}`, paddingTop: 18 }}>
              <Bottone onClick={() => setFase("gioco")} colore={C.oro} full>
                &gt; INIZIA L'AVVENTURA <span className="cip-blink">_</span>
              </Bottone>
            </div>
          </Cornice>
        )}

        {/* GIOCO */}
        {fase === "gioco" && scena && (
          <>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
              <Barra label="VANTAGGIO PER ME" valore={nIo} colore={C.ambra} icona="[I]" />
              <Barra label="VANTAGGIO PER GLI ALTRI" valore={nAltri} colore={C.acqua} icona="[A]" />
            </div>

            <div className="cip-ui" style={{ fontSize: 8, color: C.testoSoft, marginBottom: 10, textAlign: "right" }}>
              LUOGO {i + 1} / {SCENE.length}
            </div>

            <Cornice>
              <h2 className="cip-ui" style={{ fontSize: 12, color: C.oro, margin: "0 0 16px", lineHeight: 1.7 }}>
                {scena.luogo}
              </h2>

              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
                <Sprite name={scena.npc} scale={7} bob />
                <div style={{ flex: 1, minWidth: 240 }}>
                  <p className="cip-body" style={{ color: C.testoSoft, margin: "0 0 12px" }}>
                    {scena.ambiente}
                  </p>
                  <div style={{ borderLeft: `3px solid ${C.bordoChiaro}`, paddingLeft: 12 }}>
                    <div className="cip-ui" style={{ fontSize: 8, color: C.bordoChiaro, marginBottom: 6 }}>
                      {scena.npcNome}
                    </div>
                    <p className="cip-body" style={{ margin: 0, fontStyle: "italic", color: C.testo }}>
                      "{scena.npcBattuta}"
                    </p>
                  </div>
                </div>
              </div>

              {!esito ? (
                <>
                  <div className="cip-ui" style={{ fontSize: 9, color: C.oro, margin: "0 0 14px" }}>
                    ? {scena.domanda}
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {opzioniMescolate.map((o, k) => (
                      <Bottone key={k} onClick={() => scegli(o)} full>
                        {String.fromCharCode(65 + k)}. {o.testo}
                      </Bottone>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ borderTop: `2px dashed ${C.bordo}`, paddingTop: 18 }}>
                  <p className="cip-body" style={{ color: C.testo, margin: "0 0 16px" }}>
                    {esito.esito}
                  </p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                    <span className="cip-ui" style={{ fontSize: 9, color: esito.io >= 0 ? C.ambra : C.rosso }}>
                      ME {esito.io > 0 ? "+" : ""}
                      {esito.io}
                    </span>
                    <span className="cip-ui" style={{ fontSize: 9, color: esito.altri >= 0 ? C.acqua : C.rosso }}>
                      ALTRI {esito.altri > 0 ? "+" : ""}
                      {esito.altri}
                    </span>
                  </div>
                  <Bottone onClick={avanti} colore={C.oro} full>
                    &gt; {i + 1 >= SCENE.length ? "VEDI IL VERDETTO" : "PROSEGUI"} <span className="cip-blink">_</span>
                  </Bottone>
                </div>
              )}
            </Cornice>
          </>
        )}

        {/* FINE */}
        {fase === "fine" && (
          <Cornice>
            <div className="cip-ui" style={{ fontSize: 8, color: C.testoSoft, textAlign: "center", marginBottom: 6 }}>
              fine del percorso
            </div>
            <h2
              className="cip-ui"
              style={{ fontSize: 16, textAlign: "center", color: TIPI[tipoFinale]?.col || C.oro, margin: "0 0 24px", lineHeight: 1.7 }}
            >
              {VERDETTI[tipoFinale].titolo}
            </h2>

            <PianoCartesiano x={nAltri} y={nIo} tipo={tipoFinale} />

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "26px 0 22px" }}>
              <Barra label="VANTAGGIO PER ME" valore={nIo} colore={C.ambra} icona="[I]" />
              <Barra label="VANTAGGIO PER GLI ALTRI" valore={nAltri} colore={C.acqua} icona="[A]" />
            </div>

            <p className="cip-body" style={{ color: C.testo, marginBottom: 22 }}>
              {VERDETTI[tipoFinale].testo}
            </p>

            <div style={{ borderTop: `2px dashed ${C.bordo}`, paddingTop: 18, marginBottom: 22 }}>
              <div className="cip-ui" style={{ fontSize: 9, color: C.oro, marginBottom: 14 }}>
                LE TUE CINQUE SCELTE
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(conteggio).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="cip-ui" style={{ fontSize: 8, width: 130, color: TIPI[k].col }}>
                      {TIPI[k].label}
                    </span>
                    <div style={{ flex: 1, height: 12, background: C.notte2, border: `2px solid ${C.bordo}` }}>
                      <div style={{ width: `${(v / SCENE.length) * 100}%`, height: "100%", background: TIPI[k].col }} />
                    </div>
                    <span className="cip-ui" style={{ fontSize: 8, width: 20, textAlign: "right" }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `2px dashed ${C.bordo}`, paddingTop: 18, marginBottom: 22 }}>
              <div className="cip-ui" style={{ fontSize: 9, color: C.oro, marginBottom: 14 }}>
                LE CINQUE LEGGI
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {LEGGI.map((l, k) => {
                  const on = VERDETTI[tipoFinale].leggi.includes(k);
                  return (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: 10,
                        background: on ? C.notte2 : "transparent",
                        border: on ? `2px solid ${TIPI[tipoFinale]?.col || C.oro}` : `2px solid transparent`,
                      }}
                    >
                      <span className="cip-ui" style={{ fontSize: 10, color: on ? (TIPI[tipoFinale]?.col || C.oro) : C.bordo }}>
                        {k + 1}
                      </span>
                      <p className="cip-body" style={{ margin: 0, color: on ? C.testo : C.testoSoft, fontSize: 14 }}>
                        {l}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Bottone onClick={ricomincia} colore={C.oro} full>
              &gt; RIGIOCA E CAMBIA QUADRANTE <span className="cip-blink">_</span>
            </Bottone>

            <p className="cip-body" style={{ color: C.testoSoft, fontSize: 12, marginTop: 20, textAlign: "center" }}>
              Da Carlo M. Cipolla, "Allegro ma non troppo", il Mulino, 1988.
            </p>
          </Cornice>
        )}
      </div>
    </div>
  );
}
