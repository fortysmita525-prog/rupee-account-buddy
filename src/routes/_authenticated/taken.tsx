import { createFileRoute } from "@tanstack/react-router";
import { RecordsPage } from "@/components/records-page";

export const Route = createFileRoute("/_authenticated/taken")({
  head: () => ({
    meta: [
      { title: "Money Taken — My Money Tracker" },
      {
        name: "description",
        content: "Every record of money you have taken from someone, with remaining principal and monthly extra.",
      },
      { property: "og:title", content: "Money Taken — My Money Tracker" },
      { property: "og:description", content: "Principal you owe, tracked separately from monthly extra." },
    ],
  }),
  component: () => <RecordsPage type="taken" />,
});
