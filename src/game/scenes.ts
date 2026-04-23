import gardenBg from "@/assets/world-map.jpg";
import beachBg from "@/assets/beach-map.jpg";
import houseBg from "@/assets/house-map.jpg";

export type SceneId = "garden" | "beach" | "house";

export type Portal = {
  x: number;
  y: number;
  to: SceneId;
  spawnX: number;
  spawnY: number;
  label: string;
  emoji: string;
};

export type AlbumPhoto = {
  id: string;
  x: number;
  y: number;
  url: string;
  caption: string;
};

export type CollectibleSpot = { id: string; x: number; y: number };

export type SceneDef = {
  id: SceneId;
  name: string;
  width: number;
  height: number;
  bg: string;
  spawn: { x: number; y: number };
  portals: Portal[];
  hiddenRoses?: { id: string; x: number; y: number }[];
  bonfire?: { x: number; y: number };
  hiddenLetter?: { x: number; y: number };
  /** Fotos do nosso álbum espalhadas pelo cenário */
  albumPhotos?: AlbumPhoto[];
  /** Cervejas pra brindar no Major */
  beers?: CollectibleSpot[];
  /** Pipocas escondidas no cinema */
  popcorns?: CollectibleSpot[];
  /** Poltrona do cinema (fica de mãos dadas pra completar a sessão) */
  cinemaSeat?: { x: number; y: number };
};

const PHOTO = (name: string) =>
  `https://giovanalimaminhavida.netlify.app/fotos/${name}`;

export const SCENES: Record<SceneId, SceneDef> = {
  garden: {
    id: "garden",
    name: "Festa das Nações 🎉",
    width: 2400,
    height: 1600,
    bg: gardenBg,
    spawn: { x: 1200, y: 800 },
    portals: [
      { x: 2300, y: 800, to: "beach", spawnX: 120, spawnY: 600, label: "Major Bar", emoji: "🍺" },
      { x: 100, y: 800, to: "house", spawnX: 1400, spawnY: 1100, label: "Cinema", emoji: "🎬" },
    ],
    hiddenRoses: [
      { id: "r1", x: 420, y: 380 },
      { id: "r2", x: 1850, y: 520 },
      { id: "r3", x: 1100, y: 1100 },
      { id: "r4", x: 380, y: 1280 },
      { id: "r5", x: 2050, y: 1300 },
    ],
    albumPhotos: [
      { id: "a1", x: 700, y: 600, url: PHOTO("hero-amor-2.jpeg"), caption: "11/10/25 — a noite que mudou tudo 🎉" },
      { id: "a2", x: 1700, y: 1000, url: PHOTO("amor-1.jpeg"), caption: "nosso primeiro encontro de verdade 💫" },
    ],
  },
  beach: {
    id: "beach",
    name: "Major Bar — Americana 🍺",
    width: 1920,
    height: 1280,
    bg: beachBg,
    spawn: { x: 960, y: 700 },
    portals: [
      { x: 60, y: 600, to: "garden", spawnX: 2250, spawnY: 800, label: "Festa", emoji: "🎉" },
    ],
    bonfire: { x: 1300, y: 850 },
    beers: [
      { id: "b1", x: 500, y: 500 },
      { id: "b2", x: 1100, y: 400 },
      { id: "b3", x: 1600, y: 700 },
    ],
    albumPhotos: [
      { id: "a3", x: 800, y: 350, url: PHOTO("mor-2.jpg"), caption: "10/10/25 — Major, onde tudo começou 🍻" },
      { id: "a4", x: 1450, y: 1050, url: PHOTO("mor-10.jpg"), caption: "a prima junto kkk — mas valeu cada segundo" },
    ],
  },
  house: {
    id: "house",
    name: "Cinema — Invocação do Mal 4 🎬",
    width: 1600,
    height: 1280,
    bg: houseBg,
    spawn: { x: 800, y: 700 },
    portals: [
      { x: 1500, y: 1100, to: "garden", spawnX: 150, spawnY: 800, label: "Festa", emoji: "🎉" },
    ],
    hiddenLetter: { x: 420, y: 480 },
    cinemaSeat: { x: 800, y: 900 },
    popcorns: [
      { id: "p1", x: 300, y: 350 },
      { id: "p2", x: 1250, y: 400 },
      { id: "p3", x: 600, y: 1100 },
    ],
    albumPhotos: [
      { id: "a5", x: 1100, y: 700, url: PHOTO("mor-11.jpg"), caption: "18/10/25 — nosso 1º cinema 🍿" },
      { id: "a6", x: 350, y: 1000, url: PHOTO("hero-amor-3.jpeg"), caption: "06/01/26 — você disse SIM 💍" },
    ],
  },
};