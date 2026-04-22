import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar2D } from "@/components/Avatar2D";
import { Petals } from "@/components/Petals";
import { WallOfNotes } from "@/components/WallOfNotes";
import { DayCounter } from "@/components/DayCounter";
import { PetRabbit } from "@/components/Pet";
import { StoryBook } from "@/components/StoryBook";
import { bumpMission, setMissionProgress } from "@/game/missions";
import { SCENES, type SceneId } from "@/game/scenes";

type Direction = "up" | "down" | "left" | "right";

type PlayerRow = {
  user_id: string;
  x: number;
  y: number;
  direction: Direction;
  scene: string;
  is_online: boolean;
  holding_hands: boolean;
  last_seen: string;
  updated_at: string;
};

type Profile = { id: string; display_name: string; avatar_color: string };

type Gift = {
  id: string;
  from_user: string;
  gift_type: string;
  x: number;
  y: number;
  opened: boolean;
  message: string | null;
  created_at: string;
};

type ChatMsg = { id: string; user_id: string; text: string; created_at: string };

type PetState = {
  id: number;
  name: string;
  x: number;
  y: number;
  hunger: number;
  happiness: number;
  last_fed: string;
  last_pet: string;
};

const SPEED = 5;
const AVATAR_SIZE = 72; // bigger sprites

export function GameScene() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.13 0.04 10)" }}>
        <div className="text-3xl">🌹</div>
      </div>
    );
  }
  return <GameInner userId={user.id} />;
}

function GameInner({ userId }: { userId: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [players, setPlayers] = useState<Record<string, PlayerRow>>({});
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [chats, setChats] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showWall, setShowWall] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [pet, setPet] = useState<PetState | null>(null);
  const [foundRoses, setFoundRoses] = useState<Set<string>>(new Set());
  const [petBubble, setPetBubble] = useState<string | null>(null);

  const meRef = useRef({ x: 1200, y: 800, dir: "down" as Direction, walking: false });
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const lastSyncRef = useRef(0);
  const handsTimerRef = useRef(0);
  const [, setTick] = useState(0);
  const [viewport, setViewport] = useState({ w: 800, h: 600 });
  const [zoom, setZoom] = useState(1);
  const [currentScene, setCurrentScene] = useState<SceneId>("garden");
  const portalCooldownRef = useRef(0);

  const scene = SCENES[currentScene];
  const WORLD_W = scene.width;
  const WORLD_H = scene.height;
  const HIDDEN_ROSES = scene.hiddenRoses ?? [];

  const me = players[userId];
  const partnerEntry = Object.entries(players).find(([id]) => id !== userId);
  const partnerId = partnerEntry?.[0];
  const partner = partnerEntry?.[1];
  const partnerProfile = partnerId ? profiles[partnerId] : undefined;

  const holdingHands = !!(me?.holding_hands && partner?.holding_hands);

  // Initial load + realtime
  useEffect(() => {
    let mounted = true;
    async function load() {
      const [{ data: profs }, { data: states }, { data: gs }, { data: cs }, { data: petData }] =
        await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("player_state").select("*"),
          supabase.from("gifts").select("*").eq("scene", currentScene).order("created_at"),
          supabase
            .from("chat_messages")
            .select("*")
            .eq("scene", currentScene)
            .gte("created_at", new Date(Date.now() - 60_000).toISOString()),
          supabase.from("pet_state").select("*").eq("id", 1).maybeSingle(),
        ]);
      if (!mounted) return;
      if (profs) setProfiles(Object.fromEntries(profs.map((p) => [p.id, p as Profile])));
      if (states) {
        const map = Object.fromEntries(states.map((s) => [s.user_id, s as PlayerRow]));
        setPlayers(map);
        if (map[userId]) {
          meRef.current.x = Number(map[userId].x);
          meRef.current.y = Number(map[userId].y);
          meRef.current.dir = map[userId].direction as Direction;
        }
      }
      if (gs) setGifts(gs as Gift[]);
      if (cs) setChats(cs as ChatMsg[]);
      if (petData) setPet(petData as PetState);

      await supabase
        .from("player_state")
        .upsert({ user_id: userId, is_online: true, scene: currentScene });
    }
    load();

    const ch = supabase
      .channel("game-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "player_state" }, (p) => {
        const row = p.new as PlayerRow;
        if (row?.user_id) setPlayers((s) => ({ ...s, [row.user_id]: row }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (p) => {
        const row = p.new as Profile;
        if (row?.id) setProfiles((s) => ({ ...s, [row.id]: row }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gifts" }, (p) =>
        setGifts((g) => [...g, p.new as Gift])
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gifts" }, (p) => {
        const row = p.new as Gift;
        setGifts((g) => g.map((x) => (x.id === row.id ? row : x)));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) =>
        setChats((c) => [...c, p.new as ChatMsg])
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "pet_state" }, (p) => {
        if (p.new) setPet(p.new as PetState);
      })
      .subscribe();

    const cleanup = setInterval(() => {
      const now = Date.now();
      setChats((c) => c.filter((m) => now - new Date(m.created_at).getTime() < 8000));
    }, 2000);

    const offline = () =>
      supabase.from("player_state").update({ is_online: false }).eq("user_id", userId).then(() => {});
    window.addEventListener("beforeunload", offline);

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
      clearInterval(cleanup);
      window.removeEventListener("beforeunload", offline);
      offline();
    };
  }, [userId, currentScene]);

  // Viewport resize
  useEffect(() => {
    const upd = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      // Mobile gets bigger zoom so avatars look bigger
      setZoom(window.innerWidth < 640 ? 1.2 : window.innerWidth < 1024 ? 1 : 0.9);
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keysRef.current[k] = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Game loop
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    function loop(t: number) {
      const dt = (t - lastTime) / 1000;
      lastTime = t;
      const k = keysRef.current;
      let dx = 0,
        dy = 0;
      if (k["arrowleft"] || k["a"]) dx -= 1;
      if (k["arrowright"] || k["d"]) dx += 1;
      if (k["arrowup"] || k["w"]) dy -= 1;
      if (k["arrowdown"] || k["s"]) dy += 1;
      dx += joystickRef.current.dx;
      dy += joystickRef.current.dy;

      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        const len = Math.hypot(dx, dy) || 1;
        meRef.current.x += (dx / len) * SPEED;
        meRef.current.y += (dy / len) * SPEED;
        meRef.current.x = Math.max(40, Math.min(WORLD_W - 40, meRef.current.x));
        meRef.current.y = Math.max(40, Math.min(WORLD_H - 40, meRef.current.y));
        if (Math.abs(dx) > Math.abs(dy)) meRef.current.dir = dx > 0 ? "right" : "left";
        else meRef.current.dir = dy > 0 ? "down" : "up";
        meRef.current.walking = true;
      } else {
        meRef.current.walking = false;
      }

      // Hidden rose pickup
      for (const r of HIDDEN_ROSES) {
        if (foundRoses.has(r.id)) continue;
        const d = Math.hypot(meRef.current.x - r.x, meRef.current.y - r.y);
        if (d < 50) {
          setFoundRoses((s) => new Set(s).add(r.id));
          bumpMission("find_roses", 1);
        }
      }

      // Portal check
      if (t > portalCooldownRef.current) {
        for (const portal of scene.portals) {
          const d = Math.hypot(meRef.current.x - portal.x, meRef.current.y - portal.y);
          if (d < 60) {
            portalCooldownRef.current = t + 1500;
            meRef.current.x = portal.spawnX;
            meRef.current.y = portal.spawnY;
            void supabase
              .from("player_state")
              .update({
                x: portal.spawnX,
                y: portal.spawnY,
                scene: portal.to,
              })
              .eq("user_id", userId);
            setCurrentScene(portal.to);
            break;
          }
        }
      }

      // Holding hands timer mission
      if (holdingHands) {
        handsTimerRef.current += dt;
        if (Math.floor(handsTimerRef.current) > Math.floor(handsTimerRef.current - dt)) {
          setMissionProgress("hold_hands_long", Math.floor(handsTimerRef.current));
        }
      }

      // Sync
      if (moving && t - lastSyncRef.current > 130) {
        lastSyncRef.current = t;
        supabase
          .from("player_state")
          .update({
            x: meRef.current.x,
            y: meRef.current.y,
            direction: meRef.current.dir,
            is_online: true,
            scene: currentScene,
            last_seen: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .then(() => {});
      }

      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [userId, holdingHands, foundRoses, currentScene, scene]);

  // Pet AI: hop toward avg of players every 4s
  useEffect(() => {
    const iv = setInterval(async () => {
      if (!pet || currentScene !== "garden") return;
      const targets = Object.values(players).filter((p) => p.scene === "garden");
      if (targets.length === 0) return;
      const myX = meRef.current.x;
      const myY = meRef.current.y;
      const avgX = (myX + (partner ? Number(partner.x) : myX)) / (partner ? 2 : 1);
      const avgY = (myY + (partner ? Number(partner.y) : myY)) / (partner ? 2 : 1);
      const dx = avgX - Number(pet.x);
      const dy = avgY - Number(pet.y);
      const d = Math.hypot(dx, dy);
      if (d < 80) return;
      const step = Math.min(d - 60, 90);
      const nx = Number(pet.x) + (dx / d) * step + (Math.random() - 0.5) * 30;
      const ny = Number(pet.y) + (dy / d) * step + (Math.random() - 0.5) * 30;
      // Decay hunger/happiness slowly
      const newHunger = Math.min(100, pet.hunger + 1);
      const newHappiness = Math.max(0, pet.happiness - 1);
      await supabase
        .from("pet_state")
        .update({
          x: Math.max(60, Math.min(WORLD_W - 60, nx)),
          y: Math.max(60, Math.min(WORLD_H - 60, ny)),
          hunger: newHunger,
          happiness: newHappiness,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
    }, 4000);
    return () => clearInterval(iv);
  }, [pet, partner, players, currentScene]);

  // Camera / world transform
  const camera = useMemo(() => {
    const visW = viewport.w / zoom;
    const visH = (viewport.h - 0) / zoom;
    let cx = meRef.current.x - visW / 2;
    let cy = meRef.current.y - visH / 2;
    cx = Math.max(0, Math.min(WORLD_W - visW, cx));
    cy = Math.max(0, Math.min(WORLD_H - visH, cy));
    return { x: cx, y: cy };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, zoom, players]);

  const distance = useMemo(() => {
    if (!partner) return Infinity;
    return Math.hypot(meRef.current.x - Number(partner.x), meRef.current.y - Number(partner.y));
  }, [partner, players]); // eslint-disable-line react-hooks/exhaustive-deps

  const distanceToPet = pet
    ? Math.hypot(meRef.current.x - Number(pet.x), meRef.current.y - Number(pet.y))
    : Infinity;

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim().slice(0, 140);
    if (!text) return;
    setChatInput("");
    await supabase.from("chat_messages").insert({ user_id: userId, text, scene: currentScene });
  }

  async function dropRose() {
    await supabase.from("gifts").insert({
      from_user: userId,
      gift_type: "rose",
      scene: currentScene,
      x: meRef.current.x,
      y: meRef.current.y + 30,
    });
  }

  async function toggleHands() {
    const newVal = !me?.holding_hands;
    if (!newVal) handsTimerRef.current = 0;
    await supabase.from("player_state").update({ holding_hands: newVal }).eq("user_id", userId);
  }

  async function openGift(id: string) {
    await supabase.from("gifts").update({ opened: true }).eq("id", id);
  }

  async function blow() {
    if (distance < 100 && partner) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1400);
      await supabase.from("chat_messages").insert({ user_id: userId, text: "💋", scene: currentScene });
      await bumpMission("kiss_count", 1);
    }
  }

  async function feedPet() {
    if (!pet || distanceToPet > 120) return;
    setPetBubble("🥕 nham!");
    setTimeout(() => setPetBubble(null), 1600);
    await supabase
      .from("pet_state")
      .update({
        hunger: Math.max(0, pet.hunger - 40),
        happiness: Math.min(100, pet.happiness + 15),
        last_fed: new Date().toISOString(),
      })
      .eq("id", 1);
    await bumpMission("feed_pet", 1);
  }

  async function petPet() {
    if (!pet || distanceToPet > 120) return;
    setPetBubble("💕");
    setTimeout(() => setPetBubble(null), 1600);
    await supabase
      .from("pet_state")
      .update({
        happiness: Math.min(100, pet.happiness + 20),
        last_pet: new Date().toISOString(),
      })
      .eq("id", 1);
  }

  // Latest chat per user
  const latestChat: Record<string, ChatMsg | undefined> = {};
  for (const c of chats) {
    const prev = latestChat[c.user_id];
    if (!prev || new Date(c.created_at) > new Date(prev.created_at)) latestChat[c.user_id] = c;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "oklch(0.1 0.03 10)" }}>
      <Petals />

      {/* World viewport */}
      <div
        ref={viewportRef}
        className="absolute inset-0 overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `scale(${zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
            transformOrigin: "0 0",
            backgroundImage: `url(${scene.bg})`,
            backgroundSize: "100% 100%",
            imageRendering: "auto",
          }}
        >
          {/* Hidden roses */}
          {HIDDEN_ROSES.map((r) =>
            foundRoses.has(r.id) ? null : (
              <div
                key={r.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: r.x, top: r.y }}
              >
                <span
                  className="text-2xl"
                  style={{ filter: "drop-shadow(0 0 10px oklch(0.78 0.13 85))", animation: "float-heart 2s ease-in-out infinite alternate" }}
                >
                  ✨
                </span>
              </div>
            )
          )}

          {/* Gifts */}
          {gifts.map((g) => (
            <button
              key={g.id}
              onClick={() => openGift(g.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              style={{ left: Number(g.x), top: Number(g.y) }}
              aria-label="rosa"
            >
              <span
                className="text-4xl"
                style={{
                  filter: g.opened
                    ? "grayscale(0.3) drop-shadow(0 2px 4px black)"
                    : "drop-shadow(0 0 16px oklch(0.65 0.2 5)) drop-shadow(0 2px 4px black)",
                  opacity: g.opened ? 0.7 : 1,
                }}
              >
                {g.opened ? "🌷" : "🌹"}
              </span>
            </button>
          ))}

          {/* Pet */}
          {pet && (
            <>
              <PetRabbit
                x={Number(pet.x)}
                y={Number(pet.y)}
                hunger={pet.hunger}
                happiness={pet.happiness}
                walking
                size={56}
              />
              {petBubble && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-2xl px-2 py-1 text-xs"
                  style={{
                    left: Number(pet.x),
                    top: Number(pet.y) - 30,
                    background: "oklch(0.95 0.02 15)",
                    color: "oklch(0.2 0.05 10)",
                  }}
                >
                  {petBubble}
                </div>
              )}
            </>
          )}

          {/* Holding hands line */}
          {holdingHands && partner && (
            <svg className="pointer-events-none absolute left-0 top-0" width={WORLD_W} height={WORLD_H}>
              <line
                x1={meRef.current.x}
                y1={meRef.current.y}
                x2={Number(partner.x)}
                y2={Number(partner.y)}
                stroke="oklch(0.78 0.13 85)"
                strokeWidth="3"
                strokeDasharray="6 4"
                opacity="0.8"
              />
            </svg>
          )}

          {/* Players */}
          {Object.values(players)
            .filter((p) => p.scene === "garden")
            .map((p) => {
              const isMe = p.user_id === userId;
              const x = isMe ? meRef.current.x : Number(p.x);
              const y = isMe ? meRef.current.y : Number(p.y);
              const prof = profiles[p.user_id];
              const dir = (isMe ? meRef.current.dir : (p.direction as Direction)) ?? "down";
              const walking = isMe ? meRef.current.walking : false;
              const bubble = latestChat[p.user_id];
              return (
                <div
                  key={p.user_id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: x, top: y, transition: isMe ? "none" : "left 130ms linear, top 130ms linear" }}
                >
                  {bubble && <ChatBubble text={bubble.text} />}
                  <Avatar2D
                    color={prof?.avatar_color ?? "#c0506e"}
                    name={prof?.display_name ?? "Amor"}
                    direction={dir}
                    walking={walking}
                    showHeart={isMe && showHeart}
                    size={AVATAR_SIZE}
                  />
                </div>
              );
            })}
        </div>

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, oklch(0.08 0.03 10 / 0.7) 100%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <Link
            to="/hub"
            className="flex h-8 items-center justify-center rounded-full border px-3 text-xs"
            style={{
              background: "oklch(0.22 0.06 10 / 0.85)",
              borderColor: "oklch(0.78 0.13 85 / 0.4)",
              color: "oklch(0.95 0.02 15)",
              backdropFilter: "blur(6px)",
            }}
          >
            ← menu
          </Link>
          <DayCounter />
          {pet && <PetStatus pet={pet} />}
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          {partner ? (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest"
              style={{
                background: partner.is_online ? "oklch(0.4 0.15 145 / 0.3)" : "oklch(0.3 0.05 10 / 0.6)",
                color: partner.is_online ? "oklch(0.85 0.18 145)" : "oklch(0.7 0.04 15)",
                fontFamily: "var(--font-heading)",
                border: "1px solid oklch(0.5 0.1 5 / 0.3)",
                backdropFilter: "blur(6px)",
              }}
            >
              {partnerProfile?.display_name ?? "Amor"} {partner.is_online ? "•on" : "•off"}
            </span>
          ) : null}
          <IconBtn label="História" onClick={() => setShowStory(true)}>📖</IconBtn>
          <IconBtn label="Mural" onClick={() => setShowWall(true)}>📝</IconBtn>
        </div>
      </div>

      {/* Mission hint when finding roses */}
      {foundRoses.size > 0 && foundRoses.size < HIDDEN_ROSES.length && (
        <div
          className="pointer-events-none absolute left-1/2 top-14 z-20 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest"
          style={{
            background: "oklch(0.22 0.06 10 / 0.9)",
            border: "1px solid oklch(0.78 0.13 85 / 0.4)",
            color: "oklch(0.78 0.13 85)",
            fontFamily: "var(--font-heading)",
            backdropFilter: "blur(6px)",
          }}
        >
          ✨ rosas encontradas: {foundRoses.size}/{HIDDEN_ROSES.length}
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-2 pb-2">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Joystick onChange={(dx, dy) => (joystickRef.current = { dx, dy })} />
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap justify-center gap-1.5">
              <ActionBtn label={holdingHands ? "Soltar 💔" : "Mãos 💕"} onClick={toggleHands} disabled={!partner} />
              <ActionBtn label="Rosa 🌹" onClick={dropRose} />
              <ActionBtn label="Beijo 💋" onClick={blow} disabled={distance >= 100 || !partner} />
              <ActionBtn label="Cenoura 🥕" onClick={feedPet} disabled={distanceToPet >= 120} />
              <ActionBtn label="Carinho 🤗" onClick={petPet} disabled={distanceToPet >= 120} />
            </div>
            <form onSubmit={sendChat} className="flex gap-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="diga algo bonito..."
                maxLength={140}
                className="flex-1 rounded-full border bg-[oklch(0.18_0.04_10/0.85)] px-3 py-2 text-sm outline-none backdrop-blur"
                style={{ borderColor: "oklch(0.5 0.1 5 / 0.4)", color: "oklch(0.95 0.02 15)" }}
              />
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm"
                style={{
                  background: "linear-gradient(135deg, oklch(0.58 0.14 5), oklch(0.42 0.13 10))",
                  color: "oklch(0.98 0.01 15)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                ✦
              </button>
            </form>
          </div>
        </div>
      </div>

      {showWall && <WallOfNotes userId={userId} profiles={profiles} onClose={() => setShowWall(false)} />}
      {showStory && <StoryBook onClose={() => setShowStory(false)} />}
    </div>
  );
}

function ChatBubble({ text }: { text: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl px-3 py-1.5 text-xs shadow-lg"
      style={{
        bottom: "calc(100% + 12px)",
        background: "oklch(0.95 0.02 15)",
        color: "oklch(0.2 0.05 10)",
        fontFamily: "var(--font-body)",
        maxWidth: 220,
        whiteSpace: "normal",
        textAlign: "center",
      }}
    >
      {text}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -5,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid oklch(0.95 0.02 15)",
        }}
      />
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border px-2.5 py-1 text-[11px] backdrop-blur transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        color: "oklch(0.95 0.02 15)",
        fontFamily: "var(--font-heading)",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border text-base backdrop-blur transition-all hover:scale-105"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        color: "oklch(0.95 0.02 15)",
      }}
    >
      {children}
    </button>
  );
}

function PetStatus({ pet }: { pet: PetState }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        backdropFilter: "blur(6px)",
      }}
    >
      <span className="text-base">🐰</span>
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-heading)", color: "oklch(0.95 0.02 15)" }}
      >
        {pet.name}
      </span>
      <Bar value={100 - pet.hunger} color="oklch(0.65 0.18 25)" title="fome" />
      <Bar value={pet.happiness} color="oklch(0.78 0.13 85)" title="felicidade" />
    </div>
  );
}

function Bar({ value, color, title }: { value: number; color: string; title: string }) {
  return (
    <div title={title} className="h-1.5 w-8 overflow-hidden rounded-full" style={{ background: "oklch(0.15 0.03 10)" }}>
      <div className="h-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

function Joystick({ onChange }: { onChange: (dx: number, dy: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeId = useRef<number | null>(null);

  function handleMove(clientX: number, clientY: number) {
    const el = baseRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = r.width / 2 - 6;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    setKnob({ x: dx, y: dy });
    onChange(dx / max, dy / max);
  }

  function reset() {
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
    activeId.current = null;
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        activeId.current = e.pointerId;
        (e.target as Element).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activeId.current === e.pointerId) handleMove(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      className="relative h-28 w-28 shrink-0 touch-none select-none rounded-full border backdrop-blur md:hidden"
      style={{
        background: "oklch(0.22 0.06 10 / 0.6)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          background: "linear-gradient(135deg, oklch(0.78 0.13 85), oklch(0.58 0.14 5))",
          boxShadow: "0 4px 12px oklch(0.1 0.03 10)",
        }}
      />
    </div>
  );
}