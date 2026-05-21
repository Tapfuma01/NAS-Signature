"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  blocksPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  propertiesPanel: React.ReactNode;
};

export function EditorMobileTabs({ blocksPanel, previewPanel, propertiesPanel }: Props) {
  return (
    <Tabs defaultValue="preview" className="lg:hidden">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="blocks">Blocks</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
      </TabsList>
      <TabsContent value="blocks" className="mt-4 space-y-4">
        {blocksPanel}
      </TabsContent>
      <TabsContent value="preview" className="mt-4">
        {previewPanel}
      </TabsContent>
      <TabsContent value="properties" className="mt-4 space-y-4">
        {propertiesPanel}
      </TabsContent>
    </Tabs>
  );
}
