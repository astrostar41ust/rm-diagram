import type { Metadata } from "next";
import { InsightsPage } from "@/features/insights/components/InsightsPage";

export const metadata: Metadata = { title: "Insights · rm-diagram" };

export default function Page() {
  return <InsightsPage />;
}
