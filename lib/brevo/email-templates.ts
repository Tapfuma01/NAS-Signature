export function buildSignatureInviteSubject(companyName: string): string {
  return `Your ${companyName} email signature is ready`;
}

export function buildSignatureInviteText(input: {
  recipientName: string;
  companyName: string;
  installUrl: string;
}): string {
  const name = input.recipientName.trim() || "there";
  return [
    `Hi ${name},`,
    "",
    `Your ${input.companyName} email signature is ready.`,
    "",
    `Open this link to review your details, then copy your signature into your email app:`,
    input.installUrl,
    "",
    "If you did not expect this email, you can ignore it.",
  ].join("\n");
}

export function buildSignatureInviteHtml(input: {
  recipientName: string;
  companyName: string;
  installUrl: string;
  primaryColor?: string;
}): string {
  const name = escapeHtml(input.recipientName.trim() || "there");
  const company = escapeHtml(input.companyName);
  const url = escapeHtml(input.installUrl);
  const accent = input.primaryColor?.trim() || "#C69C6D";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e8ddd0;">
          <tr>
            <td style="padding:32px 28px 24px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b64;">${company}</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;">Your email signature is ready</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#3d3d38;">Hi ${name}, use the link below to check your details and copy your signature into Outlook, Gmail, or Apple Mail.</p>
              <a href="${url}" style="display:inline-block;padding:12px 24px;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">Set up my signature</a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6b6b64;">Or copy this link:<br><a href="${url}" style="color:${accent};word-break:break-all;">${url}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
