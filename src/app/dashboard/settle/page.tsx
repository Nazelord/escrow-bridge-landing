"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettlementWizard } from "@/components/settlement/SettlementWizard";

export default function SettlePage() {
  return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Settlement</h2>
          <p className="text-muted-foreground">Follow the steps to initiate a secure on-ramp settlement.</p>
        </div>
        
        <div className="mt-8">
            <SettlementWizard />
        </div>
      </div>
  );
}
