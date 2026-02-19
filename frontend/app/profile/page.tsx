"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

interface OrderItem { product: number; product_name: string; quantity: number; price: number; }
interface Order { id: number; created_at: string; total_amount: number; paid: boolean; items: OrderItem[]; shipping_method: string; payment_method: string; }

export default function ProfilePage() {
  const { token, isAuthenticated, logout } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { setIsHydrated(true); }, []);
  useEffect(() => { if (isHydrated && !isAuthenticated) router.push("/login"); }, [isAuthenticated, router, isHydrated]);

  useEffect(() => {
    if (isHydrated && isAuthenticated && token) {
      fetch("http://127.0.0.1:8000/api/my-orders/", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setOrders([]); setLoading(false); });
    }
  }, [token, isHydrated, isAuthenticated]);

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b-2 border-gray-800 pb-4">
          <h1 className="text-4xl font-bold text-primary uppercase tracking-widest">User <span className="text-brand">Data_Log</span></h1>
          <button onClick={() => { logout(); clearCart(); router.push("/"); }} className="text-red-500 border border-red-500 px-4 py-1 text-sm font-mono hover:bg-red-500 hover:text-black transition-colors uppercase">
            [ TERMINATE SESSION ]
          </button>
        </div>

        <h2 className="text-xl font-mono text-secondary mb-6 uppercase">// TRANSACTION HISTORY</h2>

        {loading ? (
          <p className="text-brand animate-pulse font-mono">LOADING DATA...</p>
        ) : orders.length === 0 ? (
          <div className="bg-surface border border-gray-800 p-8 text-center font-mono text-secondary">NO TRANSACTIONS FOUND.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <div key={order.id} className="bg-surface border-2 border-gray-800 p-6 hover:border-brand transition-colors">
                  <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4 font-mono">
                    <div>
                      <span className="text-xs text-secondary block">ORDER_ID: #{order.id}</span>
                      <p className="text-primary">{new Date(order.created_at).toLocaleDateString("cs-CZ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand">{order.total_amount} <span className="text-sm">Kč</span></p>
                      <span className={`text-xs px-2 py-0.5 ${order.paid ? "bg-neon-green text-black" : "bg-yellow-500 text-black"}`}>
                        {order.paid ? "PAID" : "PENDING"}
                      </span>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer font-mono text-brand hover:text-white flex justify-between items-center text-sm uppercase">
                      <span>[ {totalItems} UNITS DETECTED ] - EXPAND VIEW</span>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-4 space-y-2 border-t border-gray-800 pt-2 text-sm font-mono text-secondary">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span>{item.price} Kč/unit</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}