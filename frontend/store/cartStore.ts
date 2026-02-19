import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

// 1. Přidáme 'stock' do definice položky
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
  stock: number; // <--- NOVÉ
}

interface CartState {
  items: CartItem[];
  shippingPrice: number;
  
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  setShippingPrice: (price: number) => void;
  getTotalPrice: () => number;
  fetchServerCart: () => Promise<void>; 
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingPrice: 0,

      addItem: async (newItem) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === newItem.id);

        // --- KONTROLA SKLADU ---
        const currentQty = existingItem ? existingItem.quantity : 0;
        
        // Pokud už máme v košíku tolik, kolik je na skladě, KONČÍME.
        if (currentQty >= newItem.stock) {
            alert(`Více kusů už není skladem! (Max: ${newItem.stock})`);
            return; // Funkce se zastaví, nic se nepřidá
        }
        // -----------------------

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });

        // Sync s Backendem (stejné jako předtím)
        const { token, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && token) {
            try {
                await fetch("http://127.0.0.1:8000/api/cart/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ product_id: newItem.id, quantity: 1 })
                });
            } catch (e) {
                console.error("Chyba při syncu košíku:", e);
            }
        }
      },

      // ... (removeItem, clearCart atd. zůstávají stejné) ...
      removeItem: async (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        const { token, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && token) {
             try {
                await fetch("http://127.0.0.1:8000/api/cart/", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ product_id: id })
                });
            } catch (e) { console.error(e); }
        }
      },

      clearCart: () => set({ items: [], shippingPrice: 0 }),
      setShippingPrice: (price) => set({ shippingPrice: price }),

      getTotalPrice: () => {
        const itemsPrice = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return itemsPrice + get().shippingPrice;
      },

      fetchServerCart: async () => {
        const { token, isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || !token) return;

        try {
            const res = await fetch("http://127.0.0.1:8000/api/cart/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const serverItems = data.items.map((serverItem: any) => ({
                    id: serverItem.product_id,
                    name: serverItem.name,
                    price: serverItem.price,
                    quantity: serverItem.quantity,
                    image: serverItem.image,
                    slug: serverItem.slug,
                    stock: serverItem.stock || 99 // Načteme stock ze serveru
                }));
                set({ items: serverItems });
            }
        } catch (e) {
            console.error("Nepodařilo se stáhnout košík:", e);
        }
      }
    }),
    { name: 'shopping-cart' }
  )
);