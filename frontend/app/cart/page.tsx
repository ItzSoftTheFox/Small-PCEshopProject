"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-8 border-b-2 border-gray-800 pb-4">
            <h1 className="text-4xl font-bold text-primary uppercase tracking-tighter">
                System Load <span className="text-brand">// CART</span>
            </h1>
            <span className="font-mono text-secondary">ITEMS: {items.length}</span>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-800">
            <p className="text-xl text-secondary font-mono mb-6">SYSTEM LOAD EMPTY.</p>
            <Link href="/" className="text-brand hover:underline font-bold uppercase tracking-widest">
              [ INITIATE SEARCH ]
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Seznam položek */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="group bg-surface border-2 border-gray-800 p-4 flex items-center gap-6 hover:border-brand transition-colors">
                  
                  {/* Obrázek */}
                  <div className="h-20 w-20 bg-black border border-gray-800 flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-xs text-gray-600 font-mono">NO_IMG</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <Link href={`/products/${item.slug}`} className="text-xl font-bold text-primary hover:text-brand uppercase">
                      {item.name}
                    </Link>
                    <div className="text-secondary text-sm font-mono mt-1">UNIT COST: {item.price.toLocaleString("cs-CZ")} Kč</div>
                  </div>

                  {/* Množství */}
                  <div className="font-mono bg-black border border-gray-700 text-primary px-4 py-2">
                    x{item.quantity}
                  </div>

                  {/* Celkem za položku */}
                  <div className="font-bold text-xl text-brand w-32 text-right font-mono">
                    {(item.price * item.quantity).toLocaleString("cs-CZ")} Kč
                  </div>

                  {/* Odebrat */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-600 hover:text-brand transition-colors p-2 font-mono text-xl"
                  >
                    [X]
                  </button>
                </div>
              ))}
            </div>

            {/* Patička košíku */}
            <div className="mt-8 flex flex-col items-end border-t-2 border-gray-800 pt-8">
              
              <div className="text-right mb-6">
                <p className="text-secondary font-mono mb-2 uppercase">Total Resource Cost</p>
                <p className="text-5xl font-bold text-primary tracking-tighter">
                    {getTotalPrice().toLocaleString("cs-CZ")} <span className="text-2xl text-brand">Kč</span>
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={clearCart} className="px-6 py-3 text-red-500 font-mono hover:bg-red-500/10 transition-colors uppercase text-sm">
                    Purge System
                </button>
                <Link 
                    href="/checkout"
                    className="bg-brand text-black px-8 py-3 font-bold text-xl uppercase tracking-widest hover:bg-white transition-colors border-2 border-brand"
                >
                    [ EXECUTE ORDER ]
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}