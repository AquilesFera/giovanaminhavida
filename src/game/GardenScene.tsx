import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar2D } from "@/components/Avatar2D";
import { Petals } from "@/components/Petals";
import { WallOfNotes } from "@/components/WallOfNotes";
import { DayCounter } from "@/components/DayCounter";
import gardenBg from "@/assets/garden-bg.jpg";

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

type Profile = {
  id: string;
  display_name: string;
  avatar_color: string;
};

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

type ChatMsg = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
};

const WORLD_W = 1200;
const WORLD_H = 700;
const SPEED = 4;

export function GardenScene() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-2xl">🌹</div>
      </div>
    );
  }
  return <GardenInner userId={user.id} onSignOut={signOut} />;
}

function GardenInner({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [players, setPlayers] = useState<Record<string, PlayerRow>>({});
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [chats, setChats] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showWall, setShowWall] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const meRef = useRef({ x: 600, y: 350, dir: "down" as Direction, walking: false });
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const lastSyncRef = useRef(0);
  const [, setTick] = useState(0);

  const me = players[userId];
  const partnerEntry = Object.entries(players).find(([id]) => id !== userId);
  const partnerId = partnerEntry?.[0];
  const partner = partnerEntry?.[1];
  const partnerProfile = partnerId ? profiles[partnerId] : undefined;
  const myProfile = profiles[userId];

  const holdingHands = !!(me?.holding_hands && partner?.holding_hands);

  // Initial load + realtime
  useEffect(() => {
    let mounted = true;
    async function load() {
      const [{ data: profs }, { data: states }, { data: gs }, { data: cs }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("player_state").select("*"),
        supabase.from("gifts").select("*").eq("scene", "garden").order("created_at"),
        supabase
          .from("chat_messages")
          .select("*")
          .eq("scene", "garden")
          .gte("created_at", new Date(Date.now() - 60_000).toISOString()),
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

      // Mark online
      await supabase
        .from("player_state")
        .upsert({ user_id: userId, is_online: true, scene: "garden" });
    }
    load();

    const ch = supabase
      .channel("garden")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_state" },
        (payload) => {
          const row = payload.new as PlayerRow;
          if (!row?.user_id) return;
          setPlayers((p) => ({ ...p, [row.user_id]: row }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as Profile;
          if (row?.id) setProfiles((p) => ({ ...p, [row.id]: row }));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gifts" },
        (payload) => setGifts((g) => [...g, payload.new as Gift])
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "gifts" },
        (payload) => {
          const row = payload.new as Gift;
          setGifts((g) => g.map((x) => (x.id === row.id ? row : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => setChats((c) => [...c, payload.new as ChatMsg])
      )
      .subscribe();

    // Cleanup chats older than 8s every 2s
    const cleanup = setInterval(() => {
      const now = Date.now();
      setChats((c) => c.filter((m) => now - new Date(m.created_at).getTime() < 8000));
    }, 2000);

    // Mark offline on unload
    const offline = () => {
      navigator.sendBeacon &&
        supabase
          .from("player_state")
          .update({ is_online: false })
          .eq("user_id", userId)
          .then(() => {});
    };
    window.addEventListener("beforeunload", offline);

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
      clearInterval(cleanup);
      window.removeEventListener("beforeunload", offline);
      supabase.from("player_state").update({ is_online: false }).eq("user_id", userId).then(() => {});
    };
  }, [userId]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        keysRef.current[e.key.toLowerCase()] = true;
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
    function tick() {
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
        meRef.current.x = Math.max(30, Math.min(WORLD_W - 30, meRef.current.x));
        meRef.current.y = Math.max(30, Math.min(WORLD_H - 30, meRef.current.y));
        if (Math.abs(dx) > Math.abs(dy)) meRef.current.dir = dx > 0 ? "right" : "left";
        else meRef.current.dir = dy > 0 ? "down" : "up";
        meRef.current.walking = true;

        // If holding hands, drag partner along visually (server keeps real positions)
      } else {
        meRef.current.walking = false;
      }

      // Throttle sync
      const now = performance.now();
      if (moving && now - lastSyncRef.current > 120) {
        lastSyncRef.current = now;
        supabase
          .from("player_state")
          .update({
            x: meRef.current.x,
            y: meRef.current.y,
            direction: meRef.current.dir,
            is_online: true,
            scene: "garden",
            last_seen: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .then(() => {});
      }

      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [userId]);

  // Heart effect when close
  const distance = useMemo(() => {
    if (!partner) return Infinity;
    return Math.hypot(meRef.current.x - Number(partner.x), meRef.current.y - Number(partner.y));
  }, [partner, players]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim().slice(0, 140);
    if (!text) return;
    setChatInput("");
    await supabase.from("chat_messages").insert({ user_id: userId, text, scene: "garden" });
  }

  async function dropRose() {
    await supabase.from("gifts").insert({
      from_user: userId,
      gift_type: "rose",
      scene: "garden",
      x: meRef.current.x,
      y: meRef.current.y + 20,
    });
  }

  async function toggleHands() {
    const newVal = !me?.holding_hands;
    await supabase
      .from("player_state")
      .update({ holding_hands: newVal })
      .eq("user_id", userId);
  }

  async function openGift(id: string) {
    await supabase.from("gifts").update({ opened: true }).eq("id", id);
  }

  async function blow() {
    if (distance < 80 && partner) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1400);
      await supabase.from("chat_messages").insert({ user_id: userId, text: "💋", scene: "garden" });
    }
  }

  // Render scaling: fit world into viewport
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const upd = () => {
      const w = window.innerWidth;
      const h = window.innerHeight - 80;
      setScale(Math.min(w / WORLD_W, h / WORLD_H, 1));
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Latest chat per user for bubbles
  const latestChat: Record<string, ChatMsg | undefined> = {};
  for (const c of chats) {
    const prev = latestChat[c.user_id];
    if (!prev || new Date(c.created_at) > new Date(prev.created_at)) latestChat[c.user_id] = c;
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "oklch(0.12 0.03 10)" }}>
      <Petals />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <DayCounter />
          {partner ? (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest"
              style={{
                background: partner.is_online ? "oklch(0.4 0.15 145 / 0.3)" : "oklch(0.3 0.05 10 / 0.5)",
                color: partner.is_online ? "oklch(0.85 0.18 145)" : "oklch(0.7 0.04 15)",
                fontFamily: "var(--font-heading)",
                border: "1px solid oklch(0.5 0.1 5 / 0.3)",
              }}
            >
              {partnerProfile?.display_name ?? "Amor"} {partner.is_online ? "• online" : "• offline"}
            </span>
          ) : (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest"
              style={{ background: "oklch(0.3 0.05 10 / 0.5)", color: "oklch(0.7 0.04 15)", fontFamily: "var(--font-heading)" }}
            >
              esperando o amor entrar...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IconBtn label="Mural" onClick={() => setShowWall(true)}>📝</IconBtn>
          <IconBtn label="Sair" onClick={() => onSignOut()}>↪</IconBtn>
        </div>
      </div>

      {/* World */}
      <div className="relative flex justify-center" style={{ height: `calc(100vh - 80px)` }}>
        <div
          ref={containerRef}
          className="relative origin-top overflow-hidden rounded-xl"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `scale(${scale})`,
            backgroundImage: `url(${gardenBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 30px 80px -20px black, 0 0 0 2px oklch(0.78 0.13 85 / 0.2)",
            imageRendering: "auto",
          }}
        >
          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, oklch(0.1 0.03 10 / 0.7) 100%)",
            }}
          />

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
                className="text-3xl"
                style={{
                  filter: g.opened
                    ? "grayscale(0.3) drop-shadow(0 2px 4px black)"
                    : "drop-shadow(0 0 12px oklch(0.65 0.2 5)) drop-shadow(0 2px 4px black)",
                  opacity: g.opened ? 0.7 : 1,
                }}
              >
                {g.opened ? "🌷" : "🌹"}
              </span>
            </button>
          ))}

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
                  style={{ left: x, top: y, transition: isMe ? "none" : "left 120ms linear, top 120ms linear" }}
                >
                  {bubble && (
                    <ChatBubble text={bubble.text} />
                  )}
                  <Avatar2D
                    color={prof?.avatar_color ?? "#c0506e"}
                    name={prof?.display_name ?? "Amor"}
                    direction={dir}
                    walking={walking}
                    showHeart={isMe && showHeart}
                  />
                </div>
              );
            })}

          {/* Holding hands line */}
          {holdingHands && partner && (
            <svg
              className="pointer-events-none absolute inset-0"
              width={WORLD_W}
              height={WORLD_H}
            >
              <line
                x1={meRef.current.x}
                y1={meRef.current.y}
                x2={Number(partner.x)}
                y2={Number(partner.y)}
                stroke="oklch(0.78 0.13 85)"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Joystick onChange={(dx, dy) => (joystickRef.current = { dx, dy })} />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-center gap-2">
              <ActionBtn label={holdingHands ? "Soltar 💔" : "Dar a mão 💕"} onClick={toggleHands} />
              <ActionBtn label="Rosa 🌹" onClick={dropRose} />
              <ActionBtn label="Beijo 💋" onClick={blow} disabled={distance >= 80 || !partner} />
            </div>
            <form onSubmit={sendChat} className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="diga algo bonito..."
                maxLength={140}
                className="flex-1 rounded-full border bg-[oklch(0.18_0.04_10/0.85)] px-4 py-2 text-sm outline-none backdrop-blur"
                style={{
                  borderColor: "oklch(0.5 0.1 5 / 0.4)",
                  color: "oklch(0.95 0.02 15)",
                }}
              />
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-medium tracking-wide"
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

      {showWall && (
        <WallOfNotes
          userId={userId}
          profiles={profiles}
          onClose={() => setShowWall(false)}
        />
      )}
    </div>
  );
}

function ChatBubble({ text }: { text: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl px-3 py-1.5 text-xs shadow-lg"
      style={{
        bottom: "calc(100% + 16px)",
        background: "oklch(0.95 0.02 15)",
        color: "oklch(0.2 0.05 10)",
        fontFamily: "var(--font-body)",
        maxWidth: 200,
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
      className="rounded-full border px-3 py-1.5 text-xs backdrop-blur transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        color: "oklch(0.95 0.02 15)",
        fontFamily: "var(--font-heading)",
        letterSpacing: "0.08em",
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
      className="flex h-9 w-9 items-center justify-center rounded-full border text-sm backdrop-blur transition-all hover:scale-105"
      style={{
        background: "oklch(0.22 0.06 10 / 0.85)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
        color: "oklch(0.95 0.02 15)",
      }}
      title={label}
    >
      {children}
    </button>
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
      className="relative h-24 w-24 shrink-0 touch-none select-none rounded-full border backdrop-blur md:hidden"
      style={{
        background: "oklch(0.22 0.06 10 / 0.6)",
        borderColor: "oklch(0.78 0.13 85 / 0.4)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          background: "linear-gradient(135deg, oklch(0.78 0.13 85), oklch(0.58 0.14 5))",
          boxShadow: "0 4px 12px oklch(0.1 0.03 10)",
        }}
      />
    </div>
  );
}