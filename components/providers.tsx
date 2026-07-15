"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </ThemeProvider>
    </SessionProvider>
  );
}
