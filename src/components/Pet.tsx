import { useEffect, useRef } from "react";

type Props = {
  x: number;
  y: number;
  happiness: number;
  hunger: number;
  walking?: boolean;
  size?: number;
};

export function PetRabbit({ x, y, happiness, hunger, walking, size = 40 }: Props) {
  const hopRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hopRef.current) return;
    hopRef.current.style.animation = walking ? "rabbit-hop 0.5s ease-in-out infinite" : "none";
  }, [walking]);

  const sad = happiness < 30 || hunger > 80;

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y, transition: "left 200ms linear, top 200ms linear" }}
    >
      {/* Shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: -2,
          width: size * 0.6,
          height: size * 0.15,
          background: "rgba(0,0,0,0.4)",
          filter: "blur(3px)",
        }}
      />
      <div ref={hopRef} style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size}>
          {/* Ears */}
          <ellipse cx="14" cy="8" rx="3" ry="7" fill="#f5e6ea" stroke="#3a1520" strokeWidth="0.6" />
          <ellipse cx="26" cy="8" rx="3" ry="7" fill="#f5e6ea" stroke="#3a1520" strokeWidth="0.6" />
          <ellipse cx="14" cy="9" rx="1.3" ry="4.5" fill="#f8c5d0" />
          <ellipse cx="26" cy="9" rx="1.3" ry="4.5" fill="#f8c5d0" />
          {/* Body */}
          <ellipse cx="20" cy="28" rx="11" ry="9" fill="#f5e6ea" stroke="#3a1520" strokeWidth="0.7" />
          {/* Head */}
          <circle cx="20" cy="18" r="8" fill="#f5e6ea" stroke="#3a1520" strokeWidth="0.7" />
          {/* Eyes */}
          {sad ? (
            <>
              <path d="M16 18 L18 18" stroke="#1a0808" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M22 18 L24 18" stroke="#1a0808" strokeWidth="1.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="17" cy="18" r="1.4" fill="#1a0808" />
              <circle cx="23" cy="18" r="1.4" fill="#1a0808" />
              <circle cx="17.4" cy="17.6" r="0.4" fill="white" />
              <circle cx="23.4" cy="17.6" r="0.4" fill="white" />
            </>
          )}
          {/* Nose */}
          <path d="M19 21 L20 22 L21 21 Z" fill="#c0506e" />
          {/* Mouth */}
          {sad ? (
            <path d="M18 24 Q20 23 22 24" stroke="#3a1520" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M18 23 Q20 24.5 22 23" stroke="#3a1520" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          )}
          {/* Tail */}
          <circle cx="30" cy="28" r="2.2" fill="#fff" />
          {/* Bow (gold) */}
          <path d="M18 13 Q20 11 22 13 Q20 14 18 13 Z" fill="#d4af37" />
        </svg>
      </div>
    </div>
  );
}