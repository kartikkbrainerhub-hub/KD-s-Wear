"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, ShoppingBag, Eye, ShieldAlert, Sparkles, Layers, Type } from "lucide-react";
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

// Ultra-premium seeded showcase fallback drops (KoraWear Presets)
const SEED_LOOKBOOK_DROPS = [
  {
    id: "preset-shibuya-drift",
    title: "Drop #1084: Shibuya Drift",
    colorName: "Crimson Red",
    hex: "#7a1c27",
    preview_image_url: "/images/products/blank_tee_black.png", // fallback placeholder
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

export default function LookbookPage() {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [feedItems, setFeedItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/designs/feed`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        // filter out designs that don't have preview images
        setFeedItems(data.filter((item: any) => item.preview_image_url));
      })
      .catch(() => {
        setFeedItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleInstantBuy = (drop: typeof SEED_LOOKBOOK_DROPS[0]) => {
    setPurchaseStatus(drop.id);
    // Add directly to bag
    addToCart({
      product_id: "custom-tshirt-canvas",
      title: `Curated Drop: ${drop.textLabel} Custom Tee`,
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

  const handleRemix = (drop: typeof SEED_LOOKBOOK_DROPS[0]) => {
    if (drop.id.startsWith("preset-")) {
      // Seed fallback - load with query parameters
      router.push(`/customize?seed_text=${encodeURIComponent(drop.textLabel)}&seed_color=${encodeURIComponent(drop.hex)}&seed_family=Impact`);
    } else {
      // Stored user custom design
      router.push(`/customize?design_id=${drop.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-24 pb-16 flex flex-col font-sans">
      <div className="max-w-7xl mx-auto px-6 w-full flex-grow">
        
        {/* Header Block */}
        <div className="border-b border-zinc-200 pb-8 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#7a1c27]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KD's Wear Community</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-zinc-900 font-serif">
              THE STREET LOOKBOOK
            </h1>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider max-w-xl">
              CURATED DESIGN DROPS CREATED BY STREETWEAR CONNOISSEURS AROUND THE GLOBE. INSTANTLY BUY ANY DROP AS A READY-MADE PIECE OR REMIX IT TO MAKE IT YOUR OWN.
            </p>
          </div>
          <div className="bg-[#7a1c27]/5 border border-[#7a1c27]/10 p-3 flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-[#7a1c27] flex-shrink-0" />
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-650 leading-relaxed">
              <span>Privacy Verified: No Customer Names or Private Order Details Revealed.</span>
            </div>
          </div>
        </div>

        {/* CURATED USER FEEDS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7a1c27]">Syncing Lookbook Staging Feed...</p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Live Drops Feed */}
            {feedItems.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-450 border-b border-dashed border-zinc-200 pb-2">
                  Live Custom Drops ({feedItems.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {feedItems.map((item, index) => {
                    const dropTitle = `Drop #${1400 + index}: Staged Drop`;
                    const citySeed = ["New Delhi Staging", "Tokyo Studio", "Berlin Under", "London Core", "Paris Docks", "New York Warehouse"][index % 6];
                    const designHex = getShirtHex(item.shirt_color);
                    const isPreset = false;

                    const dropObject = {
                      id: item.id,
                      title: dropTitle,
                      colorName: item.shirt_color || "Custom Shade",
                      hex: designHex,
                      preview_image_url: item.preview_image_url,
                      textLabel: "CUSTOM STREET DROP",
                      stageCity: citySeed,
                      price: 1800,
                      canvas_json: item.canvas_json || ""
                    };

                    return (
                      <div key={item.id} className="group border border-zinc-200 bg-white flex flex-col transition-all hover:border-[#7a1c27] hover:shadow-lg">
                        {/* Mockup Garment Container */}
                        <div 
                          className="aspect-[5/6] w-full relative flex items-center justify-center transition-colors duration-500 overflow-hidden"
                          style={{ backgroundColor: designHex }}
                        >
                          {/* Illustrated background mockup line details */}
                          <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                            <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.6" opacity="0.8" />
                            <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.2" opacity="0.8" />
                          </svg>

                          {/* Print Output Image rendering overlay */}
                          <img 
                            src={item.preview_image_url} 
                            alt={dropTitle} 
                            className="w-[180px] h-[225px] object-contain relative z-10 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Drop description & interaction dashboard */}
                        <div className="p-5 flex-grow flex flex-col justify-between border-t border-zinc-150 space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#7a1c27]">{citySeed}</span>
                              <span className="text-[8px] font-mono text-zinc-400">#CUSTOM</span>
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800">{dropTitle}</h4>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemix(dropObject)}
                              className="flex-1 py-2 border border-zinc-200 hover:border-[#7a1c27] text-zinc-700 hover:text-[#7a1c27] text-[8px] font-black uppercase tracking-widest transition-all bg-white"
                            >
                              Remix Drop
                            </button>
                            <button
                              onClick={() => handleInstantBuy(dropObject)}
                              disabled={purchaseStatus === item.id}
                              className="flex-1 py-2 bg-zinc-950 hover:bg-[#7a1c27] text-white text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-1"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{purchaseStatus === item.id ? "Adding..." : "Instant Buy"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Showcase fallback presets feed */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-450 border-b border-dashed border-zinc-200 pb-2">
                Featured Catalog Drops (KD's Wear Presets)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {SEED_LOOKBOOK_DROPS.map((drop) => (
                  <div key={drop.id} className="group border border-zinc-200 bg-white flex flex-col transition-all hover:border-[#7a1c27] hover:shadow-lg">
                    {/* Simulated Garment Visual Container with Custom text details on top */}
                    <div 
                      className="aspect-[5/6] w-full relative flex items-center justify-center transition-colors duration-500 overflow-hidden"
                      style={{ backgroundColor: drop.hex }}
                    >
                      {/* Illustrated heavy boxy streetwear T-Shirt silhouette backdrop */}
                      <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                        <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.8" opacity="0.9" />
                        <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.5" opacity="0.9" />
                        <path d="M 50 15 C 54.5 15 58.5 17 60 18.5 C 54.5 21 45.5 21 40 18.5 C 41.5 17 45.5 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.2" opacity="0.75" />
                        <path d="M 33 42 C 33 42 35 60 33 75" fill="none" stroke="#1f1f23" strokeWidth="0.8" opacity="0.5" />
                        <path d="M 67 42 C 67 42 65 60 67 75" fill="none" stroke="#1f1f23" strokeWidth="0.8" opacity="0.5" />
                      </svg>

                      {/* Headless visual rendering representation */}
                      <div className="absolute inset-0 flex items-center justify-center p-8 z-15 pointer-events-none">
                        <div className="w-[160px] h-[200px] border border-dashed border-zinc-900/10 flex items-center justify-center relative">
                          <span 
                            className="text-center text-[18px] uppercase tracking-widest font-black max-w-[140px] break-words"
                            style={{ 
                              fontFamily: drop.id === "preset-system-override" ? "Courier New" : drop.id === "preset-vintage-rebel" ? "Georgia" : "Impact",
                              color: drop.id === "preset-system-override" ? "#ef4444" : drop.id === "preset-vintage-rebel" ? "#eab308" : "#ffffff",
                              fontStyle: drop.id === "preset-vintage-rebel" ? "italic" : "normal"
                            }}
                          >
                            {drop.textLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-5 flex-grow flex flex-col justify-between border-t border-zinc-150 space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{drop.stageCity}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-none font-mono">RS. {drop.price}</span>
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800">{drop.title}</h4>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemix(drop)}
                          className="flex-1 py-2 border border-zinc-200 hover:border-[#7a1c27] text-zinc-700 hover:text-[#7a1c27] text-[8px] font-black uppercase tracking-widest transition-all bg-white"
                        >
                          Remix Drop
                        </button>
                        <button
                          onClick={() => handleInstantBuy(drop)}
                          disabled={purchaseStatus === drop.id}
                          className="flex-1 py-2 bg-zinc-950 hover:bg-[#7a1c27] text-white text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{purchaseStatus === drop.id ? "Adding..." : "Instant Buy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
