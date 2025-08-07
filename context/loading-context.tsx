import React, { createContext, useContext, useState } from "react";

interface LoadingContextValue {
  loadingCount: number;
  startLoading: () => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((c) => c + 1);
  const stopLoading = () => setLoadingCount((c) => Math.max(0, c - 1));

  return (
    <LoadingContext.Provider
      value={{ loadingCount, startLoading, stopLoading, isLoading: loadingCount > 0 }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
