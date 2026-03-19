import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;
  
  // Sidebar Collapse (Desktop)
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Workspace State
  selectedWorkspace: string;
  setSelectedWorkspace: (id: string) => void;
  
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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
      openMobileSidebar: () => set({ isMobileSidebarOpen: true }),

      isSidebarCollapsed: false,
      toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),

      selectedWorkspace: 'civiq-demo-city',
      setSelectedWorkspace: (id: string) => set({ selectedWorkspace: id }),

      activeReport: null,
      openReport: (type, data) => set({ activeReport: { type, data } }),
      closeReport: () => set({ activeReport: null }),
    }),
    {
      name: 'civiq-ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain states
      partialize: (state) => ({ 
        isSidebarCollapsed: state.isSidebarCollapsed,
        selectedWorkspace: state.selectedWorkspace 
      }),
    }
  )
);
