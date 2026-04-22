import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/site")({
  head: () => ({
    meta: [
      { title: "Giovana Lima 🌹 — Aquiles" },
      { name: "description", content: "Site da Giovana." },
    ],
  }),
  component: SitePage,
});

function SitePage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) return null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <iframe
        src="/giovana/index.html"
        title="Site da Giovana"
        className="absolute inset-0 h-full w-full border-0"
      />
      <Link
        to="/hub"
        className="absolute left-3 top-3 z-50 flex h-9 items-center justify-center rounded-full border px-3 text-xs backdrop-blur"
        style={{
          background: "rgba(6,3,6,0.9)",
          borderColor: "rgba(212,175,55,0.5)",
          color: "#d4af37",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "Georgia, serif",
        }}
      >
        ← menu
      </Link>
    </div>
  );
}