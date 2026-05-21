"use client";

import { PlatformSelect } from "@/components/platform-select";
import { TemplatePicker } from "@/components/template-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import type { TargetPlatform } from "@/types/signature-document";
import type { OrgBrand } from "@/types/org-brand";

export type MemberForm = {
  id?: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  templateId: string;
  targetPlatform: TargetPlatform;
};

export const emptyMemberForm: MemberForm = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  whatsapp: "",
  avatarUrl: "",
  templateId: DEFAULT_TEMPLATE_ID,
  targetPlatform: "generic",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: MemberForm;
  onChange: (form: MemberForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
  org: OrgBrand;
  readOnly?: boolean;
};

export function MemberFormDialog({
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  pending,
  org,
  readOnly,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit signature" : "Create signature"}</DialogTitle>
            <DialogDescription>Details sync to the public install page for this teammate.</DialogDescription>
          </DialogHeader>
          <fieldset className="grid gap-3 py-2" disabled={readOnly || pending}>
            <div className="grid gap-2">
              <Label htmlFor="m-name">Full name</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-title">Job title</Label>
              <Input
                id="m-title"
                value={form.jobTitle}
                onChange={(e) => onChange({ ...form, jobTitle: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-email">Email</Label>
              <Input
                id="m-email"
                type="email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-phone">Phone</Label>
              <Input
                id="m-phone"
                value={form.phone}
                onChange={(e) => onChange({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-wa">WhatsApp</Label>
              <Input
                id="m-wa"
                value={form.whatsapp}
                onChange={(e) => onChange({ ...form, whatsapp: e.target.value })}
                placeholder="https://wa.me/…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-avatar">Avatar URL (optional)</Label>
              <Input
                id="m-avatar"
                value={form.avatarUrl}
                onChange={(e) => onChange({ ...form, avatarUrl: e.target.value })}
              />
            </div>
            <PlatformSelect
              value={form.targetPlatform}
              onChange={(targetPlatform) => onChange({ ...form, targetPlatform })}
              disabled={pending}
            />
            <div className="grid gap-2">
              <Label>Template</Label>
              <TemplatePicker
                value={form.templateId}
                onChange={(templateId) => onChange({ ...form, templateId })}
                disabled={pending}
                org={org}
              />
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!readOnly ? (
              <Button type="submit" disabled={pending}>
                {form.id ? "Save changes" : "Create"}
              </Button>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
