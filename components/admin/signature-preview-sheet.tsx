"use client";

import { SignatureHtmlPreview } from "@/components/signature-html-preview";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { signatureRowToFormState } from "@/lib/signature-map";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureRow } from "@/types/signature-row";

type Props = {
  row: SignatureRow | null;
  onClose: () => void;
  org: OrgBrand;
  publicBaseUrl: string;
};

export function SignaturePreviewSheet({ row, onClose, org, publicBaseUrl }: Props) {
  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{row?.name ?? "Preview"}</SheetTitle>
          <SheetDescription>Live HTML preview for this teammate&apos;s signature.</SheetDescription>
        </SheetHeader>
        {row ? (
          <div className="bg-muted/30 mt-4 overflow-auto rounded-lg border p-4">
            <SignatureHtmlPreview
              org={org}
              member={signatureRowToFormState(row)}
              templateId={row.template_id}
              targetPlatform={row.target_platform}
              assetsBaseUrl={publicBaseUrl}
              storedRow={row}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
