import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { QuickActionFab } from "@/components/quick-action-fab";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeroTec ERP - Sistema de Gestão Empresarial",
  description: "Sistema completo de gestão empresarial com módulos de vendas, estoque, financeiro e assistência técnica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <QuickActionFab />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
