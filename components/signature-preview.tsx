"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";

type Props = {
  org: OrgBrand;
  value: SignatureFormState;
};

function line(text: string, placeholder: string, activeColor: string, mutedColor: string) {
  const show = text.trim().length > 0;
  return <span style={{ color: show ? activeColor : mutedColor }}>{show ? text : placeholder}</span>;
}

function footerDisplayText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function footerHref(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function SignaturePreview({ org, value }: Props) {
  const { fullName, jobTitle, phone, email, whatsapp } = value;
  const { companyName, footerLinks, accentColor, textColor, mutedColor, borderColor, primaryColor } = org;

  return (
    <div
      className="rounded-xl border p-6 shadow-soft"
      style={{
        backgroundColor: "#ffffff",
        borderColor,
      }}
    >
      <div className="mb-4 border-b pb-4" style={{ borderColor }}>
        <p
          className="font-heading text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: accentColor }}
        >
          {companyName.trim() || "Company"}
        </p>
        <div className="mt-2 h-0.5 w-20 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}55` }} />
      </div>
      <div className="space-y-1 font-body text-sm" style={{ color: textColor }}>
        <p className="text-base font-semibold" style={{ color: textColor }}>
          {line(fullName, "Your name", textColor, mutedColor)}
        </p>
        <p className="text-sm" style={{ color: mutedColor }}>
          {line(jobTitle, "Your role", textColor, mutedColor)}
        </p>
      </div>
      <ul className="mt-4 space-y-2 font-body text-sm" style={{ color: textColor }}>
        <li className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} aria-hidden />
          <span>{line(phone, "Phone number", textColor, mutedColor)}</span>
        </li>
        <li className="flex items-start gap-2">
          <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} aria-hidden />
          <span>{line(email, "Email address", textColor, mutedColor)}</span>
        </li>
        <li className="flex items-start gap-2">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} aria-hidden />
          <span>{line(whatsapp, "WhatsApp link or number", textColor, mutedColor)}</span>
        </li>
      </ul>
      {footerLinks.length > 0 ? (
        <p
          className="mt-6 border-t pt-4 text-xs tracking-[0.15em]"
          style={{ borderColor, color: mutedColor }}
        >
          {footerLinks.map((link, i) => (
            <span key={link}>
              {i > 0 ? <span className="px-2 opacity-60">|</span> : null}
              <a
                href={footerHref(link)}
                className="underline-offset-2 hover:underline"
                style={{ color: mutedColor }}
              >
                {footerDisplayText(link)}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
