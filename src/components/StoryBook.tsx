import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CHAPTERS, MISSIONS } from "@/game/storyChapters";

type StoryRow = { chapter_id: number; unlocked: boolean };
type MissionRow = { mission_id: string; progress: number; completed: boolean };

export function StoryBook({ worldCode, onClose }: { worldCode: string; onClose: () => void }) {
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([1]));
  const [missions, setMissions] = useState<Record<string, MissionRow>>({});
  const [active, setActive] = useState(1);

  useEffect(() => {
    Promise.all([
      supabase.from("story_progress").select("*").eq("world_code", worldCode),
      supabase.from("missions_progress").select("*").eq("world_code", worldCode),
    ]).then(([s, m]) => {
      if (s.data) setUnlocked(new Set((s.data as StoryRow[]).filter((r) => r.unlocked).map((r) => r.chapter_id)));
      if (m.data) setMissions(Object.fromEntries((m.data as MissionRow[]).map((r) => [r.mission_id, r])));
    });
  }, [worldCode]);

  const chapter = CHAPTERS.find((c) => c.id === active)!;
  const isUnlocked = unlocked.has(chapter.id);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-3 py-6"
      style={{ background: "oklch(0.08 0.03 10 / 0.9)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative grid w-full max-w-3xl gap-0 overflow-hidden rounded-2xl border md:grid-cols-[200px_1fr]"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, oklch(0.25 0.07 12), oklch(0.15 0.04 10))",
          borderColor: "oklch(0.78 0.13 85 / 0.35)",
          maxHeight: "85vh",
        }}
      >
        {/* Chapter list */}
        <div
          className="border-b p-3 md:border-b-0 md:border-r"
          style={{ borderColor: "oklch(0.78 0.13 85 / 0.2)" }}
        >
          <h3
            className="mb-2 text-xs uppercase tracking-[0.3em]"
            style={{ color: "oklch(0.78 0.13 85)", fontFamily: "var(--font-heading)" }}
          >
            Nossa história
          </h3>
          <div className="flex gap-1.5 overflow-x-auto md:flex-col md:gap-1">
            {CHAPTERS.map((c) => {
              const u = unlocked.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                  style={{
                    background: active === c.id ? "oklch(0.58 0.14 5 / 0.3)" : "transparent",
                    color: u ? "oklch(0.95 0.02 15)" : "oklch(0.6 0.04 15 / 0.6)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span>{u ? c.emoji : "🔒"}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter content */}
        <div className="overflow-y-auto p-5" style={{ maxHeight: "85vh" }}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-sm"
            style={{ color: "oklch(0.78 0.13 85)" }}
          >
            ✕
          </button>

          {isUnlocked ? (
            <>
              <div className="mb-2 text-4xl">{chapter.emoji}</div>
              <h2
                className="mb-4 text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "oklch(0.95 0.02 15)" }}
              >
                Capítulo {chapter.id} — {chapter.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "oklch(0.9 0.03 15)" }}>
                {chapter.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {chapter.unlockMissionId && !unlocked.has(chapter.id + 1) && (
                <MissionProgress
                  missionId={chapter.unlockMissionId}
                  data={missions[chapter.unlockMissionId]}
                />
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 text-5xl opacity-50">🔒</div>
              <p className="text-sm opacity-70" style={{ color: "oklch(0.85 0.04 15)" }}>
                Capítulo bloqueado.
              </p>
              <p className="mt-1 text-xs opacity-60" style={{ color: "oklch(0.78 0.13 85)" }}>
                Complete a missão do capítulo anterior pra abrir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MissionProgress({ missionId, data }: { missionId: string; data: MissionRow | undefined }) {
  const m = MISSIONS.find((x) => x.id === missionId);
  if (!m) return null;
  const prog = data?.progress ?? 0;
  const pct = Math.min(100, (prog / m.goal) * 100);
  const done = data?.completed;
  return (
    <div
      className="mt-6 rounded-xl border p-4"
      style={{
        background: "oklch(0.18 0.05 10 / 0.6)",
        borderColor: "oklch(0.78 0.13 85 / 0.3)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">{m.emoji}</span>
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "oklch(0.78 0.13 85)", fontFamily: "var(--font-heading)" }}
        >
          missão: {m.title}
        </span>
      </div>
      <p className="mb-3 text-xs opacity-80" style={{ color: "oklch(0.9 0.03 15)" }}>
        {m.description}
      </p>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "oklch(0.15 0.03 10)" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: done
              ? "linear-gradient(90deg, oklch(0.65 0.18 145), oklch(0.78 0.13 85))"
              : "linear-gradient(90deg, oklch(0.58 0.14 5), oklch(0.78 0.13 85))",
          }}
        />
      </div>
      <div className="mt-1.5 text-right text-[10px] opacity-70" style={{ color: "oklch(0.85 0.04 15)" }}>
        {done ? "✨ completa! capítulo desbloqueado" : `${prog} / ${m.goal}`}
      </div>
    </div>
  );
}