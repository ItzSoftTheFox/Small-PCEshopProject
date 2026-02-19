export default function ContactPage() {
    return (
      <main className="min-h-screen bg-background text-primary font-sans p-8 md:p-16">
        <div className="max-w-5xl mx-auto">
          
          <header className="mb-12 border-b-2 border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-end">
            <div>
                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-2">
                LINK <span className="text-brand">ESTABLISHED</span>
                </h1>
                <p className="text-xl text-secondary font-mono">
                /// TRANSMISSION_OPEN
                </p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-brand font-mono text-sm animate-pulse">● LIVE SIGNAL</div>
            </div>
          </header>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* KONTAKTNÍ ÚDAJE */}
            <div className="space-y-10">
                <div>
                    <h3 className="text-brand font-mono text-sm uppercase mb-4 tracking-widest">--- HQ_COORDINATES ---</h3>
                    <p className="text-2xl font-bold uppercase">Technická 2938/4<br/>Brno, 616 00<br/>Czech Sector</p>
                </div>
  
                <div>
                    <h3 className="text-brand font-mono text-sm uppercase mb-4 tracking-widest">--- DIRECT_LINE ---</h3>
                    <p className="text-xl hover:text-brand transition-colors cursor-pointer">+420 600 123 456</p>
                    <p className="text-xl hover:text-brand transition-colors cursor-pointer">info@pceshop.cz</p>
                </div>
  
                <div>
                    <h3 className="text-brand font-mono text-sm uppercase mb-4 tracking-widest">--- OPERATION_HOURS ---</h3>
                    <ul className="font-mono text-secondary space-y-2">
                        <li className="flex justify-between border-b border-gray-800 pb-1"><span>MON - FRI</span> <span className="text-white">09:00 - 18:00</span></li>
                        <li className="flex justify-between border-b border-gray-800 pb-1"><span>SATURDAY</span> <span className="text-white">10:00 - 14:00</span></li>
                        <li className="flex justify-between border-b border-gray-800 pb-1"><span>SUNDAY</span> <span className="text-red-500">OFFLINE</span></li>
                    </ul>
                </div>
            </div>
  
            {/* FORMULÁŘ */}
            <div className="bg-surface border-2 border-gray-800 p-8">
                <h3 className="text-lg font-bold uppercase mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand"></span> SEND_MESSAGE
                </h3>
                
                <form className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-secondary mb-2 uppercase">Your ID (Name)</label>
                        <input type="text" className="w-full bg-[#050505] border border-gray-700 p-3 text-white focus:border-brand focus:outline-none transition-colors" placeholder="John Doe" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-mono text-secondary mb-2 uppercase">Comms Frequency (Email)</label>
                        <input type="email" className="w-full bg-[#050505] border border-gray-700 p-3 text-white focus:border-brand focus:outline-none transition-colors" placeholder="john@example.com" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-mono text-secondary mb-2 uppercase">Message Data</label>
                        <textarea rows={4} className="w-full bg-[#050505] border border-gray-700 p-3 text-white focus:border-brand focus:outline-none transition-colors" placeholder="Type your query..."></textarea>
                    </div>
  
                    <button type="button" className="w-full bg-brand text-black font-bold uppercase py-3 hover:bg-white transition-colors tracking-widest">
                        [ TRANSMIT DATA ]
                    </button>
                </form>
            </div>
  
          </div>
        </div>
      </main>
    );
  }