import type { Metadata } from "next";
import { RecurringPage } from "@/features/recurring/components/RecurringPage";

export const metadata: Metadata = { title: "Recurring · rm-diagram" };

export default function Page() {
  return <RecurringPage />;
}
