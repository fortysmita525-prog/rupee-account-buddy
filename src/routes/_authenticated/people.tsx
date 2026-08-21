import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/bits";
import { useDialogs } from "@/components/tracker-dialogs";
import { useTracker } from "@/lib/data";
import { inr } from "@/lib/money";
import { summariseAll } from "@/lib/tracker";

export const Route = createFileRoute("/_authenticated/people")({
  head: () => ({
    meta: [
      { title: "People — My Money Tracker" },
      {
        name: "description",
        content: "Everyone you have taken money from or given money to, with their outstanding principal.",
      },
      { property: "og:title", content: "People — My Money Tracker" },
      { property: "og:description", content: "Per-person balances for money taken and money given." },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const { people, records, transactions, isLoading } = useTracker();
  const dialogs = useDialogs();
  const [q, setQ] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removePersonId, setRemovePersonId] = useState("");

  const rows = useMemo(() => {
    const summaries = summariseAll(records, transactions);
    const needle = q.trim().toLowerCase();
    return people
      .filter((p) => !needle || p.name.toLowerCase().includes(needle) || (p.phone ?? "").includes(needle))
      .map((p) => {
        const mine = summaries.filter((s) => s.record.person_id === p.id);
        const owe = mine
          .filter((s) => s.record.type === "taken")
          .reduce((a, s) => a + s.remainingPrincipal, 0);
        const owed = mine
          .filter((s) => s.record.type === "given")
          .reduce((a, s) => a + s.remainingPrincipal, 0);
        return { person: p, count: mine.length, owe, owed };
      });
  }, [people, records, transactions, q]);

  function openRemoveUI() {
    setRemoveOpen(true);
  }

  function cancelRemove() {
    setRemoveOpen(false);
    setRemovePersonId("");
  }

  function confirmRemove() {
    if (!removePersonId) {
      // simple feedback
      window.alert("Choose a person to remove");
      return;
    }
    const person = people.find((p) => p.id === removePersonId);
    if (!person) return;
    // This will open the confirmation dialog from the dialogs provider
    dialogs.deletePerson(person);
    cancelRemove();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">People</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A person can have many separate money records — each stays independent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-full" onClick={() => dialogs.addPerson()}>
            <Plus className="size-4" /> Add Person
          </Button>

          {/* Remove person inline UI */}
          {!removeOpen ? (
            <Button variant="ghost" className="rounded-full" onClick={openRemoveUI}>
              Remove Person
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={removePersonId}
                onChange={(e) => setRemovePersonId(e.target.value)}
                className="rounded-md border px-2 py-1 bg-background"
              >
                <option value="">Select person</option>
                {people.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button variant="destructive" onClick={confirmRemove}>
                Remove
              </Button>
              <Button variant="ghost" onClick={cancelRemove}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search people"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No people yet"
          hint="Add a person, then attach money records to them."
          action={
            <Button className="mt-3" onClick={() => dialogs.addPerson()}>
              Add Person
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ person, count, owe, owed }) => (
            <Link
              key={person.id}
              to="/people/$personId"
              params={{ personId: person.id }}
              className="surface group p-5 transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:underline">{person.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.phone || `${count} record${count === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-owe-soft p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-owe">I owe</p>
                  <p className="money-figure mt-1 font-semibold text-owe">{inr(owe)}</p>
                </div>
                <div className="rounded-lg bg-owed-soft p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-owed">Owes me</p>
                  <p className="money-figure mt-1 font-semibold text-owed">{inr(owed)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
