import type { Metadata } from "next";
import { NetWorthPage } from "@/features/networth/components/NetWorthPage";

export const metadata: Metadata = { title: "Net worth · rm-diagram" };

export default function Page() {
  return <NetWorthPage />;
}
