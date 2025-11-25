"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface StepRecipientProps {
  email: string;
  setEmail: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRecipient({ email, setEmail, onNext, onBack }: StepRecipientProps) {
  const isValid = email && email.includes("@");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Who is this for?</h2>
        <p className="text-muted-foreground">Enter your email address for the settlement record.</p>
      </div>

      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-14 text-lg"
        placeholder="name@example.com"
        type="email"
        autoFocus
      />

      <div className="flex gap-4">
        <Button variant="outline" className="h-12 w-1/3" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>
        <Button className="h-12 flex-1" onClick={onNext} disabled={!isValid}>
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
