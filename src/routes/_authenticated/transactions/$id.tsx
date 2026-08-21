import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTracker } from "@/lib/data";
import { inr } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/transactions/$id")({
  head: () => ({ meta: [{ title: "Transaction — My Money Tracker" }] }),
  component: TransactionView,
});

function TransactionView({ params }: { params: { id: string } }) {
  const { transactions = [], people = [], records = [] } = useTracker();
  const txn = useMemo(() => transactions.find((t) => t.id === params.id), [transactions, params.id]);
  if (!txn) return <p className="text-sm text-muted-foreground">Transaction not found.</p>;

  const person = people.find((p) => p.id === txn.person_id);
  const record = records.find((r) => r.id === txn.money_record_id || r.id === txn.related_record_id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transaction</h1>
      <div className="rounded-lg bg-card p-4">
        <p>
          <strong>Date:</strong> {new Date(txn.transaction_date).toLocaleDateString()}
        </p>
        <p>
          <strong>Type:</strong> {txn.transaction_type}
        </p>
        <p>
          <strong>Person:</strong> {person?.name ?? "—"}
        </p>
        <p>
          <strong>Record:</strong> {record ? record.notes ?? record.id : "—"}
        </p>
        <p>
          <strong>Amount:</strong> <span className="font-semibold">{inr(txn.amount)}</span>
        </p>
        <p>
          <strong>Notes:</strong> {txn.notes ?? "—"}
        </p>
        {txn.updated_at ? (
          <p className="text-xs text-muted-foreground">Edited: {new Date(txn.updated_at).toLocaleString()}</p>
        ) : null}
      </div>
    </div>
  );
}
