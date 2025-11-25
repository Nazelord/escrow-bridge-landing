"use client";

import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your account and recent activity.</p>
        </div>
        <Link href="/settle">
          <Button>
            New Settlement <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-1">
          <BalanceCard />
        </div>
        <div className="md:col-span-2">
          <TransactionList />
        </div>
      </div>

    </div>
  );
}
