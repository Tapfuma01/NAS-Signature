"use client";

import { useCallback } from "react";
import { toast } from "sonner";

type Props = {
  disabled?: boolean;
  /** Button label (default: Copy signature). */
  buttonLabel?: string;
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

export function CopySignatureButton({ disabled, buttonLabel = "Copy signature", buildHtml, plainText }: Props) {
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
      toast.success("Copied to clipboard", {
        description: "Rich HTML and plain text were copied where supported.",
      });
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
        toast.warning("Copied plain text only", {
          description: "Your browser did not allow rich HTML on the clipboard.",
        });
        return;
      }
    } catch {
      /* fall through */
    }

    if (legacyCopyPlainText(plainText)) {
      toast.warning("Copied plain text only", {
        description: "Used a fallback copy method.",
      });
    } else {
      toast.error("Copy failed", {
        description: "Try selecting the signature and copying manually.",
      });
    }
  }, [buildHtml, plainText]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
    >
      {buttonLabel}
    </button>
  );
}
