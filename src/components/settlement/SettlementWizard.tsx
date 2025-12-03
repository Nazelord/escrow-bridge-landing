"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, usePublicClient } from "wagmi";
import { parseUnits, formatUnits, keccak256, encodePacked, toHex } from "viem";
import { baseSepolia } from "@/lib/config";
import { BRIDGE_ADDRESS, ESCROW_BRIDGE_ABI, USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI } from "@/lib/constants";

// Steps
import { StepAmount } from "./StepAmount";
import { StepRecipient } from "./StepRecipient";
import { StepReview } from "./StepReview";
import { StepProcessing } from "./StepProcessing";
import { stringToBytes } from "viem";

export function SettlementWizard() {
  const { address, chainId } = useConnection();
  const { switchChain } = useSwitchChain();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    amount: "",
    walletAddress: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<bigint | null>(null); // Track amount for payment after approval
  const [apiFee, setApiFee] = useState<number>(0); // Fee from API
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: recipientEmail } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'recipientEmail',
  });

  const { data: minPaymentAmount } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'minPaymentAmount',
  });

  const { data: maxPaymentAmount } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'maxPaymentAmount',
  });

  const { data: freeBalance } = useReadContract({
    address: BRIDGE_ADDRESS as `0x${string}`,
    abi: ESCROW_BRIDGE_ABI,
    functionName: 'getFreeBalance',
  });

  // Fetch fee from API
  useEffect(() => {
    const fetchFee = async () => {
      try {
        const response = await fetch('https://app.escrowbridge.xyz/fee');
        if (response.ok) {
          const feeData = await response.json();
          console.log('Fee API response:', feeData);
          
          // API returns { fee_pct: "1.00%" } - parse the percentage string
          if (feeData.fee_pct) {
            // Remove % sign and convert to decimal (e.g., "1.00%" -> 0.01)
            const feeString = feeData.fee_pct.replace('%', '');
            const feeValue = parseFloat(feeString) / 100;
            setApiFee(feeValue);
            console.log('Fee loaded from API:', feeValue, `(${feeData.fee_pct})`);
          } else {
            console.warn('No fee_pct in response, using default 0');
          }
        } else {
          console.warn('Failed to fetch fee, using default 0');
        }
      } catch (error) {
        console.error('Error fetching fee:', error);
        // Keep default fee of 0
      }
    };
    fetchFee();
  }, []);

  // ===== COMMENTED OUT: Fee from contract (now using API) =====
  // const { data: fee } = useReadContract({
  //   address: BRIDGE_ADDRESS as `0x${string}`,
  //   abi: ESCROW_BRIDGE_ABI.abi,
  //   functionName: 'fee',
  // });
  //
  // const { data: feeDenominator } = useReadContract({
  //   address: BRIDGE_ADDRESS as `0x${string}`,
  //   abi: ESCROW_BRIDGE_ABI.abi,
  //   functionName: 'FEE_DENOMINATOR',
  // });
  // =================================================================

  // Get user's USDC balance (ERC20 token)
  const { data: userBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI as any,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!USDC_ADDRESS,
    }
  });

  // ===== COMMENTED OUT: Native BDAG balance (kept for possible future dual-chain setup) =====
  // const { data: userBalance } = useBalance({
  //   address: address,
  //   chainId: blockdag.id,
  // });
  // =========================================================================================

  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSettlement = async () => {
    if (!address) return;

    // Check if we're on Base Sepolia network
    if (chainId !== baseSepolia.id) {
      setStatus("Switching to Base Sepolia Testnet...");
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (err) {
        const error = err as Error;
        setStatus(`Error switching network: ${error.message}`);
        return;
      }
    }

    setStep(4); // Go to processing step
    setStatus("Validating amount...");

    try {
      const decimals = USDC_DECIMALS; // USDC has 6 decimals
      const rawAmount = parseUnits(data.amount, decimals);

      // Validate amount limits
      if (minPaymentAmount && typeof minPaymentAmount === 'bigint' && rawAmount < minPaymentAmount) {
        const minHuman = formatUnits(minPaymentAmount, decimals);
        throw new Error(`Amount too low. Minimum: ${minHuman} USDC`);
      }

      if (maxPaymentAmount && typeof maxPaymentAmount === 'bigint' && rawAmount > maxPaymentAmount) {
        const maxHuman = formatUnits(maxPaymentAmount, decimals);
        throw new Error(`Amount too high. Maximum: ${maxHuman} USDC`);
      }

      // Validate bridge has sufficient free balance
      if (freeBalance && typeof freeBalance === 'bigint' && rawAmount > freeBalance) {
        const freeHuman = formatUnits(freeBalance, decimals);
        throw new Error(`Insufficient bridge balance. Available: ${freeHuman} USDC`);
      }

      // Validate user has enough USDC for transaction
      if (userBalance && typeof userBalance === 'bigint' && rawAmount > userBalance) {
        const balanceHuman = formatUnits(userBalance, decimals);
        throw new Error(`Insufficient USDC balance. You have: ${balanceHuman} USDC`);
      }

      setStatus("Preparing transaction...");

      // USDC is ERC20 token - need to approve bridge contract first
      await approveAndInitiatePayment(rawAmount);

      // ===== COMMENTED OUT: BDAG native token logic (kept for possible future dual-chain setup) =====
      // const decimals = 18; // BDAG has 18 decimals like ETH
      // const rawAmount = parseUnits(data.amount, decimals);
      // // ... validation with BDAG references ...
      // // BDAG is native token, no approval needed - proceed directly with payment
      // await initiatePayment(rawAmount);
      // =========================================================================================

    } catch (err) {
      const error = err as Error;
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const approveAndInitiatePayment = async (rawAmount: bigint) => {
    if (!address) return;

    try {
      // Store amount for next step (payment after approval)
      setPendingAmount(rawAmount);
      
      // Step 1: Approve USDC spending by bridge contract
      setStatus("Approving USDC spending...");
      console.log('Approving USDC:', {
        token: USDC_ADDRESS,
        spender: BRIDGE_ADDRESS,
        amount: rawAmount.toString(),
      });

      await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI as any,
        functionName: 'approve',
        args: [BRIDGE_ADDRESS as `0x${string}`, rawAmount],
        chainId: baseSepolia.id,
      });

      // After approval confirmation, initiatePayment will be called via useEffect
      
    } catch (err) {
      const error = err as Error;
      console.error('Approval error:', error);
      setStatus(`Error approving USDC: ${error.message}`);
      setPendingAmount(null);
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

      // Init Payment with USDC (ERC20 token - no value sent, token transferred via contract)
      setStatus("Please confirm transaction in MetaMask...");
      console.log('Initiating payment:', {
        idHash,
        rawAmount: rawAmount.toString(),
        address: BRIDGE_ADDRESS,
        chainId: baseSepolia.id,
        token: USDC_ADDRESS,
        settlementId,
        recipientWallet: data.walletAddress
      });
      
      await writeContract({
        address: BRIDGE_ADDRESS as `0x${string}`,
        abi: ESCROW_BRIDGE_ABI,
        functionName: 'initPayment',
        args: [idHash as `0x${string}`, rawAmount, data.walletAddress as `0x${string}`] as const,
        // NOTE: No 'value' field for ERC20 tokens - approval handles the transfer
        chainId: baseSepolia.id,
      });

      // ===== COMMENTED OUT: BDAG native token logic (kept for possible future dual-chain setup) =====
      // await writeContract({
      //   address: BRIDGE_ADDRESS as `0x${string}`,
      //   abi: ESCROW_BRIDGE_ABI.abi,
      //   functionName: 'initPayment',
      //   args: [idHash as `0x${string}`, rawAmount] as const,
      //   value: rawAmount, // Send BDAG as value since it's native token
      //   chainId: blockdag.id,
      // });
      // =========================================================================================

      // Register settlement in API (after transaction is submitted)
      // We do this after to not block the transaction
      try {
        setStatus("Registering settlement with ChainSettle...");
        
        // Get recipient_email from contract (like Python CLI does)
        const contractRecipientEmail = recipientEmail || "treasury@lp.com";
        
        const registrationPayload = {
          salt: salt,
          settlement_id: settlementId,
          recipient_email: contractRecipientEmail, // Use contract's recipient_email, not user's wallet
        };
        console.log('Registering settlement with payload:', registrationPayload);
        
        const response = await fetch(`/api/register-settlement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationPayload),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API registration failed:', response.status, errorData);
          throw new Error(`API registration failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log("Settlement registered:", result);

        // Open user_url for PayPal payment
        if (result.settlement_info?.user_url) {
          setStatus("Opening PayPal payment page...");
          window.open(result.settlement_info.user_url, '_blank');
        } else {
          console.warn("No user_url in response");
          setStatus("Transaction confirmed! Settlement registered successfully.");
        }
      } catch (apiError) {
        console.error("API registration failed (CORS or network issue):", apiError);
        // Don't show error to user since the on-chain transaction succeeded
        setStatus("Transaction confirmed! Waiting for settlement...");
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
    if (isConfirmed && pendingAmount && !escrowId) {
      // Approval confirmed - now initiate payment
      console.log('Approval confirmed! Hash:', hash);
      setStatus("Approval confirmed! Initiating payment...");
      const amountToProcess = pendingAmount; // Save amount before clearing
      setPendingAmount(null); // Clear pending amount
      initiatePayment(amountToProcess); // Use saved amount
    } else if (isConfirmed && escrowId) {
      // Payment confirmed - start polling
      console.log('Transaction confirmed! Hash:', hash);
      setStatus("Transaction confirmed! Waiting for settlement...");
      pollSettlementStatus(escrowId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, hash, escrowId, pendingAmount]);

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
        
        // Check if settlement is finalized on-chain (using isSettled instead of isFinalized)
        const isFinalized = await publicClient.readContract({
          address: BRIDGE_ADDRESS as `0x${string}`,
          abi: ESCROW_BRIDGE_ABI,
          functionName: 'isSettled',
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
          abi: ESCROW_BRIDGE_ABI,
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
                walletAddress={data.walletAddress} 
                setWalletAddress={(w: string) => setData({ ...data, walletAddress: w })} 
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
                fee={apiFee}
                freeBalance={freeBalance && typeof freeBalance === 'bigint' ? formatUnits(freeBalance, USDC_DECIMALS) : undefined}
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
