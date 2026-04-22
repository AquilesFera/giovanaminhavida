import { createFileRoute } from "@tanstack/react-router";
import { GameScene } from "@/game/GameScene";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Jogo — Mundinho do Casal 🌹" },
      { name: "description", content: "Nosso jardim 2D em tempo real." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  return <GameScene />;
}