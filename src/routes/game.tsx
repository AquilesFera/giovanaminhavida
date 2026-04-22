import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GameScene } from "@/game/GameScene";
import { useWorldCode } from "@/lib/world";

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
  const worldCode = useWorldCode();
  const nav = useNavigate();
  useEffect(() => {
    if (!worldCode) nav({ to: "/play" });
  }, [worldCode, nav]);
  if (!worldCode) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "oklch(0.13 0.04 10)" }}
      >
        <div className="text-4xl">🌹</div>
      </div>
    );
  }
  return <GameScene worldCode={worldCode} />;
}