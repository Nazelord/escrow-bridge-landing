"use client";

import { TransactionList } from "@/components/dashboard/TransactionList";

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
        <p className="text-muted-foreground">View all your past settlements and activities.</p>
      </div>
      <TransactionList />
    </div>
  );
}
