"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { TemplateEditor } from "@/components/editor/template-editor";

const TemplateEditorLazy = dynamic(
  () => import("@/components/editor/template-editor").then((m) => m.TemplateEditor),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex min-h-[320px] items-center justify-center text-sm">
        Loading editor…
      </div>
    ),
  },
);

export function TemplateEditorLoader(props: ComponentProps<typeof TemplateEditor>) {
  return <TemplateEditorLazy {...props} />;
}
