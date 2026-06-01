"use client";
 
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard, { ProductProps } from "@/components/ProductCard";
import { Filter, SlidersHorizontal, Search, X, Sparkles, ArrowLeftRight, ShoppingBag, Eye, ShieldAlert } from "lucide-react";
import { API_BASE } from "@/config";
import { useCartStore } from "@/store/cartStore";

interface LookbookItem {
  id: string;
  preview_image_url: string;
  shirt_color: string;
  view: string;
  created_at?: string;
  canvas_json?: string;
}

const SHIRT_COLORS = [
  { name: "Carbon Black", hex: "#0a0a0c" },
  { name: "Off White", hex: "#f4f4f7" },
  { name: "Ash Grey", hex: "#9e9e9e" },
  { name: "Stone", hex: "#6b6b6b" },
  { name: "Chalk", hex: "#e8e3dc" },
  { name: "Midnight Navy", hex: "#0a192f" },
  { name: "Tokyo Violet", hex: "#2b1055" },
  { name: "Crimson Red", hex: "#781e28" },
  { name: "Forest Hunter", hex: "#1a2e1a" },
  { name: "Espresso", hex: "#2c1a0e" },
  { name: "Desert Sand", hex: "#d7ccc8" },
  { name: "Sage Green", hex: "#607267" },
  { name: "Terra Cotta", hex: "#c1694f" },
  { name: "Warm Khaki", hex: "#c8b87a" },
  { name: "Rust Brown", hex: "#8b4513" },
  { name: "Peach Sunset", hex: "#ffab91" },
  { name: "Sky Blue", hex: "#90caf9" },
  { name: "Mint Fresh", hex: "#a5d6a7" },
  { name: "Lavender", hex: "#ce93d8" },
  { name: "Butter Yellow", hex: "#fff59d" },
];

const getShirtHex = (name: string) => {
  if (!name) return "#f4f4f7";
  const match = SHIRT_COLORS.find(c => c.name.toLowerCase() === name.toLowerCase());
  return match ? match.hex : (name.startsWith("#") ? name : "#f4f4f7");
};

// Seed showcase fallback drops for community custom designs
const SEED_LOOKBOOK_DROPS = [
  {
    id: "preset-shibuya-drift",
    title: "Drop #1084: Shibuya Drift",
    colorName: "Crimson Red",
    hex: "#7a1c27",
    preview_image_url: "/images/products/blank_tee_black.png",
    textLabel: "NEON TOKYO",
    stageCity: "Tokyo Studio",
    price: 1800,
    canvas_json: '{"version":"5.3.0","objects":[{"type":"i-text","version":"5.3.0","originX":"center","originY":"center","left":160,"top":200,"width":240,"height":40,"fill":"#ffffff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1.2,"scaleY":1.2,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Impact","fontWeight":"bold","fontSize":28,"text":"NEON TOKYO","underline":false,"overline":false,"linethrough":false,"textAlign":"center","fontStyle":"normal","lineHeight":1.16,"charSpacing":0}]}'
  },
  {
    id: "preset-system-override",
    title: "Drop #3290: Cyber Override",
    colorName: "Slate Grey",
    hex: "#4b5563",
    preview_image_url: "/images/products/blank_tee_white.png",
    textLabel: "SYSTEM FAIL",
    stageCity: "Berlin Under",
    price: 1800,
    canvas_json: '{"version":"5.3.0","objects":[{"type":"i-text","version":"5.3.0","originX":"center","originY":"center","left":160,"top":180,"width":250,"height":36,"fill":"#ef4444","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":0.9,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Courier New","fontWeight":"bold","fontSize":32,"text":"SYSTEM FAIL","underline":false,"overline":false,"linethrough":false,"textAlign":"center","fontStyle":"normal","lineHeight":1.16,"charSpacing":0}]}'
  },
  {
    id: "preset-vintage-rebel",
    title: "Drop #7712: Vintage Rebel",
    colorName: "Pitch Black",
    hex: "#18181b",
    preview_image_url: "/images/products/blank_tee_black.png",
    textLabel: "REBEL STREETS",
    stageCity: "New Delhi Staging",
    price: 1800,
    canvas_json: '{"version":"5.3.0","objects":[{"type":"i-text","version":"5.3.0","originX":"center","originY":"center","left":160,"top":210,"width":200,"height":32,"fill":"#eab308","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1.3,"scaleY":1.3,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Georgia","fontWeight":"normal","fontSize":26,"text":"REBEL STREETS","underline":false,"overline":false,"linethrough":false,"textAlign":"center","fontStyle":"italic","lineHeight":1.16,"charSpacing":0}]}'
  },
  {
    id: "preset-minimalist-cyber",
    title: "Drop #9024: Void Division",
    colorName: "Sand Beige",
    hex: "#d6d3d1",
    preview_image_url: "/images/products/blank_tee_white.png",
    textLabel: "VOID DIVISION",
    stageCity: "London Core",
    price: 1800,
    canvas_json: '{"version":"5.3.0","objects":[{"type":"i-text","version":"5.3.0","originX":"center","originY":"center","left":160,"top":190,"width":260,"height":38,"fill":"#1f1f23","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1.1,"scaleY":1.1,"angle":0,"flipX":false,"flipY":false,"opacity":0.95,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Impact","fontWeight":"normal","fontSize":30,"text":"VOID DIVISION","underline":false,"overline":false,"linethrough":false,"textAlign":"center","fontStyle":"normal","lineHeight":1.16,"charSpacing":0}]}'
  }
];

export default function ShopPage() {
  const router = useRouter();
  const { addToCart } = useCartStore();

  // Tab switching state: "official" or "community"
  const [activeTab, setActiveTab] = useState<"official" | "community">("official");
  
  // Official Products State
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Community Creations State
  const [feedItems, setFeedItems] = useState<LookbookItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  
  // Filter variables
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest");
 
  // Dynamic fetch official catalog
  useEffect(() => {
    let url = `${API_BASE}/api/products?`;
    if (selectedCategory) url += `category_slug=${selectedCategory}&`;
    if (selectedSize) url += `size=${selectedSize}&`;
    if (selectedColor) url += `color=${selectedColor}&`;
    if (search) url += `q=${search}&`;
    url += `sort=${sortOption}`;
 
    setLoadingProducts(true);
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
      .finally(() => setLoadingProducts(false));
  }, [selectedCategory, selectedSize, selectedColor, search, sortOption]);

  // Fetch lookbook community designs feed
  useEffect(() => {
    setLoadingFeed(true);
    fetch(`${API_BASE}/api/designs/feed`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setFeedItems(data.filter((item: any) => item.preview_image_url));
      })
      .catch(() => {
        setFeedItems([]);
      })
      .finally(() => {
        setLoadingFeed(false);
      });
  }, []);

  const handleInstantBuy = (drop: any) => {
    setPurchaseStatus(drop.id);
    addToCart({
      product_id: "custom-tshirt-canvas",
      title: `Community Drop: ${drop.textLabel || "Custom Designer"} Tee`,
      image: drop.hex === "#f4f4f7" ? "/images/products/blank_tee_white.png" : "/images/products/blank_tee_black.png",
      custom_design_id: drop.id.startsWith("preset-") ? `custom_preset_${Date.now()}` : drop.id,
      canvas_preview: drop.preview_image_url,
      quantity: 1,
      size: "M",
      color: drop.hex,
      price: 899.00
    });

    setTimeout(() => {
      setPurchaseStatus(null);
      router.push("/checkout");
    }, 800);
  };

  const handleRemix = (drop: any) => {
    if (drop.id.startsWith("preset-")) {
      router.push(`/customize?seed_text=${encodeURIComponent(drop.textLabel)}&seed_color=${encodeURIComponent(drop.hex)}&seed_family=Impact`);
    } else {
      router.push(`/customize?design_id=${drop.id}`);
    }
  };

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
                  placeholder="Search drops..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
              </div>
            </div>
 
            {/* Categories - Only active when searching official items */}
            {activeTab === "official" && (
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
            )}
 
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
 
        {/* 2. MAIN PRODUCTS & CREATIONS CONTAINER */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* HIGH-FASHION DUAL TAB SELECTOR */}
          <div className="flex border-b border-zinc-200">
            <button
              onClick={() => setActiveTab("official")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center ${activeTab === "official" ? "border-[#7a1c27] text-[#7a1c27]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
            >
              🛍️ Official Releases
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center flex items-center justify-center space-x-2 ${activeTab === "community" ? "border-[#7a1c27] text-[#7a1c27]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>👥 Community Custom Drops</span>
            </button>
          </div>

          {/* Subheader info block depending on active tab */}
          <div className="bg-white border border-zinc-200/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                {activeTab === "official" 
                  ? "Explore the official seasonal custom drops and signature templates designed by KD's Wear."
                  : "Unique high-streetwear designs created and fully checked out by real customers. Click to Buy or Remix!"}
              </p>
            </div>
            
            {activeTab === "community" && (
              <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-widest text-[#7a1c27] bg-[#7a1c27]/5 border border-[#7a1c27]/10 px-2.5 py-1">
                <span>🔒 Privacy Verified</span>
              </div>
            )}
          </div>

          {/* ================= ACTIVE TAB: OFFICIAL RELEASES ================= */}
          {activeTab === "official" && (
            <div className="space-y-6">
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
              {loadingProducts ? (
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
          )}

          {/* ================= ACTIVE TAB: COMMUNITY CUSTOM DROPS ================= */}
          {activeTab === "community" && (
            <div className="space-y-6">
              {loadingFeed ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-8 h-8 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7a1c27]">Syncing Live Custom Drops...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  
                  {/* Staged Custom Creations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Render live drops from confirmed orders */}
                    {feedItems.map((item, index) => {
                      const dropTitle = `Drop #${1400 + index}: Staged Drop`;
                      const citySeed = ["New Delhi Staging", "Tokyo Studio", "Berlin Under", "London Core", "Paris Docks", "New York Warehouse"][index % 6];
                      const designHex = getShirtHex(item.shirt_color);
                      
                      const dropObject = {
                        id: item.id,
                        title: dropTitle,
                        colorName: item.shirt_color || "Custom Shade",
                        hex: designHex,
                        preview_image_url: item.preview_image_url,
                        textLabel: "CUSTOM STREET TEE",
                        stageCity: citySeed,
                        price: 899,
                        canvas_json: item.canvas_json || ""
                      };

                      return (
                        <div key={item.id} className="group border border-zinc-200 bg-white flex flex-col transition-all hover:border-[#7a1c27] hover:shadow-lg">
                          <div 
                            className="aspect-[5/6] w-full relative flex items-center justify-center transition-colors duration-500 overflow-hidden"
                            style={{ backgroundColor: designHex }}
                          >
                            {/* SVG mockup lines */}
                            <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                              <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.6" opacity="0.8" />
                              <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.2" opacity="0.8" />
                            </svg>

                            <img 
                              src={item.preview_image_url} 
                              alt={dropTitle} 
                              className="w-[160px] h-[200px] object-contain relative z-10 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          <div className="p-4 flex-grow flex flex-col justify-between border-t border-zinc-150 space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#7a1c27]">{citySeed}</span>
                                <span className="text-[7px] font-mono text-zinc-400">#CUSTOM</span>
                              </div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">{dropTitle}</h4>
                              <p className="text-[9px] text-zinc-450 uppercase tracking-wider font-bold">
                                Fabric: <span className="text-zinc-650">{item.shirt_color || "Custom Shade"}</span>
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100">
                              <button 
                                onClick={() => handleInstantBuy(dropObject)}
                                disabled={purchaseStatus === item.id}
                                className="flex-1 bg-zinc-950 text-white py-2 text-[9px] font-black uppercase tracking-widest rounded-none hover:bg-[#7a1c27] transition-all flex items-center justify-center space-x-1.5"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>{purchaseStatus === item.id ? "Securing..." : "Buy Ready"}</span>
                              </button>
                              <button 
                                onClick={() => handleRemix(dropObject)}
                                className="px-3 bg-zinc-100 text-zinc-700 py-2 text-[9px] font-black uppercase tracking-widest rounded-none hover:bg-zinc-200 transition-all flex items-center justify-center space-x-1"
                                title="Remix Design inside Studio"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                                <span>Remix</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Clean seeder presets fallback if no live community drops yet */}
                    {SEED_LOOKBOOK_DROPS.map((drop) => {
                      return (
                        <div key={drop.id} className="group border border-zinc-200 bg-white flex flex-col transition-all hover:border-[#7a1c27] hover:shadow-lg">
                          <div 
                            className="aspect-[5/6] w-full relative flex items-center justify-center transition-colors duration-500 overflow-hidden"
                            style={{ backgroundColor: drop.hex }}
                          >
                            <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                              <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.6" opacity="0.8" />
                              <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.2" opacity="0.8" />
                            </svg>

                            {/* Render seeded lookbook text print overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 p-6">
                              <span className="text-white text-base md:text-lg font-black uppercase tracking-widest filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rotate-[-12deg]" style={{ fontFamily: "Impact" }}>
                                {drop.textLabel}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 flex-grow flex flex-col justify-between border-t border-zinc-150 space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#7a1c27]">{drop.stageCity}</span>
                                <span className="text-[7px] font-mono text-zinc-400">#PRESET</span>
                              </div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800">{drop.title}</h4>
                              <p className="text-[9px] text-zinc-450 uppercase tracking-wider font-bold">
                                Fabric: <span className="text-zinc-650">{drop.colorName}</span>
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100">
                              <button 
                                onClick={() => handleInstantBuy(drop)}
                                disabled={purchaseStatus === drop.id}
                                className="flex-1 bg-zinc-950 text-white py-2 text-[9px] font-black uppercase tracking-widest rounded-none hover:bg-[#7a1c27] transition-all flex items-center justify-center space-x-1.5"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>{purchaseStatus === drop.id ? "Securing..." : "Buy Ready"}</span>
                              </button>
                              <button 
                                onClick={() => handleRemix(drop)}
                                className="px-3 bg-zinc-100 text-zinc-700 py-2 text-[9px] font-black uppercase tracking-widest rounded-none hover:bg-zinc-200 transition-all flex items-center justify-center space-x-1"
                                title="Remix Design inside Studio"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                                <span>Remix</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
 
      </div>
    </main>
  );
}
