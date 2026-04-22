import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Petals } from "@/components/Petals";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Mundinho do Casal 🌹" },
      { name: "description", content: "Entre no nosso mundinho." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/" });
  }, [user, loading, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const res =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, name || "Amor");
    setBusy(false);
    if (res.error) setErr(res.error);
    else nav({ to: "/" });
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.32 0.11 13) 0%, oklch(0.15 0.04 10) 70%)",
      }}
    >
      <Petals />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border p-8 shadow-2xl"
        style={{
          background: "rgba(28,12,18,0.85)",
          borderColor: "oklch(0.5 0.1 5 / 0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 30px 80px -20px oklch(0.15 0.05 10), 0 0 0 1px oklch(0.78 0.13 85 / 0.15)",
        }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 text-5xl"
            style={{ filter: "drop-shadow(0 4px 12px oklch(0.4 0.15 5))" }}
          >
            🌹
          </div>
          <h1
            className="text-3xl tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
          >
            Mundinho do Casal
          </h1>
          <p
            className="mt-2 text-xs uppercase tracking-[0.3em]"
            style={{ fontFamily: "var(--font-heading)", color: "oklch(0.78 0.13 85)" }}
          >
            só nós dois
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field
              label="Como quer ser chamado(a)"
              value={name}
              onChange={setName}
              placeholder="Ex: Gi"
              required
            />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          <Field
            label="Senha"
            value={password}
            onChange={setPassword}
            type="password"
            required
            minLength={6}
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
            disabled={busy}
            className="w-full rounded-full py-3 font-medium tracking-wide transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
              color: "oklch(0.98 0.01 15)",
              fontFamily: "var(--font-heading)",
              letterSpacing: "0.15em",
              fontSize: "0.85rem",
              boxShadow: "0 8px 24px -8px oklch(0.4 0.15 5), inset 0 1px 0 oklch(0.78 0.13 85 / 0.3)",
            }}
          >
            {busy ? "..." : mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
          }}
          className="mt-5 w-full text-center text-xs underline-offset-4 hover:underline"
          style={{ color: "oklch(0.78 0.13 85)" }}
        >
          {mode === "signin"
            ? "Primeira vez aqui? Criar nossa conta →"
            : "← Já tenho conta"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-[11px] uppercase tracking-[0.2em]"
        style={{ color: "oklch(0.78 0.13 85)", fontFamily: "var(--font-heading)" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[oklch(0.78_0.13_85)]"
        style={{
          borderColor: "oklch(0.4 0.08 10 / 0.5)",
          color: "oklch(0.95 0.02 15)",
          fontFamily: "var(--font-body)",
        }}
      />
    </label>
  );
}