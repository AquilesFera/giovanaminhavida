const PETALS = Array.from({ length: 14 }, (_, i) => i);

export function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PETALS.map((i) => {
        const left = (i * 7.3) % 100;
        const dur = 9 + ((i * 1.3) % 8);
        const delay = (i * 0.7) % 9;
        const size = 14 + ((i * 3) % 18);
        return (
          <div
            key={i}
            className="petal"
            style={{
              left: `${left}%`,
              animationDuration: `${dur}s`,
              animationDelay: `${-delay}s`,
              width: `${size}px`,
              height: `${size}px`,
              background:
                "radial-gradient(circle at 30% 30%, oklch(0.65 0.16 5), oklch(0.32 0.11 13))",
              borderRadius: "60% 20% 60% 20%",
              opacity: 0.5,
            }}
          />
        );
      })}
    </div>
  );
}