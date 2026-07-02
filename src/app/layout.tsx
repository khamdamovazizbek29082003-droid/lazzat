import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { bodyFont } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

export const metadata: Metadata = {
  title: "Lazzat — O'zbekistondagi barcha taomlar bitta joyda",
  description: "Nationwide food discovery platform for Uzbekistan: restaurants, cafes, and every place to eat.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${bodyFont.className} antialiased`}>
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
