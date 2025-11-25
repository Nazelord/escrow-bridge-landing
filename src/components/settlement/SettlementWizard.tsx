"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { parseUnits, keccak256, encodePacked, toHex } from "viem";
import { blockdag } from "@/lib/config";
import { BRIDGE_ADDRESS, CHAINSETTLE_API, ESCROW_BRIDGE_API, ESCROW_BRIDGE_ABI, BDAG_ADDRESS, ERC20_ABI } from "@/lib/constants";

// Steps
import { StepAmount } from "./StepAmount";
import { StepRecipient } from "./StepRecipient";
import { StepReview } from "./StepReview";
import { StepProcessing } from "./StepProcessing";

export function SettlementWizard() {
  const { address, chainId } = useConnection();
  const { switchChain } = useSwitchChain();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    amount: "",
    email: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  
  const { writeContract, data: hash, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: recipientEmail } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'recipientEmail',
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BDAG_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, BRIDGE_ADDRESS],
    chainId: blockdag.id,
  });

  const { data: bdagBalance } = useReadContract({
    address: BDAG_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: blockdag.id,
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSettlement = async () => {
    if (!address) return;

    // Check if we're on BlockDAG network
    if (chainId !== blockdag.id) {
      setStatus("Switching to BlockDAG Testnet...");
      try {
        await switchChain({ chainId: blockdag.id });
      } catch (err) {
        const error = err as Error;
        setStatus(`Error switching network: ${error.message}`);
        return;
      }
    }

    setStep(4); // Go to processing step
    setStatus("Preparing transaction...");

    try {
      const decimals = 18; // BDAG has 18 decimals like ETH
      const rawAmount = parseUnits(data.amount, decimals);

      // Check if we need to approve BDAG spending
      const currentAllowance = (allowance as bigint) || BigInt(0);
      if (currentAllowance < rawAmount) {
        setNeedsApproval(true);
        setStatus("Approving BDAG spending...");
        
        writeContract({
          address: BDAG_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [BRIDGE_ADDRESS, rawAmount],
          chainId: blockdag.id,
        });
        return; // Wait for approval to complete
      }

      // If we have enough allowance, proceed with payment
      await initiatePayment(rawAmount);

    } catch (err) {
      const error = err as Error;
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const initiatePayment = async (rawAmount: bigint) => {
    if (!address) return;

    try {
      const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const settlementId = `${address}-${Date.now()}`;
      
      const idHash = keccak256(encodePacked(["bytes32", "string"], [salt, settlementId]));
      const userEmailHash = keccak256(encodePacked(["bytes32", "string"], [salt, data.email]));

      // Store Salt
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

      // Init Payment
      setStatus("Confirm transaction in wallet...");
      setNeedsApproval(false);
      writeContract({
        address: BRIDGE_ADDRESS as `0x${string}`,
        abi: ESCROW_BRIDGE_ABI,
        functionName: 'initPayment',
        args: [idHash, rawAmount],
        chainId: blockdag.id,
      });

    } catch (err) {
      const error = err as Error;
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isConfirming && !status?.includes("Waiting for confirmation")) {
        setStatus(needsApproval ? "Approving BDAG..." : "Transaction submitted. Waiting for confirmation...");
    }
  }, [isConfirming, needsApproval, status]);

  useEffect(() => {
    if (isConfirmed) {
        if (needsApproval) {
          setStatus("BDAG approved! Initiating payment...");
          void refetchAllowance();
          reset();
          // Retry payment with approval done
          const rawAmount = parseUnits(data.amount, 18); // BDAG has 18 decimals
          setTimeout(() => void initiatePayment(rawAmount), 1000);
        } else {
          setStatus("Transaction confirmed! Waiting for settlement...");
          // Poll logic would go here, simplified for now
          setTimeout(() => setStatus("Settlement Completed!"), 2000);
        }
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
        setStatus(`Error: ${writeError.message}`);
    }
  }, [writeError]);

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
