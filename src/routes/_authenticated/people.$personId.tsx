import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordCard } from "@/components/record-card";
import { useDialogs } from "@/components/tracker-dialogs";
import { useTracker } from "@/lib/data";
import { fmtDate, inr } from "@/lib/money";
import { TXN_LABEL, computeTotals, summariseAll } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/people/$personId")({
  head: () => ({
    meta: [
      { title: "Person — My Money Tracker" },
      { name: "description", content: "All money records and payment history for this person." },
      { property: "og:title", content: "Person — My Money Tracker" },
      {
        property: "og:description",
        content: "All money records and payment history for this person.",
      },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { personId } = Route.useParams();
  const { people, records, transactions, isLoading } = useTracker();
  const dialogs = useDialogs();

  const person = people.find((p) => p.id === personId);
  const personRecords = useMemo(
    () => records.filter((r) => r.person_id === personId),
    [records, personId],
  );
  const summaries = useMemo(
    () => summariseAll(personRecords, transactions),
    [personRecords, transactions],
  );
  const totals = useMemo(() => computeTotals(summaries), [summaries]);
  const history = useMemo(
    () =>
      transactions
        .filter((t) => t.person_id === personId)
        .slice()
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date)),
    [transactions, personId],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!person)
    return (
      <div className="surface p-8 text-center">
        <p className="text-sm text-muted-foreground">This person no longer exists.</p>
        <Link to="/people" className="mt-3 inline-block text-sm underline">
          Back to people
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <Link to="/people" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> People
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{person.name}</h1>
          {person.phone ? (
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-3.5" /> {person.phone}
            </p>
          ) : null}
          {person.notes ? (
            <p className="mt-1 text-sm text-muted-foreground">{person.notes}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => dialogs.addRecord("taken", person.id)}>
            <Plus className="mr-2 size-4" /> Taken
          </Button>
          <Button onClick={() => dialogs.addRecord("given", person.id)}>
            <Plus className="mr-2 size-4" /> Given
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile label="I owe them" value={totals.owe} />
        <Tile label="They owe me" value={totals.owed} />
        <Tile label="Monthly extra paid" value={totals.extraPaid} />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Money records</h2>
        {summaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records for this person yet.</p>
        ) : (
          summaries.map((s) => (
            <RecordCard key={s.record.id} summary={s} personName={person.name} showPerson={false} />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments logged yet.</p>
        ) : (
          <ol className="surface divide-y divide-border/60">
            {history.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{TXN_LABEL[t.transaction_type]}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(t.transaction_date)}
                    {t.notes ? ` · ${t.notes}` : ""}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">{inr(t.amount)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{inr(value)}</p>
    </div>
  );
}
