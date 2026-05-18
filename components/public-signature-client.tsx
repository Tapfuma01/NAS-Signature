"use client";

import { CopySignatureButton } from "@/components/copy-signature-button";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature, buildSignatureHtml } from "@/components/SignatureTemplate";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
};

export function PublicSignatureClient({ org, member, assetsBaseUrl }: Props) {
  const content = { ...member, ...org };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <TemplateWrapper org={org} member={member} eyebrow="" />
      <div>
        <CopySignatureButton
          buttonLabel="Copy to clipboard"
          disabled={!member.fullName.trim()}
          plainText={buildPlainTextSignature(content)}
          buildHtml={() => buildSignatureHtml({ ...content, assetsBaseUrl })}
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Copies rich HTML for Gmail / Outlook where supported, with plain text fallback.
        </p>
      </div>
      <div>
        <h2 className="font-heading text-sm font-semibold tracking-tight">How to install</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick your email app and paste the signature into the signature editor.
        </p>
        <Accordion defaultValue={[]} className="mt-4 w-full">
          <AccordionItem value="outlook">
            <AccordionTrigger>Microsoft Outlook (desktop)</AccordionTrigger>
            <AccordionContent>
              <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
                <li>Open Outlook and go to File → Options → Mail → Signatures.</li>
                <li>Under “Select signature to edit”, choose New and name your signature.</li>
                <li>Paste into the editor (Ctrl+V / ⌘V). Use “Copy to clipboard” above for best results.</li>
                <li>Assign the signature for New messages and Replies, then save.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="gmail">
            <AccordionTrigger>Gmail (web)</AccordionTrigger>
            <AccordionContent>
              <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
                <li>Open Gmail → Settings (gear) → See all settings.</li>
                <li>Under “General”, find “Signature” and create or edit a signature.</li>
                <li>Paste into the rich text box, then scroll down and save changes.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="apple">
            <AccordionTrigger>Apple Mail (Mac)</AccordionTrigger>
            <AccordionContent>
              <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
                <li>Open Mail → Settings → Signatures.</li>
                <li>Select your account, add a signature, and paste into the right-hand preview.</li>
                <li>Close settings; choose this signature when composing new mail if needed.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
