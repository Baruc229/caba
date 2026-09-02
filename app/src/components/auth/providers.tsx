"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/components/providers/app-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        <ToastProvider>{children}</ToastProvider>
      </AppProvider>
    </SessionProvider>
  );
}
