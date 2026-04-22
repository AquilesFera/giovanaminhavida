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
};

export const SCENES: Record<SceneId, SceneDef> = {
  garden: {
    id: "garden",
    name: "Jardim das Rosas",
    width: 2400,
    height: 1600,
    bg: gardenBg,
    spawn: { x: 1200, y: 800 },
    portals: [
      { x: 2300, y: 800, to: "beach", spawnX: 120, spawnY: 600, label: "Praia", emoji: "🌊" },
      { x: 100, y: 800, to: "house", spawnX: 1400, spawnY: 1100, label: "Casinha", emoji: "🏠" },
    ],
    hiddenRoses: [
      { id: "r1", x: 420, y: 380 },
      { id: "r2", x: 1850, y: 520 },
      { id: "r3", x: 1100, y: 1100 },
      { id: "r4", x: 380, y: 1280 },
      { id: "r5", x: 2050, y: 1300 },
    ],
  },
  beach: {
    id: "beach",
    name: "Praia da Lua",
    width: 1920,
    height: 1280,
    bg: beachBg,
    spawn: { x: 960, y: 700 },
    portals: [
      { x: 60, y: 600, to: "garden", spawnX: 2250, spawnY: 800, label: "Jardim", emoji: "🌹" },
    ],
    bonfire: { x: 1300, y: 850 },
  },
  house: {
    id: "house",
    name: "Nossa Casinha",
    width: 1600,
    height: 1280,
    bg: houseBg,
    spawn: { x: 800, y: 700 },
    portals: [
      { x: 1500, y: 1100, to: "garden", spawnX: 150, spawnY: 800, label: "Jardim", emoji: "🌹" },
    ],
    hiddenLetter: { x: 420, y: 480 },
  },
};