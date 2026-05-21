import "server-only";

import { getBrevoClient, getBrevoSender, isBrevoConfigured } from "@/lib/brevo/client";
import {
  buildSignatureInviteHtml,
  buildSignatureInviteSubject,
  buildSignatureInviteText,
} from "@/lib/brevo/email-templates";
import { buildMemberEditUrl } from "@/lib/signatures/public-edit";
import type { SignatureRow } from "@/types/signature-row";
import type { OrgBrand } from "@/types/org-brand";

export type SendInviteResult = { ok: true } | { ok: false; message: string };

export async function sendSignatureInviteEmail(input: {
  signature: SignatureRow;
  org: OrgBrand;
}): Promise<SendInviteResult> {
  if (!isBrevoConfigured()) {
    return { ok: false, message: "Brevo is not configured (set BREVO_API_KEY and BREVO_SENDER_EMAIL)" };
  }

  const editToken = input.signature.edit_token?.trim();
  if (!editToken) {
    return { ok: false, message: "Signature edit token is missing — run db migration 004" };
  }

  const recipientEmail = input.signature.email.trim();
  if (!recipientEmail) {
    return { ok: false, message: "This member has no email address" };
  }

  const sender = getBrevoSender();
  if (!sender) {
    return { ok: false, message: "Brevo sender is not configured" };
  }

  const installUrl = await buildMemberEditUrl(input.signature.slug, editToken);
  const companyName = input.org.companyName;
  const recipientName = input.signature.name;
  const subject = buildSignatureInviteSubject(companyName);
  const textContent = buildSignatureInviteText({ recipientName, companyName, installUrl });
  const htmlContent = buildSignatureInviteHtml({
    recipientName,
    companyName,
    installUrl,
    primaryColor: input.org.primaryColor,
  });

  const templateIdRaw = process.env.BREVO_TEMPLATE_ID?.trim();
  const templateId = templateIdRaw ? Number(templateIdRaw) : NaN;

  try {
    const client = getBrevoClient();
    if (Number.isFinite(templateId) && templateId > 0) {
      await client.transactionalEmails.sendTransacEmail({
        templateId,
        sender,
        to: [{ email: recipientEmail, name: recipientName }],
        params: {
          recipientName,
          companyName,
          installUrl,
        },
      });
    } else {
      await client.transactionalEmails.sendTransacEmail({
        subject,
        sender,
        to: [{ email: recipientEmail, name: recipientName }],
        htmlContent,
        textContent,
      });
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email via Brevo";
    return { ok: false, message };
  }
}
