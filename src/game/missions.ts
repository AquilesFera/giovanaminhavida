import { supabase } from "@/integrations/supabase/client";
import { MISSIONS, CHAPTERS } from "./storyChapters";

/** Increment a mission's progress and unlock next chapter when completed. */
export async function bumpMission(missionId: string, by = 1) {
  const m = MISSIONS.find((x) => x.id === missionId);
  if (!m) return;

  const { data: existing } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("mission_id", missionId)
    .maybeSingle();

  if (existing?.completed) return;

  const newProgress = Math.min(m.goal, (existing?.progress ?? 0) + by);
  const completed = newProgress >= m.goal;

  if (existing) {
    await supabase
      .from("missions_progress")
      .update({
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("mission_id", missionId);
  } else {
    await supabase.from("missions_progress").insert({
      mission_id: missionId,
      progress: newProgress,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  }

  if (completed) {
    // Unlock the chapter that comes AFTER the one whose unlockMissionId == missionId
    const ch = CHAPTERS.find((c) => c.unlockMissionId === missionId);
    if (ch) {
      const nextId = ch.id + 1;
      await supabase
        .from("story_progress")
        .upsert(
          { chapter_id: nextId, unlocked: true, unlocked_at: new Date().toISOString() },
          { onConflict: "chapter_id" }
        );
    }
  }
}

/** Set absolute progress (used for time-based missions like hold-hands). */
export async function setMissionProgress(missionId: string, progress: number) {
  const m = MISSIONS.find((x) => x.id === missionId);
  if (!m) return;
  const capped = Math.min(m.goal, Math.max(0, progress));
  const completed = capped >= m.goal;

  const { data: existing } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("mission_id", missionId)
    .maybeSingle();

  if (existing?.completed) return;

  if (existing) {
    await supabase
      .from("missions_progress")
      .update({
        progress: capped,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("mission_id", missionId);
  } else {
    await supabase.from("missions_progress").insert({
      mission_id: missionId,
      progress: capped,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  }

  if (completed) {
    const ch = CHAPTERS.find((c) => c.unlockMissionId === missionId);
    if (ch) {
      await supabase
        .from("story_progress")
        .upsert(
          { chapter_id: ch.id + 1, unlocked: true, unlocked_at: new Date().toISOString() },
          { onConflict: "chapter_id" }
        );
    }
  }
}