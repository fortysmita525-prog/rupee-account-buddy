import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/data"; // if available; fallback to useTracker if not
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — My Money Tracker" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  // If your project exposes a user hook useUser, use it. Otherwise adapt to whatever
  // the app uses for current user data (e.g. useTracker().user).
  const { user } = (useUser && useUser()) || { user: undefined };
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");
  const [currency] = useState("INR");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <section className="surface p-4">
        <h2 className="text-lg font-medium">Profile</h2>
        <p className="mt-2 text-sm">Email: {user?.email ?? "—"}</p>
        <p className="text-sm">Name: {user?.user_metadata?.['full_name'] ?? user?.user_metadata?.['name'] ?? "—"}</p>
      </section>

      <section className="surface p-4">
        <h2 className="text-lg font-medium">Currency</h2>
        <p className="mt-2 text-sm">Default: ₹ INR</p>
      </section>

      <section className="surface p-4">
        <h2 className="text-lg font-medium">Appearance</h2>
        <div className="mt-2 flex gap-2">
          <label><input type="radio" checked={appearance === "light"} onChange={() => setAppearance("light")} /> Light</label>
          <label><input type="radio" checked={appearance === "dark"} onChange={() => setAppearance("dark")} /> Dark</label>
          <label><input type="radio" checked={appearance === "system"} onChange={() => setAppearance("system")} /> System</label>
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="text-lg font-medium">Data</h2>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => alert("Export CSV not implemented in this build")} disabled>
            Export CSV
          </Button>
          <Button onClick={() => alert("Backup data not implemented in this build")} disabled>
            Backup Data
          </Button>
          <Button onClick={() => alert("Restore data not implemented in this build")} disabled>
            Restore Data
          </Button>
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="text-lg font-medium">Account</h2>
        <div className="mt-2">
          <Button variant="destructive" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </section>
    </div>
  );
}
