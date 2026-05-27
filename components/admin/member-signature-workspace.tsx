"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createSignature,
  deleteSignature,
  updateSignature,
} from "@/app/actions/signatures";
import { sendSignatureInviteEmailAction } from "@/app/actions/email";
import { AvatarUploadField } from "@/components/admin/avatar-upload-field";
import { DetailsForm } from "@/components/details-form";
import { PlatformSelect } from "@/components/platform-select";
import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature } from "@/components/SignatureTemplate";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getExportAssetsBaseUrl } from "@/lib/export-base-url";
import { renderMemberSignatureHtml } from "@/lib/signature-render/render-member";
import { slugifyName } from "@/lib/slug";
import { getMemberCustomFieldDefs } from "@/lib/templates/custom-fields";
import { getTemplateById } from "@/lib/templates";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { MemberForm } from "@/types/admin/member-form";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";
import { ArrowLeft, Copy, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

function memberToFormState(form: MemberForm): SignatureFormState {
  return {
    fullName: form.name,
    jobTitle: form.jobTitle,
    phone: form.phone,
    email: form.email,
    whatsapp: form.whatsapp,
    customFields: form.customFields,
  };
}

function formsEqual(a: MemberForm, b: MemberForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  mode: "create" | "edit";
  initialForm: MemberForm;
  org: OrgBrand;
  templatesById: Record<string, SignatureTemplateDefinition>;
  defaultTemplateId: string;
  assetsBaseUrl: string;
  readOnly?: boolean;
  r2Enabled?: boolean;
  /** When set, create mode is duplicating this member's saved details. */
  duplicateSourceName?: string;
};

export function MemberSignatureWorkspace({
  mode,
  initialForm,
  org,
  templatesById,
  defaultTemplateId,
  assetsBaseUrl,
  readOnly,
  r2Enabled = false,
  duplicateSourceName,
}: Props) {
  const isDuplicateCreate = mode === "create" && Boolean(duplicateSourceName);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [form, setForm] = useState<MemberForm>(initialForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const initialRef = useRef(initialForm);

  const template =
    templatesById[form.templateId] ?? templatesById[defaultTemplateId] ?? getTemplateById(form.templateId);
  const customFieldDefs = getMemberCustomFieldDefs(template.blocks);
  const templateId = template.id;
  const member = memberToFormState(form);
  const content = { ...member, ...org };

  const slugPreview = useMemo(() => {
    if (mode === "edit" && form.slug) return form.slug;
    return slugifyName(form.name || "member");
  }, [mode, form.slug, form.name]);

  const isDirty = !formsEqual(form, initialRef.current);
  const emailInvalid = form.email.length > 0 && !EMAIL_RE.test(form.email);

  const exportBase =
    typeof window !== "undefined"
      ? getExportAssetsBaseUrl(window.location.origin)
      : getExportAssetsBaseUrl(assetsBaseUrl);

  const publicUrl =
    mode === "edit" && form.slug
      ? `${assetsBaseUrl.replace(/\/+$/, "")}/${form.slug}`
      : null;

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    router.push("/admin");
  }, [isDirty, router]);

  async function copyPublicLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied", { description: publicUrl });
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  function sendEmailInvite() {
    const signatureId = form.id;
    if (!signatureId || readOnly) return;
    startEmailTransition(async () => {
      const res = await sendSignatureInviteEmailAction({ signatureId });
      if (res.ok) {
        toast.success(`Email sent to ${form.email}`);
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    if (emailInvalid) {
      toast.error("Enter a valid email address");
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateSignature({
          id: form.id,
          name: form.name,
          jobTitle: form.jobTitle,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp || null,
          customFields: form.customFields,
          avatarUrl: form.avatarUrl || null,
          templateId: form.templateId,
          targetPlatform: form.targetPlatform,
        });
        if (!res.ok) toast.error(res.message);
        else {
          toast.success("Signature saved");
          initialRef.current = form;
          router.push("/admin");
          router.refresh();
        }
      } else {
        const res = await createSignature({
          name: form.name,
          jobTitle: form.jobTitle,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp || null,
          customFields: form.customFields,
          avatarUrl: form.avatarUrl || null,
          templateId: form.templateId,
          targetPlatform: form.targetPlatform,
        });
        if (!res.ok) toast.error(res.message);
        else {
          toast.success("Signature created", {
            description: res.slug ? `Public page: /${res.slug}` : undefined,
          });
          router.push("/admin");
          router.refresh();
        }
      }
    });
  }

  function confirmDelete() {
    if (!form.id) return;
    startTransition(async () => {
      const res = await deleteSignature(form.id!);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Signature removed");
        setDeleteOpen(false);
        router.push("/admin");
        router.refresh();
      }
    });
  }

  const templateOptions = Object.values(templatesById);

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" variant="ghost" size="icon-sm" onClick={handleCancel}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h1 className="font-heading text-lg font-semibold tracking-tight">
                {isDuplicateCreate
                  ? "Duplicate signature"
                  : mode === "create"
                    ? "Create signature"
                    : "Edit member"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isDuplicateCreate
                  ? `Copied from ${duplicateSourceName} — update details, then create to publish a new link.`
                  : mode === "create"
                    ? "Add a teammate — preview updates as you type."
                    : "Update contact details — layout comes from the assigned template."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode === "edit" && !readOnly ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={pending}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={handleCancel} disabled={pending}>
              Cancel
            </Button>
            {!readOnly ? (
              <Button type="submit" disabled={pending || !form.name.trim() || !form.email.trim()}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "create" ? "Create signature" : "Save changes"}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:gap-10">
        <section className="flex flex-1 flex-col gap-6 lg:max-w-md">
          <DetailsForm
            value={member}
            customFields={customFieldDefs}
            disabled={readOnly || pending}
            onChange={(m) =>
              setForm((f) => ({
                ...f,
                name: m.fullName,
                jobTitle: m.jobTitle,
                phone: m.phone,
                email: m.email,
                whatsapp: m.whatsapp,
                customFields: m.customFields,
              }))
            }
          />

          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-xs">Public URL slug</Label>
            <p className="font-mono text-sm text-foreground">/{slugPreview}</p>
            {mode === "edit" && form.slug && form.slug !== slugPreview ? (
              <p className="text-muted-foreground text-xs">
                Saved slug: <span className="font-mono">/{form.slug}</span> (unchanged until name is saved)
              </p>
            ) : null}
          </div>

          {emailInvalid ? (
            <p className="text-destructive text-sm">Enter a valid email address.</p>
          ) : null}

          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wide">
              Admin options
            </p>
            <fieldset className="grid gap-4" disabled={readOnly || pending}>
              <AvatarUploadField
                avatarUrl={form.avatarUrl}
                onAvatarUrlChange={(avatarUrl) => setForm((f) => ({ ...f, avatarUrl }))}
                disabled={readOnly || pending}
                r2Enabled={r2Enabled}
              />
              <PlatformSelect
                value={form.targetPlatform}
                onChange={(targetPlatform) => setForm((f) => ({ ...f, targetPlatform }))}
                disabled={pending}
              />
              {mode === "create" ? (
                <div className="grid gap-1.5">
                  <Label>Template</Label>
                  <p className="text-sm text-foreground">{template.name}</p>
                  <p className="text-muted-foreground text-xs">
                    New members use the active company template. Change the default under Organization
                    settings, or assign a different template after saving.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Template</Label>
                  <Select
                    value={form.templateId}
                    onValueChange={(templateId) => {
                      if (templateId) setForm((f) => ({ ...f, templateId }));
                    }}
                    disabled={readOnly || pending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    <Link href={`/admin/templates/${form.templateId}/edit`} className="text-primary hover:underline">
                      Edit template design
                    </Link>
                  </p>
                </div>
              )}
            </fieldset>
          </div>

          {publicUrl ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                Public install link
              </p>
              <p className="break-all font-mono text-sm">{publicUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={sendEmailInvite}
                  disabled={readOnly || emailPending || !form.email.trim()}
                >
                  {emailPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  Email signature
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyPublicLink}
                >
                  <Copy className="size-4" />
                  Copy link
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="flex-1 lg:min-w-0">
          <TemplateWrapper
            org={org}
            member={member}
            templateId={templateId}
            template={template}
            targetPlatform={form.targetPlatform}
            assetsBaseUrl={exportBase}
            eyebrow="Live preview"
          />
          <div className="mt-8 border-t border-border pt-8">
            <SignatureCopyPanel
              targetPlatform={form.targetPlatform}
              onPlatformChange={(targetPlatform) => setForm((f) => ({ ...f, targetPlatform }))}
              disabled={!form.name.trim()}
              downloadBasename={form.slug ? `${form.slug}-signature` : "signature-preview"}
              showPlatformSelect={false}
              buildHtml={() =>
                renderMemberSignatureHtml({
                  org,
                  member,
                  assetsBaseUrl: exportBase,
                  templateId,
                  template,
                  targetPlatform: form.targetPlatform,
                  row:
                    mode === "edit"
                      ? {
                          template_id: form.templateId,
                          target_platform: form.targetPlatform,
                        }
                      : undefined,
                })
              }
              plainText={buildPlainTextSignature(content)}
            />
          </div>
        </section>
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete signature?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {form.name}&apos;s saved signature and public page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
