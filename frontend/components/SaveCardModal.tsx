"use client";

interface SaveCardModalProps {
  isOpen: boolean;
  onClose: () => void; // Funkce pro "Ne, děkuji"
  onSave: () => void;  // Funkce pro "Ano, uložit"
  last4: string;       // Poslední 4 čísla karty pro kontrolu
}

export default function SaveCardModal({ isOpen, onClose, onSave, last4 }: SaveCardModalProps) {
  // Pokud není isOpen true, komponenta nic nevykreslí (je neviditelná)
  if (!isOpen) return null;

  return (
    // Černé poloprůhledné pozadí přes celou obrazovku
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Bílé okno uprostřed */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100 animate-in zoom-in duration-200">
        
        {/* Ikonka úspěchu (Zelená fajfka) */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">Platba úspěšná!</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vaše objednávka se připravuje k odeslání.
          </p>

          {/* Modrý boxík s dotazem */}
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-left">
            <h4 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
              💳 Uložit kartu pro příště?
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Chcete bezpečně uložit kartu končící na <strong>**** {last4}</strong>? 
              Při příštím nákupu nebudete muset nic opisovat.
            </p>
          </div>

          {/* Tlačítka */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Ne, děkuji
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-transform active:scale-95"
            >
              Ano, uložit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}