"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  children: Category[];
}

interface FilterOption {
  id: string;
  label: string;
  options: string[];
}

interface FilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (id: number | null) => void;
  onFilterChange: (filters: any) => void;
  currentFilters: any;
  onPriceChange: (min: string, max: string) => void;
}

export default function FilterSidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onFilterChange, 
  currentFilters,
  onPriceChange 
}: FilterProps) {
  
  const [expandedCats, setExpandedCats] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  // ZDE: Stav pro dynamické filtry načtené z backendu
  const [dynamicFilters, setDynamicFilters] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // EFEKT: Když se změní kategorie, načti filtry z API
  useEffect(() => {
    if (!selectedCategory) {
        setDynamicFilters([]);
        return;
    }

    setLoadingFilters(true);
    fetch(`http://127.0.0.1:8000/api/filters/?category=${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
            // Data přijdou jako pole objektů {id, label, options}
            setDynamicFilters(data);
            setLoadingFilters(false);
        })
        .catch(err => {
            console.error("Failed to load filters", err);
            setLoadingFilters(false);
        });

  }, [selectedCategory]);


  const toggleCategory = (id: number) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleCheckboxChange = (filterId: string, value: string) => {
    const newFilters = { ...currentFilters };
    if (newFilters[filterId] === value) {
        delete newFilters[filterId];
    } else {
        newFilters[filterId] = value;
    }
    onFilterChange(newFilters);
  };

  const applyPrice = () => {
    onPriceChange(minPrice, maxPrice);
  };

  return (
    <aside className="w-full md:w-72 flex-shrink-0 border-r-2 border-gray-800 bg-background p-6 hidden md:block overflow-y-auto h-screen sticky top-20">
      
      {/* 1. KATEGORIE */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-primary uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
          Systems
        </h2>
        <div className="space-y-1">
            <button 
                onClick={() => onCategorySelect(null)}
                className={`w-full text-left px-2 py-2 text-sm font-mono uppercase hover:text-brand transition-colors ${selectedCategory === null ? "text-brand font-bold" : "text-secondary"}`}
            >
                [ ALL SYSTEMS ]
            </button>

            {categories.map((cat) => (
                <div key={cat.id}>
                    <div className="flex items-center justify-between group">
                        <button
                            onClick={() => onCategorySelect(cat.id)}
                            className={`flex-1 text-left px-2 py-2 text-sm font-mono uppercase transition-colors ${selectedCategory === cat.id ? "text-white bg-gray-900" : "text-secondary hover:text-white"}`}
                        >
                            {cat.name}
                        </button>
                        {cat.children.length > 0 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }}
                                className="px-2 text-gray-500 hover:text-brand font-mono"
                            >
                                {expandedCats.includes(cat.id) ? "[-]" : "[+]"}
                            </button>
                        )}
                    </div>

                    {expandedCats.includes(cat.id) && (
                        <div className="pl-4 border-l border-gray-800 ml-2 mt-1 space-y-1">
                            {cat.children.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => onCategorySelect(child.id)}
                                    className={`block w-full text-left px-2 py-1 text-xs font-mono uppercase transition-colors ${selectedCategory === child.id ? "text-brand" : "text-gray-500 hover:text-white"}`}
                                >
                                    {child.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* 2. CENA */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-brand uppercase mb-3 font-mono">Price Limit</h2>
        <div className="flex gap-2 mb-2">
            <input type="number" placeholder="MIN" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-surface border border-gray-700 text-xs p-2 text-white font-mono focus:border-brand outline-none" />
            <input type="number" placeholder="MAX" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-surface border border-gray-700 text-xs p-2 text-white font-mono focus:border-brand outline-none" />
        </div>
        <button onClick={applyPrice} className="w-full border border-gray-600 text-secondary text-xs py-1 hover:border-brand hover:text-brand uppercase transition-colors">
            [ SET RANGE ]
        </button>
      </div>

      {/* 3. AUTOMATICKÉ FILTRY Z API */}
      {loadingFilters ? (
        <div className="py-4 text-center">
            <span className="text-brand text-xs font-mono animate-pulse">LOADING FILTERS...</span>
        </div>
      ) : (
        dynamicFilters.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="border-t border-gray-800 my-4"></div>
                
                {dynamicFilters.map((filter) => (
                <div key={filter.id}>
                    <h3 className="text-sm font-bold text-brand uppercase mb-3 font-mono">{filter.label}</h3>
                    <div className="space-y-2">
                    {filter.options.map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group hover:text-white">
                        <div className={`w-3 h-3 border border-gray-600 flex items-center justify-center transition-all ${currentFilters[filter.id] === option ? "bg-brand border-brand" : "bg-transparent"}`}>
                            {currentFilters[filter.id] === option && <div className="w-1.5 h-1.5 bg-black" />}
                        </div>
                        
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={currentFilters[filter.id] === option}
                            onChange={() => handleCheckboxChange(filter.id, option)}
                        />
                        
                        <span className={`text-xs font-mono uppercase ${currentFilters[filter.id] === option ? "text-white font-bold" : "text-gray-500 group-hover:text-brand"}`}>
                            {option}
                        </span>
                        </label>
                    ))}
                    </div>
                </div>
                ))}
            </div>
        ) : (
            selectedCategory && (
                <div className="mt-8 p-4 border border-dashed border-gray-800 text-center">
                    <p className="text-xs text-secondary font-mono">NO DATA TO FILTER.</p>
                </div>
            )
        )
      )}
    </aside>
  );
}