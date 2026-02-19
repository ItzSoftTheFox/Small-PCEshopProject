"use client";

import { useCartStore } from "../store/cartStore";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  stock: number; // Přidáno stock
}

export default function AddToCartButton({ product }: { product: Product }) {
  const items = useCartStore((state) => state.items); // Potřebujeme číst košík
  const addItem = useCartStore((state) => state.addItem);
  const [clicked, setClicked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 1. Zjistíme, kolik už toho máme v košíku
  const cartItem = items.find((i) => i.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  // 2. Spočítáme, jestli můžeme přidat další
  // (Je skladem víc, než kolik máme v košíku?)
  const canAdd = quantityInCart < product.stock;

  const handleAddToCart = () => {
    if (!canAdd) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || undefined,
      slug: product.slug,
      stock: product.stock, // Předáváme stock dál
    });

    setClicked(true);
    setTimeout(() => setClicked(false), 1000);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleAddToCart}
      disabled={!canAdd} // Deaktivujeme tlačítko, pokud je plno
      className={`w-full py-4 px-6 font-bold text-xl uppercase tracking-widest transition-all duration-200 border-2 
        ${!canAdd 
            ? "bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed" // Styl pro VYPRODÁNO/PLNO
            : clicked 
                ? "bg-neon-green border-neon-green text-black scale-95" 
                : "bg-brand text-black border-brand hover:bg-transparent hover:text-brand hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]"
        }`}
    >
      {/* Měníme text podle stavu */}
      {!canAdd 
         ? (product.stock === 0 ? "OUT OF STOCK" : "MAX LIMIT REACHED") 
         : (clicked ? ">> INITIALIZED <<" : "[ ADD TO SYSTEM ]")
      }
    </button>
  );
}