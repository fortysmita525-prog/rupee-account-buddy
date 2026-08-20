import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTracker } from "@/lib/data";
import { inr } from "@/lib/money";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({ meta: [{ title: "Reminders — My Money Tracker" }] }),
  component: RemindersPage,
});

function RemindersPage() {
  // records should contain monthly extra info (amount, schedule, active flag)
  const { records = [], people = [], transactions = [], isLoading, refetch } = useTracker();

  // determine reminder occurrences using available record fields.
  const reminders = useMemo(() => {
    // Conservative approach: select records that have a monthly_extra_amount > 0 and are active.
    return records
      .filter((r: any) => r.monthly_extra_amount && r.monthly_extra_amount > 0 && r.active !== false)
      .map((r: any) => {
        // attempt to compute nextDueDate from record.next_monthly_extra_date or monthly_extra_day
        const nextDue = r.next_monthly_extra_date ? new Date(r.next_monthly_extra_date) : null;
        return { record: r, nextDue };
      });
  }, [records]);

  function statusFor(nextDue: Date | null) {
    if (!nextDue) return "Upcoming";
    const today = new Date();
    const n = new Date(nextDue.toDateString());
    if (n.toDateString() === today.toDateString()) return "Due Today";
    if (n < today) return "Overdue";
    return "Upcoming";
  }

  async function markAsPaid(record: any) {
    // Create a Monthly Extra transaction and mark occurrence as paid.
    // IMPORTANT: adapt fields if your transactions schema differs.
    try {
      const txDate = new Date().toISOString();
      const { error: insertErr } = await supabase.from("transactions").insert([
        {
          record_id: record.id,
          person_id: record.person_id,
          type: "monthly_extra",
          amount: record.monthly_extra_amount,
          direction: record.type === "taken" ? "in" : "out",
          notes: "Monthly extra paid via reminders",
          date: txDate,
        },
      ]);
      if (insertErr) throw insertErr;

      // Mark occurrence as paid:
      // The schema for tracking paid occurrences may vary. If you have a dedicated table or a
      // record field (for example last_monthly_extra_paid_at or monthly_extra_paid_dates),
      // update that here. This update is a conservative example that sets last_monthly_extra_paid_at.
      const { error: updateErr } = await supabase
        .from("records")
        .update({ last_monthly_extra_paid_at: txDate })
        .eq("id", record.id);
      if (updateErr) throw updateErr;

      // refresh UI via the app data-layer
      refetch?.();
    } catch (e: any) {
      alert("Could not mark as paid: " + (e.message ?? e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monthly extra reminders for your active money records.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No monthly-extra reminders at the moment.</p>
      ) : (
        <div className="grid gap-4">
          {reminders.map(({ record, nextDue }: any) => {
            const personName = people.find((p: any) => p.id === record.person_id)?.name ?? "—";
            const status = statusFor(nextDue);
            return (
              <div key={record.id} className="surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{personName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.type === "taken" ? "Money Taken" : "Money Given"} · {record.title ?? ""}
                    </p>
                    <p className="mt-2">Monthly extra: <span className="font-semibold">{inr(record.monthly_extra_amount)}</span></p>
                    <p className="text-sm text-muted-foreground">Due: {nextDue ? new Date(nextDue).toLocaleDateString() : "—"}</p>
                    <p className="mt-1 text-sm">Status: <strong>{status}</strong></p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button onClick={() => markAsPaid(record)} disabled={!record.monthly_extra_amount}>
                      Mark as Paid
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
