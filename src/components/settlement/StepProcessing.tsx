"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StepProcessingProps {
  status: string | null;
  isProcessing: boolean;
}

export function StepProcessing({ status, isProcessing }: StepProcessingProps) {
  const isSuccess = status?.includes("Completed");
  const isError = status?.includes("Error") || status?.includes("failed");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 space-y-6 text-center"
    >
      {isProcessing ? (
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-muted animate-spin border-t-primary" />
        </div>
      ) : isSuccess ? (
        <CheckCircle className="h-24 w-24 text-green-500" />
      ) : isError ? (
        <XCircle className="h-24 w-24 text-destructive" />
      ) : (
        <Loader2 className="h-24 w-24 animate-spin text-primary" />
      )}

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
            {isSuccess ? "Settlement Successful!" : isError ? "Settlement Failed" : "Processing..."}
        </h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {status || "Please wait while we process your transaction."}
        </p>
      </div>

      {!isProcessing && (
        <Link href="/">
            <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      )}
    </motion.div>
  );
}
