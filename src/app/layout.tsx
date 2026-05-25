import type { Metadata } from "next";
import { BudgetProvider } from "@/context/BudgetContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Budget",
  description: "Monthly family budget presentation & planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <BudgetProvider>{children}</BudgetProvider>
      </body>
    </html>
  );
}
