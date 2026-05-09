import type { Metadata } from "next";
import { SubscriptionsPage } from "@/features/subscription/components/SubscriptionsPage";

export const metadata: Metadata = { title: "Subscriptions · rm-diagram" };

export default function Page() {
  return <SubscriptionsPage />;
}
