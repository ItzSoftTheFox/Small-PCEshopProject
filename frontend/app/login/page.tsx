"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("ACCESS DENIED: Invalid credentials.");

      login(data.access, username);
      router.push("/");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="bg-surface p-8 border-2 border-gray-800 w-full max-w-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-8 border-b border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-primary uppercase tracking-widest mb-2">System Login</h1>
            <p className="text-secondary font-mono text-xs">/// AUTHENTICATION REQUIRED ///</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 font-mono">
          <div>
            <label className="block text-sm text-brand mb-2 uppercase">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
              placeholder="ENTER_ID"
            />
          </div>

          <div>
            <label className="block text-sm text-brand mb-2 uppercase">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 text-sm text-center uppercase">
                ⚠ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand text-black py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all border-2 border-brand"
          >
            {isLoading ? "AUTHENTICATING..." : ":: EXECUTE LOGIN ::"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary font-mono">
          NO ACCESS ID?{" "}
          <Link href="/register" className="text-brand hover:underline uppercase">
            [ REGISTER NEW USER ]
          </Link>
        </p>
      </div>
    </main>
  );
}