import type { Metadata } from "next";
import { AiPage } from "@/features/ai/components/AiPage";

export const metadata: Metadata = { title: "AI Coach · rm-diagram" };

export default function AiRoute() {
  return <AiPage />;
}
