import type { Metadata, Viewport } from "next";
import { BudgetProvider } from "@/context/BudgetContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: {
    default: "Orçamento Familiar",
    template: "%s | Orçamento Familiar",
  },
  description: "Apresentação e planeamento do orçamento familiar mensal. Visualize receitas, despesas e poupanças com gráficos interativos.",
  keywords: ["orçamento", "família", "finanças", "planeamento", "despesas", "poupança"],
  authors: [{ name: "Family Budget" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: "en_GB",
    title: "Orçamento Familiar",
    description: "Apresentação e planeamento do orçamento familiar mensal",
    siteName: "Orçamento Familiar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col touch-manipulation">
        <LanguageProvider>
          <BudgetProvider>{children}</BudgetProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
