import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function DayCounter() {
  const [date, setDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    supabase
      .from("couple_meta")
      .select("anniversary_date")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.anniversary_date) setDate(data.anniversary_date);
      });
  }, []);

  const days = date ? Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)) : null;

  async function save(newDate: string) {
    setDate(newDate);
    setEditing(false);
    await supabase.from("couple_meta").update({ anniversary_date: newDate }).eq("id", 1);
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-3 py-1"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        backdropFilter: "blur(6px)",
      }}
    >
      <span className="text-base">💞</span>
      {editing ? (
        <input
          type="date"
          defaultValue={date ?? ""}
          onBlur={(e) => e.target.value && save(e.target.value)}
          autoFocus
          className="bg-transparent text-xs outline-none"
          style={{ color: "oklch(0.95 0.02 15)" }}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-heading)", color: "oklch(0.95 0.02 15)" }}
          title="Clique para mudar a data"
        >
          {days === null ? "..." : `${days} ${days === 1 ? "dia" : "dias"} juntos`}
        </button>
      )}
    </div>
  );
}