"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { saveSignatureDesign } from "@/app/actions/signatures";
import { EditorBlockInspector } from "@/components/editor/editor-block-inspector";
import { EditorBlockPalette } from "@/components/editor/editor-block-palette";
import { EditorMobileTabs } from "@/components/editor/editor-mobile-tabs";
import { EditorSortableBlocks } from "@/components/editor/editor-sortable-blocks";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { PlatformSelect } from "@/components/platform-select";
import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { SignatureHtmlPreview } from "@/components/signature-html-preview";
import { buildPlainTextFromDocument } from "@/lib/signature-render/plain-text";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { contentToFieldValues } from "@/lib/signature-render/form-to-document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentHistory } from "@/hooks/use-document-history";
import {
  duplicateBlock,
  insertBlock,
  removeBlock,
  reorderBlocks,
  updateBlock,
} from "@/lib/document-editor/document-mutations";
import { resolveSignatureDocument } from "@/lib/signature-resolve";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";
import { toast } from "sonner";

type Props = {
  signature: SignatureRow;
  org: OrgBrand;
  assetsBaseUrl: string;
};

export function SignatureEditor({ signature, org, assetsBaseUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [member, setMember] = useState<SignatureFormState>({
    fullName: signature.name,
    jobTitle: signature.job_title,
    phone: signature.phone,
    email: signature.email,
    whatsapp: signature.whatsapp ?? "",
  });

  const publicUrl = `${assetsBaseUrl.replace(/\/+$/, "")}/${signature.slug}`;

  const initialDocument = resolveSignatureDocument({
    row: signature,
    org,
    member,
    assetsBaseUrl,
    templateId: signature.template_id,
    targetPlatform: signature.target_platform,
  });

  const { document, setDocument, undo, redo, canUndo, canRedo } = useDocumentHistory(initialDocument);
  const selectedBlock = document.blocks.find((b) => b.id === selectedId) ?? null;

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const res = await saveSignatureDesign({
        id: signature.id,
        name: member.fullName,
        jobTitle: member.jobTitle,
        email: member.email,
        phone: member.phone,
        whatsapp: member.whatsapp || null,
        avatarUrl: signature.avatar_url,
        templateId: document.templateId,
        targetPlatform: document.targetPlatform,
        document,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Signature saved");
        router.refresh();
      }
    });
  }, [signature.id, signature.avatar_url, member, document, router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, handleSave]);

  const blocksPanel = (
    <Card className="shadow-sm">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Blocks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <EditorBlockPalette
          disabled={pending}
          onAdd={(block) => {
            setDocument((d) => insertBlock(d, block));
            setSelectedId(block.id);
          }}
        />
        <EditorSortableBlocks
          blocks={document.blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          disabled={pending}
          onReorder={(from, to) => setDocument((d) => reorderBlocks(d, from, to))}
          onRemove={(id) => {
            setDocument((d) => removeBlock(d, id));
            if (selectedId === id) setSelectedId(null);
          }}
          onDuplicate={(id) => setDocument((d) => duplicateBlock(d, id))}
        />
      </CardContent>
    </Card>
  );

  const previewPanel = (
    <Card className="shadow-sm">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Live preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-0">
        <SignatureHtmlPreview
          org={org}
          member={member}
          templateId={document.templateId}
          targetPlatform={document.targetPlatform}
          assetsBaseUrl={assetsBaseUrl}
          document={document}
        />
        <SignatureCopyPanel
          targetPlatform={document.targetPlatform}
          onPlatformChange={(targetPlatform) => setDocument((d) => ({ ...d, targetPlatform }))}
          showPlatformSelect={false}
          downloadBasename={`${signature.slug}-signature`}
          buildHtml={() => {
            const fields = contentToFieldValues({ ...member, ...org });
            return renderSignatureDocument({
              document,
              fields,
              assetsBaseUrl,
              orgLogoUrl: org.logoUrl,
              options: { assetsBaseUrl, targetPlatform: document.targetPlatform },
            });
          }}
          plainText={buildPlainTextFromDocument(
            document,
            contentToFieldValues({ ...member, ...org }),
          )}
        />
      </CardContent>
    </Card>
  );

  const propertiesPanel = (
    <>
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Contact fields</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          {(
            [
              ["fullName", "Full name"],
              ["jobTitle", "Job title"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["whatsapp", "WhatsApp"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-1.5">
              <Label className="text-xs">{label}</Label>
              <Input
                value={member[key]}
                disabled={pending}
                onChange={(e) => setMember((m) => ({ ...m, [key]: e.target.value }))}
              />
            </div>
          ))}
          <PlatformSelect
            value={document.targetPlatform}
            onChange={(targetPlatform: TargetPlatform) =>
              setDocument((d) => ({ ...d, targetPlatform }))
            }
            disabled={pending}
          />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Block properties</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditorBlockInspector
            block={selectedBlock}
            document={document}
            disabled={pending}
            onUpdate={(blockId, patch) => setDocument((d) => updateBlock(d, blockId, patch))}
            onDocumentPatch={(patch) => setDocument((d) => ({ ...d, ...patch }))}
          />
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar
        name={member.fullName || signature.name}
        slug={signature.slug}
        publicUrl={publicUrl}
        canUndo={canUndo}
        canRedo={canRedo}
        pending={pending}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
      />

      <EditorMobileTabs
        blocksPanel={blocksPanel}
        previewPanel={previewPanel}
        propertiesPanel={propertiesPanel}
      />

      <div className="hidden flex-1 gap-4 lg:grid lg:grid-cols-[minmax(220px,260px)_1fr_minmax(260px,300px)] lg:items-start">
        <aside className="sticky top-20 flex flex-col gap-4 self-start">{blocksPanel}</aside>
        <section className="min-w-0">{previewPanel}</section>
        <aside className="sticky top-20 flex flex-col gap-4 self-start">{propertiesPanel}</aside>
      </div>
    </div>
  );
}
