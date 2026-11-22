import type { Lang } from "../../src/locales.ts";

// The language served at the site root. The others live under /<lang>/.
export const DEFAULT_LANG: Lang = "en";

// Interface text: everything on the page that is not CV content. CV content lives in data/.
export const UI = {
  en: {
    langName: "English",
    skip: "Skip to content",
    nav: { mission: "Missions", stats: "Stats", map: "Map", phone: "Phone" },
    level: "Senior",
    player: "Player 1",
    cta: { pdf: "Download CV", start: "Start mission" },
    sections: {
      current: ["Current mission", "In the field now"],
      missions: ["Missions", "Contract work"],
      side: ["Side missions", "And previous chapters"],
      stats: ["Player stats", "And area of operations"],
      phone: ["Phone", "Contact"],
    },
    status: "In progress",
    objectives: "Objectives",
    rewards: "Rewards",
    loadout: "Loadout",
    side: "Side mission",
    chapters: "Previous chapters",
    training: "Training",
    complete: "Complete",
    levels: { max: "Max", elite: "Elite", pro: "Pro", skilled: "Skilled" },
    map: "Area of operations",
    home: "Home base",
    contact: "Got a mission?",
    apps: { email: "Email", call: "Call", linkedin: "LinkedIn", github: "GitHub" },
    pdf: "PDF",
    footer: "Every word on this page comes from the same data files that generate the PDF.",
    source: "Source on GitHub",
    disclaimer: "Look inspired by neon sunsets and open-world game HUDs. Not affiliated with any game or studio.",
  },
  es: {
    langName: "Español",
    skip: "Saltar al contenido",
    nav: { mission: "Misiones", stats: "Stats", map: "Mapa", phone: "Teléfono" },
    level: "Senior",
    player: "Jugador 1",
    cta: { pdf: "Descargar CV", start: "Empezar misión" },
    sections: {
      current: ["Misión actual", "En el terreno ahora"],
      missions: ["Misiones", "Por contrato"],
      side: ["Misiones secundarias", "Y capítulos anteriores"],
      stats: ["Estadísticas", "Y zona de operaciones"],
      phone: ["Teléfono", "Contacto"],
    },
    status: "En curso",
    objectives: "Objetivos",
    rewards: "Recompensas",
    loadout: "Equipamiento",
    side: "Misión secundaria",
    chapters: "Capítulos anteriores",
    training: "Entrenamiento",
    complete: "Completada",
    levels: { max: "Máx", elite: "Élite", pro: "Pro", skilled: "Hábil" },
    map: "Zona de operaciones",
    home: "Base",
    contact: "¿Tienes una misión?",
    apps: { email: "Correo", call: "Llamar", linkedin: "LinkedIn", github: "GitHub" },
    pdf: "PDF",
    footer: "Cada palabra de esta página sale de los mismos archivos de datos que generan el PDF.",
    source: "Código en GitHub",
    disclaimer: "Estética inspirada en atardeceres de neón y en el HUD de los juegos de mundo abierto. Sin relación con ningún juego ni estudio.",
  },
} satisfies Record<Lang, unknown>;

export type Ui = (typeof UI)[Lang];
