'use client';

import React, { createContext, useContext, useState } from 'react';

type DashboardContextType = {
  headerExtra: React.ReactNode | null;
  setHeaderExtra: (content: React.ReactNode | null) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode | null>(null);

  return (
    <DashboardContext.Provider value={{ headerExtra, setHeaderExtra }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
