import { create } from "zustand";

interface UIState {
  isMobileDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileDrawerOpen: false,
  openDrawer: () => set({ isMobileDrawerOpen: true }),
  closeDrawer: () => set({ isMobileDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isMobileDrawerOpen: !s.isMobileDrawerOpen })),
}));
