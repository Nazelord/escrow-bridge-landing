"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Wallet } from "lucide-react";

interface StepRecipientProps {
  walletAddress: string;
  setWalletAddress: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRecipient({ walletAddress, setWalletAddress, onNext, onBack }: StepRecipientProps) {
  // Validate Ethereum address format (0x followed by 40 hex characters)
  const isValidAddress = walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Recipient Wallet</h2>
        <p className="text-muted-foreground">Enter the wallet address that will receive the settlement.</p>
      </div>

      <div className="space-y-2">
        <Input
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="h-14 text-sm font-mono"
          placeholder="0x..."
          autoFocus
        />
        {walletAddress && !isValidAddress && (
          <p className="text-sm text-destructive">Please enter a valid Ethereum address</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="h-12 w-1/3" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>
        <Button className="h-12 flex-1" onClick={onNext} disabled={!isValidAddress}>
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
