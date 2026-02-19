"use client"; 

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-primary">
      <div className="bg-surface p-12 border-2 border-neon-green shadow-[0_0_30px_rgba(0,255,0,0.2)] text-center max-w-lg w-full">
        <div className="h-24 w-24 bg-black border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl text-neon-green">✓</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-widest">Order Confirmed</h1>
        <p className="text-secondary font-mono mb-8 text-lg">
          TRANSACTION SUCCESSFUL. <br/> SYSTEM IS PROCESSING YOUR HARDWARE.
        </p>

        <Link 
          href="/"
          className="block w-full bg-neon-green text-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors"
        >
          [ RETURN TO TERMINAL ]
        </Link>
      </div>
    </main>
  );
}