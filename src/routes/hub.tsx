import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Petals } from "@/components/Petals";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Nosso Mundinho 🌹" },
      { name: "description", content: "Escolha onde quer ir." },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) return null;

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
          {/* Site dela */}
          <HubCard
            emoji="💌"
            title="Site dela"
            subtitle="O cantinho dela na internet"
            disabled={!siteUrl}
            onClick={() => siteUrl && window.open(siteUrl, "_blank", "noopener,noreferrer")}
            footer={
              editingUrl ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-md bg-[oklch(0.15_0.03_10)] px-2 py-1 text-xs outline-none"
                    style={{ color: "oklch(0.95 0.02 15)", border: "1px solid oklch(0.5 0.1 5 / 0.4)" }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveUrl();
                    }}
                    className="rounded-md px-2 py-1 text-[10px] tracking-widest"
                    style={{ background: "oklch(0.58 0.14 5)", color: "white" }}
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingUrl(true);
                  }}
                  className="text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100"
                  style={{ color: "oklch(0.78 0.13 85)" }}
                >
                  {siteUrl ? "✎ trocar link" : "✎ adicionar link"}
                </button>
              )
            }
          />

          {/* Jogo */}
          <Link
            to="/game"
            className="group block rounded-2xl border p-6 text-left transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(145deg, oklch(0.32 0.11 13 / 0.85), oklch(0.18 0.05 10 / 0.95))",
              borderColor: "oklch(0.78 0.13 85 / 0.35)",
              boxShadow: "0 20px 50px -15px oklch(0.1 0.03 10), inset 0 1px 0 oklch(0.78 0.13 85 / 0.2)",
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
              Entre no nosso jardim, cuide do nosso pet, faça missões e descubra nossa história 💕
            </p>
            <div
              className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-heading)", color: "oklch(0.78 0.13 85)" }}
            >
              ENTRAR →
            </div>
          </Link>
        </div>

        <button
          onClick={() => signOut().then(() => nav({ to: "/login" }))}
          className="mt-10 text-xs underline-offset-4 hover:underline"
          style={{ color: "oklch(0.78 0.13 85 / 0.7)" }}
        >
          sair da conta
        </button>
      </div>
    </div>
  );
}

function HubCard({
  emoji,
  title,
  subtitle,
  disabled,
  onClick,
  footer,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`group flex flex-col justify-between rounded-2xl border p-6 text-left transition-all ${
        disabled ? "opacity-70" : "cursor-pointer hover:scale-[1.03]"
      }`}
      style={{
        background: "linear-gradient(145deg, oklch(0.32 0.11 13 / 0.85), oklch(0.18 0.05 10 / 0.95))",
        borderColor: "oklch(0.78 0.13 85 / 0.35)",
        boxShadow: "0 20px 50px -15px oklch(0.1 0.03 10), inset 0 1px 0 oklch(0.78 0.13 85 / 0.2)",
      }}
    >
      <div>
        <div className="mb-3 text-5xl">{emoji}</div>
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
        >
          {title}
        </h2>
        <p className="mt-1 text-sm opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
          {subtitle}
        </p>
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}