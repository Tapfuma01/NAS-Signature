"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastState = { message: string; variant: "success" | "warning" } | null;

type Props = {
  disabled?: boolean;
  /** Called on each copy click so `window.location.origin` is read at gesture time. */
  buildHtml: () => string;
  plainText: string;
};

function legacyCopyPlainText(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export function CopySignatureButton({ disabled, buildHtml, plainText }: Props) {
  const [toast, setToast] = useState<ToastState>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: "success" | "warning") => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ message, variant });
    hideTimer.current = setTimeout(() => {
      setToast(null);
      hideTimer.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const html = buildHtml();

    const tryRich = async (): Promise<boolean> => {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        return false;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ]);
        return true;
      } catch {
        return false;
      }
    };

    if (await tryRich()) {
      showToast("Copied to clipboard", "success");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
        showToast("Copied plain text only", "warning");
        return;
      }
    } catch {
      /* fall through */
    }

    if (legacyCopyPlainText(plainText)) {
      showToast("Copied plain text only", "warning");
    } else {
      showToast("Copy failed — try selecting and copying manually", "warning");
    }
  }, [buildHtml, plainText, showToast]);

  return (
    <div className="relative flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={handleCopy}
        className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        Copy signature
      </button>
      <div
        className={`pointer-events-none min-h-[1.25rem] text-sm transition-opacity duration-300 ${
          toast ? "opacity-100" : "opacity-0"
        } ${toast?.variant === "warning" ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast?.message ?? "\u00a0"}
      </div>
    </div>
  );
}
