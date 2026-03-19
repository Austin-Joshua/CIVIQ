import { create } from 'zustand';

interface UIState {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;
  
  // Report State
  activeReport: { type: string; data: ReportData } | null;
  openReport: (type: string, data: ReportData) => void;
  closeReport: () => void;
}

export interface ReportData {
  label?: string;
  value?: string | number;
  unit?: string;
  change?: { value: string; positive: boolean };
  type?: string;
  severity?: string;
  message?: string;
  time?: string;
  [key: string]: unknown;
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
