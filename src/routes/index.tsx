import { createFileRoute } from "@tanstack/react-router";
import { GardenScene } from "@/components/GardenScene";

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
  return <GardenScene />;
}
