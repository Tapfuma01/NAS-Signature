import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationSettings } from "@/lib/data";
import { loadAllTemplates } from "@/lib/templates/store";
import { Pencil } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Templates",
};

export default async function AdminTemplatesPage() {
  const [templates, orgSettings] = await Promise.all([
    loadAllTemplates(),
    getOrganizationSettings(),
  ]);
  const defaultId = orgSettings.default_template_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Signature templates</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Global layouts shared by all team signatures. Editing a template updates every member
          linked to it instantly — no per-person regeneration.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Layout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.name}
                  {t.id === defaultId ? (
                    <Badge className="ml-2" variant="default">
                      Active default
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.category}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {t.layoutStyle}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/templates/${t.id}/edit`}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium shadow-xs hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    Edit design
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
