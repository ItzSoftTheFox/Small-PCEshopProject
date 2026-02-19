export default function AboutPage() {
    return (
      <main className="min-h-screen bg-background text-primary font-sans p-8 md:p-16">
        <div className="max-w-4xl mx-auto">
          
          {/* HLAVIČKA */}
          <header className="mb-12 border-b-2 border-brand pb-6">
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-4">
              SYSTEM <span className="text-brand">CORE</span>
            </h1>
            <p className="text-xl text-secondary font-mono">
              /// IDENTITY_VERIFICATION_SUCCESSFUL
            </p>
          </header>
  
          {/* OBSAH - GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* LEVÁ STRANA - TEXT */}
            <div className="space-y-6 text-lg leading-relaxed text-gray-300">
              <p>
                <strong className="text-white">INITIATED IN 2024.</strong> Jsme tým nadšenců do hardwaru, kteří odmítají kompromisy. Nestavíme jen počítače. Stavíme stroje, které dominují.
              </p>
              <p>
                Věříme, že každý komponent má svůj účel. Od základní desky po poslední šroubek. Naše sestavy nejsou jen hromada křemíku, jsou to vyladěné ekosystémy připravené na maximální zátěž.
              </p>
              <div className="p-4 border border-gray-700 bg-surface mt-8">
                <h3 className="text-brand font-mono text-sm uppercase mb-2">/// MISSION_PROTOCOL</h3>
                <p className="font-mono text-sm text-secondary">
                  &gt; POSKYTOVAT NEJKVALITNĚJŠÍ HARDWARE<br/>
                  &gt; ELIMINOVAT FPS DROPY<br/>
                  &gt; OPTIMALIZOVAT CABLE MANAGEMENT
                </p>
              </div>
            </div>
  
            {/* PRAVÁ STRANA - STATISTIKY (Vizuální prvek) */}
            <div className="border-2 border-gray-800 p-8 bg-surface flex flex-col justify-center">
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between text-sm font-mono text-secondary mb-1">
                            <span>SYSTEMS_BUILT</span>
                            <span>1,024+</span>
                        </div>
                        <div className="h-2 bg-gray-800 w-full overflow-hidden">
                            <div className="h-full bg-brand w-[85%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-mono text-secondary mb-1">
                            <span>CUSTOMER_SATISFACTION</span>
                            <span>99.9%</span>
                        </div>
                        <div className="h-2 bg-gray-800 w-full overflow-hidden">
                            <div className="h-full bg-brand w-[99%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-mono text-secondary mb-1">
                            <span>RMA_RATE</span>
                            <span>0.1%</span>
                        </div>
                        <div className="h-2 bg-gray-800 w-full overflow-hidden">
                            <div className="h-full bg-brand w-[1%]"></div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 text-center">
                    <span className="inline-block border border-brand text-brand px-6 py-2 font-mono uppercase text-sm hover:bg-brand hover:text-black transition-colors cursor-default">
                        [ AUTHORIZED PERSONNEL ONLY ]
                    </span>
                </div>
            </div>
          </div>
        </div>
      </main>
    );
  }