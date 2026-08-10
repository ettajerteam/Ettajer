import type { Metadata } from "next";
import { DevelopersLanding } from "@/components/developer/developers-landing";

export const metadata: Metadata = {
  title: "Ettajer for Developers",
  description:
    "Connect Claude, Cursor, and AI agents to Ettajer with OAuth, Developer API, and MCP. AI designs themes; Ettajer runs commerce.",
};

export default function DevelopersHomePage() {
  return <DevelopersLanding />;
}
