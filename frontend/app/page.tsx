"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/FilterSideBar"; // Ujisti se, že cesta sedí

// --- TYPY ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: number;
  slug: string;
  image: string | null;
  stock: number;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

interface CategoryNode extends Category {
  children: Category[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Stavy pro filtry
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: "", max: "" });

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search");

  // 1. NAČTENÍ KATEGORIÍ
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data: Category[]) => {
        const mainCategories: CategoryNode[] = data
          .filter((cat) => cat.parent_id === null)
          .map((parent) => ({
            ...parent,
            children: data.filter((child) => child.parent_id === parent.id),
          }));
        setCategories(mainCategories);
      })
      .catch((err) => console.error("Chyba kategorií:", err));
  }, []);

  // 2. NAČTENÍ PRODUKTŮ
  useEffect(() => {
    setLoading(true);
    let url = "http://127.0.0.1:8000/api/products/";
    
    const params = new URLSearchParams();
    
    if (selectedCategory) params.append("category", selectedCategory.toString());
    if (searchTerm) params.append("search", searchTerm);

    if (activeFilters.brand) {
        params.append("brand", activeFilters.brand);
    }
    
    const otherSpecs = Object.entries(activeFilters)
        .filter(([key]) => key !== "brand")
        .map(([key, val]) => `${key}:${val}`)
        .join(',');
    
    if (otherSpecs) params.append("specs", otherSpecs);

    if (priceRange.min) params.append("min_price", priceRange.min);
    if (priceRange.max) params.append("max_price", priceRange.max);

    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error("Chyba produktů:", err));
  }, [selectedCategory, searchTerm, activeFilters, priceRange]); 

  const handleCategoryChange = (id: number | null) => {
    setSelectedCategory(id);
    setActiveFilters({});
  };

  return (
    <main className="min-h-screen bg-[#050505] text-primary font-sans flex flex-col relative overflow-x-hidden">
      
      {/* --- BACKGROUND GRID EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
           }}>
      </div>

      {/* --- HEADER --- */}
      <header className="py-12 text-center border-b border-gray-800 bg-background/80 backdrop-blur-sm z-10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50"></div>
        
        <div className="inline-block relative">
             <h1 className="text-6xl md:text-8xl font-black text-white mb-2 uppercase tracking-tighter relative z-10 mix-blend-difference">
                PC <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-red-600">E-shop</span>
            </h1>
            {/* Dekorativní rozostřený stín nadpisu */}
            <h1 className="text-6xl md:text-8xl font-black text-brand absolute top-1 left-1 uppercase tracking-tighter opacity-20 blur-sm z-0">
                PC E-SHOP
            </h1>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-mono text-secondary tracking-[0.2em]">
            <span className="hidden md:inline">/// SYSTEM_READY</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#00ff00]"></span>
            <span>{searchTerm ? `SEARCH_QUERY: "${searchTerm}"` : "ACCESSING_HIGH_END_DATABASE"}</span>
            <span className="hidden md:inline">/// v.2.0.4</span>
        </div>
      </header>

      {/* --- HLAVNÍ LAYOUT --- */}
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full items-start relative z-10">
        
        {/* LEVÝ SIDEBAR */}
        <FilterSidebar 
            categories={categories}
            selectedCategory={selectedCategory} 
            onCategorySelect={handleCategoryChange}
            onFilterChange={setActiveFilters}
            currentFilters={activeFilters}
            onPriceChange={(min, max) => setPriceRange({ min, max })}
        />

        {/* PRAVÝ OBSAH */}
        <div className="flex-1 p-6 md:p-10">
            
            {/* Status Bar nad produkty */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-2">
                <div className="text-xs font-mono text-gray-500 uppercase">
                    Detected Items: <span className="text-white font-bold">{products.length}</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-1 bg-gray-800"></div>
                    <div className="w-2 h-1 bg-brand"></div>
                    <div className="w-1 h-1 bg-gray-800"></div>
                </div>
            </div>

            {loading ? (
                // --- LOADING ANIMATION ---
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <div className="w-16 h-16 border-4 border-gray-800 border-t-brand rounded-full animate-spin"></div>
                    <p className="text-brand font-mono text-sm uppercase tracking-widest animate-pulse">
                        Scanning Database...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                    <Link 
                        href={`/products/${product.slug}`} 
                        key={product.id}
                        className="group block h-full relative"
                    >
                        {/* Karta produktu */}
                        <div className="bg-[#0a0a0a] border border-gray-800 h-full flex flex-col transition-all duration-300 group-hover:border-brand/70 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] group-hover:-translate-y-1 relative overflow-hidden">
                          
                          {/* Dekorativní rohy */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600 group-hover:border-brand transition-colors"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 group-hover:border-brand transition-colors"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600 group-hover:border-brand transition-colors"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600 group-hover:border-brand transition-colors"></div>

                          {/* SCAN LINE (Animace při hoveru) */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 z-20 pointer-events-none"></div>

                          {/* Obrázek */}
                          <div className="relative h-64 bg-[#050505] flex items-center justify-center p-8 border-b border-gray-800 group-hover:border-brand/50 transition-colors">
                              {/* Grid za obrázkem */}
                              <div className="absolute inset-0 opacity-20" 
                                   style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px'}}>
                              </div>
                              
                              {product.image ? (
                              <img src={product.image} alt={product.name} className="relative z-10 object-contain h-full w-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 grayscale group-hover:grayscale-0" />
                              ) : (
                                <div className="text-gray-700 font-mono text-xs border border-gray-800 px-4 py-2">[ NO_IMAGE_DATA ]</div>
                              )}
                              
                              <div className="absolute top-3 right-3 bg-black/80 border border-gray-700 text-gray-400 text-[10px] font-mono px-2 py-0.5 group-hover:text-brand group-hover:border-brand transition-colors">
                                ID: {product.id.toString().padStart(4, '0')}
                              </div>
                          </div>
                          
                          {/* Popis */}
                          <div className="p-6 flex flex-col flex-grow relative z-10">
                              <div className="text-[10px] font-mono text-brand mb-2 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand rounded-full"></span>
                                {categories.flatMap(p => [p, ...p.children]).find(c => c.id === product.category)?.name || "HARDWARE"}
                              </div>

                              <h2 className="text-lg font-bold mb-4 text-white uppercase leading-tight group-hover:text-brand transition-colors line-clamp-2">
                                {product.name}
                              </h2>
                              
                              <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-800/50 group-hover:border-brand/30 transition-colors">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-0.5">Price Unit</p>
                                    <span className="text-2xl font-bold text-white tracking-tight">
                                        {product.price.toLocaleString("cs-CZ")} <span className="text-sm text-brand font-normal">Kč</span>
                                    </span>
                                </div>
                                <span className="bg-transparent border border-gray-600 text-gray-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest group-hover:bg-brand group-hover:text-black group-hover:border-brand transition-all">
                                    Init_Buy
                                </span>
                              </div>
                          </div>
                        </div>
                    </Link>
                    ))
                ) : (
                    <div className="col-span-full py-32 border border-dashed border-gray-800 bg-[#0a0a0a] flex flex-col items-center justify-center text-center">
                      <p className="text-xl text-white font-bold mb-2 uppercase tracking-widest">System Empty</p>
                      <p className="text-secondary font-mono text-sm mb-6">No matching hardware found in current sector.</p>
                      <button 
                        onClick={() => { handleCategoryChange(null); setActiveFilters({}); setPriceRange({min:"", max:""}); }} 
                        className="border border-brand text-brand px-6 py-3 font-mono text-xs uppercase hover:bg-brand hover:text-black transition-all"
                      >
                        [ RESET_SEARCH_PROTOCOLS ]
                      </button>
                    </div>
                )}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}