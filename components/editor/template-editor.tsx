"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useState, useTransition } from "react";
import { saveTemplateDesign } from "@/app/actions/templates";
import { EditorBlockInspector } from "@/components/editor/editor-block-inspector";
import { EditorBlockPalette } from "@/components/editor/editor-block-palette";
import { EditorMobileTabs } from "@/components/editor/editor-mobile-tabs";
import { EditorSortableBlocks } from "@/components/editor/editor-sortable-blocks";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { PlatformSelect } from "@/components/platform-select";
import { SignatureHtmlPreview } from "@/components/signature-html-preview";
import { buildDocumentFromTemplate, themeFromOrgBrand } from "@/lib/templates";
import { fieldsFromOrgAndForm } from "@/lib/templates";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentHistory } from "@/hooks/use-document-history";
import {
  duplicateBlock,
  insertBlock,
  removeBlock,
  reorderBlocks,
  updateBlock,
} from "@/lib/document-editor/document-mutations";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import { toast } from "sonner";

const SAMPLE_MEMBER: SignatureFormState = {
  fullName: "Alex Morgan",
  jobTitle: "Marketing Manager",
  email: "alex@example.com",
  phone: "+27 12 345 6789",
  whatsapp: "+27 82 000 0000",
  customFields: {},
};

type Props = {
  template: SignatureTemplateDefinition;
  org: OrgBrand;
  assetsBaseUrl: string;
  isDefaultTemplate?: boolean;
};

export function TemplateEditor({ template, org, assetsBaseUrl, isDefaultTemplate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialDocument = buildDocumentFromTemplate({
    templateId: template.id,
    template,
    fields: fieldsFromOrgAndForm(org, SAMPLE_MEMBER),
    theme: themeFromOrgBrand(org),
    targetPlatform: "generic",
    assetsBaseUrl,
    orgLogoUrl: org.logoUrl,
  });

  const { document, setDocument, undo, redo, canUndo, canRedo } = useDocumentHistory(initialDocument);
  const previewDocument = useDeferredValue(document);
  const selectedBlock = document.blocks.find((b) => b.id === selectedId) ?? null;

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const res = await saveTemplateDesign({
        templateId: template.id,
        document,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Template saved — all linked signatures will use this design");
        router.refresh();
      }
    });
  }, [template.id, document, router]);

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
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Blocks</CardTitle>
        <p className="text-muted-foreground text-xs">
          Drag to reorder. Changes apply to every signature using this template.
        </p>
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
    <Card className="shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Live preview</CardTitle>
        <p className="text-muted-foreground text-xs">Sample contact data for preview only.</p>
      </CardHeader>
      <CardContent className="pt-0">
        <SignatureHtmlPreview
          org={org}
          member={SAMPLE_MEMBER}
          templateId={previewDocument.templateId}
          targetPlatform={previewDocument.targetPlatform}
          assetsBaseUrl={assetsBaseUrl}
          document={previewDocument}
        />
      </CardContent>
    </Card>
  );

  const propertiesPanel = (
    <>
      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {template.description}
            {isDefaultTemplate ? (
              <span className="mt-2 block font-medium text-primary">
                This is the active default template for the public generator.
              </span>
            ) : null}
          </p>
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
        name={template.name}
        slug={template.id}
        publicUrl=""
        canUndo={canUndo}
        canRedo={canRedo}
        pending={pending}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        saveLabel="Save template"
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
