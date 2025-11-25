// src/components/wallet/providers.tsx
"use client";

import React, { useState } from "react";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getConfig } from "@/lib/config";

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={getConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
