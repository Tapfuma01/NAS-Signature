import type { Metadata } from "next";
import { Lato, Montserrat, Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  variable: "--font-c4-heading",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-c4-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Email signature | C4 Photo Safaris",
    template: "%s | C4 Photo Safaris",
  },
  description: "Internal email signature generator for C4 Photo Safaris.",
  icons: {
    icon: [{ url: "/c4-favicon.jpg", type: "image/jpeg" }],
    shortcut: "/c4-favicon.jpg",
    apple: "/c4-favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${montserrat.variable} ${lato.variable} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
