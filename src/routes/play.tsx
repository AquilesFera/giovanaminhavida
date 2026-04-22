import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Petals } from "@/components/Petals";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { generateWorldCode, setWorldCode, useWorldCode, clearWorldCode } from "@/lib/world";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Entrar no Mundinho 🎮" },
      { name: "description", content: "Crie um mundo ou entre com um código." },
    ],
  }),
  component: PlayPage,
});

type Mode = "menu" | "create" | "join";

function PlayPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const currentCode = useWorldCode();
  const [mode, setMode] = useState<Mode>("menu");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  if (loading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "oklch(0.13 0.04 10)" }}
      >
        <div className="text-4xl">🌹</div>
      </div>
    );
  }

  async function createWorld() {
    if (!user) return;
    setBusy(true);
    setErr(null);
    // Try a few times in case of unlikely collision
    for (let i = 0; i < 5; i++) {
      const c = generateWorldCode();
      const { error } = await supabase
        .from("worlds")
        .insert({ code: c, created_by: user.id });
      if (!error) {
        setCreatedCode(c);
        setWorldCode(c);
        setBusy(false);
        return;
      }
      if (!error.message.includes("duplicate")) {
        setErr(error.message);
        setBusy(false);
        return;
      }
    }
    setErr("Não conseguimos gerar um código único. Tenta de novo.");
    setBusy(false);
  }

  async function joinWorld(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmed = code.trim();
    if (!/^[1-6]{6}$/.test(trimmed)) {
      setErr("O código deve ter 6 números de 1 a 6.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("worlds")
      .select("code")
      .eq("code", trimmed)
      .maybeSingle();
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (!data) {
      setErr("Esse mundo não existe. Confere o código com seu amor 💕");
      return;
    }
    setWorldCode(trimmed);
    nav({ to: "/game" });
  }

  function leaveWorld() {
    clearWorldCode();
    setMode("menu");
    setCreatedCode(null);
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.32 0.11 13) 0%, oklch(0.13 0.04 10) 70%)",
      }}
    >
      <Petals />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.3em] opacity-70 hover:opacity-100"
            style={{ color: "oklch(0.78 0.13 85)", fontFamily: "var(--font-heading)" }}
          >
            ← voltar
          </Link>
          <div className="mt-3 text-5xl">🎮</div>
          <h1
            className="mt-2 text-3xl tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
          >
            Mundinho do Casal
          </h1>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{
            background: "rgba(28,12,18,0.85)",
            borderColor: "oklch(0.5 0.1 5 / 0.4)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 30px 80px -20px oklch(0.15 0.05 10)",
          }}
        >
          {createdCode ? (
            <CreatedView
              code={createdCode}
              onEnter={() => nav({ to: "/game" })}
              onCancel={leaveWorld}
            />
          ) : mode === "menu" ? (
            <MenuView
              currentCode={currentCode}
              onCreate={() => setMode("create")}
              onJoin={() => setMode("join")}
              onContinue={() => nav({ to: "/game" })}
              onLeave={leaveWorld}
            />
          ) : mode === "create" ? (
            <CreateConfirmView busy={busy} onConfirm={createWorld} onBack={() => setMode("menu")} />
          ) : (
            <JoinView
              code={code}
              setCode={setCode}
              busy={busy}
              err={err}
              onSubmit={joinWorld}
              onBack={() => {
                setMode("menu");
                setErr(null);
                setCode("");
              }}
            />
          )}

          {err && mode !== "join" && (
            <div
              className="mt-3 rounded-md border px-3 py-2 text-sm"
              style={{
                background: "oklch(0.3 0.1 25 / 0.3)",
                borderColor: "oklch(0.5 0.2 25 / 0.4)",
                color: "oklch(0.85 0.1 25)",
              }}
            >
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuView({
  currentCode,
  onCreate,
  onJoin,
  onContinue,
  onLeave,
}: {
  currentCode: string | null;
  onCreate: () => void;
  onJoin: () => void;
  onContinue: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-3">
      {currentCode && (
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            background: "oklch(0.4 0.15 145 / 0.15)",
            borderColor: "oklch(0.6 0.18 145 / 0.4)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "oklch(0.85 0.18 145)", fontFamily: "var(--font-heading)" }}
          >
            Você já está em um mundo
          </div>
          <div
            className="mt-1 text-2xl tracking-[0.4em]"
            style={{ color: "oklch(0.95 0.02 15)", fontFamily: "var(--font-display)" }}
          >
            {currentCode}
          </div>
          <button
            onClick={onContinue}
            className="mt-3 w-full rounded-full py-2 text-xs tracking-widest"
            style={{
              background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
              color: "oklch(0.98 0.01 15)",
              fontFamily: "var(--font-heading)",
              letterSpacing: "0.15em",
            }}
          >
            CONTINUAR JOGANDO →
          </button>
          <button
            onClick={onLeave}
            className="mt-2 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100"
            style={{ color: "oklch(0.78 0.13 85)" }}
          >
            sair desse mundo
          </button>
        </div>
      )}

      <BigBtn
        emoji="✨"
        title="Criar um mundo novo"
        sub="Gera um código pra compartilhar com seu amor"
        onClick={onCreate}
      />
      <BigBtn
        emoji="🔑"
        title="Entrar com código"
        sub="Use o código que seu amor te mandou"
        onClick={onJoin}
      />
    </div>
  );
}

function CreateConfirmView({
  busy,
  onConfirm,
  onBack,
}: {
  busy: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-4xl">✨</div>
      <h2
        className="text-xl"
        style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
      >
        Criar um mundo novo
      </h2>
      <p className="text-sm opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
        Vamos gerar um código de 6 números pra você compartilhar com seu amor.
        Quem tiver o código entra no mesmo mundinho 💕
      </p>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="w-full rounded-full py-3 text-xs tracking-widest disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
          color: "oklch(0.98 0.01 15)",
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.2em",
        }}
      >
        {busy ? "..." : "GERAR CÓDIGO"}
      </button>
      <button
        onClick={onBack}
        className="text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100"
        style={{ color: "oklch(0.78 0.13 85)" }}
      >
        ← voltar
      </button>
    </div>
  );
}

function CreatedView({
  code,
  onEnter,
  onCancel,
}: {
  code: string;
  onEnter: () => void;
  onCancel: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🌹</div>
      <h2
        className="text-xl"
        style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
      >
        Seu mundo foi criado!
      </h2>
      <p className="text-xs opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
        Compartilhe esse código com seu amor pra ele(a) entrar:
      </p>
      <div
        className="mx-auto inline-block rounded-xl border px-6 py-4 text-3xl tracking-[0.5em]"
        style={{
          background: "oklch(0.18 0.05 10)",
          borderColor: "oklch(0.78 0.13 85 / 0.5)",
          color: "oklch(0.95 0.02 15)",
          fontFamily: "var(--font-display)",
          boxShadow: "inset 0 1px 0 oklch(0.78 0.13 85 / 0.2)",
        }}
      >
        {code}
      </div>
      <button
        onClick={copy}
        className="block w-full text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100"
        style={{ color: "oklch(0.78 0.13 85)" }}
      >
        {copied ? "✓ copiado!" : "📋 copiar código"}
      </button>
      <button
        onClick={onEnter}
        className="w-full rounded-full py-3 text-xs tracking-widest"
        style={{
          background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
          color: "oklch(0.98 0.01 15)",
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.2em",
        }}
      >
        ENTRAR NO MUNDO →
      </button>
      <button
        onClick={onCancel}
        className="text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100"
        style={{ color: "oklch(0.78 0.13 85)" }}
      >
        cancelar
      </button>
    </div>
  );
}

function JoinView({
  code,
  setCode,
  busy,
  err,
  onSubmit,
  onBack,
}: {
  code: string;
  setCode: (v: string) => void;
  busy: boolean;
  err: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-center">
      <div className="text-4xl">🔑</div>
      <h2
        className="text-xl"
        style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
      >
        Entrar com código
      </h2>
      <p className="text-xs opacity-80" style={{ color: "oklch(0.85 0.04 15)" }}>
        Digite os 6 números que seu amor te mandou:
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^1-6]/g, "").slice(0, 6))}
        inputMode="numeric"
        autoFocus
        placeholder="••••••"
        className="w-full rounded-xl border bg-transparent px-3 py-4 text-center text-3xl tracking-[0.5em] outline-none"
        style={{
          borderColor: "oklch(0.5 0.1 5 / 0.5)",
          color: "oklch(0.95 0.02 15)",
          fontFamily: "var(--font-display)",
        }}
      />
      {err && (
        <div
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            background: "oklch(0.3 0.1 25 / 0.3)",
            borderColor: "oklch(0.5 0.2 25 / 0.4)",
            color: "oklch(0.85 0.1 25)",
          }}
        >
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        className="w-full rounded-full py-3 text-xs tracking-widest disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
          color: "oklch(0.98 0.01 15)",
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.2em",
        }}
      >
        {busy ? "..." : "ENTRAR"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100"
        style={{ color: "oklch(0.78 0.13 85)" }}
      >
        ← voltar
      </button>
    </form>
  );
}

function BigBtn({
  emoji,
  title,
  sub,
  onClick,
}: {
  emoji: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
      style={{
        background: "linear-gradient(145deg, oklch(0.28 0.09 13 / 0.7), oklch(0.18 0.05 10 / 0.9))",
        borderColor: "oklch(0.78 0.13 85 / 0.3)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <div
            className="text-base"
            style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
          >
            {title}
          </div>
          <div className="text-xs opacity-70" style={{ color: "oklch(0.85 0.04 15)" }}>
            {sub}
          </div>
        </div>
      </div>
    </button>
  );
}