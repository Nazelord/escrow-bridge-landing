"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnection, useDisconnect } from "wagmi";
import { Bell } from "lucide-react";
import { WalletModal } from "@/components/wallet/WalletModal";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function Navbar() {
  const { address } = useConnection();
  const { disconnect } = useDisconnect();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <MobileSidebar />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Overview</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
          </Button>
          
          {address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-background">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => disconnect()}
                className="text-muted-foreground hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsWalletModalOpen(true)} 
              className="rounded-full"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </header>
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
}
