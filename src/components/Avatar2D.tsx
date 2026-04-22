type Props = {
  color: string;
  name: string;
  direction: "up" | "down" | "left" | "right";
  walking?: boolean;
  showHeart?: boolean;
  size?: number;
};

export function Avatar2D({ color, name, direction, walking, showHeart, size = 48 }: Props) {
  const eyeOffset = {
    up: { x: 0, y: -2 },
    down: { x: 0, y: 2 },
    left: { x: -2, y: 0 },
    right: { x: 2, y: 0 },
  }[direction];

  return (
    <div className={`relative ${walking ? "walking" : ""}`} style={{ width: size, height: size }}>
      {showHeart && (
        <div
          className="float-heart absolute -top-2 left-1/2 -translate-x-1/2 text-2xl"
          style={{ color: "oklch(0.65 0.2 5)" }}
        >
          💖
        </div>
      )}
      {/* Shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: -4,
          width: size * 0.7,
          height: size * 0.18,
          background: "rgba(0,0,0,0.35)",
          filter: "blur(3px)",
        }}
      />
      <svg viewBox="0 0 48 48" width={size} height={size} className="relative">
        {/* Body / dress */}
        <ellipse cx="24" cy="38" rx="14" ry="8" fill={color} opacity="0.95" />
        <path
          d={`M10 38 Q24 26 38 38 L36 44 Q24 40 12 44 Z`}
          fill={color}
          stroke="oklch(0.2 0.05 10)"
          strokeWidth="0.7"
        />
        {/* Head */}
        <circle cx="24" cy="20" r="10" fill="#f4d8c0" stroke="oklch(0.25 0.05 15)" strokeWidth="0.7" />
        {/* Hair */}
        <path
          d="M14 18 Q14 8 24 8 Q34 8 34 18 Q34 14 28 13 Q24 12 20 13 Q14 14 14 18 Z"
          fill="oklch(0.25 0.06 30)"
        />
        {/* Eyes */}
        <circle cx={20 + eyeOffset.x} cy={20 + eyeOffset.y} r="1.3" fill="#1a0808" />
        <circle cx={28 + eyeOffset.x} cy={20 + eyeOffset.y} r="1.3" fill="#1a0808" />
        {/* Mouth */}
        <path d="M22 24 Q24 26 26 24" stroke="oklch(0.4 0.15 15)" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Crown / accent */}
        <circle cx="24" cy="9" r="1.2" fill="#d4af37" />
      </svg>
      <div
        className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{
          marginTop: 6,
          background: "rgba(20,8,12,0.7)",
          color: "oklch(0.95 0.02 15)",
          backdropFilter: "blur(4px)",
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.05em",
        }}
      >
        {name}
      </div>
    </div>
  );
}