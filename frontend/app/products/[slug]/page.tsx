import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  slug: string;
  image: string | null;
  is_available: boolean;
  stock: number;
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`http://backend:8000/api/products/${slug}/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product: Product | null = await getProduct(slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-background text-primary p-8 flex justify-center items-center font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LEVÁ ČÁST - Obrázek (Scan window) */}
        <div className="relative">
             {/* Ozdobné rohy */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand z-10"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand z-10"></div>

            <div className="bg-surface border-2 border-gray-800 h-[500px] flex items-center justify-center p-8 relative overflow-hidden group">
                {/* Mřížka na pozadí */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                {product.image ? (
                <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
                ) : (
                <div className="text-gray-600 font-mono">[ NO VISUAL DATA ]</div>
                )}
            </div>
        </div>

        {/* PRAVÁ ČÁST - Data */}
        <div className="flex flex-col justify-center">
            {/* Navigace */}
            <div className="mb-6">
                <Link href="/" className="text-secondary hover:text-brand font-mono text-sm uppercase tracking-widest transition-colors">
                    &lt; BACK_TO_ROOT
                </Link>
            </div>

            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-6">
                <div className="flex justify-between items-start">
                    <span className="bg-gray-800 text-secondary px-2 py-0.5 text-xs font-mono mb-2 inline-block">
                        CAT_ID: {product.category === 'pc' ? 'SYSTEM' : 'COMPONENT'}
                    </span>
                    <span className="text-brand font-mono text-xs">ID_{product.id}</span>
                </div>
                
                <h1 className="text-5xl font-bold text-primary mb-4 uppercase tracking-tighter">
                    {product.name}
                </h1>
                
                {/* Skladová dostupnost */}
                <div className="font-mono text-sm">
                    {product.is_available && product.stock > 0 ? (
                        <span className="text-neon-green flex items-center gap-2">
                            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                            STATUS: ONLINE ({product.stock} UNITS)
                        </span>
                    ) : (
                        <span className="text-brand flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand rounded-full"></span>
                            STATUS: OFFLINE (OUT OF STOCK)
                        </span>
                    )}
                </div>
            </div>
            
            {/* Popis */}
            <p className="text-secondary text-lg mb-8 leading-relaxed font-mono border-l-2 border-gray-800 pl-4">
                {product.description || "NO_DATA_AVAILABLE."}
            </p>

            {/* Cena a Akce */}
            <div className="bg-surface border-2 border-gray-800 p-6">
              <div className="flex items-end justify-between mb-6">
                  <span className="text-secondary font-mono text-sm uppercase">Cost per unit</span>
                  <span className="text-4xl font-bold text-primary tracking-tighter">
                    {product.price.toLocaleString("cs-CZ")} <span className="text-lg text-brand">Kč</span>
                  </span>
              </div>
              
              {/* Tlačítko - musíme mu předat retro styl přes komponentu nebo globálně, 
                  ale AddToCartButton je Client Component, upravíme ho níže. */}
              <div className="w-full">
                   <AddToCartButton product={product} />
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}