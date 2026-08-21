import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTracker } from "@/lib/data";
import { useDialogs } from "@/components/tracker-dialogs";

export const Route = createFileRoute("/_authenticated/transactions/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Transaction — My Money Tracker" }] }),
  component: TransactionEdit,
});

function TransactionEdit({ params }: { params: { id: string } }) {
  const { transactions = [] } = useTracker();
  const dialogs = useDialogs();
  const txn = transactions.find((t) => t.id === params.id);

  useEffect(() => {
    if (txn) dialogs.editTransaction(txn as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  return null; // dialog handles the UI
}
