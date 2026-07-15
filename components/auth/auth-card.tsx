import { cn } from "@/lib/utils";

export const AUTH_CARD_SHELL =
  "relative overflow-hidden rounded-[0.625rem] border-0 bg-white shadow-none md:rounded-[1.25rem] md:border md:border-white/80 md:bg-white/75 md:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02),0_12px_40px_-8px_rgba(0,0,0,0.08)] md:backdrop-blur-xl md:backdrop-saturate-150";

export function AuthCardAccent() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 hidden h-40 w-40 rounded-full bg-blue-400/[0.06] blur-3xl md:block"
        aria-hidden
      />
    </>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(AUTH_CARD_SHELL, className)}>
      <AuthCardAccent />
      {children}
    </div>
  );
}
