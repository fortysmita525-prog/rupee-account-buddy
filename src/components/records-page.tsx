import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/bits";
import { RecordCard } from "@/components/record-card";
import { useDialogs } from "@/components/tracker-dialogs";
import { useTracker } from "@/lib/data";
import { summariseAll, type MoneyType } from "@/lib/tracker";

type Filter = "all" | "active" | "settled" | "demanded" | "extra_due" | "overdue";

export function RecordsPage({ type }: { type: MoneyType }) {
  const { people, records, transactions, isLoading } = useTracker();
  const dialogs = useDialogs();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState("date_desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? "Unknown";

  const list = useMemo(() => {
    let out = summariseAll(records, transactions).filter((s) => s.record.type === type);
    const needle = q.trim().toLowerCase();
    if (needle)
      out = out.filter(
        (s) =>
          nameOf(s.record.person_id).toLowerCase().includes(needle) ||
          (s.record.notes ?? "").toLowerCase().includes(needle),
      );
    if (filter === "active") out = out.filter((s) => !s.isSettled);
    if (filter === "settled") out = out.filter((s) => s.isSettled);
    if (filter === "demanded")
      out = out.filter((s) => s.record.principal_demand_status === "demanded");
    if (filter === "extra_due")
      out = out.filter((s) => s.extraStatus === "due_today" || s.extraStatus === "overdue");
    if (filter === "overdue") out = out.filter((s) => s.extraStatus === "overdue");
    if (from) out = out.filter((s) => s.record.date_started >= from);
    if (to) out = out.filter((s) => s.record.date_started <= to);

    const sorters: Record<string, (a: (typeof out)[number], b: (typeof out)[number]) => number> = {
      date_desc: (a, b) => b.record.date_started.localeCompare(a.record.date_started),
      date_asc: (a, b) => a.record.date_started.localeCompare(b.record.date_started),
      amount_desc: (a, b) => b.remainingPrincipal - a.remainingPrincipal,
      amount_asc: (a, b) => a.remainingPrincipal - b.remainingPrincipal,
      person: (a, b) => nameOf(a.record.person_id).localeCompare(nameOf(b.record.person_id)),
    };
    return out.slice().sort(sorters[sort] ?? sorters["date_desc"]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, transactions, people, q, filter, sort, from, to, type]);

  const taken = type === "taken";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{taken ? "Money Taken" : "Money Given"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {taken
              ? "Money others gave me — I owe this principal back."
              : "Money I gave others — they owe this principal to me."}
          </p>
        </div>
        <Button onClick={() => dialogs.addRecord(type)} className="rounded-full">
          <Plus className="size-4" /> {taken ? "Add Money Taken" : "Add Money Given"}
        </Button>
      </div>

      <div className="surface grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search person or notes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All records</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="settled">Fully paid</SelectItem>
            <SelectItem value="demanded">Principal demanded</SelectItem>
            <SelectItem value="extra_due">Monthly extra due</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest first</SelectItem>
            <SelectItem value="date_asc">Oldest first</SelectItem>
            <SelectItem value="amount_desc">Largest remaining</SelectItem>
            <SelectItem value="amount_asc">Smallest remaining</SelectItem>
            <SelectItem value="person">Person A–Z</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <EmptyState
          title="No records here yet"
          hint={taken ? "Add money you have taken from someone." : "Add money you have given to someone."}
          action={
            <Button className="mt-3" onClick={() => dialogs.addRecord(type)}>
              {taken ? "Add Money Taken" : "Add Money Given"}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {list.map((s) => (
            <RecordCard key={s.record.id} summary={s} personName={nameOf(s.record.person_id)} />
          ))}
        </div>
      )}
    </div>
  );
}
