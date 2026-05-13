"use client";

import Image from "next/image";
import { useState } from "react";
import { CopySignatureButton } from "@/components/copy-signature-button";
import { DetailsForm } from "@/components/details-form";
import { SignaturePreview } from "@/components/signature-preview";
import { buildPlainTextSignature, buildSignatureHtml } from "@/components/SignatureTemplate";
import { ThemeToggle } from "@/components/theme-toggle";
import { emptySignatureForm, type SignatureFormState } from "@/types/signature";

export function SignatureWorkspace() {
  const [form, setForm] = useState<SignatureFormState>(emptySignatureForm);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo-white.png"
                alt="C4 Photo Safaris"
                width={160}
                height={40}
                className="hidden h-8 w-auto dark:block"
                priority
              />
              <span className="font-heading text-lg font-semibold tracking-tight dark:hidden">
                C4 Photo Safaris
              </span>
            </div>
            <div className="hidden min-h-6 border-l border-border sm:block" aria-hidden />
            <p className="section-subtitle text-xs md:text-sm">Email signature generator</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:gap-10">
        <section className="flex-1 lg:max-w-md">
          <DetailsForm value={form} onChange={setForm} />
        </section>
        <section className="flex-1 lg:min-w-0">
          <SignaturePreview value={form} />
          <div className="mt-6">
            <CopySignatureButton
              disabled={!form.fullName.trim()}
              plainText={buildPlainTextSignature(form)}
              buildHtml={() =>
                buildSignatureHtml({
                  ...form,
                  assetsBaseUrl:
                    typeof window !== "undefined" && window.location.origin
                      ? window.location.origin
                      : "",
                })
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
