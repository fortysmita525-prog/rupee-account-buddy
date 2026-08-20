import { Link } from "@tanstack/react-router";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Amount, DemandPill, ExtraStatusPill, TypePill } from "@/components/bits";
import { useDialogs } from "@/components/tracker-dialogs";
import { fmtDate } from "@/lib/money";
import { REPAYMENT_LABEL, type RecordSummary } from "@/lib/tracker";

export function RecordCard({
  summary,
  personName,
  showPerson = true,
}: {
  summary: RecordSummary;
  personName: string;
  showPerson?: boolean;
}) {
  const { record: r } = summary;
  const dialogs = useDialogs();
  const owed = r.type === "given";

  return (
    <div className="surface animate-rise overflow-hidden">
      {r.principal_demand_status === "demanded" && summary.remainingPrincipal > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-warn-soft px-5 py-2 text-xs font-semibold text-warn">
          <span>PRINCIPAL DEMANDED · {fmtDate(r.principal_demand_date)}</span>
          <span>Outstanding: {new Intl.NumberFormat("en-IN").format(summary.remainingPrincipal)}</span>
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TypePill type={r.type} />
              {r.is_demo ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo
                </span>
              ) : null}
            </div>
            {showPerson ? (
              <Link
                to="/people/$personId"
                params={{ personId: r.person_id }}
                className="mt-2 block truncate font-display text-lg font-semibold hover:underline"
              >
                {personName}
              </Link>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground">
              Started {fmtDate(r.date_started)} · {REPAYMENT_LABEL[r.principal_repayment_condition]}
              {r.principal_due_date ? ` (${fmtDate(r.principal_due_date)})` : ""}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Record actions">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  dialogs.recordPayment({
                    recordId: r.id,
                    personId: r.person_id,
                    type: "principal_payment",
                  })
                }
              >
                Record principal payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  dialogs.recordPayment({
                    recordId: r.id,
                    personId: r.person_id,
                    type: "monthly_extra",
                  })
                }
              >
                Record monthly extra
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => dialogs.markDemanded(r)}>
                Mark principal as demanded
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dialogs.editRecord(r)}>Edit record</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => dialogs.deleteRecord(r)}
              >
                Delete record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Original principal" value={<Amount value={r.principal_amount} />} />
          <Stat
            label="Remaining principal"
            value={
              <Amount value={summary.remainingPrincipal} tone={owed ? "owed" : "owe"} />
            }
          />
          <Stat label="Monthly extra" value={<Amount value={r.monthly_extra_amount} />} />
          <Stat label="Extra paid" value={<Amount value={summary.extraPaid} tone="muted" />} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <DemandPill status={r.principal_demand_status} />
          {summary.isSettled ? (
            <span className="rounded-full bg-owed-soft px-2.5 py-1 text-xs font-medium text-owed">
              Fully settled
            </span>
          ) : (
            <ExtraStatusPill status={summary.extraStatus} />
          )}
          {summary.nextExtraDue ? (
            <span className="text-xs text-muted-foreground">
              Next extra due {fmtDate(summary.nextExtraDue)}
            </span>
          ) : null}
          <span className="ml-auto text-xs text-muted-foreground">
            Principal paid <Amount value={summary.principalPaid} tone="muted" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}
