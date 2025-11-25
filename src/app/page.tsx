"use client";

import { Button } from "@/components/ui/button";
import { useConnection } from "wagmi";
import { ArrowRight, ShieldCheck, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WalletModal } from "@/components/wallet/WalletModal";

export default function LandingPage() {
  const { isConnected, isConnecting, isReconnecting } = useConnection();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isLoading = isConnecting || isReconnecting;

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log('LandingPage - isConnected:', isConnected, 'isLoading:', isLoading, 'mounted:', mounted);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-20 items-center justify-between px-6 md:px-12 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            E
          </div>
          <span>EscrowBridge</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#" className="hover:text-primary transition-colors">Security</Link>
          <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        {!mounted ? (
          <Button disabled className="rounded-full px-6">
            Loading...
          </Button>
        ) : isConnected ? (
          <Link href="/dashboard">
            <Button className="rounded-full px-6">
              Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={() => setIsWalletModalOpen(true)} 
            disabled={isLoading} 
            className="rounded-full px-6"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </header>
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-6 md:px-12 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Now Live on Mainnet
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
            The Future of <br /> Crypto Settlements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Secure, fast, and compliant on-ramping for the modern economy. 
            Experience the power of decentralized finance with a premium banking experience.
          </p>
          <div className="flex gap-4 pt-4">
            <Button size="lg" onClick={() => setIsWalletModalOpen(true)} className="h-14 px-8 text-lg rounded-full">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
              View Demo
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30 px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-muted-foreground">
                Your funds are protected by audited smart contracts and enterprise-grade encryption.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Settlements</h3>
              <p className="text-muted-foreground">
                Say goodbye to waiting days. Experience near-instant settlement times on-chain.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Access</h3>
              <p className="text-muted-foreground">
                Send and receive payments from anywhere in the world without border restrictions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2024 EscrowBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
