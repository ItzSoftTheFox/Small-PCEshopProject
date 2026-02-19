"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SaveCardModal from "@/components/SaveCardModal";

interface SavedCard { id: number; last_4: string; brand: string; expiry: string; }

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, setShippingPrice, shippingPrice } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({ full_name: "", email: "", address: "", city: "", zip_code: "", phone: "" });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("Standard");
  const [selectedPayment, setSelectedPayment] = useState("Card");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch("http://127.0.0.1:8000/api/saved-cards/", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json()).then(data => { if (Array.isArray(data) && data.length > 0) { setSavedCards(data); setSelectedCardId(data[0].id); }});
      fetch("http://127.0.0.1:8000/api/profile/", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json()).then(data => { if (data) setFormData(p => ({ ...p, ...data, email: data.email || "" })); });
    }
  }, [isAuthenticated, token]);

  useEffect(() => { if (isMounted && items.length === 0 && !isSuccess) router.push("/cart"); }, [items, router, isMounted, isSuccess]);

  const formatZip = (val: string) => val.replace(/\D/g, "").slice(0, 5);
  const formatPhone = (val: string) => val.replace(/(?!^\+)\D/g, "").slice(0, 16);
  const formatCardNumber = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (val: string) => { const c = val.replace(/\D/g, "").slice(0, 4); return c.length >= 3 ? `${c.slice(0, 2)}/${c.slice(2)}` : c; };

  const handleShippingChange = (name: string, price: number) => { setSelectedShipping(name); setShippingPrice(price); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (e.target.name === "zip_code") v = formatZip(v);
    if (e.target.name === "phone") v = formatPhone(v);
    setFormData({ ...formData, [e.target.name]: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      if (saveToProfile && isAuthenticated && token) {
        await fetch("http://127.0.0.1:8000/api/profile/", { method: "PATCH", headers, body: JSON.stringify(formData) });
      }
      const orderPayload = { ...formData, shipping_method: selectedShipping, payment_method: selectedPayment, total_amount: getTotalPrice(), items: items.map((i) => ({ product: i.id, quantity: i.quantity, price: i.price })) };
      if (selectedPayment === "Card") await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetch("http://127.0.0.1:8000/api/orders/", { method: "POST", headers, body: JSON.stringify(orderPayload) });
      if (!res.ok) throw new Error();

      if (selectedPayment === "Card" && selectedCardId === null && isAuthenticated) setShowSaveModal(true);
      else finalizeOrder();
    } catch { setError("Order execution failed."); setIsLoading(false); }
  };

  const finalizeOrder = () => { setIsSuccess(true); setTimeout(() => { clearCart(); router.push("/checkout/success"); }, 100); };
  const handleSaveCard = async () => {
    if (!token) return finalizeOrder();
    try { await fetch("http://127.0.0.1:8000/api/save-card/", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ cardNumber: newCardNumber || "0000", expiry: newCardExpiry || "00/00" }) }); } 
    catch {} finally { finalizeOrder(); }
  };

  if (!isMounted || items.length === 0) return null;

  return (
    <main className="min-h-screen bg-background p-8 pt-20 font-sans text-primary">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-surface p-8 border-2 border-gray-800 h-fit">
          <form onSubmit={handleSubmit} className="space-y-8 font-mono"> 
            <section>
              <h2 className="text-xl font-bold text-brand mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">1. Delivery Data</h2>
              <div className="space-y-4">
                <input required name="full_name" value={formData.full_name} onChange={handleChange} type="text" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="FULL NAME" />
                <div className="grid grid-cols-2 gap-4">
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="EMAIL" />
                    <input name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="PHONE (+420)" />
                </div>
                <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="ADDRESS" />
                <div className="grid grid-cols-2 gap-4">
                  <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="CITY" />
                  <input required name="zip_code" value={formData.zip_code} onChange={handleChange} type="text" className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand outline-none" placeholder="ZIP" />
                </div>
                {isAuthenticated && (
                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="saveProfile" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} className="accent-brand h-4 w-4"/>
                        <label htmlFor="saveProfile" className="text-sm text-secondary uppercase cursor-pointer">Update Profile Data</label>
                    </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">2. Shipping</h2>
              <div className="grid grid-cols-1 gap-3">
                {[{ name: "Osobní odběr", price: 0 }, { name: "Zásilkovna", price: 79 }, { name: "Kurýr PPL", price: 119 }].map((opt) => (
                    <div key={opt.name} onClick={() => handleShippingChange(opt.name, opt.price)} className={`p-4 border-2 cursor-pointer flex justify-between uppercase transition-all ${selectedShipping === opt.name ? "border-brand bg-gray-900 text-brand" : "border-gray-700 hover:border-gray-500"}`}>
                        <span>{opt.name}</span>
                        <span className="font-bold">{opt.price === 0 ? "FREE" : `${opt.price} CR`}</span>
                    </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">3. Payment</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div onClick={() => setSelectedPayment("Card")} className={`p-4 border-2 cursor-pointer text-center font-bold uppercase ${selectedPayment === "Card" ? "border-brand bg-gray-900 text-brand" : "border-gray-700"}`}>Card Online</div>
                 <div onClick={() => setSelectedPayment("Transfer")} className={`p-4 border-2 cursor-pointer text-center font-bold uppercase ${selectedPayment === "Transfer" ? "border-brand bg-gray-900 text-brand" : "border-gray-700"}`}>Bank Transfer</div>
              </div>

              {selectedPayment === "Card" && (
                <div className="space-y-3 bg-gray-900 p-4 border border-gray-700">
                    {savedCards.map(card => (
                        <div key={card.id} onClick={() => setSelectedCardId(card.id)} className={`flex items-center gap-3 p-3 cursor-pointer border ${selectedCardId === card.id ? "border-brand text-brand" : "border-gray-700"}`}>
                            <span>💳</span> <span className="font-bold">**** {card.last_4}</span> <span className="text-xs text-secondary">{card.expiry}</span>
                        </div>
                    ))}
                    <div onClick={() => setSelectedCardId(null)} className={`flex items-center gap-3 p-3 cursor-pointer border ${selectedCardId === null ? "border-brand text-brand" : "border-gray-700"}`}>
                        <span>➕</span> <span>USE NEW CARD</span>
                    </div>
                    {selectedCardId === null && (
                        <div className="mt-4 space-y-3">
                             <input type="text" placeholder="CARD NUMBER" className="w-full p-3 bg-black border border-gray-700 outline-none" value={newCardNumber} onChange={(e) => setNewCardNumber(formatCardNumber(e.target.value))} maxLength={19} />
                             <div className="flex gap-3">
                                <input type="text" placeholder="MM/YY" className="w-1/2 p-3 bg-black border border-gray-700 outline-none" value={newCardExpiry} onChange={(e) => setNewCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                                <input type="text" placeholder="CVC" className="w-1/2 p-3 bg-black border border-gray-700 outline-none" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))} maxLength={3} />
                             </div>
                        </div>
                    )}
                </div>
              )}
            </section>

            {error && <div className="text-red-500 border border-red-500 p-3 bg-red-900/20">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-brand text-black py-4 font-bold text-xl uppercase hover:bg-white transition-all border-2 border-brand">
              {isLoading ? "PROCESSING..." : `CONFIRM ORDER (${getTotalPrice()} CR)`}
            </button>
          </form> 
        </div>

        <div className="h-fit sticky top-24">
            <div className="bg-surface p-6 border-2 border-gray-800">
                <h2 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider">Cart Manifest</h2>
                <div className="space-y-4 mb-6 font-mono text-sm">
                    {items.map((item) => (
                    <div key={item.id} className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-secondary">{item.quantity}x {item.name}</span>
                        <span className="text-primary font-bold">{item.price * item.quantity}</span>
                    </div>
                    ))}
                </div>
                <div className="pt-4 border-t-2 border-gray-800 text-lg flex justify-between items-center font-bold uppercase">
                    <span>Total</span>
                    <span className="text-brand text-2xl">{getTotalPrice()} CR</span>
                </div>
          </div>
        </div>
      </div>
      <SaveCardModal isOpen={showSaveModal} onClose={finalizeOrder} onSave={handleSaveCard} last4={newCardNumber.slice(-4) || "1234"} />
    </main>
  );
}