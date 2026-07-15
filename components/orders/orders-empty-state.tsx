import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface OrdersEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function OrdersEmptyState({ icon: Icon, title, description, action }: OrdersEmptyStateProps) {
  return (
    <div className="premium-card px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#007AFF]/10">
        <Icon className="h-8 w-8 text-[#007AFF]" />
      </div>
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
