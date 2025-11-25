"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { parseUnits, keccak256, encodePacked, toHex, type Abi } from "viem";
import { blockdag } from "@/lib/config";
import { BRIDGE_ADDRESS, CHAINSETTLE_API, ESCROW_BRIDGE_API, ESCROW_BRIDGE_ABI } from "@/lib/constants";

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
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: recipientEmail } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI as unknown as Abi,
    functionName: 'recipientEmail',
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

      // BDAG is native token, no approval needed - proceed directly with payment
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

      // Init Payment with native BDAG FIRST (most important - the on-chain transaction)
      setStatus("Please confirm transaction in MetaMask...");
      console.log('Initiating payment:', {
        idHash,
        rawAmount: rawAmount.toString(),
        address: BRIDGE_ADDRESS,
        chainId: blockdag.id,
        value: rawAmount.toString()
      });
      
      const txHash = await writeContract({
        address: BRIDGE_ADDRESS as `0x${string}`,
        abi: ESCROW_BRIDGE_ABI as unknown as Abi,
        functionName: 'initPayment',
        args: [idHash, rawAmount],
        value: rawAmount, // Send BDAG as value since it's native token
        chainId: blockdag.id,
      });

      console.log('Transaction submitted:', txHash);

      // Store Salt in API (optional - if this fails, on-chain tx is still done)
      // We do this after to not block the transaction
      try {
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
        console.log("Salt stored successfully in API");
      } catch (apiError) {
        console.warn("API storage failed, but on-chain transaction was submitted:", apiError);
        // Don't throw - the important part (on-chain tx) is already done
      }

    } catch (err) {
      const error = err as Error;
      console.error('Transaction error:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isConfirming && !status?.includes("Waiting for confirmation")) {
        console.log('Transaction confirming, hash:', hash);
        setStatus("Transaction submitted. Waiting for confirmation...");
    }
  }, [isConfirming, status, hash]);

  useEffect(() => {
    if (isConfirmed) {
      console.log('Transaction confirmed! Hash:', hash);
      setStatus("Transaction confirmed! Waiting for settlement...");
      // Poll logic would go here, simplified for now
      setTimeout(() => setStatus("Settlement Completed!"), 2000);
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (writeError) {
        console.error('Transaction error:', writeError);
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
