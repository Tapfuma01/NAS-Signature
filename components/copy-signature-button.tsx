"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { buildOutlookHtmFile, downloadHtmlFile, wrapHtmlForClipboard } from "@/lib/clipboard-html";
import { isLocalhostImageUrl } from "@/lib/signature-render/image-url";
import { getPlatformMeta } from "@/lib/platform-install";
import type { TargetPlatform } from "@/types/signature-document";
import { Download } from "lucide-react";
import { toast } from "sonner";

type Props = {
  disabled?: boolean;
  targetPlatform?: TargetPlatform;
  /** Override button label; defaults to platform-specific label. */
  buttonLabel?: string;
  /** Called on each copy click so HTML is built at gesture time. */
  buildHtml: () => string;
  plainText: string;
  /** Show .htm download for Outlook desktop (IT / manual install). */
  showOutlookDownload?: boolean;
  /** Base filename without extension for .htm download. */
  downloadBasename?: string;
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

export function CopySignatureButton({
  disabled,
  targetPlatform = "generic",
  buttonLabel,
  buildHtml,
  plainText,
  showOutlookDownload = true,
  downloadBasename = "email-signature",
}: Props) {
  const meta = getPlatformMeta(targetPlatform);
  const label = buttonLabel ?? meta.copyButtonLabel;

  const handleCopy = useCallback(async () => {
    const rawHtml = buildHtml();
    const imgSrcMatch = rawHtml.match(/<img[^>]+src="([^"]+)"/i);
    const imgSrc = imgSrcMatch?.[1] ?? "";
    if (imgSrc && isLocalhostImageUrl(imgSrc)) {
      toast.warning("Logo may not appear in Gmail", {
        description:
          "The logo URL points to localhost. Set NEXT_PUBLIC_APP_URL to your public site, or add an HTTPS logo URL under Organization settings.",
      });
    }
    const html = wrapHtmlForClipboard(rawHtml, targetPlatform);

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
      toast.success(meta.copySuccessTitle, {
        description: meta.copySuccessDescription,
      });
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
        toast.warning("Copied plain text only", {
          description: meta.plainTextFallbackHint,
        });
        return;
      }
    } catch {
      /* fall through */
    }

    if (legacyCopyPlainText(plainText)) {
      toast.warning("Copied plain text only", {
        description: meta.plainTextFallbackHint,
      });
    } else {
      toast.error("Copy failed", {
        description: "Try Download .htm (Outlook) or select the preview and copy manually.",
      });
    }
  }, [buildHtml, plainText, targetPlatform, meta]);

  const handleDownloadHtm = useCallback(() => {
    const rawHtml = buildHtml();
    const file = buildOutlookHtmFile(rawHtml, downloadBasename);
    downloadHtmlFile(file, `${downloadBasename.replace(/[^\w.-]+/g, "-")}.htm`);
    toast.success("Downloaded signature .htm", {
      description: "Open in Word or paste into Outlook signature settings.",
    });
  }, [buildHtml, downloadBasename]);

  const showDownload =
    showOutlookDownload &&
    (targetPlatform === "outlook_desktop" || targetPlatform === "microsoft_365");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={handleCopy}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {label}
      </button>
      {showDownload ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-h-11"
          onClick={handleDownloadHtm}
        >
          <Download className="size-4" />
          Download .htm
        </Button>
      ) : null}
    </div>
  );
}
