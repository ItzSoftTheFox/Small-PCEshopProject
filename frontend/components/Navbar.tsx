"use client";

import Link from "next/link";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Search } from "lucide-react";

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { isAuthenticated, username, logout } = useAuthStore();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
        router.push("/");
    }
  };

  const handleLogout = () => {
    logout();
    clearCart();
    router.push("/");
  };

  return (
    <nav className="bg-background text-primary sticky top-0 z-50 border-b-2 border-gray-800 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-[1920px] mx-auto px-6 h-24 flex items-center justify-between"> 
        
        {/* LEVÁ ČÁST: LOGO + ODKAZY */}
        <div className="flex items-center gap-12">
            {/* 1. LOGO */}
            <Link href="/" className="text-3xl font-bold text-primary hover:text-brand transition-colors flex-shrink-0 uppercase tracking-tighter cursor-pointer group">
                PC <span className="text-brand group-hover:text-white transition-colors">E-shop</span>
            </Link>

            {/* 2. NOVÉ: NAVIGAČNÍ ODKAZY (Zobrazí se jen na větších displejích) */}
            <div className="hidden xl:flex items-center gap-8">
                <Link href="/" className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 hover:text-brand transition-colors">
                    [ SYSTEM ]
                </Link>
                <Link href="/about" className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 hover:text-brand transition-colors">
                    [ O NÁS ]
                </Link>
                <Link href="/contact" className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 hover:text-brand transition-colors">
                    [ KONTAKT ]
                </Link>
            </div>
        </div>

        {/* 3. STŘED: VYHLEDÁVÁNÍ */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden lg:block">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="SEARCH_SYSTEM_DATABASE..." 
                    className="w-full py-2.5 px-4 bg-surface border border-gray-700 text-primary placeholder-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono text-sm uppercase tracking-wider"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 group-hover:text-brand transition-colors">
                    <Search className="w-5 h-5" />
                </button>
            </div>
        </form>

        {/* 4. PRAVÁ ČÁST (Košík, Profil, Login) */}
        <div className="flex items-center gap-6 flex-shrink-0 font-mono text-sm">
            
            {/* Košík */}
            <Link href="/cart" className="relative group flex items-center gap-2 hover:text-brand transition-colors">
                <Package className="w-6 h-6 text-primary group-hover:text-brand transition-colors stroke-[1.5]" />
                <span className="hidden lg:inline uppercase tracking-widest">CART</span>
                
                {/* Badge počtu kusů */}
                {mounted && itemCount > 0 && (
                    <span className="bg-brand text-black text-xs font-bold h-5 w-5 flex items-center justify-center border border-brand group-hover:bg-white group-hover:text-black transition-colors">
                        {itemCount}
                    </span>
                )}
            </Link>

            {mounted && (
                isAuthenticated ? (
                    <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
                        {/* Profil */}
                        <Link href="/profile" className="text-secondary hover:text-brand hidden md:block uppercase tracking-wider text-xs">
                            USER: <span className="text-white">{username}</span>
                        </Link>
                        
                        {/* Logout */}
                        <button 
                            onClick={handleLogout} 
                            className="border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500 px-3 py-1 transition-all uppercase tracking-widest text-[10px]"
                        >
                            [ LOGOUT ]
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
                        {/* Login */}
                        <Link href="/login" className="bg-brand text-black hover:bg-white hover:text-black px-5 py-2 font-bold transition-all uppercase tracking-widest border border-brand">
                            LOGIN
                        </Link>
                        
                        {/* Register */}
                        <Link href="/register" className="text-secondary hover:text-white uppercase tracking-widest text-xs hidden lg:block">
                            REGISTER
                        </Link>
                    </div>
                )
            )}
        </div>
      </div>
      
      {/* Mobilní menu - Hledání a odkazy */}
      <div className="lg:hidden px-4 pb-4 border-t border-gray-800 pt-4 bg-background">
          <form onSubmit={handleSearch} className="mb-4">
            <input 
                type="text" 
                placeholder="SEARCH..." 
                className="w-full py-2 px-4 bg-surface border border-gray-700 text-primary font-mono text-sm uppercase focus:border-brand outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {/* Mobilní odkazy */}
          <div className="flex justify-around text-xs font-mono font-bold text-gray-500 border-t border-gray-800 pt-3">
             <Link href="/about" className="hover:text-brand">[ O NÁS ]</Link>
             <Link href="/contact" className="hover:text-brand">[ KONTAKT ]</Link>
          </div>
      </div>
    </nav>
  );
}