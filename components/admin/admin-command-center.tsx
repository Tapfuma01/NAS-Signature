"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { updateOrganizationSettings } from "@/app/actions/organization";
import { createSignature, deleteSignature, updateSignature } from "@/app/actions/signatures";
import { SignaturePreview } from "@/components/signature-preview";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { signatureRowToFormState } from "@/lib/signature-map";
import { buildInstallShareMessage, mailtoShareUrl, whatsappShareUrl } from "@/lib/share-message";
import type { OrganizationSettings } from "@/types/organization-settings";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureRow } from "@/types/signature-row";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2, Link2, Send } from "lucide-react";
import { toast } from "sonner";

type MemberForm = {
  id?: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  templateId: string;
};

const emptyMember: MemberForm = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  whatsapp: "",
  avatarUrl: "",
  templateId: "default",
};

type Props = {
  initialSignatures: SignatureRow[];
  orgBrand: OrgBrand;
  organizationSettings: OrganizationSettings;
  publicBaseUrl: string;
};

export function AdminCommandCenter({
  initialSignatures,
  orgBrand,
  organizationSettings,
  publicBaseUrl,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMember);
  const [deleteTarget, setDeleteTarget] = useState<SignatureRow | null>(null);

  const [orgForm, setOrgForm] = useState({
    companyName: organizationSettings.company_name,
    footerUrl: organizationSettings.footer_url,
    logoUrl: organizationSettings.logo_url,
    primaryColor: organizationSettings.primary_color,
    accentColor: organizationSettings.accent_color,
    textColor: organizationSettings.text_color,
    mutedColor: organizationSettings.muted_color,
    borderColor: organizationSettings.border_color,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialSignatures;
    return initialSignatures.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
    );
  }, [initialSignatures, search]);

  function openCreate() {
    setMemberForm(emptyMember);
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
    });
    setDialogOpen(true);
  }

  function publicUrlForSlug(slug: string) {
    return `${publicBaseUrl.replace(/\/+$/, "")}/${slug}`;
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

  function shareMessageFor(row: SignatureRow) {
    return buildInstallShareMessage(row.name, publicUrlForSlug(row.slug));
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

  async function submitOrg(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrganizationSettings({
        companyName: orgForm.companyName,
        footerUrl: orgForm.footerUrl,
        logoUrl: orgForm.logoUrl,
        primaryColor: orgForm.primaryColor,
        accentColor: orgForm.accentColor,
        textColor: orgForm.textColor,
        mutedColor: orgForm.mutedColor,
        borderColor: orgForm.borderColor,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Organization settings saved", {
          description: "Branding updates apply to all signatures after refresh.",
        });
        router.refresh();
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
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Admin
            </Badge>
            <span className="text-muted-foreground text-sm">Signature command center</span>
          </div>
          <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Team signatures</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Manage members, share install links, and update global branding that applies to every signature.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Generator
          </Link>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Create new signature
          </Button>
        </div>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Organization settings</CardTitle>
          <CardDescription>Logo and brand colors apply to all signatures and previews.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitOrg}>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={orgForm.companyName}
                onChange={(e) => setOrgForm((s) => ({ ...s, companyName: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="footerUrl">Website / footer URL</Label>
              <Input
                id="footerUrl"
                type="url"
                value={orgForm.footerUrl}
                onChange={(e) => setOrgForm((s) => ({ ...s, footerUrl: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="logoUrl">Logo URL (HTTPS)</Label>
              <Input
                id="logoUrl"
                value={orgForm.logoUrl}
                onChange={(e) => setOrgForm((s) => ({ ...s, logoUrl: e.target.value }))}
                placeholder="https://…"
              />
            </div>
            {(
              [
                ["primaryColor", "Primary / rule"],
                ["accentColor", "Accent / labels"],
                ["textColor", "Body text"],
                ["mutedColor", "Muted text"],
                ["borderColor", "Borders"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={key}
                    value={orgForm[key]}
                    onChange={(e) => setOrgForm((s) => ({ ...s, [key]: e.target.value }))}
                    className="font-mono text-xs"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                  <input
                    type="color"
                    aria-label={`${label} picker`}
                    className="h-8 w-10 cursor-pointer rounded border border-input bg-background p-0"
                    value={orgForm[key].length === 7 ? orgForm[key] : "#000000"}
                    onChange={(e) => setOrgForm((s) => ({ ...s, [key]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>
                Save organization settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg">Team members</CardTitle>
            <CardDescription>{initialSignatures.length} signatures</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search team members"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                      No team members match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top">
                        <div className="bg-muted/40 relative h-[140px] w-[220px] overflow-hidden rounded-md border">
                          <div className="origin-top-left scale-[0.38] p-4" style={{ width: "260%" }}>
                            <SignaturePreview org={orgBrand} value={signatureRowToFormState(row)} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground align-top text-sm">{row.email}</TableCell>
                      <TableCell className="align-top">
                        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{row.slug}</code>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button type="button" variant="outline" size="xs" onClick={() => openEdit(row)}>
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => copyPublicLink(row.slug)}
                          >
                            <Link2 className="size-3.5" />
                            Copy link
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                buttonVariants({ variant: "secondary", size: "xs" }),
                                "gap-1",
                              )}
                            >
                              <Send className="size-3.5" />
                              Send
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Share</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => copyPublicLink(row.slug)}>
                                  Copy public link
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      whatsappShareUrl(shareMessageFor(row)),
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  Send via WhatsApp
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = mailtoShareUrl(shareMessageFor(row));
                                  }}
                                >
                                  Send via email
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={submitMember}>
            <DialogHeader>
              <DialogTitle>{memberForm.id ? "Edit signature" : "Create signature"}</DialogTitle>
              <DialogDescription>Details sync to the public install page for this teammate.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label htmlFor="m-name">Full name</Label>
                <Input
                  id="m-name"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-title">Job title</Label>
                <Input
                  id="m-title"
                  value={memberForm.jobTitle}
                  onChange={(e) => setMemberForm((s) => ({ ...s, jobTitle: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-email">Email</Label>
                <Input
                  id="m-email"
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-phone">Phone</Label>
                <Input
                  id="m-phone"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-wa">WhatsApp</Label>
                <Input
                  id="m-wa"
                  value={memberForm.whatsapp}
                  onChange={(e) => setMemberForm((s) => ({ ...s, whatsapp: e.target.value }))}
                  placeholder="https://wa.me/…"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-avatar">Avatar URL (optional)</Label>
                <Input
                  id="m-avatar"
                  value={memberForm.avatarUrl}
                  onChange={(e) => setMemberForm((s) => ({ ...s, avatarUrl: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-template">Template</Label>
                <select
                  id="m-template"
                  className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
                  value={memberForm.templateId}
                  onChange={(e) => setMemberForm((s) => ({ ...s, templateId: e.target.value }))}
                >
                  <option value="default">Default</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {memberForm.id ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete signature?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{" "}
              <span className="text-foreground font-medium">{deleteTarget?.name}</span> and their public page.
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
    </div>
  );
}
