import Image from "next/image";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface OnlineStoreEmptyStateProps {
  title: string;
  description: string;
  illustration?: string;
  action?: React.ReactNode;
  className?: string;
}

export function OnlineStoreEmptyState({
  title,
  description,
  illustration = "/assets/illustrations/storefront-collections.png",
  action,
  className,
}: OnlineStoreEmptyStateProps) {
  return (
    <div className={cn(dashboardCard, dashboardCardPad, "text-center", className)}>
      <div className="relative mx-auto mb-4 h-36 w-full max-w-sm overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        <Image
          src={illustration}
          alt=""
          fill
          className="object-cover object-top opacity-90"
          sizes="384px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>
      <h3 className="text-base font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
