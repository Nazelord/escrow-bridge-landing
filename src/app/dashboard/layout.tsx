// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/Navbar";


export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAccount();

  const isConnecting = status === "connecting" || status === "reconnecting";
  const isConnected = status === "connected";

  if (isConnecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Wallet not connected</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access the dashboard.
          </p>
          <Link href="/">
            <Button>Go to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
