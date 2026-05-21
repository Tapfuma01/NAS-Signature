"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster, type ToasterProps } from "sonner";

const STYLE_ID = "sonner-c4-brand-overrides";

/** Literal colors — Sonner injects default green CSS at runtime, so we re-inject after it. */
const INJECTED_CSS = `
[data-sonner-toaster][data-sonner-theme="light"] {
  --success-bg: hsl(32, 44%, 96%) !important;
  --success-border: hsl(32, 44%, 60%, 0.45) !important;
  --success-text: hsl(32, 44%, 38%) !important;
  --warning-bg: hsl(36, 40%, 94%) !important;
  --warning-border: hsl(32, 44%, 60%, 0.4) !important;
  --warning-text: hsl(0, 0%, 24%) !important;
  --error-bg: hsl(0, 70%, 97%) !important;
  --error-border: hsl(0, 84%, 60%, 0.35) !important;
  --error-text: hsl(0, 84%, 45%) !important;
}
[data-sonner-toaster][data-sonner-theme="dark"] {
  --success-bg: hsl(32, 28%, 14%) !important;
  --success-border: hsl(32, 44%, 60%, 0.55) !important;
  --success-text: hsl(32, 48%, 72%) !important;
  --warning-bg: hsl(32, 22%, 12%) !important;
  --warning-border: hsl(32, 44%, 60%, 0.45) !important;
  --warning-text: hsl(32, 48%, 72%) !important;
  --error-bg: hsl(0, 40%, 12%) !important;
  --error-border: hsl(0, 62%, 45%, 0.45) !important;
  --error-text: hsl(358, 85%, 72%) !important;
}
[data-sonner-toaster][data-sonner-theme="dark"] [data-rich-colors="true"][data-sonner-toast][data-type="success"] {
  background: hsl(32, 28%, 14%) !important;
  border-color: hsl(32, 44%, 60%, 0.55) !important;
  color: hsl(32, 48%, 72%) !important;
}
[data-sonner-toaster][data-sonner-theme="light"] [data-rich-colors="true"][data-sonner-toast][data-type="success"] {
  background: hsl(32, 44%, 96%) !important;
  border-color: hsl(32, 44%, 60%, 0.45) !important;
  color: hsl(32, 44%, 38%) !important;
}
[data-rich-colors="true"][data-sonner-toast][data-type="success"] [data-icon] {
  color: hsl(32, 44%, 60%) !important;
}
[data-sonner-toaster][data-sonner-theme="light"] [data-rich-colors="true"][data-sonner-toast][data-type="warning"] {
  background: hsl(36, 40%, 94%) !important;
  border-color: hsl(32, 44%, 60%, 0.4) !important;
  color: hsl(0, 0%, 24%) !important;
}
[data-sonner-toaster][data-sonner-theme="dark"] [data-rich-colors="true"][data-sonner-toast][data-type="warning"] {
  background: hsl(32, 22%, 12%) !important;
  border-color: hsl(32, 44%, 60%, 0.45) !important;
  color: hsl(32, 48%, 72%) !important;
}
[data-sonner-toaster][data-sonner-theme="light"] [data-rich-colors="true"][data-sonner-toast][data-type="error"] {
  background: hsl(0, 70%, 97%) !important;
  border-color: hsl(0, 84%, 60%, 0.35) !important;
  color: hsl(0, 84%, 45%) !important;
}
[data-sonner-toaster][data-sonner-theme="dark"] [data-rich-colors="true"][data-sonner-toast][data-type="success"] [data-close-button],
[data-sonner-toaster][data-sonner-theme="light"] [data-rich-colors="true"][data-sonner-toast][data-type="success"] [data-close-button] {
  background: inherit !important;
  border-color: inherit !important;
  color: inherit !important;
}
[data-sonner-toaster][data-sonner-theme="dark"] [data-rich-colors="true"][data-sonner-toast][data-type="error"] {
  background: hsl(0, 40%, 12%) !important;
  border-color: hsl(0, 62%, 45%, 0.45) !important;
  color: hsl(358, 85%, 72%) !important;
}
[data-sonner-toast][data-styled="true"] [data-title] {
  font-family: var(--font-c4-heading), ui-sans-serif, system-ui, sans-serif !important;
}
`;

const toastClassNames = {
  toast: "!rounded-xl !shadow-soft !border",
  title: "font-heading text-sm font-semibold tracking-tight",
  description: "text-xs leading-relaxed opacity-90",
  closeButton: "!border-border !bg-card hover:!bg-muted",
  success: "!border-l-[3px] !border-l-[hsl(32,44%,60%)]",
  error: "!border-l-[3px] !border-l-destructive",
  warning: "!border-l-[3px] !border-l-[hsl(32,44%,48%)]",
  info: "!border-l-[3px] !border-l-[hsl(32,44%,60%)]/70",
  actionButton: "!bg-primary !text-primary-foreground hover:!opacity-90 !rounded-md",
  cancelButton: "!bg-muted !text-foreground hover:!opacity-90 !rounded-md",
};

function useBrandToastStyle(theme: "light" | "dark"): ToasterProps["style"] {
  return useMemo(() => {
    if (theme === "dark") {
      return {
        "--success-bg": "hsl(32, 28%, 14%)",
        "--success-border": "hsla(32, 44%, 60%, 0.55)",
        "--success-text": "hsl(32, 48%, 72%)",
        "--warning-bg": "hsl(32, 22%, 12%)",
        "--warning-border": "hsla(32, 44%, 60%, 0.45)",
        "--warning-text": "hsl(32, 48%, 72%)",
        "--error-bg": "hsl(0, 40%, 12%)",
        "--error-border": "hsla(0, 62%, 45%, 0.45)",
        "--error-text": "hsl(358, 85%, 72%)",
        "--normal-bg": "hsl(0, 0%, 11%)",
        "--normal-border": "hsl(0, 0%, 18%)",
        "--normal-text": "hsl(0, 0%, 98%)",
      } as CSSProperties;
    }
    return {
      "--success-bg": "hsl(32, 44%, 96%)",
      "--success-border": "hsla(32, 44%, 60%, 0.45)",
      "--success-text": "hsl(32, 44%, 38%)",
      "--warning-bg": "hsl(36, 40%, 94%)",
      "--warning-border": "hsla(32, 44%, 60%, 0.4)",
      "--warning-text": "hsl(0, 0%, 24%)",
      "--error-bg": "hsl(0, 70%, 97%)",
      "--error-border": "hsla(0, 84%, 60%, 0.35)",
      "--error-text": "hsl(0, 84%, 45%)",
      "--normal-bg": "hsl(0, 0%, 100%)",
      "--normal-border": "hsl(34, 24%, 87%)",
      "--normal-text": "hsl(40, 4%, 10%)",
    } as CSSProperties;
  }, [theme]);
}

export function BrandedToaster() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const brandStyle = useBrandToastStyle(theme);

  useEffect(() => {
    const inject = () => {
      let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.id = STYLE_ID;
        el.textContent = INJECTED_CSS;
      }
      // Keep our overrides after Sonner's runtime-injected stylesheet.
      document.head.appendChild(el);
    };
    inject();
    const t0 = window.setTimeout(inject, 0);
    const t1 = window.setTimeout(inject, 50);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, []);

  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={false}
      gap={10}
      theme={theme}
      style={brandStyle}
      toastOptions={{
        classNames: toastClassNames,
      }}
    />
  );
}
