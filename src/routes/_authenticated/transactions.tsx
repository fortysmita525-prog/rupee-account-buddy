import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTracker } from "@/lib/data";
import { inr } from "@/lib/money";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({ meta: [{ title: "Transactions — My Money Tracker" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions = [], people = [], records = [], isLoading, refetch } = useTracker();
  const [q, setQ] = useState("");
  const [personFilter, setPersonFilter] = useState<string | "">("");
  const [typeFilter, setTypeFilter] = useState<string | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">(
    "date_desc",
  );

  const rows = useMemo(() => {
    let out = transactions.slice();

    // text search over notes or money record name
    const needle = q.trim().toLowerCase();
    if (needle) {
      out = out.filter(
        (t: any) =>
          (t.notes ?? "").toLowerCase().includes(needle) ||
          (t.type ?? "").toLowerCase().includes(needle) ||
          (t.amount ?? "").toString().includes(needle),
      );
    }

    if (personFilter) out = out.filter((t: any) => t.person_id === personFilter);
    if (typeFilter) out = out.filter((t: any) => t.type === typeFilter);

    if (dateFrom) out = out.filter((t: any) => new Date(t.date) >= new Date(dateFrom));
    if (dateTo) out = out.filter((t: any) => new Date(t.date) <= new Date(dateTo));

    if (sortBy === "date_desc") out.sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date));
    if (sortBy === "date_asc") out.sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date));
    if (sortBy === "amount_desc") out.sort((a: any, b: any) => b.amount - a.amount);
    if (sortBy === "amount_asc") out.sort((a: any, b: any) => a.amount - b.amount);

    return out;
  }, [transactions, q, personFilter, typeFilter, dateFrom, dateTo, sortBy]);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this transaction? This cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      alert("Could not delete transaction: " + error.message);
      return;
    }
    // refetch data via the app's data layer
    refetch?.();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">All transactions for your account.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm">
          <Input placeholder="Search transactions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} className="rounded-md border px-2 py-1">
          <option value="">All people</option>
          {people.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border px-2 py-1">
          <option value="">All types</option>
          <option value="principal_payment">Principal Payment</option>
          <option value="monthly_extra">Monthly Extra</option>
          <option value="other">Other</option>
          <option value="adjustment">Adjustment</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          From
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border px-2 py-1" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          To
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-md border px-2 py-1" />
        </label>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-md border px-2 py-1 ml-auto">
          <option value="date_desc">Date (newest)</option>
          <option value="date_asc">Date (oldest)</option>
          <option value="amount_desc">Amount (largest)</option>
          <option value="amount_asc">Amount (smallest)</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-2">Date</th>
                <th>Person</th>
                <th>Money Record</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Direction</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t: any) => {
                const person = people.find((p: any) => p.id === t.person_id);
                const record = records.find((r: any) => r.id === t.record_id);
                return (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                    <td>{person?.name ?? "—"}</td>
                    <td>{record?.title ?? record?.note ?? "—"}</td>
                    <td>{t.type?.replaceAll("_", " ")}</td>
                    <td className="font-semibold">{inr(t.amount)}</td>
                    <td>{t.direction ?? "—"}</td>
                    <td>{t.notes ?? "—"}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to="/transactions/$id" params={{ id: t.id }} className="p-1" title="View">
                          <Eye className="size-4" />
                        </Link>
                        <Link to="/transactions/$id/edit" params={{ id: t.id }} className="p-1" title="Edit">
                          <Edit className="size-4" />
                        </Link>
                        <Button variant="ghost" onClick={() => handleDelete(t.id)} title="Delete" className="p-1">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
