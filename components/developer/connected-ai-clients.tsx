import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AiClientLogo } from "@/components/developer/ai-client-logo";
import type { ConnectedAiClient } from "@/lib/developer/ai-clients";
import { cn } from "@/lib/utils";

type ConnectedAiClientsProps = {
  clients: ConnectedAiClient[];
  className?: string;
};

export function ConnectedAiClients({
  clients,
  className,
}: ConnectedAiClientsProps) {
  if (clients.length === 0) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-2xl border border-dashed border-black/[0.1] bg-white px-4 py-4 sm:px-5",
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-neutral-900">
              Connected AI
            </p>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              No agents authorized yet. Connect Claude, Cursor, or Codex with
              OAuth.
            </p>
          </div>
          <Link
            href="/help/tutorial-connect-claude-mcp"
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[12px] font-semibold text-[#007AFF] hover:underline"
          >
            How to connect
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-black/[0.06] bg-white",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.05] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[13px] font-semibold text-neutral-900">
            Connected AI
          </p>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            {clients.length} agent{clients.length === 1 ? "" : "s"} authorized
            to your store
          </p>
        </div>
      </div>
      <ul className="divide-y divide-black/[0.05]">
        {clients.map((client) => (
          <li
            key={`${client.kind}-${client.appId}`}
            className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
          >
            <AiClientLogo kind={client.kind} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] font-semibold text-neutral-900">
                  {client.label}
                </p>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Connected
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                {client.appName}
                {client.storeNames.length > 0
                  ? ` · ${client.storeNames.join(", ")}`
                  : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
