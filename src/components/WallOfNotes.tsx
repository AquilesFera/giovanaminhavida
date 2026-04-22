import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Note = {
  id: string;
  user_id: string;
  text: string;
  color: string;
  created_at: string;
};

type Profile = { id: string; display_name: string; avatar_color: string };

const COLORS = ["#f5e6ea", "#f8d7e0", "#fbeacb", "#e8d4f0"];

export function WallOfNotes({
  userId,
  worldCode,
  profiles,
  onClose,
}: {
  userId: string;
  worldCode: string;
  profiles: Record<string, Profile>;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    supabase
      .from("wall_notes")
      .select("*")
      .eq("world_code", worldCode)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setNotes(data as Note[]));

    const ch = supabase
      .channel(`wall_notes:${worldCode}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_notes", filter: `world_code=eq.${worldCode}` },
        (p) => setNotes((n) => [p.new as Note, ...n])
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "wall_notes" },
        (p) => setNotes((n) => n.filter((x) => x.id !== (p.old as Note).id))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [worldCode]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim().slice(0, 200);
    if (!t) return;
    setText("");
    await supabase.from("wall_notes").insert({ user_id: userId, text: t, color, world_code: worldCode });
  }

  async function remove(id: string) {
    await supabase.from("wall_notes").delete().eq("id", id);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: "oklch(0.1 0.03 10 / 0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border p-5"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "oklch(0.22 0.06 10 / 0.95)",
          borderColor: "oklch(0.78 0.13 85 / 0.3)",
          maxHeight: "85vh",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-2xl"
            style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
          >
            Mural de recadinhos 📝
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm"
            style={{ color: "oklch(0.78 0.13 85)" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={add} className="mb-4 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Escreva algo lindo pra ela/ele encontrar..."
            className="w-full resize-none rounded-md border bg-[oklch(0.18_0.04_10)] p-2 text-sm outline-none"
            style={{
              borderColor: "oklch(0.5 0.1 5 / 0.4)",
              color: "oklch(0.95 0.02 15)",
              fontFamily: "var(--font-body)",
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-full border-2"
                  style={{
                    background: c,
                    borderColor: color === c ? "oklch(0.78 0.13 85)" : "transparent",
                  }}
                />
              ))}
            </div>
            <button
              type="submit"
              className="rounded-full px-4 py-1.5 text-xs tracking-widest"
              style={{
                background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
                color: "oklch(0.98 0.01 15)",
                fontFamily: "var(--font-heading)",
              }}
            >
              FIXAR
            </button>
          </div>
        </form>

        <div
          className="grid gap-3 overflow-y-auto pr-1"
          style={{ maxHeight: "55vh", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {notes.map((n) => {
            const author = profiles[n.user_id];
            return (
              <div
                key={n.id}
                className="relative rounded-md p-3 text-sm shadow-md"
                style={{
                  background: n.color,
                  color: "#3a1520",
                  fontFamily: "var(--font-body)",
                  transform: `rotate(${((n.id.charCodeAt(0) % 5) - 2) * 0.8}deg)`,
                }}
              >
                <p className="whitespace-pre-wrap break-words">{n.text}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider opacity-60">
                  <span>— {author?.display_name ?? "?"}</span>
                  {n.user_id === userId && (
                    <button onClick={() => remove(n.id)} className="opacity-60 hover:opacity-100">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {notes.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm opacity-60" style={{ color: "oklch(0.95 0.02 15)" }}>
              Nenhum recadinho ainda... seja o primeiro 💕
            </p>
          )}
        </div>
      </div>
    </div>
  );
}