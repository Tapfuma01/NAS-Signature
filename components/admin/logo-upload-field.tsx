"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { clearOrganizationLogo, uploadOrganizationLogo } from "@/app/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

type Props = {
  logoUrl: string;
  onLogoUrlChange: (url: string) => void;
  disabled?: boolean;
  r2Enabled: boolean;
};

export function LogoUploadField({ logoUrl, onLogoUrlChange, disabled, r2Enabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, startUpload] = useTransition();
  const [clearing, startClear] = useTransition();
  const busy = uploading || clearing || disabled;

  const uploadFile = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.set("file", file);

      startUpload(async () => {
        const res = await uploadOrganizationLogo(formData);
        if (!res.ok) {
          toast.error(res.message);
        } else {
          onLogoUrlChange(res.url);
          toast.success("Logo uploaded to Cloudflare R2");
        }
        if (inputRef.current) inputRef.current.value = "";
      });
    },
    [onLogoUrlChange],
  );

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (busy || !r2Enabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function onClear() {
    startClear(async () => {
      const res = await clearOrganizationLogo();
      if (!res.ok) toast.error(res.message);
      else {
        onLogoUrlChange("");
        toast.success("Logo removed");
      }
    });
  }

  async function copyUrl() {
    if (!logoUrl) return;
    try {
      await navigator.clipboard.writeText(logoUrl);
      toast.success("Logo URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  }

  if (!r2Enabled) {
    return (
      <div className="grid gap-3">
        <Label>Company logo</Label>
        <p className="text-muted-foreground text-xs">
          Configure CLOUDFLARE_R2_* in your environment to upload from your computer, or paste a public HTTPS
          URL below.
        </p>
        {logoUrl ? (
          <div className="bg-muted/40 flex items-center justify-center rounded-lg border p-4">
            <LogoPreview src={logoUrl} />
          </div>
        ) : null}
        <ManualLogoUrlInput logoUrl={logoUrl} onLogoUrlChange={onLogoUrlChange} disabled={busy} />
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <Label htmlFor="logo-upload">Company logo</Label>
      <p className="text-muted-foreground text-xs">
        Pick a file from your computer — it uploads to Cloudflare R2 and the public URL is saved automatically.
      </p>

      <input
        ref={inputRef}
        id="logo-upload"
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={onFileChange}
      />

      {logoUrl ? (
        <div className="bg-muted/40 flex items-center justify-between gap-4 rounded-lg border p-4">
          <LogoPreview src={logoUrl} />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClear} className="shrink-0">
            {clearing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Remove
          </Button>
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!busy) inputRef.current?.click();
          }
        }}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver && "border-primary bg-primary/5",
          !dragOver && "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
          busy && "pointer-events-none opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 className="text-muted-foreground size-10 animate-spin" />
        ) : (
          <Upload className="text-muted-foreground size-10" />
        )}
        <div>
          <p className="text-sm font-medium">
            {logoUrl ? "Drop a new image or click to replace" : "Choose an image from your computer"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">PNG, JPEG, WebP, GIF, or SVG · max 2 MB</p>
        </div>
      </div>

      {logoUrl ? (
        <div className="grid gap-2">
          <Label htmlFor="logoUrlReadonly" className="text-xs">
            Public logo URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="logoUrlReadonly"
              value={logoUrl}
              readOnly
              className="font-mono text-xs"
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={busy}
              onClick={copyUrl}
              aria-label="Copy logo URL"
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ManualLogoUrlInput({
  logoUrl,
  onLogoUrlChange,
  disabled,
}: {
  logoUrl: string;
  onLogoUrlChange: (url: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="logoUrl" className="text-muted-foreground text-xs font-normal">
        Logo URL (HTTPS)
      </Label>
      <Input
        id="logoUrl"
        value={logoUrl}
        onChange={(e) => onLogoUrlChange(e.target.value)}
        placeholder="https://…"
        disabled={disabled}
      />
    </div>
  );
}

function LogoPreview({ src }: { src: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Current logo" className="max-h-24 max-w-full object-contain" />
    </div>
  );
}
