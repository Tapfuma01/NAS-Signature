"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  bulkDeleteSignatures,
  bulkUpdateTemplate,
  createSignature,
  deleteSignature,
  updateSignature,
} from "@/app/actions/signatures";
import {
  MemberFormDialog,
  emptyMemberForm,
  type MemberForm,
} from "@/components/admin/member-form-dialog";
import { SignaturePreviewSheet } from "@/components/admin/signature-preview-sheet";
import { SignatureRowMenu } from "@/components/admin/signature-row-menu";
import { TemplatePicker } from "@/components/template-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { memberInitials } from "@/lib/admin-utils";
import { getTemplateById } from "@/lib/templates";
import type { AdminRole } from "@/lib/auth/roles";
import { canBulkDelete, canMutateSignatures, isReadOnlyAdmin } from "@/lib/auth/roles";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureRow } from "@/types/signature-row";
import { Copy, LayoutTemplate, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

type Props = {
  rows: SignatureRow[];
  total: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  orgBrand: OrgBrand;
  organizationDefaults: { templateId: string };
  publicBaseUrl: string;
  role: AdminRole;
};

export function SignaturesPanel({
  rows,
  total,
  page,
  pageSize,
  searchQuery,
  orgBrand,
  organizationDefaults,
  publicBaseUrl,
  role,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [deleteTarget, setDeleteTarget] = useState<SignatureRow | null>(null);
  const [previewRow, setPreviewRow] = useState<SignatureRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkTemplateOpen, setBulkTemplateOpen] = useState(false);
  const [bulkTemplateId, setBulkTemplateId] = useState(organizationDefaults.templateId);

  const readOnly = isReadOnlyAdmin(role);
  const canEdit = canMutateSignatures(role);
  const canBulk = canBulkDelete(role);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const allPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const uniqueTemplates = useMemo(() => new Set(rows.map((r) => r.template_id)).size, [rows]);

  const defaultTemplateName = getTemplateById(organizationDefaults.templateId).name;

  function publicUrlForSlug(slug: string) {
    return `${publicBaseUrl.replace(/\/+$/, "")}/${slug}`;
  }

  const pushQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      router.push(`/admin?${params.toString()}`);
    },
    [router, searchParams],
  );

  function openCreate() {
    setMemberForm({
      ...emptyMemberForm,
      templateId: organizationDefaults.templateId,
    });
    setDialogOpen(true);
  }

  function openEdit(row: SignatureRow) {
    setMemberForm({
      id: row.id,
      name: row.name,
      jobTitle: row.job_title,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp ?? "",
      avatarUrl: row.avatar_url ?? "",
      templateId: row.template_id,
      targetPlatform: row.target_platform ?? "generic",
    });
    setDialogOpen(true);
  }

  async function copyPublicLink(slug: string) {
    const url = publicUrlForSlug(slug);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: url });
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const r of rows) next.delete(r.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const r of rows) next.add(r.id);
        return next;
      });
    }
  }

  async function submitMember(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (memberForm.id) {
        const res = await updateSignature({
          id: memberForm.id,
          name: memberForm.name,
          jobTitle: memberForm.jobTitle,
          email: memberForm.email,
          phone: memberForm.phone,
          whatsapp: memberForm.whatsapp || null,
          avatarUrl: memberForm.avatarUrl || null,
          templateId: memberForm.templateId,
          targetPlatform: memberForm.targetPlatform,
        });
        if (!res.ok) toast.error(res.message);
        else {
          toast.success("Signature updated");
          setDialogOpen(false);
          router.refresh();
        }
      } else {
        const res = await createSignature({
          name: memberForm.name,
          jobTitle: memberForm.jobTitle,
          email: memberForm.email,
          phone: memberForm.phone,
          whatsapp: memberForm.whatsapp || null,
          avatarUrl: memberForm.avatarUrl || null,
          templateId: memberForm.templateId,
          targetPlatform: memberForm.targetPlatform,
        });
        if (!res.ok) toast.error(res.message);
        else {
          toast.success("Signature created", {
            description: res.slug ? `Public page: /${res.slug}` : undefined,
          });
          setDialogOpen(false);
          router.refresh();
        }
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    startTransition(async () => {
      const res = await deleteSignature(deleteTarget.id);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Signature removed", { description: name });
        setDeleteTarget(null);
        setSelected((s) => {
          const n = new Set(s);
          n.delete(deleteTarget.id);
          return n;
        });
        router.refresh();
      }
    });
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    startTransition(async () => {
      const res = await bulkDeleteSignatures(ids);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(`Removed ${ids.length} signatures`);
        setSelected(new Set());
        setBulkDeleteOpen(false);
        router.refresh();
      }
    });
  }

  async function confirmBulkTemplate() {
    const ids = [...selected];
    startTransition(async () => {
      const res = await bulkUpdateTemplate(ids, bulkTemplateId);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(`Updated template for ${ids.length} signatures`);
        setBulkTemplateOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Team signatures</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage members, share install links, and open the design editor.
          </p>
        </div>
        {canEdit ? (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Create signature
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total signatures</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates in use (this page)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{uniqueTemplates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Default template</CardDescription>
            <CardTitle className="text-base font-medium">{defaultTemplateName}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {selected.size > 0 && canBulk ? (
        <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setBulkTemplateOpen(true)}>
            <LayoutTemplate className="size-4" />
            Change template
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg">Members</CardTitle>
            <CardDescription>
              Page {page} of {pageCount} · {total} total
            </CardDescription>
          </div>
          <form
            className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              pushQuery({ q: localSearch.trim() || undefined, page: "1" });
            }}
          >
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="Search by name or email…"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                aria-label="Search team members"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[min(70vh,640px)] overflow-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-[1]">
                <TableRow className="hover:bg-transparent">
                  {canBulk ? (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                  ) : null}
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Public link</TableHead>
                  <TableHead className="w-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canBulk ? 6 : 5}
                      className="text-muted-foreground py-16 text-center"
                    >
                      <Users className="text-muted-foreground/60 mx-auto mb-3 size-10" />
                      <p className="text-sm font-medium">No signatures found</p>
                      <p className="mt-1 text-xs">
                        {searchQuery ? "Try a different search." : "Create your first team signature."}
                      </p>
                      {canEdit && !searchQuery ? (
                        <Button className="mt-4" size="sm" onClick={openCreate}>
                          <Plus className="size-4" />
                          Create signature
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {canBulk ? (
                        <TableCell>
                          <Checkbox
                            checked={selected.has(row.id)}
                            onCheckedChange={() => toggleSelect(row.id)}
                            aria-label={`Select ${row.name}`}
                          />
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="text-xs font-medium">
                              {memberInitials(row.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{row.name}</p>
                            <p className="text-muted-foreground truncate text-xs">
                              {row.job_title || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${row.email}`}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          {row.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {getTemplateById(row.template_id).name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="bg-muted max-w-[120px] truncate rounded px-1.5 py-0.5 text-xs">
                            /{row.slug}
                          </code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => copyPublicLink(row.slug)}
                            aria-label="Copy link"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <SignatureRowMenu
                          row={row}
                          role={role}
                          publicUrl={publicUrlForSlug(row.slug)}
                          onEdit={() => openEdit(row)}
                          onPreview={() => setPreviewRow(row)}
                          onCopyLink={() => copyPublicLink(row.slug)}
                          onDelete={() => setDeleteTarget(row)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pageCount > 1 ? (
            <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => pushQuery({ pageSize: v ?? undefined, page: "1" })}
                >
                  <SelectTrigger className="h-8 w-[72px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["10", "25", "50"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={page > 1 ? buildPageHref(page - 1, searchQuery, pageSize) : undefined}
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href={buildPageHref(page, searchQuery, pageSize)} isActive>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href={page < pageCount ? buildPageHref(page + 1, searchQuery, pageSize) : undefined}
                      aria-disabled={page >= pageCount}
                      className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={memberForm}
        onChange={setMemberForm}
        onSubmit={submitMember}
        pending={pending}
        org={orgBrand}
        readOnly={readOnly}
      />

      <SignaturePreviewSheet
        row={previewRow}
        onClose={() => setPreviewRow(null)}
        org={orgBrand}
        publicBaseUrl={publicBaseUrl}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete signature?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{" "}
              <span className="text-foreground font-medium">{deleteTarget?.name}</span> and their public
              page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} signatures?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmBulkDelete}
            >
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkTemplateOpen} onOpenChange={setBulkTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change template</DialogTitle>
            <DialogDescription>Apply a template to {selected.size} selected signatures.</DialogDescription>
          </DialogHeader>
          <TemplatePicker
            value={bulkTemplateId}
            onChange={setBulkTemplateId}
            org={orgBrand}
            disabled={pending}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBulkTemplateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={confirmBulkTemplate}>
              Apply template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function buildPageHref(page: number, q: string, pageSize: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  return `/admin?${params.toString()}`;
}
