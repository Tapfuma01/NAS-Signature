"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import type { SignatureFormState } from "@/types/signature";

type Props = {
  value: SignatureFormState;
};

function line(text: string, placeholder: string) {
  const show = text.trim().length > 0;
  return (
    <span className={show ? "text-neutral-900" : "text-neutral-400"}>{show ? text : placeholder}</span>
  );
}

export function SignaturePreview({ value }: Props) {
  const { fullName, jobTitle, phone, email, whatsapp } = value;

  return (
    <div className="flex flex-col gap-4">
      <p className="safari-section-eyebrow text-xs md:text-sm">Live preview</p>
      <div
        className="rounded-xl border p-6 shadow-soft"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "hsl(34 24% 87%)",
        }}
      >
        <div className="mb-4 border-b border-[hsl(34_24%_87%)] pb-4">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            C4 Photo Safaris
          </p>
          <div className="gold-line mt-2" />
        </div>
        <div className="space-y-1 font-body text-sm text-neutral-900">
          <p className="text-base font-semibold text-neutral-900">{line(fullName, "Your name")}</p>
          <p className="text-sm text-neutral-700">{line(jobTitle, "Your role")}</p>
        </div>
        <ul className="mt-4 space-y-2 font-body text-sm text-neutral-800">
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{line(phone, "Phone number")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{line(email, "Email address")}</span>
          </li>
          <li className="flex items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{line(whatsapp, "WhatsApp link or number")}</span>
          </li>
        </ul>
        <p className="mt-6 border-t border-[hsl(34_24%_87%)] pt-4 text-xs uppercase tracking-[0.15em] text-neutral-500">
          www.c4photosafaris.com
        </p>
      </div>
    </div>
  );
}
