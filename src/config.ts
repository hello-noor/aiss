export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  target: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
}

export interface HeroStat {
  value: string
  label: string
}

export interface HeroConfig {
  imagePath: string
  eyebrow: string
  titleLine: string
  titleEmphasis: string
  subtitle: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
  stats: HeroStat[]
}

export interface ManifestoConfig {
  sectionLabel: string
  text: string
  emphasis: string[]
}

export interface AnatomyPillar {
  label: string
  title: string
  body: string
  image: string
}

export interface AnatomyConfig {
  sectionLabel: string
  title: string
  pillars: AnatomyPillar[]
}

export interface TierConfig {
  name: string
  tag: string
  journeys: string
  image: string
  description: string
  amenities: string[]
  ctaText: string
  ctaHref: string
}

export interface TiersConfig {
  sectionLabel: string
  title: string
  tiers: TierConfig[]
}

export interface ArchiveFile {
  name: string
  label: string
  href: string
  thumb?: string
}

export interface ArchiveGroup {
  heading: string
  files: ArchiveFile[]
}

export interface ArchiveConfig {
  sectionLabel: string
  title: string
  intro: string
  repoLabel: string
  repoHref: string
  featuredLabel: string
  featuredTitle: string
  featuredBody: string
  featuredStats: string[]
  featuredCta: string
  featuredHref: string
  featuredImage: string
  games: ArchiveFile[]
  groups: ArchiveGroup[]
  closingNote: string
}

export interface AboutCard {
  tag: string
  title: string
  body: string
  points: string[]
  linkLabel?: string
  linkHref?: string
}

export interface AboutConfig {
  sectionLabel: string
  title: string
  cards: AboutCard[]
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export interface FooterConfig {
  ageGateText: string
  brandName: string
  brandTaglineLines: string[]
  columns: FooterColumn[]
  copyright: string
}

const PAGES = "https://hello-noor.github.io/aiss"
const ARTIFACTS = "https://hello-noor.github.io/aiss/artifacts"
const REPO = "https://github.com/hello-noor/aiss"

export const siteConfig: SiteConfig = {
  language: "it",
  siteTitle: "AI Summer School · Baronissi, 6-10 luglio 2026",
  siteDescription:
    "Cinque mattinate in cui ragazzi di 10-15 anni hanno imparato a governare l'intelligenza artificiale: il knowledge graph, i giochi e tutti gli artefatti pubblicati su GitHub.",
}

export const navigationConfig: NavigationConfig = {
  brandName: "AISS",
  links: [
    { label: "Metodo", target: "#metodo" },
    { label: "In evidenza", target: "#evidenza" },
    { label: "Archivio", target: "#archivio" },
  ],
}

export const heroConfig: HeroConfig = {
  imagePath: "/aiss/images/hero.jpg",
  eyebrow: "Baronissi (SA) · 6-10 luglio 2026",
  titleLine: "AI Summer",
  titleEmphasis: "School",
  subtitle: "Cinque mattinate in cui ragazzi di 10-15 anni non hanno usato l'AI per fare i compiti, ma per pensare. Tutta la settimana, concetto per concetto, in un knowledge graph navigabile.",
  primaryCta: "Esplora il Knowledge Graph",
  primaryHref: `${PAGES}/AISS_knowledge_graph.html`,
  secondaryCta: "Scopri il progetto",
  secondaryHref: "#manifesto",
  stats: [
    { value: "5", label: "mattinate" },
    { value: "10-15", label: "anni" },
    { value: "336", label: "concetti" },
    { value: "18", label: "artefatti" },
  ],
}

export const manifestoConfig: ManifestoConfig = {
  sectionLabel: "Il manifesto",
  text: "Tenere i preadolescenti lontani dall'intelligenza artificiale non li protegge: li lascia soli. Per cinque mattinate un gruppo di ragazzi ha imparato a governarla da meta-autori: costruendo videogiochi, pubblicando codice su GitHub, discutendo di evoluzione e leggendo Platone. Elevati, non allevati: la macchina si governa, non si subisce.",
  emphasis: ["li lascia soli", "meta-autori", "Elevati, non allevati"],
}

export const anatomyConfig: AnatomyConfig = {
  sectionLabel: "Il metodo",
  title: "Tre mosse, una sola direzione",
  pillars: [
    {
      label: "01 · Governare, non delegare",
      title: "Meta-autori, non utenti",
      body: "Il distant writing insegna a dirigere la macchina invece di delegarle il pensiero: si scrive con l'AI e poi si chiede «roast me», una critica dura e onesta del proprio lavoro. A essere valutata non è l'artefatto finito ma la storia dei prompt che lo ha generato: è lì che si legge l'impegno cognitivo. L'errore è un dato del percorso, non una colpa: tolta l'ansia del giudizio, la voglia di sperimentare esplode.",
      image: "/aiss/images/metodo-01.jpg",
    },
    {
      label: "02 · Il sapere in rete",
      title: "Connessioni prima dei contenuti",
      body: "Dalla banana radioattiva al CERN, dall'etimologia di «algoritmo» al sistema binario, dal Simposio di Platone al prompt engineering: ogni innesco apre ramificazioni che attraversano più discipline. È il pensiero macro: vedere la rete prima dei singoli nodi. Tutta questa rete oggi è navigabile nel knowledge graph: 336 concetti e 954 collegamenti che ricostruiscono la settimana com'è davvero accaduta, intrecciata.",
      image: "/aiss/images/metodo-02.jpg",
    },
    {
      label: "03 · Artefatti reali",
      title: "Costruire per imparare",
      body: "Costruzionismo allo stato puro: ogni mattinata produce oggetti veri, non esercizi. Un gioco sul Dilemma del Prigioniero sviluppato in JavaScript e pubblicato su GitHub con licenza MIT, videogiochi a 8 bit, dossier interattivi, un podcast finale in cui ragazzi di undici anni spiegano la stocasticità degli LLM. La difficoltà desiderabile esalta invece di respingere: i ragazzi arrivavano alle 8:30 e non volevano più lasciare l'aula.",
      image: "/aiss/images/metodo-03.jpg",
    },
  ],
}

export const tiersConfig: TiersConfig = {
  sectionLabel: "In evidenza",
  title: "Tre porte d'ingresso alla settimana",
  tiers: [
    {
      name: "Knowledge Graph",
      tag: "L'artefatto principale",
      journeys: "HTML · Three.js",
      image: "/aiss/images/tier-01.jpg",
      description:
        "Il cuore del progetto. Ogni concetto incontrato in aula, che sia un autore, una materia, uno strumento o una parola, diventa un punto in una rete 3D che si ruota, si esplora e si interroga. Non un programma in fila, ma la settimana come l'hanno vissuta i ragazzi.",
      amenities: [
        "336 concetti connessi in 954 relazioni",
        "11 discipline attraversate in 5 giorni",
        "Autori, strumenti, parole e giorni della settimana",
        "Percorsi guidati giorno per giorno",
      ],
      ctaText: "Apri il Knowledge Graph",
      ctaHref: `${PAGES}/AISS_knowledge_graph.html`,
    },
    {
      name: "Il Dilemma del Prigioniero",
      tag: "Il gioco della teoria dei giochi",
      journeys: "HTML · JavaScript",
      image: "/aiss/images/tier-02.jpg",
      description:
        "Sviluppato in aula e pubblicato su GitHub con licenza MIT: dodici strategie spiegate passo passo, partite a coppie sullo stesso dispositivo, tornei completi, duelli tra strategie e classifica. Il passaggio da fruitore a produttore, in un solo artefatto.",
      amenities: [
        "Dodici strategie, da Tit for Tat a Pavlov",
        "Torneo tutti contro tutti in tempo reale",
        "Solitario contro dieci avversari automatici",
        "Codice open source con licenza MIT",
      ],
      ctaText: "Gioca ora",
      ctaHref: `${ARTIFACTS}/dilemma-gioco.html`,
    },
    {
      name: "Il report della settimana",
      tag: "Il documento di sintesi",
      journeys: "PDF · 8 pagine",
      image: "/aiss/images/tier-03.jpg",
      description:
        "Il report ufficiale della prima edizione: il percorso giorno per giorno, il metodo pedagogico, i dati Mentimeter, le storie individuali e la voce dei ragazzi. Costruito sulle registrazioni delle lezioni, sui resoconti scritti e sugli artefatti prodotti in aula.",
      amenities: [
        "L'arco delle cinque mattinate",
        "Il metodo e le radici pedagogiche",
        "I segnali del coinvolgimento, oltre i voti",
        "Il glossario di fine settimana",
      ],
      ctaText: "Scarica il report",
      ctaHref: "/aiss/files/AI_SS_Report_Settimana.pdf",
    },
  ],
}

export const archiveConfig: ArchiveConfig = {
  sectionLabel: "L'archivio completo",
  title: "Tutto il codice, su GitHub.",
  intro:
    "Ogni artefatto della settimana è pubblicato nel repository hello-noor/aiss con licenza MIT: si apre nel browser, si gioca, si smonta, si impara.",
  repoLabel: "github.com/hello-noor/aiss",
  repoHref: REPO,
  featuredLabel: "Il file principale",
  featuredTitle: "AISS_knowledge_graph.html",
  featuredBody:
    "La mappa 3D di tutta la settimana: 336 concetti, 954 collegamenti, 11 discipline. Ruotala, cerca una parola, segui i fili e scopri come la teoria dei giochi incontra Platone, e la chimica incontra la musica siberiana.",
  featuredStats: ["336 concetti", "954 collegamenti", "11 discipline"],
  featuredCta: "Apri la mappa",
  featuredHref: `${PAGES}/AISS_knowledge_graph.html`,
  featuredImage: "/aiss/images/tier-01.jpg",
  games: [
    { name: "dilemma-gioco.html", label: "Il Dilemma del Prigioniero · il gioco completo", href: `${ARTIFACTS}/dilemma-gioco.html`, thumb: "/aiss/images/thumbs/thumb-dilemma-gioco.jpg" },
    { name: "dilemma.html", label: "Il Dilemma del Prigioniero · la prima versione", href: `${ARTIFACTS}/dilemma.html`, thumb: "/aiss/images/thumbs/thumb-dilemma.jpg" },
    { name: "cipollotto-leggi-di-cipolla__1_.html", label: "Cipollotto e le Leggi della Stupidità · avventura 8-bit", href: `${ARTIFACTS}/cipollotto-leggi-di-cipolla__1_.html`, thumb: "/aiss/images/thumbs/thumb-cipollotto.jpg" },
    { name: "leggi-stupidita-cipolla.html", label: "Le Leggi di Cipolla · il gioco (poco) serio", href: `${ARTIFACTS}/leggi-stupidita-cipolla.html`, thumb: "/aiss/images/thumbs/thumb-cipolla.jpg" },
    { name: "trex-gallina__2_.html", label: "T-Rex Evolution · il vero gioco della gallina", href: `${ARTIFACTS}/trex-gallina__2_.html`, thumb: "/aiss/images/thumbs/thumb-trex.jpg" },
    { name: "evoluzione-roguelike.html", label: "L'Ascesa · cronaca evolutiva roguelike", href: `${ARTIFACTS}/evoluzione-roguelike.html`, thumb: "/aiss/images/thumbs/thumb-ascesa.jpg" },
    { name: "gioco-evoluzione-del-frutto__1_.html", label: "Evolvi il tuo frutto · gioco botanico", href: `${ARTIFACTS}/gioco-evoluzione-del-frutto__1_.html`, thumb: "/aiss/images/thumbs/thumb-frutto.jpg" },
    { name: "voce-cosmica.html", label: "Voce Cosmica · sintesi vocale nello spazio", href: `${ARTIFACTS}/voce-cosmica.html`, thumb: "/aiss/images/thumbs/thumb-voce.jpg" },
  ],
  groups: [
    {
      heading: "Esplorazioni interattive",
      files: [
        { name: "evoluzione.html", label: "Come cambia la vita · la selezione naturale in azione", href: `${ARTIFACTS}/evoluzione.html` },
        { name: "evoluzione-vita.html", label: "Il Cerchio della Vita · un ciclo in dodici fasi", href: `${ARTIFACTS}/evoluzione-vita.html` },
        { name: "giraffa_evoluzione.html", label: "Il collo della giraffa · caso o selezione?", href: `${ARTIFACTS}/giraffa_evoluzione.html` },
        { name: "il-frutto-capsula-tecnologica.html", label: "Il frutto · capsula tecnologica per payload genetico", href: `${ARTIFACTS}/il-frutto-capsula-tecnologica.html` },
        { name: "mnemo-tavola.html", label: "Mnemo · la Tavola Periodica a memoria", href: `${ARTIFACTS}/mnemo-tavola.html` },
      ],
    },
  ],
  closingNote: "Ogni file si apre nel browser. Il codice è dei ragazzi: forkalo, studialo, miglioralo.",
}

export const aboutConfig: AboutConfig = {
  sectionLabel: "Chi c'è dietro",
  title: "Le persone e i luoghi del progetto",
  cards: [
    {
      tag: "Il tutor",
      title: "Mario Mele",
      body: "Docente e divulgatore, cura la newsletter ExMachina sul rapporto tra uomo e macchina. La sua idea di scuola parte da un rifiuto doppio: né vietare l'AI, né ridurla a un tutorial. La terza via è trattarla come un linguaggio da abitare. In aula questo diventa un laboratorio in cui si costruisce insieme, si sbaglia senza paura e si ride molto, tra un videogioco da pubblicare e un dialogo di Platone. Educare, dal latino educere: tirare fuori quello che una persona ha già dentro.",
      points: [
        "«Non il divieto, non il tutorial: governare la tecnologia»",
        "Scrive di AI e scuola sulla newsletter ExMachina",
        "La sua bussola: «Elevati, non allevati»",
      ],
      linkLabel: "Leggi il suo manifesto su Substack",
      linkHref: "https://mariomele.substack.com/p/a-scuola-con-lai-come-imparare-a",
    },
    {
      tag: "Chi ha reso possibile tutto questo",
      title: "Skills · Enzima12",
      body: "Skills, società di formazione nata in Campania, ha creduto nel progetto fin dal primo giorno e lo ha ospitato nel suo Skills Lab di Baronissi: spazi, attrezzature e un team presente in aula ogni mattinata. Dietro c'è Enzima12, il gruppo di human capital fondato da Vincenzo Vietri e Vincenzo Salvati che unisce formazione, lavoro e innovazione in tutta Italia. La convinzione condivisa: come si forma una persona è una domanda che inizia molto prima del lavoro.",
      points: [
        "Skills Lab di Baronissi: la casa delle cinque mattinate",
        "Enzima12: holding del capitale umano, fondata da Vietri e Salvati",
        "FT 1000: tra le aziende in più rapida crescita d'Europa",
      ],
      linkLabel: "Visita il sito di Enzima12",
      linkHref: "https://www.enzima12.com/",
    },
    {
      tag: "La co-docente",
      title: "Laura Galfrè",
      body: "Psicologa, formatrice di lunga esperienza ed esperta di risorse umane in Skills, Laura è stata l'altra metà dell'aula. Mentre Mario guidava i contenuti, lei leggeva il gruppo: le fatiche, i silenzi, i ragazzi che restavano indietro. In una classe con circa il 30% di ragazzi DSA ha visto concentrazione e coinvolgimento che a quell'età raramente si registrano. E ha vissuto la settimana anche da madre, con sua figlia tra i banchi.",
      points: [
        "Lo sguardo clinico sul gruppo e sull'inclusione",
        "«Una delle co-docenze più complesse della mia vita da formatrice»",
        "Psicologa ed esperta HR in Skills",
      ],
    },
  ],
}

export const footerConfig: FooterConfig = {
  ageGateText: "«Elevati, non allevati.»",
  brandName: "AISS",
  brandTaglineLines: ["Skills Lab · Enzima12", "a cura di Mario Mele", "Baronissi (SA) · 6-10 luglio 2026"],
  columns: [
    {
      heading: "In evidenza",
      links: [
        { label: "Knowledge Graph", href: `${PAGES}/AISS_knowledge_graph.html` },
        { label: "Il Dilemma del Prigioniero", href: `${ARTIFACTS}/dilemma-gioco.html` },
        { label: "Il report (PDF)", href: "/aiss/files/AI_SS_Report_Settimana.pdf" },
        { label: "Repository GitHub", href: REPO },
      ],
    },
    {
      heading: "I giochi",
      links: [
        { label: "Cipollotto", href: `${ARTIFACTS}/cipollotto-leggi-di-cipolla__1_.html` },
        { label: "T-Rex Evolution", href: `${ARTIFACTS}/trex-gallina__2_.html` },
        { label: "L'Ascesa", href: `${ARTIFACTS}/evoluzione-roguelike.html` },
        { label: "Evolvi il tuo frutto", href: `${ARTIFACTS}/gioco-evoluzione-del-frutto__1_.html` },
      ],
    },
    {
      heading: "Le esplorazioni",
      links: [
        { label: "Come cambia la vita", href: `${ARTIFACTS}/evoluzione.html` },
        { label: "Il collo della giraffa", href: `${ARTIFACTS}/giraffa_evoluzione.html` },
        { label: "Mnemo · Tavola Periodica", href: `${ARTIFACTS}/mnemo-tavola.html` },
        { label: "Voce Cosmica", href: `${ARTIFACTS}/voce-cosmica.html` },
      ],
    },
  ],
  copyright: "AI Summer School · Skills Lab · Enzima12 · a cura di Mario Mele · Artefatti pubblicati con licenza MIT.",
}
