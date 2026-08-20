import { cn } from "@/lib/utils";
import { inr } from "@/lib/money";
import type { DemandStatus, ExtraStatus, MoneyType } from "@/lib/tracker";
import { DEMAND_LABEL } from "@/lib/tracker";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function Amount({
  value,
  tone = "default",
  className,
}: {
  value: number | string;
  tone?: "default" | "owe" | "owed" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "money-figure",
        tone === "owe" && "text-owe",
        tone === "owed" && "text-owed",
        tone === "muted" && "text-muted-foreground",
        className,
      )}
    >
      {inr(value)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "owe" | "owed" | "primary";
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "surface animate-rise p-5 transition-shadow hover:shadow-lift",
        tone === "owe" && "bg-owe-soft border-owe/20",
        tone === "owed" && "bg-owed-soft border-owed/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "text-muted-foreground",
              tone === "owe" && "text-owe",
              tone === "owed" && "text-owed",
              tone === "primary" && "text-primary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "money-figure mt-3 text-2xl font-semibold sm:text-[1.75rem]",
          tone === "owe" && "text-owe",
          tone === "owed" && "text-owed",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TypePill({ type }: { type: MoneyType }) {
  const taken = type === "taken";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        taken ? "bg-owe-soft text-owe" : "bg-owed-soft text-owed",
      )}
    >
      {taken ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
      {taken ? "Money Taken" : "Money Given"}
    </span>
  );
}

export function DemandPill({ status }: { status: DemandStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        status === "not_demanded" && "bg-muted text-muted-foreground",
        status === "demanded" && "bg-warn-soft text-warn font-semibold",
        status === "partially_paid" && "bg-accent text-accent-foreground",
        status === "fully_paid" && "bg-owed-soft text-owed",
      )}
    >
      {DEMAND_LABEL[status]}
    </span>
  );
}

export function ExtraStatusPill({ status, paid }: { status: ExtraStatus; paid?: boolean }) {
  if (paid)
    return (
      <span className="inline-flex rounded-full bg-owed-soft px-2.5 py-1 text-xs font-medium text-owed">
        Paid
      </span>
    );
  const map: Record<ExtraStatus, { label: string; cls: string }> = {
    upcoming: { label: "Upcoming", cls: "bg-muted text-muted-foreground" },
    due_today: { label: "Due Today", cls: "bg-accent text-accent-foreground font-semibold" },
    overdue: { label: "Overdue", cls: "bg-warn-soft text-warn font-semibold" },
    none: { label: "No monthly extra", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs", s.cls)}>{s.label}</span>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center gap-2 p-10 text-center">
      <p className="font-medium">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action}
    </div>
  );
}
