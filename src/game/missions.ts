import { supabase } from "@/integrations/supabase/client";
import { MISSIONS, CHAPTERS } from "./storyChapters";

async function unlockNextChapter(missionId: string, worldCode: string) {
  const ch = CHAPTERS.find((c) => c.unlockMissionId === missionId);
  if (!ch) return;
  await supabase
    .from("story_progress")
    .upsert(
      {
        chapter_id: ch.id + 1,
        world_code: worldCode,
        unlocked: true,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: "chapter_id,world_code" }
    );
}

/** Increment a mission's progress and unlock next chapter when completed. */
export async function bumpMission(missionId: string, worldCode: string, by = 1) {
  if (!worldCode) return;
  const m = MISSIONS.find((x) => x.id === missionId);
  if (!m) return;

  const { data: existing } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("mission_id", missionId)
    .eq("world_code", worldCode)
    .maybeSingle();

  if (existing?.completed) return;

  const newProgress = Math.min(m.goal, (existing?.progress ?? 0) + by);
  const completed = newProgress >= m.goal;

  await supabase
    .from("missions_progress")
    .upsert(
      {
        mission_id: missionId,
        world_code: worldCode,
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "mission_id,world_code" }
    );

  if (completed) await unlockNextChapter(missionId, worldCode);
}

/** Set absolute progress (used for time-based missions like hold-hands). */
export async function setMissionProgress(missionId: string, worldCode: string, progress: number) {
  if (!worldCode) return;
  const m = MISSIONS.find((x) => x.id === missionId);
  if (!m) return;
  const capped = Math.min(m.goal, Math.max(0, progress));
  const completed = capped >= m.goal;

  const { data: existing } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("mission_id", missionId)
    .eq("world_code", worldCode)
    .maybeSingle();

  if (existing?.completed) return;

  await supabase
    .from("missions_progress")
    .upsert(
      {
        mission_id: missionId,
        world_code: worldCode,
        progress: capped,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "mission_id,world_code" }
    );

  if (completed) await unlockNextChapter(missionId, worldCode);
}