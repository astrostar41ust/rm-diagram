import type { Metadata } from "next";
import { NoteList } from "@/features/note/components/NoteList";

export const metadata: Metadata = { title: "Notes · rm-diagram" };

export default function NotesPage() {
  return <NoteList />;
}
