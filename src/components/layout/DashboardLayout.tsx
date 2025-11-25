"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "@/components/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block border-r sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
