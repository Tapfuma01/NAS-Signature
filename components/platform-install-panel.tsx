"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPlatformMeta, PLATFORM_META } from "@/lib/platform-install";
import type { TargetPlatform } from "@/types/signature-document";
import { TARGET_PLATFORMS } from "@/types/signature-document";
import { cn } from "@/lib/utils";

type Props = {
  /** Highlights instructions for the selected platform. */
  activePlatform: TargetPlatform;
  className?: string;
};

export function PlatformInstallPanel({ activePlatform, className }: Props) {
  const active = getPlatformMeta(activePlatform);

  return (
    <div className={cn(className)}>
      <h2 className="font-heading text-sm font-semibold tracking-tight">How to install</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Steps for <span className="text-foreground font-medium">{active.label}</span> — copy above,
        then paste in your signature settings (not in a new email).
      </p>
      <Accordion key={activePlatform} defaultValue={[activePlatform]} className="mt-4 w-full">
        {TARGET_PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform];
          return (
            <AccordionItem key={platform} value={platform}>
              <AccordionTrigger>{meta.installAccordionTitle}</AccordionTrigger>
              <AccordionContent>
                <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
                  {meta.installSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {meta.installTips && meta.installTips.length > 0 ? (
                  <ul className="text-muted-foreground mt-4 list-disc space-y-1.5 pl-4 text-xs">
                    {meta.installTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
