'use client';

import React, { createContext, useContext, useState } from 'react';

type DashboardContextType = {
  headerExtra: React.ReactNode | null;
  setHeaderExtra: (content: React.ReactNode | null) => void;
  selectedModuleId: number | null;
  setSelectedModuleId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedModuleName: string | null;
  setSelectedModuleName: (name: string | null) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedModuleName, setSelectedModuleName] = useState<string | null>(null);

  return (
    <DashboardContext.Provider value={{ 
      headerExtra, 
      setHeaderExtra,
      selectedModuleId,
      setSelectedModuleId,
      selectedModuleName,
      setSelectedModuleName
    }}>
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
