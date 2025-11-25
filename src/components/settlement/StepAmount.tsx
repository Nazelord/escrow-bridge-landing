"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StepAmountProps {
  amount: string;
  setAmount: (val: string) => void;
  onNext: () => void;
}

export function StepAmount({ amount, setAmount, onNext }: StepAmountProps) {
  const isValid = amount && parseFloat(amount) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">How much do you want to settle?</h2>
        <p className="text-muted-foreground">Enter the amount in BDAG.</p>
      </div>

      <div className="relative">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-3xl h-20 font-bold"
          placeholder="0.00"
          type="number"
          autoFocus
        />
      </div>

      <Button className="w-full h-12 text-lg" onClick={onNext} disabled={!isValid}>
        Continue <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
