import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  HandCoins,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Amount, DemandPill, EmptyState, ExtraStatusPill, SectionHeading, StatCard } from "@/components/bits";
import { useDialogs } from "@/components/tracker-dialogs";
import { useSaveRow, useTracker } from "@/lib/data";
import { fmtDate, greeting, inr, longToday } from "@/lib/money";
import { computeTotals, summariseAll, type RecordSummary } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — My Money Tracker" },
      {
        name: "description",
        content:
          "See at a glance how much money you owe, how much is owed to you, upcoming monthly extras and demanded principal.",
      },
      { property: "og:title", content: "Dashboard — My Money Tracker" },
      {
        property: "og:description",
        content: "Personal money tracking in Indian Rupees: principal, monthly extra and reminders.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { people, records, transactions, isLoading } = useTracker();
  const dialogs = useDialogs();
  const saveTxn = useSaveRow("transactions");

  const summaries = useMemo(() => summariseAll(records, transactions), [records, transactions]);
  const totals = useMemo(() => computeTotals(summaries), [summaries]);

  const upcoming = summaries
    .filter((s) => s.nextExtraDue && !s.isSettled)
    .sort((a, b) => (a.nextExtraDue ?? "").localeCompare(b.nextExtraDue ?? ""))
    .slice(0, 6);

  const demands = summaries.filter(
    (s) => s.record.principal_demand_status === "demanded" && !s.isSettled,
  );

  const activePeople = new Set(summaries.filter((s) => !s.isSettled).map((s) => s.record.person_id));
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? "Unknown";

  async function markPaid(s: RecordSummary) {
    await saveTxn.mutateAsync({
      values: {
        money_record_id: s.record.id,
        person_id: s.record.person_id,
        transaction_type: "monthly_extra",
        amount: Number(s.record.monthly_extra_amount),
        transaction_date: s.nextExtraDue,
        notes: "Monthly extra marked as paid",
      },
    });
    toast.success("Monthly extra recorded — principal is unchanged");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{greeting()} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">{longToday()}</p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading your records…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Money I Owe"
          value={inr(totals.owe)}
          hint="Remaining principal I must return"
          tone="owe"
          icon={<ArrowDownLeft className="size-4" />}
        />
        <StatCard
          label="Money Owed To Me"
          value={inr(totals.owed)}
          hint="Remaining principal others must return"
          tone="owed"
          icon={<ArrowUpRight className="size-4" />}
        />
        <StatCard
          label="Monthly Extra"
          value={inr(totals.monthlyExtraExpected)}
          hint="Expected every month across active records"
          icon={<CalendarClock className="size-4" />}
        />
        <StatCard
          label="Extra Paid"
          value={inr(totals.extraPaid)}
          hint="Never reduces principal"
          icon={<HandCoins className="size-4" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MiniStat label="Principal originally taken" value={inr(totals.originalTaken)} />
        <MiniStat label="Principal originally given" value={inr(totals.originalGiven)} />
        <MiniStat label="Total principal paid" value={inr(totals.principalPaid)} />
        <MiniStat label="Active people" value={String(activePeople.size)} icon={<Users className="size-4" />} />
        <MiniStat label="Active records" value={String(totals.activeRecords)} icon={<Wallet className="size-4" />} />
      </div>

      <section>
        <SectionHeading title="Money Flow" description="Which way the money moved." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface border-owe/25 bg-owe-soft p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-owe">
              Others <ArrowRight className="size-4" /> Me
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Money taken from others. I owe this principal back.
            </p>
            <p className="money-figure mt-4 text-3xl font-semibold text-owe">{inr(totals.owe)}</p>
            <Link to="/taken" className="mt-4 inline-flex text-sm font-medium text-owe hover:underline">
              View money taken →
            </Link>
          </div>
          <div className="surface border-owed/25 bg-owed-soft p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-owed">
              Me <ArrowRight className="size-4" /> Others
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Money given to others. They owe this principal to me.
            </p>
            <p className="money-figure mt-4 text-3xl font-semibold text-owed">{inr(totals.owed)}</p>
            <Link to="/given" className="mt-4 inline-flex text-sm font-medium text-owed hover:underline">
              View money given →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          title="Upcoming Monthly Extras"
          description="Nothing is recorded until you mark it as paid."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/reminders">
                <BellRing className="size-4" /> All reminders
              </Link>
            </Button>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState
            title="No monthly extras scheduled"
            hint="Add a monthly extra amount to a record and reminders will appear here."
          />
        ) : (
          <div className="surface divide-y divide-border">
            {upcoming.map((s) => (
              <div key={s.record.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{nameOf(s.record.person_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {fmtDate(s.nextExtraDue)} ·{" "}
                    {s.record.type === "taken" ? "I pay" : "They pay me"}
                  </p>
                </div>
                <Amount value={s.record.monthly_extra_amount} />
                <ExtraStatusPill status={s.extraStatus} />
                <Button size="sm" variant="secondary" onClick={() => markPaid(s)}>
                  Mark as Paid
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Principal Demands" description="Principal that has been called back." />
        {demands.length === 0 ? (
          <EmptyState title="No principal demanded right now" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {demands.map((s) => (
              <div key={s.record.id} className="surface border-warn/30 bg-warn-soft p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{nameOf(s.record.person_id)}</p>
                  <DemandPill status={s.record.principal_demand_status} />
                </div>
                <p className="money-figure mt-2 text-2xl font-semibold text-warn">
                  {inr(s.remainingPrincipal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Outstanding principal · demanded {fmtDate(s.record.principal_demand_date)}
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    dialogs.recordPayment({
                      recordId: s.record.id,
                      personId: s.record.person_id,
                      type: "principal_payment",
                    })
                  }
                >
                  Record principal payment
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="money-figure mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
