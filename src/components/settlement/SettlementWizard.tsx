"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useBalance, usePublicClient } from "wagmi";
import { parseUnits, formatUnits, keccak256, encodePacked, toHex } from "viem";
import { blockdag } from "@/lib/config";
import { BRIDGE_ADDRESS, CHAINSETTLE_API, ESCROW_BRIDGE_ABI } from "@/lib/constants";

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
  const [escrowId, setEscrowId] = useState<string | null>(null);
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: recipientEmail } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'recipientEmail',
  });

  const { data: minPaymentAmount } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'minPaymentAmount',
  });

  const { data: maxPaymentAmount } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'maxPaymentAmount',
  });

  const { data: freeBalance } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'getFreeBalance',
  });

  const { data: fee } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'fee',
  });

  const { data: feeDenominator } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI.abi,
    functionName: 'FEE_DENOMINATOR',
  });

  const { data: userBalance } = useBalance({
    address: address,
    chainId: blockdag.id,
  });

  const publicClient = usePublicClient({ chainId: blockdag.id });

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
    setStatus("Validating amount...");

    try {
      const decimals = 18; // BDAG has 18 decimals like ETH
      const rawAmount = parseUnits(data.amount, decimals);

      // Validate amount limits
      if (minPaymentAmount && typeof minPaymentAmount === 'bigint' && rawAmount < minPaymentAmount) {
        const minHuman = formatUnits(minPaymentAmount, decimals);
        throw new Error(`Amount too low. Minimum: ${minHuman} BDAG`);
      }

      if (maxPaymentAmount && typeof maxPaymentAmount === 'bigint' && rawAmount > maxPaymentAmount) {
        const maxHuman = formatUnits(maxPaymentAmount, decimals);
        throw new Error(`Amount too high. Maximum: ${maxHuman} BDAG`);
      }

      // Validate bridge has sufficient free balance
      if (freeBalance && typeof freeBalance === 'bigint' && rawAmount > freeBalance) {
        const freeHuman = formatUnits(freeBalance, decimals);
        throw new Error(`Insufficient bridge balance. Available: ${freeHuman} BDAG`);
      }

      // Validate user has enough BDAG for transaction + gas
      if (userBalance && rawAmount > userBalance.value) {
        const balanceHuman = formatUnits(userBalance.value, decimals);
        throw new Error(`Insufficient BDAG balance. You have: ${balanceHuman} BDAG`);
      }

      setStatus("Preparing transaction...");

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
      // Generate settlement_id like Python CLI (36 hex characters)
      const settlementId = Array.from(crypto.getRandomValues(new Uint8Array(18)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const idHash = keccak256(encodePacked(["bytes32", "string"], [salt, settlementId]));

      // Store escrowId for polling
      setEscrowId(idHash);

      // Init Payment with native BDAG FIRST (most important - the on-chain transaction)
      setStatus("Please confirm transaction in MetaMask...");
      console.log('Initiating payment:', {
        idHash,
        rawAmount: rawAmount.toString(),
        address: BRIDGE_ADDRESS,
        chainId: blockdag.id,
        value: rawAmount.toString(),
        settlementId
      });
      
      await writeContract({
        address: BRIDGE_ADDRESS as `0x${string}`,
        abi: ESCROW_BRIDGE_ABI.abi,
        functionName: 'initPayment',
        args: [idHash as `0x${string}`, rawAmount] as const,
        value: rawAmount, // Send BDAG as value since it's native token
        chainId: blockdag.id,
      });

      // Register settlement in API (after transaction is submitted)
      // We do this after to not block the transaction
      try {
        setStatus("Registering settlement...");
        const response = await fetch(`${CHAINSETTLE_API}/settlement/register_settlement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salt,
            settlement_id: settlementId,
            recipient_email: recipientEmail,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API registration failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Settlement registered:", result);

        // Open user_url for PayPal payment
        if (result.settlement_info?.user_url) {
          setStatus("Opening PayPal payment page...");
          window.open(result.settlement_info.user_url, '_blank');
        } else {
          console.warn("No user_url in response");
        }
      } catch (apiError) {
        console.error("API registration failed:", apiError);
        setStatus(`Warning: ${apiError instanceof Error ? apiError.message : 'API registration failed'}`);
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
    if (isConfirmed && escrowId) {
      console.log('Transaction confirmed! Hash:', hash);
      setStatus("Transaction confirmed! Waiting for settlement...");
      // Start polling for settlement status
      pollSettlementStatus(escrowId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, hash, escrowId]);

  const pollSettlementStatus = async (idHash: string) => {
    if (!publicClient) {
      console.error('Public client not available');
      return;
    }

    const maxAttempts = 60; // Poll for 5 minutes (60 * 5s)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        
        // Check if settlement is finalized on-chain
        const isFinalized = await publicClient.readContract({
          address: BRIDGE_ADDRESS as `0x${string}`,
          abi: ESCROW_BRIDGE_ABI.abi,
          functionName: 'isFinalized',
          args: [idHash as `0x${string}`],
        }) as boolean;

        if (isFinalized) {
          setStatus("Settlement Completed! ✅");
          console.log('Settlement finalized!');
          return;
        }

        // Check if escrow expired
        const isExpired = await publicClient.readContract({
          address: BRIDGE_ADDRESS as `0x${string}`,
          abi: ESCROW_BRIDGE_ABI.abi,
          functionName: 'isEscrowExpired',
          args: [idHash as `0x${string}`],
        }) as boolean;

        if (isExpired) {
          setStatus("Escrow expired. Please try again.");
          console.log('Escrow expired');
          return;
        }

        if (attempts < maxAttempts) {
          setStatus(`Waiting for PayPal payment... (${attempts}/${maxAttempts})`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setStatus("Timeout waiting for settlement. Check status manually.");
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

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
                fee={fee && feeDenominator && typeof fee === 'bigint' && typeof feeDenominator === 'bigint' ? Number(fee) / Number(feeDenominator) : 0}
                freeBalance={freeBalance && typeof freeBalance === 'bigint' ? formatUnits(freeBalance, 18) : undefined}
                recipientEmail={recipientEmail as string | undefined}
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
