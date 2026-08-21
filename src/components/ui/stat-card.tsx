import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  className,
  children,
}: {
  title: string;
  value: ReactNode;
  hint?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-semibold text-foreground">{value}</div>
            {hint ? <div className="text-sm text-muted-foreground">{hint}</div> : null}
          </div>
        </div>
        {children ? <div className="self-center">{children}</div> : null}
      </div>
    </div>
  );
}
