"use client";

import { CreditCard } from "lucide-react";

export default function CardsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        <CreditCard className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Virtual Cards</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Spend your crypto anywhere with our upcoming virtual debit cards. 
          Join the waitlist to be the first to know.
        </p>
      </div>
      <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
        Coming Soon
      </div>
    </div>
  );
}
