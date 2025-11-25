"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useConnection } from "wagmi";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, isReconnecting } = useConnection();
  const router = useRouter();
  const pathname = usePathname();
  const isLoading = isConnecting || isReconnecting;

  useEffect(() => {
    // Only perform navigation after the connection check completes on the client
    if (!isLoading && !isConnected && pathname.startsWith("/dashboard")) {
      router.push("/");
    }
  }, [isConnected, isLoading, router, pathname]);

  // Show loading state while connecting/reconnecting or while we will redirect
  if (isLoading || (!isConnected && pathname.startsWith("/dashboard"))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
