import type { Metadata } from "next";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export const metadata: Metadata = { title: "Settings · rm-diagram" };

export default function SettingsRoute() {
  return <SettingsPage />;
}
