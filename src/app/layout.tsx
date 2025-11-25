import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "@/lib/config";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Escrow Bridge",
  description: "Escrow Bridge - Secure Cross-Chain Escrow Services",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie')
  );

  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
