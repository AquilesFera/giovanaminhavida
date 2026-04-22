import { createFileRoute, Link } from "@tanstack/react-router";
import { Petals } from "@/components/Petals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nosso Mundinho 🌹" },
      { name: "description", content: "Nosso jardim secreto, só pra nós dois." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.32 0.11 13) 0%, oklch(0.13 0.04 10) 70%)",
      }}
    >
      <Petals />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div
          className="mx-auto mb-2 text-6xl"
          style={{ filter: "drop-shadow(0 6px 18px oklch(0.4 0.15 5))" }}
        >
          🌹
        </div>
        <h1
          className="text-4xl tracking-wide md:text-5xl"
          style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
        >
          Nosso Mundinho
        </h1>
        <p
          className="mt-2 text-xs uppercase tracking-[0.4em]"
          style={{ fontFamily: "var(--font-heading)", color: "oklch(0.78 0.13 85)" }}
        >
          aonde você quer ir agora?
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            to="/site"
            className="group block rounded-2xl border p-6 text-left transition-all hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.32 0.11 13 / 0.85), oklch(0.18 0.05 10 / 0.95))",
              borderColor: "oklch(0.78 0.13 85 / 0.35)",
              boxShadow:
                "0 20px 50px -15px oklch(0.1 0.03 10), inset 0 1px 0 oklch(0.78 0.13 85 / 0.2)",
            }}
          >
            <div className="mb-3 text-5xl">💌</div>
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
            >
              Site da Giovana
            </h2>
            <p className="mt-1 text-sm opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
              Nossa história, fotos, cartas, músicas, quiz e jogo da memória 🌹
            </p>
            <div
              className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-heading)", color: "oklch(0.78 0.13 85)" }}
            >
              ABRIR →
            </div>
          </Link>

          <Link
            to="/play"
            className="group block rounded-2xl border p-6 text-left transition-all hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.32 0.11 13 / 0.85), oklch(0.18 0.05 10 / 0.95))",
              borderColor: "oklch(0.78 0.13 85 / 0.35)",
              boxShadow:
                "0 20px 50px -15px oklch(0.1 0.03 10), inset 0 1px 0 oklch(0.78 0.13 85 / 0.2)",
            }}
          >
            <div className="mb-3 text-5xl">🎮</div>
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
            >
              Mundinho do Casal
            </h2>
            <p className="mt-1 text-sm opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
              Crie um mundo ou entre com o código do mundo do seu amor 💕
            </p>
            <div
              className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-heading)", color: "oklch(0.78 0.13 85)" }}
            >
              JOGAR →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
