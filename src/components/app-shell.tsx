import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BellRing,
  LayoutDashboard,
  Plus,
  Receipt,
  Settings,
  Users,
  Wallet,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDialogs } from "@/components/tracker-dialogs";
import { useTracker } from "@/lib/data";
import "@/styles/sci-fi.css";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/people", label: "People", icon: Users },
  { to: "/taken", label: "Money Taken", icon: ArrowDownLeft },
  { to: "/given", label: "Money Given", icon: ArrowUpRight },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/reminders", label: "Reminders", icon: BellRing },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/people", "/taken", "/given", "/transactions"].includes(n.to),
);

export function AddMenu({ className, label = "Add Money" }: { className?: string; label?: string }) {
  const { addRecord, recordPayment, addPerson } = useDialogs();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("gap-1.5 rounded-full shadow-soft", className)}>
          <Plus className="size-4" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Add a money record</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => addRecord("taken")}>
          <ArrowDownLeft className="text-owe" /> I Took Money
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addRecord("given")}>
          <ArrowUpRight className="text-owed" /> I Gave Money
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => recordPayment({ type: "advance_given" })}>
          <Users /> I Gave an Advance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => recordPayment({ type: "advance_received" })}>
          <Users /> I Received an Advance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => recordPayment({ type: "principal" })}>
          <Wallet /> I Paid Principal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => recordPayment({ type: "monthly_extra" })}>
          <Receipt /> I Paid Monthly Extra
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => recordPayment({ type: "principal" })}>
          <Wallet /> I Received Principal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => recordPayment({ type: "monthly_extra" })}>
          <Receipt /> I Received Monthly Extra
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => addPerson()}>
          <Users /> Add Person
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dialogs = useDialogs();
  const { people } = useTracker();

  return (
    <div className="sci-fi min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="font-display text-base font-semibold leading-tight">
            My Money
            <span className="block text-xs font-normal text-muted-foreground">Tracker</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <AddMenu className="w-full" />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            <span className="font-display text-sm font-semibold">My Money Tracker</span>
          </Link>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Private personal record keeping · Indian Rupees (₹)
          </p>
          <div className="flex items-center gap-3">
            <AddMenu label="Add Money" />

            {/* Remove Person quick menu in header */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="destructive" className="rounded-full">
                  <Trash2 className="size-4" /> Remove
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Remove a person</DropdownMenuLabel>
                {people.length === 0 ? (
                  <DropdownMenuItem disabled>No people</DropdownMenuItem>
                ) : (
                  people.map((p: any) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => dialogs.deletePerson(p)}
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dialogs.addPerson()}>Add a person</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
