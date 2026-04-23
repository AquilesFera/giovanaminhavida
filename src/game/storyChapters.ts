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
    title: "O começo de tudo — Outubro/25",
    emoji: "✨",
    unlockMissionId: "major_brindes",
    paragraphs: [
      "Outubro de 2025. A gente começou a conversar e, sem perceber, já estava se tratando diferente do resto.",
      "Um carinho meu te fez arrepiar — algo que você nunca tinha sentido. Ali eu já sabia que ia te querer perto.",
      "Pra abrir o próximo capítulo, vai até o Major Bar e brinda 3 cervejas comigo. 🍺",
    ],
  },
  {
    id: 2,
    title: "Major Bar — Americana 🍺",
    emoji: "🍻",
    unlockMissionId: "festa_nacoes",
    paragraphs: [
      "10/10/25 — nosso primeiro encontro foi no Major. Sua prima foi junto, e eu nem liguei.",
      "Foi o aviso de que tudo ali estava só começando.",
      "Pra abrir o próximo capítulo, encontre as 5 lembranças escondidas na Festa das Nações. ✨",
    ],
  },
  {
    id: 3,
    title: "Festa das Nações — 11/10/25",
    emoji: "🎉",
    unlockMissionId: "cinema_pipocas",
    paragraphs: [
      "Pra mim, esse foi o nosso primeiro encontro de verdade. Em Nova Odessa, no meio da festa.",
      "Foi a noite que ficou gravada. A noite em que tudo virou nosso.",
      "Pra abrir o próximo capítulo, vai pro Cinema e ache as pipocas escondidas. 🍿",
    ],
  },
  {
    id: 4,
    title: "Cinema — Invocação 4 🎬",
    emoji: "🍿",
    unlockMissionId: "album_secreto",
    paragraphs: [
      "18/10/25 — nosso primeiro filme juntos. Invocação do Mal 4, de mãos dadas no escuro.",
      "Foi o começo da nossa lista de cinema, das maratonas de Velozes, do UCM em ordem cronológica.",
      "Pra abrir o último capítulo, encontre as 6 fotos do nosso álbum espalhadas pelos cenários. 📸",
    ],
  },
  {
    id: 5,
    title: "Para sempre 💍",
    emoji: "🌹",
    unlockMissionId: null,
    paragraphs: [
      "06/01/26 — 92 dias depois do primeiro beijo, te pedi em namoro na sua casa. E você disse sim.",
      "Depois veio sua festa de 17, Santana da Vargem, o sítio, o zoológico, o Tortelle… e o que ainda vem.",
      "Esse capítulo continua todo dia. Obrigado por existir do jeito que você existe. Você é meu mundinho. 💍",
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
  { id: "major_brindes", title: "Brinde no Major", description: "Brinde 3 cervejas no Major Bar", goal: 3, emoji: "🍺" },
  { id: "festa_nacoes", title: "Festa das Nações", description: "Ache as 5 lembranças da festa de 11/10", goal: 5, emoji: "✨" },
  { id: "cinema_pipocas", title: "Sessão de cinema", description: "Pegue as 3 pipocas no cinema", goal: 3, emoji: "🍿" },
  { id: "album_secreto", title: "Nosso álbum", description: "Encontre as 6 fotos escondidas pelos cenários", goal: 6, emoji: "📸" },
  { id: "hold_hands_long", title: "Mãos dadas", description: "Fiquem 30 segundos de mãos dadas", goal: 30, emoji: "💕" },
  { id: "feed_pet", title: "Cuidando da Mel", description: "Alimente a Mel 3 vezes", goal: 3, emoji: "🥕" },
  { id: "kiss_count", title: "Beijinhos", description: "Deem 5 beijinhos um no outro", goal: 5, emoji: "💋" },
  { id: "light_bonfire", title: "Fogueira", description: "Acenda a fogueira do bar", goal: 1, emoji: "🔥" },
  { id: "find_letter", title: "Carta escondida", description: "Ache a carta romântica no cinema", goal: 1, emoji: "💌" },
];