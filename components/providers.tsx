"use client";

import { ThemeProvider } from "next-themes";
import { BrandedToaster } from "@/components/branded-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <BrandedToaster />
    </ThemeProvider>
  );
}
