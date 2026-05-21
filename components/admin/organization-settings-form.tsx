"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrganizationSettings } from "@/app/actions/organization";
import { PlatformSelect } from "@/components/platform-select";
import { LogoUploadField } from "@/components/admin/logo-upload-field";
import { TemplatePicker } from "@/components/template-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import type { OrganizationSettings } from "@/types/organization-settings";
import type { OrgBrand } from "@/types/org-brand";
import type { AdminRole } from "@/lib/auth/roles";
import { canAccessOrgSettings } from "@/lib/auth/roles";
import { toast } from "sonner";

type Props = {
  organizationSettings: OrganizationSettings;
  orgBrand: OrgBrand;
  role: AdminRole;
  r2Enabled: boolean;
};

export function OrganizationSettingsForm({
  organizationSettings,
  orgBrand,
  role,
  r2Enabled,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const readOnly = !canAccessOrgSettings(role);

  const [orgForm, setOrgForm] = useState({
    companyName: organizationSettings.company_name,
    footerUrl: organizationSettings.footer_url,
    logoUrl: organizationSettings.logo_url,
    primaryColor: organizationSettings.primary_color,
    accentColor: organizationSettings.accent_color,
    textColor: organizationSettings.text_color,
    mutedColor: organizationSettings.muted_color,
    borderColor: organizationSettings.border_color,
    defaultTemplateId: organizationSettings.default_template_id ?? DEFAULT_TEMPLATE_ID,
    defaultTargetPlatform: organizationSettings.default_target_platform ?? "generic",
  });

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
        defaultTemplateId: orgForm.defaultTemplateId,
        defaultTargetPlatform: orgForm.defaultTargetPlatform,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Organization settings saved");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Organization</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Logo and brand colors apply to every signature and preview.
        </p>
      </div>

      <form onSubmit={submitOrg}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Brand settings</CardTitle>
            <CardDescription>
              {readOnly
                ? "You have read-only access. Contact an administrator to change branding."
                : "Changes apply to all team signatures after save."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion multiple defaultValue={["identity", "colors", "defaults"]} className="w-full">
              <AccordionItem value="identity">
                <AccordionTrigger>Brand identity</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-2">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company name</Label>
                    <Input
                      id="companyName"
                      value={orgForm.companyName}
                      onChange={(e) => setOrgForm((s) => ({ ...s, companyName: e.target.value }))}
                      required
                      disabled={readOnly || pending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="footerUrl">Website / footer URL</Label>
                    <Input
                      id="footerUrl"
                      type="url"
                      value={orgForm.footerUrl}
                      onChange={(e) => setOrgForm((s) => ({ ...s, footerUrl: e.target.value }))}
                      required
                      disabled={readOnly || pending}
                    />
                  </div>
                  <LogoUploadField
                    logoUrl={orgForm.logoUrl}
                    onLogoUrlChange={(logoUrl) => setOrgForm((s) => ({ ...s, logoUrl }))}
                    disabled={readOnly || pending}
                    r2Enabled={r2Enabled}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="colors">
                <AccordionTrigger>Colors</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-2 sm:grid-cols-2">
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
                          disabled={readOnly || pending}
                        />
                        <input
                          type="color"
                          aria-label={`${label} picker`}
                          className="h-8 w-10 cursor-pointer rounded border border-input bg-background p-0 disabled:opacity-50"
                          value={orgForm[key].length === 7 ? orgForm[key] : "#000000"}
                          onChange={(e) => setOrgForm((s) => ({ ...s, [key]: e.target.value }))}
                          disabled={readOnly || pending}
                        />
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="defaults">
                <AccordionTrigger>Defaults</AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-2">
                  <div className="grid gap-2">
                    <Label>Active company template</Label>
                    <p className="text-muted-foreground text-xs">
                      Only this template is shown on the public generator. Staff cannot pick other layouts.
                    </p>
                    <TemplatePicker
                      value={orgForm.defaultTemplateId}
                      onChange={(defaultTemplateId) => setOrgForm((s) => ({ ...s, defaultTemplateId }))}
                      disabled={readOnly || pending}
                      org={orgBrand}
                    />
                  </div>
                  <PlatformSelect
                    value={orgForm.defaultTargetPlatform}
                    onChange={(defaultTargetPlatform) =>
                      setOrgForm((s) => ({ ...s, defaultTargetPlatform }))
                    }
                    disabled={readOnly || pending}
                    id="org-default-platform"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {!readOnly ? (
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 mt-6 flex justify-end border-t py-4 backdrop-blur">
            <Button type="submit" disabled={pending}>
              Save organization settings
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
