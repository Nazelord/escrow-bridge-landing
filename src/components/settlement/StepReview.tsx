"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Wallet } from "lucide-react";

interface StepReviewProps {
  data: { amount: string; walletAddress: string };
  onConfirm: () => void;
  onBack: () => void;
  fee?: number;
  freeBalance?: string;
  recipientEmail?: string;
}

export function StepReview({ data, onConfirm, onBack, fee = 0, freeBalance, recipientEmail }: StepReviewProps) {
  const feePercent = (fee * 100).toFixed(2);
  const amountNum = parseFloat(data.amount);
  const feeAmount = amountNum * fee;
  const totalAmount = amountNum + feeAmount;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Settlement</h2>
        <p className="text-muted-foreground">Please confirm the details below.</p>
      </div>

      <div className="bg-muted/50 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-muted-foreground">Amount</span>
          <span className="text-xl font-bold">{data.amount} USDC</span>
        </div>
        <div className="flex justify-between items-start border-b pb-4">
          <span className="text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Recipient
          </span>
          <span className="font-mono text-sm text-right break-all max-w-[200px]">{data.walletAddress}</span>
        </div>
        {recipientEmail && (
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-muted-foreground">PayPal Recipient</span>
            <span className="font-medium text-sm">{recipientEmail}</span>
          </div>
        )}
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-muted-foreground">Fee ({feePercent}%)</span>
          <span className="font-medium">{feeAmount > 0 ? `${feeAmount.toFixed(6)} USDC` : 'Free'}</span>
        </div>
        {feeAmount > 0 && (
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-muted-foreground font-semibold">Total</span>
            <span className="text-xl font-bold">{totalAmount.toFixed(6)} USDC</span>
          </div>
        )}
        {freeBalance && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Bridge Balance Available</span>
            <span className="font-medium text-green-600">{parseFloat(freeBalance).toFixed(2)} USDC</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="h-12 w-1/3" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>
        <Button className="h-12 flex-1 bg-primary" onClick={onConfirm}>
          <ShieldCheck className="mr-2 h-5 w-5" /> Confirm & Pay
        </Button>
      </div>
    </motion.div>
  );
}
