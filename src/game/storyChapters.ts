export type Chapter = {
  id: number;
  title: string;
  emoji: string;
  unlockMissionId: string | null; // mission that unlocks NEXT chapter
  paragraphs: string[];
};

// Você pode editar esses textos pra contar a história REAL de vocês.
// Cada capítulo é desbloqueado completando a missão indicada no anterior.
export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "O começo de tudo",
    emoji: "✨",
    unlockMissionId: "find_roses",
    paragraphs: [
      "Antes de existir esse mundinho, existia só a vontade de te ter por perto.",
      "Esse jardim foi feito pra ser nosso. Cada rosa que cai, cada pétala no vento, é um pedacinho do que sinto por você.",
      "Pra desbloquear o próximo capítulo, vamos juntos colher 5 rosas escondidas pelo jardim. 🌹",
    ],
  },
  {
    id: 2,
    title: "Quando te vi pela primeira vez",
    emoji: "👀",
    unlockMissionId: "hold_hands_long",
    paragraphs: [
      "Tem dias que a gente lembra pra sempre. O dia que te vi foi um deles.",
      "O mundo ficou mais devagar, e eu sabia, do nada, que ia te querer por muito tempo.",
      "Pra abrir o próximo capítulo, fiquem de mãos dadas por 30 segundos seguidos. 💕",
    ],
  },
  {
    id: 3,
    title: "Nosso bichinho",
    emoji: "🐰",
    unlockMissionId: "feed_pet",
    paragraphs: [
      "Toda história de amor merece uma testemunha fofa. A nossa é a Mel, nosso coelhinho.",
      "Cuida dela com carinho, igual a gente cuida do que sente um pelo outro.",
      "Pra abrir o próximo capítulo, alimente a Mel 3 vezes. 🥕",
    ],
  },
  {
    id: 4,
    title: "Promessas no escuro",
    emoji: "🌙",
    unlockMissionId: "kiss_count",
    paragraphs: [
      "Eu prometo te ouvir, mesmo quando você não souber o que dizer.",
      "Prometo te abraçar, mesmo quando o mundo tá pesado.",
      "Prometo te escolher, todo dia, mesmo nos dias difíceis.",
      "Pra abrir o próximo capítulo, deem 5 beijinhos um no outro. 💋",
    ],
  },
  {
    id: 5,
    title: "O que vem agora",
    emoji: "🌹",
    unlockMissionId: null,
    paragraphs: [
      "Esse capítulo ainda tá sendo escrito — todo dia que a gente acorda, ele ganha uma linha nova.",
      "Eu não sei tudo o que vem, mas sei que quero ver com você.",
      "Obrigado por existir do jeito que você existe. Você é meu mundinho. 💍",
    ],
  },
];

export type Mission = {
  id: string;
  title: string;
  description: string;
  goal: number;
  emoji: string;
};

export const MISSIONS: Mission[] = [
  { id: "find_roses", title: "Caça às rosas", description: "Encontrem 5 rosas escondidas pelo mapa", goal: 5, emoji: "🌹" },
  { id: "hold_hands_long", title: "Mãos dadas", description: "Fiquem 30 segundos de mãos dadas", goal: 30, emoji: "💕" },
  { id: "feed_pet", title: "Cuidando da Mel", description: "Alimente a Mel 3 vezes", goal: 3, emoji: "🥕" },
  { id: "kiss_count", title: "Beijinhos", description: "Deem 5 beijinhos um no outro", goal: 5, emoji: "💋" },
  { id: "light_bonfire", title: "Fogueira na praia", description: "Acendam a fogueira na Praia da Lua", goal: 1, emoji: "🔥" },
  { id: "find_letter", title: "Carta escondida", description: "Achem a carta romântica na Casinha", goal: 1, emoji: "💌" },
];