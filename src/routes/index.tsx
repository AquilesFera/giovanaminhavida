import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mundinho do Casal 🌹" },
      { name: "description", content: "Nosso jardim secreto." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) nav({ to: "/hub" });
    else nav({ to: "/login" });
  }, [user, loading, nav]);
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "oklch(0.13 0.04 10)" }}
    >
      <div className="text-4xl">🌹</div>
    </div>
  );
}
