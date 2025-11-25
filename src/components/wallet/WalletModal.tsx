"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConnect } from "wagmi";
import { Wallet, Globe } from "lucide-react";
import { useEffect } from "react";


interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {


  const { connectors, connect, isPending, error, reset } = useConnect({
    mutation: {
      onSuccess: (data) => {
        console.log('WalletModal - Connection successful:', data);
        // Close modal and navigate to dashboard from the client to avoid server-side redirect races
      },
      onError: (err) => {
        console.error('WalletModal - Connection error:', err);
        // Don't close modal on error, let user try again
      },
    },
  });

  

  // Reset connection state when modal closes
  useEffect(() => {
    if (!isOpen && error) {
      reset();
    }
  }, [isOpen, error, reset]);

  const handleConnect = (connector: any) => {
    console.log('WalletModal - Connecting with:', connector.name);
    connect({ connector });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to EscrowBridge.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="mx-4 mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error.message || 'Failed to connect. Please try again.'}
          </div>
        )}
        <div className="grid gap-4 py-4">
          {connectors
            .filter((connector, index, self) => 
              // Filter out duplicates and safe connector (Gnosis Safe)
              index === self.findIndex((c) => c.id === connector.id) &&
              connector.id !== 'safe'
            )
            .map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              className="h-16 justify-start gap-4 px-6"
              onClick={() => handleConnect(connector)}
              disabled={isPending}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                {connector.name.toLowerCase().includes('metamask') ? <Wallet className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{connector.name}</span>
                <span className="text-xs text-muted-foreground">Connect using {connector.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
