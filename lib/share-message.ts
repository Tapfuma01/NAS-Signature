export function buildInstallShareMessage(recipientName: string, installUrl: string): string {
  const name = recipientName.trim() || "there";
  return `Hi ${name}, your new company email signature is ready! You can install it here: ${installUrl}`;
}

export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function mailtoShareUrl(message: string, subject = "Your email signature"): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}
