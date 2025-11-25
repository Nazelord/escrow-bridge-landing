"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, keccak256, encodePacked, toHex } from "viem";
import { BRIDGE_ADDRESS, CHAINSETTLE_API, ESCROW_BRIDGE_API, ESCROW_BRIDGE_ABI } from "@/lib/constants";

// Steps
import { StepAmount } from "./StepAmount";
import { StepRecipient } from "./StepRecipient";
import { StepReview } from "./StepReview";
import { StepProcessing } from "./StepProcessing";

export function SettlementWizard() {
  const { address } = useConnection();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    amount: "",
    email: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: recipientEmail } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'recipientEmail',
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSettlement = async () => {
    if (!address) return;
    setStep(4); // Go to processing step
    setStatus("Preparing transaction...");

    try {
      const decimals = 6;
      const rawAmount = parseUnits(data.amount, decimals);
      const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const settlementId = `${address}-${Date.now()}`;
      
      const idHash = keccak256(encodePacked(["bytes32", "string"], [salt, settlementId]));
      const userEmailHash = keccak256(encodePacked(["bytes32", "string"], [salt, data.email]));

      // 3. Store Salt
      setStatus("Registering settlement...");
      await fetch(`${CHAINSETTLE_API}/api/store_salt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_hash: idHash,
          salt,
          email: data.email,
          recipient_email: recipientEmail,
        }),
      });

      // 4. Init Payment
      setStatus("Confirm transaction in wallet...");
      writeContract({
        address: BRIDGE_ADDRESS as `0x${string}`,
        abi: ESCROW_BRIDGE_ABI,
        functionName: 'initPayment',
        args: [idHash, userEmailHash, rawAmount],
      });

    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isConfirming) {
        setStatus("Transaction submitted. Waiting for confirmation...");
    }
    if (isConfirmed) {
        setStatus("Transaction confirmed! Waiting for settlement...");
        // Poll logic would go here, simplified for now
        setStatus("Settlement Completed!");
    }
    if (writeError) {
        setStatus(`Error: ${writeError.message}`);
    }
  }, [isConfirming, isConfirmed, writeError]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 flex justify-between items-center px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {s === 1 ? "Amount" : s === 2 ? "Recipient" : s === 3 ? "Review" : "Processing"}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepAmount 
                key="step1" 
                amount={data.amount} 
                setAmount={(a: string) => setData({ ...data, amount: a })} 
                onNext={nextStep}
              />
            )}
            {step === 2 && (
              <StepRecipient 
                key="step2" 
                email={data.email} 
                setEmail={(e: string) => setData({ ...data, email: e })} 
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <StepReview 
                key="step3" 
                data={data} 
                onConfirm={handleSettlement}
                onBack={prevStep}
              />
            )}
            {step === 4 && (
              <StepProcessing 
                key="step4" 
                status={status} 
                isProcessing={isConfirming || status === "Preparing transaction..." || status === "Registering settlement..."}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
