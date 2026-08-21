import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ExtraStatusPill } from "@/components/bits";
import { useDialogs } from "@/components/tracker-dialogs";
import { useTracker } from "@/lib/data";
import { fmtDate, inr } from "@/lib/money";
import { MONEY_TYPE_LABEL, summariseAll } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — My Money Tracker" },
      {
        name: "description",
        content: "Upcoming and overdue monthly extras plus outstanding principal demands.",
      },
      { property: "og:title", content: "Reminders — My Money Tracker" },
      {
        property: "og:description",
        content: "Upcoming and overdue monthly extras plus outstanding principal demands.",
      },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { records, people, transactions, isLoading } = useTracker();
  const dialogs = useDialogs();

  const nameOf = useMemo(
    () => (id: string) => people.find((p) => p.id === id)?.name ?? "—",
    [people],
  );

  const reminders = useMemo(
    () =>
      summariseAll(records, transactions)
        .filter((s) => s.nextExtraDue !== null)
        .sort((a, b) => (a.nextExtraDue ?? "").localeCompare(b.nextExtraDue ?? "")),
    [records, transactions],
  );

  const demands = useMemo(
    () =>
      summariseAll(records, transactions).filter(
        (s) => s.record.principal_demand_status === "demanded" && s.remainingPrincipal > 0,
      ),
    [records, transactions],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly extras never reduce principal — they are tracked separately.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Monthly extras</h2>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No monthly extras scheduled.</p>
            ) : (
              reminders.map((s) => (
                <div
                  key={s.record.id}
                  className="surface flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold">{nameOf(s.record.person_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {MONEY_TYPE_LABEL[s.record.type]} · principal {inr(s.record.principal_amount)}
                    </p>
                    <p className="mt-1 text-sm">
                      Monthly extra{" "}
                      <span className="font-semibold">{inr(s.record.monthly_extra_amount)}</span> ·
                      due {fmtDate(s.nextExtraDue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExtraStatusPill status={s.extraStatus} />
                    <Button
                      onClick={() =>
                        dialogs.recordPayment({
                          recordId: s.record.id,
                          personId: s.record.person_id,
                          type: "monthly_extra",
                        })
                      }
                    >
                      Mark as paid
                    </Button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Principal demands</h2>
            {demands.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outstanding demands.</p>
            ) : (
              demands.map((s) => (
                <div
                  key={s.record.id}
                  className="surface flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold">{nameOf(s.record.person_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      Demanded {fmtDate(s.record.principal_demand_date)} · outstanding{" "}
                      {inr(s.remainingPrincipal)}
                    </p>
                    {s.record.demand_note ? (
                      <p className="mt-1 text-sm text-muted-foreground">{s.record.demand_note}</p>
                    ) : null}
                  </div>
                  <Button
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
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
