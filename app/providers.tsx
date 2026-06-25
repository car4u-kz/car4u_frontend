"use client";

import { useEffect, useRef, useState } from "react";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { LoadingProvider, useLoading } from "@/context/loading-context";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function LoadingOverlay() {
  const { isLoading } = useLoading();
  const [isVisible, setIsVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (isLoading) {
      if (isVisible) {
        return clearTimers;
      }

      if (!showTimerRef.current) {
        showTimerRef.current = setTimeout(() => {
          shownAtRef.current = Date.now();
          setIsVisible(true);
          showTimerRef.current = null;
        }, 250);
      }

      return clearTimers;
    }

    clearTimers();

    if (!isVisible) {
      return clearTimers;
    }

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const remainingVisibleMs = Math.max(0, 250 - elapsed);

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      shownAtRef.current = null;
      hideTimerRef.current = null;
    }, remainingVisibleMs);

    return clearTimers;
  }, [isLoading, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
    >
      <CircularProgress />
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <LoadingProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <LoadingOverlay />
      </QueryClientProvider>
    </LoadingProvider>
  );
}
