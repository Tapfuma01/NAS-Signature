"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

function SonnerToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <SonnerToaster />
    </ThemeProvider>
  );
}
