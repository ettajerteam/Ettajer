import Link from "next/link";
import type { Metadata } from "next";
import { buildAiSystemPrompt } from "@/lib/developer/ai-system-prompt";

export const metadata: Metadata = {
  title: "AI System Prompt — Ettajer",
  description: "Canonical instructions for AI agents designing Ettajer storefronts.",
};

export default function AiSystemPromptPage() {
  const prompt = buildAiSystemPrompt();
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm">
        <Link href="/developers" className="text-[#007AFF]">
          ← Developers
        </Link>
        {" · "}
        <Link href="/developers/ai-integration" className="text-[#007AFF]">
          AI Integration
        </Link>
        {" · "}
        <Link href="/developers/ai-system-prompt.txt" className="text-[#007AFF]">
          Raw .txt
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
        AI system prompt
      </h1>
      <p className="mt-2 text-sm text-[#636366]">
        Canonical instructions for Claude / Cursor agents. Copy into the agent system
        prompt or project rules.
      </p>
      <pre className="mt-8 overflow-x-auto whitespace-pre-wrap rounded-2xl border bg-[#F2F2F7] p-6 text-sm leading-relaxed text-neutral-800">
        {prompt}
      </pre>
    </main>
  );
}
