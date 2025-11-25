"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowRightLeft,
  History,
  Settings,
  LogOut,
  CreditCard
} from "lucide-react";

const sidebarItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Settlements",
    href: "/dashboard/settle",
    icon: ArrowRightLeft,
  },
  {
    title: "Cards",
    href: "/dashboard/cards",
    icon: CreditCard,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("bg-card w-64 min-h-screen flex flex-col", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            E
          </div>
          <span>EscrowBridge</span>
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                isActive
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
      <div className="absolute bottom-4 left-0 w-full px-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary">
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
