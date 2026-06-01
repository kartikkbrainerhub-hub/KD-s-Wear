"use client";
 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard, { ProductProps } from "@/components/ProductCard";
import { Filter, SlidersHorizontal, Search, X, Sparkles, ArrowLeftRight, ShoppingBag, ShieldAlert, Heart } from "lucide-react";
import { API_BASE } from "@/config";
import { useCartStore } from "@/store/cartStore";
interface LookbookItem {
  id: string;
  preview_image_url: string;
  shirt_color: string;
  view?: string;
  created_at?: string;
  canvas_json?: string;
  title?: string;
}

const FILTER_COLORS = [
  { name: "Carbon Black", hex: "#0a0a0c" },
  { name: "Off White", hex: "#f4f4f7" },
  { name: "Ash Grey", hex: "#9e9e9e" },
  { name: "Charcoal Grey", hex: "#2e2e2e" },
  { name: "Slate Grey", hex: "#4b5563" },
  { name: "Crimson Red", hex: "#7a1c27" },
  { name: "Sage Green", hex: "#607267" },
  { name: "Sand Beige", hex: "#d6d3d1" },
];

const getShirtHex = (colorName: string) => {
  if (!colorName) return "#0a0a0c";
  const norm = colorName.toLowerCase();
  if (norm.includes("black")) return "#0a0a0c";
  if (norm.includes("white")) return "#f4f4f7";
  if (norm.includes("grey") || norm.includes("gray")) return "#9e9e9e";
  if (norm.includes("red") || norm.includes("crimson")) return "#7a1c27";
  if (norm.includes("green") || norm.includes("sage")) return "#607267";
  if (norm.includes("beige") || norm.includes("sand")) return "#d6d3d1";
  return "#0a0a0c";
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
  
  // Base raw items state
  const [rawProducts, setRawProducts] = useState<ProductProps[]>([]);
  const [rawFeedItems, setRawFeedItems] = useState<LookbookItem[]>([]);
  
  // Filtered items state displayed on screen
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [feedItems, setFeedItems] = useState<LookbookItem[]>([]);
  
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Success state for inline cart actions
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Filter criteria states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortOption, setSortOption] = useState("newest");
 
  // 1. Fetch raw products once
  useEffect(() => {
    let url = `${API_BASE}/api/products?`;
    setLoadingProducts(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRawProducts(data);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        // High-fidelity fallback catalog
        const mocks = [
          {
            id: "1",
            title: "KD's Signature Blank Heavy Tee",
            description: "Premium 245GSM organic cotton boxy blank. Specially tailored with dropshoulder seams, ready for live custom graphics placement in the designer.",
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
            description: "Our signature Off White 245GSM cotton blank adorned with subtle KD's Wear brand labels embroidered neatly near the lower hem.",
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
        setRawProducts(mocks);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // 2. Fetch raw community lookbook feed
  useEffect(() => {
    setLoadingFeed(true);
    fetch(`${API_BASE}/api/designs/feed`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setRawFeedItems(data.filter((item: any) => item.preview_image_url));
      })
      .catch(() => {
        setRawFeedItems([]);
      })
      .finally(() => {
        setLoadingFeed(false);
      });
  }, []);

  // 3. MASTER FILTER ENGINE
  useEffect(() => {
    let filteredProds = [...rawProducts];

    if (selectedCategory) {
      filteredProds = filteredProds.filter(x => x.category_id === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      filteredProds = filteredProds.filter(x => 
        x.title.toLowerCase().includes(q) || 
        x.description.toLowerCase().includes(q)
      );
    }
    if (selectedSize) {
      filteredProds = filteredProds.filter(x => {
        try {
          const parsed = JSON.parse(x.sizes);
          return Array.isArray(parsed) && parsed.includes(selectedSize);
        } catch {
          return true;
        }
      });
    }
    if (selectedColor) {
      filteredProds = filteredProds.filter(x => {
        try {
          const parsed = JSON.parse(x.colors);
          return Array.isArray(parsed) && parsed.some((c: any) => c.name.toLowerCase().includes(selectedColor.toLowerCase()));
        } catch {
          return true;
        }
      });
    }
    filteredProds = filteredProds.filter(x => x.base_price <= maxPrice);

    if (sortOption === "price_asc") filteredProds.sort((a,b) => a.base_price - b.base_price);
    if (sortOption === "price_desc") filteredProds.sort((a,b) => b.base_price - a.base_price);
    if (sortOption === "rating") filteredProds.sort((a,b) => b.ratings - a.ratings);

    setProducts(filteredProds);

    const communitySeeds = [
      {
        id: "preset-shibuya-drift",
        title: "Drop #1084: Shibuya Drift",
        shirt_color: "Crimson Red",
        preview_image_url: "/images/products/blank_tee_black.png",
        canvas_json: '{"text":"NEON TOKYO"}'
      },
      {
        id: "preset-system-override",
        title: "Drop #3290: Cyber Override",
        shirt_color: "Slate Grey",
        preview_image_url: "/images/products/blank_tee_white.png",
        canvas_json: '{"text":"SYSTEM FAIL"}'
      },
      {
        id: "preset-vintage-rebel",
        title: "Drop #7712: Vintage Rebel",
        shirt_color: "Carbon Black",
        preview_image_url: "/images/products/blank_tee_black.png",
        canvas_json: '{"text":"REBEL STREETS"}'
      },
      {
        id: "preset-minimalist-cyber",
        title: "Drop #9024: Void Division",
        shirt_color: "Sand Beige",
        preview_image_url: "/images/products/blank_tee_white.png",
        canvas_json: '{"text":"VOID DIVISION"}'
      }
    ];

    const baseFeed = rawFeedItems.length > 0 ? rawFeedItems : communitySeeds;
    let filteredFeed = [...baseFeed];

    if (search) {
      const q = search.toLowerCase();
      filteredFeed = filteredFeed.filter(x => 
        (x.shirt_color && x.shirt_color.toLowerCase().includes(q)) ||
        (x.title && x.title.toLowerCase().includes(q))
      );
    }

    if (selectedColor) {
      filteredFeed = filteredFeed.filter(x => 
        x.shirt_color && x.shirt_color.toLowerCase().includes(selectedColor.toLowerCase())
      );
    }
    
    filteredFeed = filteredFeed.filter(x => {
      const itemPrice = x.id.startsWith("preset-") ? 1800 : 899;
      return itemPrice <= maxPrice;
    });

    setFeedItems(filteredFeed);

  }, [rawProducts, rawFeedItems, search, selectedCategory, selectedSize, selectedColor, maxPrice, sortOption]);

  const handleAddToCart = (drop: any) => {
    setCartStatus(drop.id);
    const dropHex = drop.hex || "#0a0a0c";
    addToCart({
      product_id: "custom-tshirt-canvas",
      title: `Community Drop: ${drop.textLabel || "Custom Designer"} Tee`,
      image: dropHex === "#f4f4f7" ? "/images/products/blank_tee_white.png" : "/images/products/blank_tee_black.png",
      custom_design_id: drop.id.startsWith("preset-") ? `custom_preset_${Date.now()}` : drop.id,
      canvas_preview: drop.preview_image_url,
      quantity: 1,
      size: "M",
      color: dropHex,
      price: drop.price || 899.00
    });

    setTimeout(() => {
      setCartStatus(null);
    }, 1000);
  };

  const handleRemix = (drop: any) => {
    if (drop.id.startsWith("preset-")) {
      router.push(`/customize?seed_text=${encodeURIComponent(drop.textLabel)}&seed_color=${encodeURIComponent(drop.hex)}&seed_family=Impact`);
    } else {
      router.push(`/customize?design_id=${drop.id}`);
    }
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(x => x !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setMaxPrice(2000);
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. FILTER SIDEBAR */}
        <div className="flex flex-col space-y-6">
          <div className="border border-zinc-200 bg-white p-6 rounded-none space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center space-x-2 font-serif">
                <Filter className="w-4 h-4 text-[#7a1c27]" />
                <span>Filters</span>
              </h3>
              {(search || selectedCategory || selectedSize || selectedColor || maxPrice < 2000) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[9px] font-black uppercase tracking-wider text-[#7a1c27] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
 
            {/* Filter 1: Search */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Search Store</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Vintage, heavy, black..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Filter 2: Price Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-black text-zinc-450 tracking-wider">
                <span>Max Budget</span>
                <span className="text-zinc-800 font-extrabold font-mono">₹{maxPrice}</span>
              </div>
              <input 
                type="range"
                min="500"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-200 appearance-none cursor-pointer accent-[#7a1c27]"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 uppercase">
                <span>₹500</span>
                <span>₹2000</span>
              </div>
            </div>

            {/* Filter 3: Category Selectors */}
            {activeTab === "official" && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Collection Category</label>
                <div className="flex flex-col space-y-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`text-left hover:text-[#7a1c27] transition-colors ${!selectedCategory ? "text-[#7a1c27] font-black" : ""}`}
                  >
                    All Collections
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

            {/* Filter 4: Fabric shade swatches */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Fabric shade</label>
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {FILTER_COLORS.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button 
                      key={color.name}
                      onClick={() => setSelectedColor(isSelected ? null : color.name)}
                      className={`w-7 h-7 rounded-full border relative flex items-center justify-center transition-all ${isSelected ? "border-[#7a1c27] scale-110 shadow-md ring-2 ring-[#7a1c27]/20" : "border-zinc-300 hover:border-zinc-500 hover:scale-105"}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
 
            {/* Filter 5: Sizes */}
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
          
          {/* DUAL TAB SWITCHER */}
          <div className="flex border-b border-zinc-200 bg-white">
            <button
              onClick={() => {
                setActiveTab("official");
                setSelectedCategory(null);
              }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center ${activeTab === "official" ? "border-[#7a1c27] text-[#7a1c27]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
            >
              🛍️ Official releases
            </button>
            <button
              onClick={() => {
                setActiveTab("community");
                setSelectedCategory(null);
              }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center flex items-center justify-center space-x-2 ${activeTab === "community" ? "border-[#7a1c27] text-[#7a1c27]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>👥 Community creations drops</span>
            </button>
          </div>

          {/* Subheader info block */}
          <div className="bg-white border border-zinc-200/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                {activeTab === "official" 
                  ? "Explore the official seasonal custom drops and signature templates designed by KD's Wear."
                  : "Unique high-streetwear designs created and fully checked out by real customers. Hover image to buy or remix!"}
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
     
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-zinc-150 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-24 text-center text-zinc-450 space-y-4 border border-zinc-200 bg-white">
                  <p className="text-xs uppercase tracking-widest font-bold">No t-shirt drops found matching your filters.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] uppercase tracking-widest font-black text-[#7a1c27] border-b-2 border-[#7a1c27] pb-0.5"
                  >
                    Reset Active Filters
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
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">{feedItems.length} Community creations found</span>
              </div>

              {loadingFeed ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-8 h-8 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7a1c27]">Syncing Live Custom Drops...</p>
                </div>
              ) : feedItems.length === 0 ? (
                <div className="py-24 text-center text-zinc-450 space-y-4 border border-zinc-200 bg-white">
                  <p className="text-xs uppercase tracking-widest font-bold">No community custom creations fit your selected filters.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] uppercase tracking-widest font-black text-[#7a1c27] border-b-2 border-[#7a1c27] pb-0.5"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {feedItems.map((item, index) => {
                    const dropTitle = item.id.startsWith("preset-") ? item.title : `Drop #${1400 + index}: Staged Drop`;
                    const citySeed = item.id.startsWith("preset-") 
                      ? (SEED_LOOKBOOK_DROPS.find(s => s.id === item.id)?.stageCity || "Paris Studio")
                      : ["New Delhi Staging", "Tokyo Studio", "Berlin Under", "London Core", "Paris Docks", "New York Warehouse"][index % 6];
                    
                    const isPreset = item.id.startsWith("preset-");
                    const presetItem = SEED_LOOKBOOK_DROPS.find(s => s.id === item.id);
                    
                    const designHex = isPreset && presetItem ? presetItem.hex : getShirtHex(item.shirt_color);
                    const itemPrice = isPreset ? 1800 : 899;
                    const textLabel = isPreset && presetItem ? presetItem.textLabel : "CUSTOM STREET TEE";

                    const dropObject = {
                      id: item.id,
                      title: dropTitle,
                      colorName: item.shirt_color || "Custom Shade",
                      hex: designHex,
                      preview_image_url: item.preview_image_url,
                      textLabel: textLabel,
                      stageCity: citySeed,
                      price: itemPrice,
                      canvas_json: item.canvas_json || ""
                    };

                    const isCartSuccess = cartStatus === item.id;
                    const isLiked = wishlist.includes(item.id);

                    return (
                      <div key={item.id} className="group block">
                        <div className="overflow-hidden flex flex-col h-full bg-white/40 border border-zinc-100 hover:border-zinc-200 transition-all p-3 rounded-none shadow-sm">
                          
                          {/* Card Media Preview (Structured exactly like ProductCard) */}
                          <div className="relative aspect-[1/1] bg-[#f5f2eb] overflow-hidden flex items-center justify-center">
                            
                            {/* Color fill layer matching fabric shade */}
                            <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: designHex }} />
                            
                            {/* Vintage garment outline lines overlay */}
                            <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                              <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.3" />
                              <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.3" />
                            </svg>

                            {isPreset && presetItem ? (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 p-6">
                                <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] rotate-[-12deg]" style={{ fontFamily: "Impact" }}>
                                  {presetItem.textLabel}
                                </span>
                              </div>
                            ) : (
                              <img 
                                src={item.preview_image_url} 
                                alt={dropTitle} 
                                className="w-[130px] h-[160px] object-contain relative z-10 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                              />
                            )}

                            {/* Floating Badges */}
                            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col space-y-2">
                              <span className="text-[8px] font-black uppercase text-[#7a1c27] bg-[#f5f2eb] border border-[#7a1c27]/20 px-2 py-0.5 tracking-widest flex items-center space-x-1 shadow-sm font-sans">
                                <span>{isPreset ? "Preset" : "Community"}</span>
                              </span>
                            </div>

                            {/* DYNAMIC HOVER BUTTONS PANEL (Matches ProductCard style exactly!) */}
                            <div className="absolute inset-0 bg-[#7a1c27]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-20">
                              {/* Crimson Square Box: Add to Cart */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(dropObject);
                                }}
                                className={`p-3 text-white rounded-none shadow-lg transition-all hover:scale-105 flex items-center justify-center ${isCartSuccess ? "bg-green-600" : "bg-[#7a1c27] hover:bg-[#8e2430]"}`}
                                title="Add to Bag"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>

                              {/* White Square Box: Remix */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemix(dropObject);
                                }}
                                className="p-3 bg-white hover:bg-zinc-50 text-zinc-950 rounded-none shadow-lg transition-transform hover:scale-105 flex items-center justify-center border border-zinc-200"
                                title="Remix T-Shirt"
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>

                              {/* White Square Box: Wishlist Toggle */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(item.id);
                                }}
                                className={`p-3 rounded-none shadow-lg transition-transform hover:scale-105 flex items-center justify-center border ${isLiked ? "bg-[#7a1c27] text-white border-[#7a1c27]" : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"}`}
                                title="Add to Wishlist"
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-white" : ""}`} />
                              </button>
                            </div>
                          </div>

                          {/* Card Info Footer */}
                          <div className="pt-4 pb-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="text-xs uppercase font-extrabold text-zinc-900 tracking-wider font-display truncate group-hover:text-[#7a1c27] transition-colors">
                                {dropTitle}
                              </h3>
                              <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
                                Co-designed in {citySeed} on {dropObject.colorName} fabric.
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-100/60 mt-3">
                              <span className="text-xs font-black text-[#7a1c27] tracking-wider font-sans">
                                RS. {itemPrice}.00
                              </span>
                              <span className="text-[10px] text-zinc-400 font-bold tracking-widest font-sans">
                                ★ 4.9
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
 
      </div>
    </main>
  );
}
