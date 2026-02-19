import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore'; // <--- Importujeme Cart Store

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,

      login: (token, username) => {
        set({ token, username, isAuthenticated: true });
        
        // --- TADY JE TA MAGIE ---
        // Jakmile se přihlásí, okamžitě stáhneme jeho košík z databáze
        // Používáme setTimeout, aby se stihl uložit token
        setTimeout(() => {
            useCartStore.getState().fetchServerCart(); 
        }, 100);
      },

      logout: () => {
        set({ token: null, username: null, isAuthenticated: false });
        // Při odhlášení vymažeme lokální košík (aby ho neviděl někdo jiný)
        // Ale v databázi zůstane uložený!
        useCartStore.getState().clearCart();
      },
    }),
    { name: 'auth-storage' }
  )
);