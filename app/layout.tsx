import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Classic Car Project Hub",
  description: "Manage your classic car renovation projects, parts sourcing, and scrapyard outreach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
