"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { uploadPublicAsset } from "@/app/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

type Props = {
  avatarUrl: string;
  onAvatarUrlChange: (url: string) => void;
  disabled?: boolean;
  r2Enabled: boolean;
};

export function AvatarUploadField({
  avatarUrl,
  onAvatarUrlChange,
  disabled,
  r2Enabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, startUpload] = useTransition();
  const busy = uploading || disabled;

  const uploadFile = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.set("file", file);
      startUpload(async () => {
        const res = await uploadPublicAsset(formData);
        if (!res.ok) toast.error(res.message);
        else {
          onAvatarUrlChange(res.url);
          toast.success("Avatar uploaded");
        }
        if (inputRef.current) inputRef.current.value = "";
      });
    },
    [onAvatarUrlChange],
  );

  return (
    <div className="grid gap-2">
      <Label>Avatar (optional)</Label>
      {r2Enabled ? (
        <div
          className={cn(
            "rounded-lg border border-dashed p-4 transition-colors",
            dragOver && "border-primary bg-primary/5",
            busy && "opacity-60",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (busy) return;
            const file = e.dataTransfer.files?.[0];
            if (file) uploadFile(file);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload image
            </Button>
            {avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => onAvatarUrlChange("")}
              >
                <Trash2 className="size-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <Input
        value={avatarUrl}
        onChange={(e) => onAvatarUrlChange(e.target.value)}
        placeholder="https://…"
        disabled={busy}
      />
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-12 w-12 rounded-full border object-cover"
        />
      ) : null}
    </div>
  );
}
