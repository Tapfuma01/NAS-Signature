"use client";

import type { SignatureFormState } from "@/types/signature";

type Props = {
  value: SignatureFormState;
  onChange: (next: SignatureFormState) => void;
  disabled?: boolean;
};

export function DetailsForm({ value, onChange, disabled }: Props) {
  const patch = (partial: Partial<SignatureFormState>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="safari-section-eyebrow text-xs md:text-sm">Your details</p>
      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Full name</span>
          <input
            className="font-body rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            autoComplete="name"
            placeholder="Jane Doe"
            value={value.fullName}
            disabled={disabled}
            onChange={(e) => patch({ fullName: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Job title</span>
          <input
            className="font-body rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            autoComplete="organization-title"
            placeholder="Photo Safari Specialist"
            value={value.jobTitle}
            disabled={disabled}
            onChange={(e) => patch({ jobTitle: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Phone number</span>
          <input
            className="font-body rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            type="tel"
            autoComplete="tel"
            placeholder="+27 12 345 6789"
            value={value.phone}
            disabled={disabled}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            className="font-body rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            type="email"
            autoComplete="email"
            placeholder="you@c4photosafaris.com"
            value={value.email}
            disabled={disabled}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-foreground">WhatsApp</span>
          <input
            className="font-body rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            autoComplete="tel"
            placeholder="https://wa.me/27123456789"
            value={value.whatsapp}
            disabled={disabled}
            onChange={(e) => patch({ whatsapp: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
