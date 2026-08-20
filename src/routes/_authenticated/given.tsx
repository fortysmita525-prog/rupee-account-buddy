import { createFileRoute } from "@tanstack/react-router";
import { RecordsPage } from "@/components/records-page";

export const Route = createFileRoute("/_authenticated/given")({
  head: () => ({
    meta: [
      { title: "Money Given — My Money Tracker" },
      {
        name: "description",
        content: "Every record of money you have given to someone, with remaining principal and monthly extra.",
      },
      { property: "og:title", content: "Money Given — My Money Tracker" },
      { property: "og:description", content: "Principal owed to you, tracked separately from monthly extra." },
    ],
  }),
  component: () => <RecordsPage type="given" />,
});
