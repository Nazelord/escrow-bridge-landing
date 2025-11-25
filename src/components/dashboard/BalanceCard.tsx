"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";
import { useConnection, useBalance } from "wagmi";
import { formatEther } from "viem";
import { blockdag } from "@/lib/config";

export function BalanceCard() {
  const { address } = useConnection();

  // Get BDAG Balance (native token) from BlockDAG network
  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
    chainId: blockdag.id,
    query: {
      enabled: !!address,
    }
  });

  const balance = balanceData ? formatEther(balanceData.value) : null;

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="20" />
        </svg>
      </div>
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Balance</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-5xl font-bold tracking-tight">
            {balance || "0.00"}
          </span>
          <span className="text-xl text-zinc-500 font-normal">BDAG</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button className="bg-white text-black hover:bg-zinc-200 h-12 text-base font-medium transition-transform active:scale-95" size="lg">
            <Plus className="mr-2 h-5 w-5" /> Add Money
          </Button>
          <Button className="bg-zinc-700 hover:bg-zinc-600 text-white border-none h-12 text-base font-medium transition-transform active:scale-95" variant="outline" size="lg">
            <Send className="mr-2 h-5 w-5" /> Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
