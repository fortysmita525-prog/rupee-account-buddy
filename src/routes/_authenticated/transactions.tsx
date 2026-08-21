import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Pencil, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTracker } from "@/lib/data";
import { useDialogs } from "@/components/tracker-dialogs";
import { inr, fmtDate } from "@/lib/money";
import {
  MONEY_TYPE_LABEL,
  TXN_LABEL,
  downloadFile,
  toCSV,
  type Transaction,
  type TxnType,
} from "@/lib/tracker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — My Money Tracker" },
      {
        name: "description",
        content: "Full history of principal payments and monthly extras, with filters and CSV export.",
      },
      { property: "og:title", content: "Transactions — My Money Tracker" },
      {
        property: "og:description",
        content: "Full history of principal payments and monthly extras, with filters and CSV export.",
      },
    ],
  }),
  component: TransactionsPage,
});

const TXN_TYPES: TxnType[] = ["principal_payment", "monthly_extra", "other", "adjustment"];

function TransactionsPage() {
  const { transactions, people, records, isLoading } = useTracker();
  const { recordPayment, editTransaction, deleteTransaction } = useDialogs();

  const [q, setQ] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">(
    "date_desc",
  );

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const recordById = useMemo(() => new Map(records.map((r) => [r.id, r])), [records]);

  const rows = useMemo(() => {
    let out: Transaction[] = transactions.slice();
    const needle = q.trim().toLowerCase();

    if (needle) {
      out = out.filter((t) => {
        const person = personById.get(t.person_id);
        return (
          (t.notes ?? "").toLowerCase().includes(needle) ||
          TXN_LABEL[t.transaction_type].toLowerCase().includes(needle) ||
          (person?.name ?? "").toLowerCase().includes(needle) ||
          String(t.amount).includes(needle)
        );
      });
    }

    if (personFilter) out = out.filter((t) => t.person_id === personFilter);
    if (typeFilter) out = out.filter((t) => t.transaction_type === typeFilter);
    if (dateFrom) out = out.filter((t) => t.transaction_date >= dateFrom);
    if (dateTo) out = out.filter((t) => t.transaction_date <= dateTo);

    const cmp: Record<typeof sortBy, (a: Transaction, b: Transaction) => number> = {
      date_desc: (a, b) => b.transaction_date.localeCompare(a.transaction_date),
      date_asc: (a, b) => a.transaction_date.localeCompare(b.transaction_date),
      amount_desc: (a, b) => Number(b.amount) - Number(a.amount),
      amount_asc: (a, b) => Number(a.amount) - Number(b.amount),
    };
    return out.sort(cmp[sortBy]);
  }, [transactions, q, personFilter, typeFilter, dateFrom, dateTo, sortBy, personById]);

  const totals = useMemo(() => {
    let principal = 0;
    let extra = 0;
    let other = 0;
    for (const t of rows) {
      const amount = Number(t.amount);
      if (t.transaction_type === "monthly_extra") extra += amount;
      else if (t.transaction_type === "other") other += amount;
      else principal += amount;
    }
    return { principal, extra, other };
  }, [rows]);

  const exportCSV = () => {
    if (rows.length === 0) return;
    const csv = toCSV(
      rows.map((t) => {
        const record = recordById.get(t.money_record_id);
        return {
          Date: t.transaction_date,
          Person: personById.get(t.person_id)?.name ?? "",
          Record: record ? `${MONEY_TYPE_LABEL[record.type]} ${inr(record.principal_amount)}` : "",
          Type: TXN_LABEL[t.transaction_type],
          Amount: Number(t.amount),
          Notes: t.notes ?? "",
        };
      }),
    );
    downloadFile(`transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const selectClass =
    "h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every principal payment and monthly extra you have logged.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={rows.length === 0}>
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
          <Button onClick={() => recordPayment()}>
            <Plus className="mr-2 size-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Principal paid" value={totals.principal} />
        <SummaryTile label="Monthly extra paid" value={totals.extra} />
        <SummaryTile label="Other" value={totals.other} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search person, notes, amount"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />

        <select
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All people</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All types</option>
          {TXN_TYPES.map((t) => (
            <option key={t} value={t}>
              {TXN_LABEL[t]}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={selectClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={selectClass}
          />
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className={cn(selectClass, "ml-auto")}
        >
          <option value="date_desc">Date (newest)</option>
          <option value="date_asc">Date (oldest)</option>
          <option value="amount_desc">Amount (largest)</option>
          <option value="amount_asc">Amount (smallest)</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions match these filters.</p>
        </div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">Record</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const person = personById.get(t.person_id);
                const record = recordById.get(t.money_record_id);
                return (
                  <tr key={t.id} className="border-t border-border/60">
                    <td className="whitespace-nowrap px-4 py-3">{fmtDate(t.transaction_date)}</td>
                    <td className="px-4 py-3">{person?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {record
                        ? `${MONEY_TYPE_LABEL[record.type]} · ${inr(record.principal_amount)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{TXN_LABEL[t.transaction_type]}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold tabular-nums",
                        t.transaction_type === "monthly_extra" && "text-muted-foreground",
                      )}
                    >
                      {inr(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.notes ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => editTransaction(t)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => deleteTransaction(t)}
                        >
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

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{inr(value)}</p>
    </div>
  );
}
