import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";

export function useWalletLogin() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  return async () => {
    if (!walletClient || !address) return;

    const message = `Login to Escrow Bridge at ${new Date().toISOString()}`;

    const signature = await walletClient.signMessage({
      account: address,
      message,
    });

    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature }),
    });
  };
}
