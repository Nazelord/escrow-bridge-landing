"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface StepReviewProps {
  data: { amount: string; email: string };
  onConfirm: () => void;
  onBack: () => void;
}

export function StepReview({ data, onConfirm, onBack }: StepReviewProps) {
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
          <span className="text-xl font-bold">{data.amount} BDAG</span>
        </div>
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{data.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Fee</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
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
