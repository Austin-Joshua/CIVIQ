import { create } from 'zustand';

interface UIState {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;
  
  // Report State
  activeReport: { type: string; data: any } | null;
  openReport: (type: string, data: any) => void;
  closeReport: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),

  activeReport: null,
  openReport: (type, data) => set({ activeReport: { type, data } }),
  closeReport: () => set({ activeReport: null }),
}));
