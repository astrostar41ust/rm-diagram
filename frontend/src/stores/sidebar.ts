import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  expandedItems: Set<string>;
  toggle: () => void;
  toggleItem: (key: string) => void;
  collapseAll: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  expandedItems: new Set<string>(),
  toggle: () =>
    set((s) => ({
      isOpen: !s.isOpen,
      expandedItems: s.isOpen ? new Set<string>() : s.expandedItems,
    })),
  toggleItem: (key) =>
    set((s) => {
      const next = new Set(s.expandedItems);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { expandedItems: next };
    }),
  collapseAll: () => set({ expandedItems: new Set<string>() }),
}));
