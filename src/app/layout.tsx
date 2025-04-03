import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import runCashbackExpirationJob from "./api/cron/cashbackUpdater";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "SysVMT v2.0",
  description: "SysVMT v2.0",
};

runCashbackExpirationJob(); // Inicia o cron job no servidor

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
