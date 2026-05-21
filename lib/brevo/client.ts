import "server-only";

import { BrevoClient } from "@getbrevo/brevo";

let client: BrevoClient | null = null;

export function isBrevoConfigured(): boolean {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  return Boolean(apiKey && senderEmail);
}

export function getBrevoSender(): { email: string; name: string } | null {
  const email = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!email) return null;
  const name = process.env.BREVO_SENDER_NAME?.trim() || "C4 Photo Safaris";
  return { email, name };
}

export function getBrevoClient(): BrevoClient {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  if (!client) {
    client = new BrevoClient({ apiKey });
  }
  return client;
}
