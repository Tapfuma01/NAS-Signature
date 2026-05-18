"use client";

import { CopySignatureButton } from "@/components/copy-signature-button";
import { PlatformInstallPanel } from "@/components/platform-install-panel";
import { PlatformSelect } from "@/components/platform-select";
import { getPlatformMeta } from "@/lib/platform-install";
import type { TargetPlatform } from "@/types/signature-document";

type Props = {
  targetPlatform: TargetPlatform;
  onPlatformChange: (platform: TargetPlatform) => void;
  disabled?: boolean;
  buildHtml: () => string;
  plainText: string;
  downloadBasename?: string;
  showPlatformSelect?: boolean;
  showInstallPanel?: boolean;
};

export function SignatureCopyPanel({
  targetPlatform,
  onPlatformChange,
  disabled,
  buildHtml,
  plainText,
  downloadBasename,
  showPlatformSelect = true,
  showInstallPanel = true,
}: Props) {
  const meta = getPlatformMeta(targetPlatform);

  return (
    <div className="flex flex-col gap-6">
      {showPlatformSelect ? (
        <PlatformSelect
          value={targetPlatform}
          onChange={onPlatformChange}
          disabled={disabled}
        />
      ) : null}

      <div>
        <CopySignatureButton
          disabled={disabled}
          targetPlatform={targetPlatform}
          buildHtml={buildHtml}
          plainText={plainText}
          downloadBasename={downloadBasename}
        />
        <p className="text-muted-foreground mt-2 text-xs">{meta.hint}</p>
      </div>

      {showInstallPanel ? <PlatformInstallPanel activePlatform={targetPlatform} /> : null}
    </div>
  );
}
