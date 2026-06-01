"use client";
 
import React, { useEffect, useState } from "react";
import ProductCard, { ProductProps } from "@/components/ProductCard";
import { Filter, SlidersHorizontal, Search, X } from "lucide-react";
import { API_BASE } from "@/config";
 
export default function ShopPage() {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter variables
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest");
 
  // Dynamic fetch catalog
  useEffect(() => {
    let url = `${API_BASE}/api/products?`;
    if (selectedCategory) url += `category_slug=${selectedCategory}&`;
    if (selectedSize) url += `size=${selectedSize}&`;
    if (selectedColor) url += `color=${selectedColor}&`;
    if (search) url += `q=${search}&`;
    url += `sort=${sortOption}`;
 
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        // Fallback robust mockup catalog
        const mocks = [
          {
            id: "1",
            title: "KD's Signature Blank Heavy Tee",
            description: "Premium 240GSM organic cotton boxy blank. Specially tailored with dropshoulder seams, ready for live custom graphics placement in the designer.",
            base_price: 699,
            category_id: "oversized-streetwear",
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Carbon Black","hex":"#0a0a0c"},{"name":"Off White","hex":"#f4f4f7"}]',
            images: '["/images/products/blank_tee_black.png","/images/products/blank_tee_white.png"]',
            inventory: 100,
            ratings: 4.9,
            is_customizable: true
          },
          {
            id: "2",
            title: "Neon Overdrive Oversized Graphic Tee",
            description: "Featuring high-contrast retro halftone cyberpunk canvas graphics. Screen printed in bright Tokyo-neon shades on dense charcoal knit cotton.",
            base_price: 999,
            category_id: "vintage-graphics",
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Charcoal Grey","hex":"#2e2e2e"}]',
            images: '["/images/products/neon_tee.png"]',
            inventory: 50,
            ratings: 4.8,
            is_customizable: false
          },
          {
            id: "3",
            title: "Sacred Lotus Minimalist T-Shirt",
            description: "A beautiful, ultra-fine white thread flat embroidery design centered on the chest. Designed for premium daily wear and absolute aesthetic balance.",
            base_price: 899,
            category_id: "minimalist-collection",
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Off White","hex":"#f4f4f7"}]',
            images: '["/images/products/lotus_tee.png"]',
            inventory: 30,
            ratings: 4.7,
            is_customizable: false
          },
          {
            id: "4",
            title: "Cyber-Lotus Vaporwave Heavy Tee",
            description: "Limited dropshoulder streetwear edition blending retro vaporwave color aesthetics with fine sacred lotus patterns.",
            base_price: 1199,
            category_id: "vintage-graphics",
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Charcoal Grey","hex":"#2e2e2e"}]',
            images: '["/images/products/neon_tee.png"]',
            inventory: 25,
            ratings: 4.9,
            is_customizable: false
          },
          {
            id: "5",
            title: "Tokyo Halftone Boxy Vintage Tee",
            description: "Heavyweight drop-shoulder garment dyed fit. Halftone printing gives a beautifully worn-in retro Tokyo streetwear graphic visual.",
            base_price: 1099,
            category_id: "vintage-graphics",
            sizes: '["M","L","XL"]',
            colors: '[{"name":"Carbon Black","hex":"#0a0a0c"}]',
            images: '["/images/products/neon_tee.png"]',
            inventory: 40,
            ratings: 4.9,
            is_customizable: false
          },
          {
            id: "6",
            title: "Alabaster Minimal Signature Tee",
            description: "Our signature Off White 240GSM cotton blank adorned with subtle KD's Wear brand labels embroidered neatly near the lower hem.",
            base_price: 799,
            category_id: "minimalist-collection",
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Off White","hex":"#f4f4f7"}]',
            images: '["/images/products/blank_tee_white.png"]',
            inventory: 60,
            ratings: 4.8,
            is_customizable: false
          }
        ];
        
        // Simulating filters locally inside the luxury sandbox
        let filtered = [...mocks];
        if (selectedCategory) filtered = filtered.filter(x => x.category_id === selectedCategory);
        if (search) filtered = filtered.filter(x => x.title.toLowerCase().includes(search.toLowerCase()));
        
        if (sortOption === "price_asc") filtered.sort((a,b) => a.base_price - b.base_price);
        if (sortOption === "price_desc") filtered.sort((a,b) => b.base_price - a.base_price);
        if (sortOption === "rating") filtered.sort((a,b) => b.ratings - a.ratings);
        
        setProducts(filtered);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSize, selectedColor, search, sortOption]);
 
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. FILTER SIDEBAR (Desktop) */}
        <div className="hidden lg:flex flex-col space-y-8">
          <div className="border border-zinc-200 bg-white p-6 rounded-none space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center space-x-2 pb-3 border-b border-zinc-200 font-serif">
              <Filter className="w-4 h-4 text-[#7a1c27]" />
              <span>Filters</span>
            </h3>
 
            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Search Catalog</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Vintage, Minimal..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
              </div>
            </div>
 
            {/* Categories */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Collection Category</label>
              <div className="flex flex-col space-y-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left hover:text-[#7a1c27] transition-colors ${!selectedCategory ? "text-[#7a1c27] font-black" : ""}`}
                >
                  All Categories
                </button>
                <button 
                  onClick={() => setSelectedCategory("oversized-streetwear")}
                  className={`text-left hover:text-[#7a1c27] transition-colors ${selectedCategory === "oversized-streetwear" ? "text-[#7a1c27] font-black" : ""}`}
                >
                  Oversized Streetwear
                </button>
                <button 
                  onClick={() => setSelectedCategory("minimalist-collection")}
                  className={`text-left hover:text-[#7a1c27] transition-colors ${selectedCategory === "minimalist-collection" ? "text-[#7a1c27] font-black" : ""}`}
                >
                  Minimalist Collection
                </button>
                <button 
                  onClick={() => setSelectedCategory("vintage-graphics")}
                  className={`text-left hover:text-[#7a1c27] transition-colors ${selectedCategory === "vintage-graphics" ? "text-[#7a1c27] font-black" : ""}`}
                >
                  Vintage Graphics
                </button>
              </div>
            </div>
 
            {/* Sizing list */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Size Selection</label>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-none ${selectedSize === sz ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "bg-white border-zinc-200 text-zinc-650 hover:border-zinc-350 hover:text-zinc-900"}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        {/* 2. PRODUCTS LISTINGS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar Sort and details */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">{products.length} Drops found</span>
            
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-600 px-3 py-2 rounded-none focus:outline-none focus:border-[#7a1c27]"
              >
                <option value="newest">Newest Drops</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
 
          {/* Product grid list */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-150 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-zinc-450 space-y-4 border border-zinc-200 bg-white">
              <p className="text-xs uppercase tracking-widest font-bold">No t-shirt drops found matching your selection.</p>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSize(null);
                  setSelectedColor(null);
                  setSearch("");
                }}
                className="text-[10px] uppercase tracking-widest font-black text-[#7a1c27] border-b-2 border-[#7a1c27] pb-0.5"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
 
      </div>
    </main>
  );
}
