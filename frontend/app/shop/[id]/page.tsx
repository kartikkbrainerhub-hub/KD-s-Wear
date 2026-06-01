"use client";
 
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingBag, Star, Heart, Truck, ShieldCheck, ChevronRight, CheckCircle2, Palette } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ProductProps } from "@/components/ProductCard";
import { API_BASE } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

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

const SHIRT_COLORS = [
  // Neutrals
  { name: "Carbon Black", hex: "#0a0a0c", category: "Neutrals" },
  { name: "Off White", hex: "#f4f4f7", category: "Neutrals" },
  { name: "Ash Grey", hex: "#9e9e9e", category: "Neutrals" },
  { name: "Stone", hex: "#6b6b6b", category: "Neutrals" },
  { name: "Chalk", hex: "#e8e3dc", category: "Neutrals" },
  // Streetwear Darks
  { name: "Midnight Navy", hex: "#0a192f", category: "Darks" },
  { name: "Tokyo Violet", hex: "#2b1055", category: "Darks" },
  { name: "Crimson Red", hex: "#781e28", category: "Darks" },
  { name: "Forest Hunter", hex: "#1a2e1a", category: "Darks" },
  { name: "Espresso", hex: "#2c1a0e", category: "Darks" },
  // Earth Tones
  { name: "Desert Sand", hex: "#d7ccc8", category: "Earth" },
  { name: "Sage Green", hex: "#607267", category: "Earth" },
  { name: "Terra Cotta", hex: "#c1694f", category: "Earth" },
  { name: "Warm Khaki", hex: "#c8b87a", category: "Earth" },
  { name: "Rust Brown", hex: "#8b4513", category: "Earth" },
  // Pastels & Brights
  { name: "Peach Sunset", hex: "#ffab91", category: "Pastels" },
  { name: "Sky Blue", hex: "#90caf9", category: "Pastels" },
  { name: "Mint Fresh", hex: "#a5d6a7", category: "Pastels" },
  { name: "Lavender", hex: "#ce93d8", category: "Pastels" },
  { name: "Butter Yellow", hex: "#fff59d", category: "Pastels" },
];

const COLOR_CATEGORIES = ["All", "Neutrals", "Darks", "Earth", "Pastels"];
 
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCommunity, setIsCommunity] = useState(false);
  const [canvasJson, setCanvasJson] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const [presetFont, setPresetFont] = useState("");
  const [presetTextColor, setPresetTextColor] = useState("");
  const [colorCategory, setColorCategory] = useState("All");
  
  // Selection States
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Custom Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ""
  });
 
  // Fetch product from FastAPI on mount
  useEffect(() => {
    setLoading(true);
    
    // 1. Check if preset community design
    if (productId.startsWith("preset-")) {
      const preset = SEED_LOOKBOOK_DROPS.find(p => p.id === productId);
      if (preset) {
        let pFont = "Impact";
        let pColor = "#ffffff";
        if (preset.id === "preset-system-override") {
          pFont = "Courier New";
          pColor = "#ef4444";
        } else if (preset.id === "preset-vintage-rebel") {
          pFont = "Georgia";
          pColor = "#eab308";
        }

        const mockProduct: any = {
          id: preset.id,
          title: preset.title,
          description: `Co-designed in ${preset.stageCity} on ${preset.colorName} fabric. Formed of dense organic heavyweight streetwear cotton.`,
          base_price: preset.price,
          sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
          colors: JSON.stringify([{ name: preset.colorName, hex: preset.hex }]),
          images: JSON.stringify([preset.preview_image_url])
        };
        setProduct(mockProduct);
        setIsCommunity(true);
        setCanvasJson(preset.canvas_json);
        setTextLabel(preset.textLabel);
        setPresetFont(pFont);
        setPresetTextColor(pColor);
        setLoading(false);
      } else {
        setProduct(null);
        setLoading(false);
      }
      return;
    }

    // 2. Fetch from products
    fetch(`${API_BASE}/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setProduct(data);
          setIsCommunity(false);
          setLoading(false);
        } else {
          throw new Error("Product not found");
        }
      })
      .catch(() => {
        // 3. Fallback to designs database API
        fetch(`${API_BASE}/api/designs/${productId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Design not found");
            return res.json();
          })
          .then((designData) => {
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

            const hex = getShirtHex(designData.shirt_color);
            const mockProduct: any = {
              id: designData.id,
              title: `Drop #${designData.id.slice(-4).toUpperCase()}: Street Custom`,
              description: `Unique custom creation co-designed in drop studio. Formed of dense organic heavyweight streetwear cotton.`,
              base_price: 1800,
              sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
              colors: JSON.stringify([{ name: designData.shirt_color, hex: hex }]),
              images: JSON.stringify([designData.preview_image_url || "/images/products/blank_tee_white.png"])
            };
            setProduct(mockProduct);
            setIsCommunity(true);
            setCanvasJson(designData.canvas_json || "");
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error loading item:", err);
            setProduct(null);
            setLoading(false);
          });
      });
  }, [productId]);
 
  // Populate defaults when product is loaded
  useEffect(() => {
    if (!product) return;
    
    let sizesList = ["S", "M", "L", "XL"];
    let colorsList: any[] = [{ name: "Carbon Black", hex: "#1e1e1e" }];
    let imagesList = ["/images/products/blank_tee_black.png"];
    
    try {
      if (product.sizes) {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed) && parsed.length > 0) sizesList = parsed;
      }
    } catch(e){}
 
    try {
      if (product.colors) {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed) && parsed.length > 0) colorsList = parsed;
      }
    } catch(e){}
 
    try {
      if (product.images) {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) imagesList = parsed;
      }
    } catch(e){}
    
    setSelectedSize(sizesList[0] || "M");
    setSelectedColor(colorsList[0] || null);
    setActiveImage(imagesList[0] || "");
  }, [product]);
 
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      product_id: product.id,
      title: product.title,
      image: activeImage,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor?.hex || "#000000",
      price: product.base_price
    });
 
    // Beautiful Custom Toast notification
    setToast({
      show: true,
      message: `Successfully added ${quantity}x ${product.title} to your bag!`
    });
 
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };
 
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push("/dashboard?mode=login&redirect=checkout");
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };
 
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] pt-36 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }
 
  if (!product) {
    return (
      <main className="min-h-screen bg-[#faf8f5] pt-36 text-center text-zinc-500 font-serif">
        <p className="text-sm uppercase tracking-widest font-black text-[#7a1c27]">Drop not found.</p>
      </main>
    );
  }
 
  let sizesList = ["S", "M", "L", "XL"];
  let colorsList: any[] = [{ name: "Carbon Black", hex: "#1e1e1e" }];
  let imagesList = ["/images/products/blank_tee_black.png"];
  
  try {
    if (product.sizes) {
      const parsed = JSON.parse(product.sizes);
      if (Array.isArray(parsed) && parsed.length > 0) sizesList = parsed;
    }
  } catch(e){}
 
  try {
    if (product.colors) {
      const parsed = JSON.parse(product.colors);
      if (Array.isArray(parsed) && parsed.length > 0) colorsList = parsed;
    }
  } catch(e){}
 
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) imagesList = parsed;
    }
  } catch(e){}
 
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Editorial Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-zinc-450 mb-8 border-b border-zinc-200/50 pb-4">
          <span className="hover:text-zinc-900 cursor-pointer" onClick={() => router.push("/")}>Home</span>
          <ChevronRight className="w-3 h-3 text-zinc-350" />
          <span className="hover:text-zinc-900 cursor-pointer" onClick={() => router.push("/shop")}>Shop Catalogue</span>
          <ChevronRight className="w-3 h-3 text-zinc-350" />
          <span className="text-[#7a1c27]">{product.title}</span>
        </div>
 
        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Images Presentation Grid */}
          <div className="space-y-4">
            {isCommunity ? (
              /* ── Community Drop: live SVG T-shirt silhouette with dynamic colour ── */
              <div
                className="w-full aspect-[4/5] border border-zinc-200/80 flex items-center justify-center relative overflow-hidden transition-colors duration-500 shadow-sm"
                style={{ backgroundColor: selectedColor?.hex || "#0a0a0c" }}
              >
                {/* Badge */}
                <span className="absolute top-4 left-4 text-[9px] font-black uppercase text-white bg-[#7a1c27] px-2 py-0.5 tracking-widest z-30">
                  Community Drop
                </span>

                {/* Boxy streetwear T-shirt SVG silhouette */}
                <svg
                  className="absolute inset-0 w-full h-full p-6 pointer-events-none select-none z-10"
                  viewBox="0 0 100 100"
                >
                  <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
                  <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
                  <path d="M 50 15 C 54.5 15 58.5 17 60 18.5 C 54.5 21 45.5 21 40 18.5 C 41.5 17 45.5 15 50 15 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                  <path d="M 33 42 C 33 42 35 60 33 75" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <path d="M 67 42 C 67 42 65 60 67 75" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <path d="M 27 37 L 22 25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.0" strokeDasharray="1.5,1.5" />
                  <path d="M 73 37 L 78 25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.0" strokeDasharray="1.5,1.5" />
                </svg>

                {/* Design overlay: preset text OR custom transparent canvas print */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none">
                  {productId.startsWith("preset-") && textLabel ? (
                    <span
                      className="text-base sm:text-lg font-black uppercase tracking-widest filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] rotate-[-8deg]"
                      style={{ fontFamily: presetFont, color: presetTextColor }}
                    >
                      {textLabel}
                    </span>
                  ) : (
                    <img
                      src={activeImage}
                      alt={product.title}
                      className="w-3/5 h-3/5 object-contain opacity-90"
                    />
                  )}
                </div>

                {/* Colour name label at bottom */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/60 bg-black/20 px-2 py-0.5">
                    {selectedColor?.name}
                  </span>
                </div>
              </div>
            ) : (
              /* ── Official Release: standard image gallery ── */
              <>
                <div className="w-full aspect-[4/5] bg-[#f5f2eb] border border-zinc-200/80 flex items-center justify-center p-8 relative">
                  <img
                    src={activeImage}
                    alt={product.title}
                    className="w-full h-full object-contain relative z-10"
                  />
                  <span className="absolute top-4 left-4 text-[9px] font-black uppercase text-white bg-[#7a1c27] px-2 py-0.5 tracking-widest">
                    Premium Drop
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {imagesList.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`aspect-square bg-[#f5f2eb] border p-1 transition-all ${activeImage === img ? "border-[#7a1c27] scale-95" : "border-zinc-200 hover:border-zinc-300"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
 
          {/* Editorial Specs Details */}
          <div className="space-y-6">
            
            {/* Title & Tagging */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a1c27] bg-[#7a1c27]/5 border border-[#7a1c27]/10 px-2 py-0.5 inline-block">
                {isCommunity ? "User Custom Creation" : "Original KD's Knitwear"}
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-wider text-zinc-950 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex items-center text-[#7a1c27]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">(24 Reviews)</span>
              </div>
            </div>
 
            {/* Pricing Section */}
            <div className="border-t border-b border-zinc-200/50 py-4 flex items-baseline justify-between bg-[#f5f2eb]/40 px-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Retail price</span>
              <span className="text-xl md:text-2xl font-black text-[#7a1c27] font-mono">
                RS.{product.base_price}.00
              </span>
            </div>
 
            {/* Description Spec */}
            <div className="space-y-2">
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Spec Details</p>
              <p className="text-xs text-zinc-650 leading-relaxed font-medium uppercase tracking-wide">
                {product.description || "Indulge in premium dense organic cotton build, tailored with heavyweight custom loops, flat boxy drop shoulder cuts, and tailored minimalist chest highlights."}
              </p>
            </div>
 
            {/* Color Swatch Selector */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Garment Palette</label>

              {isCommunity ? (
                /* ── Community: full 20-colour studio palette with category tabs ── */
                <div className="space-y-3">
                  {/* Category filter tabs */}
                  <div className="flex flex-wrap gap-1">
                    {COLOR_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setColorCategory(cat)}
                        className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border transition-all ${
                          colorCategory === cat
                            ? "bg-[#7a1c27] border-[#7a1c27] text-white"
                            : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* 20-colour grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {(colorCategory === "All"
                      ? SHIRT_COLORS
                      : SHIRT_COLORS.filter((c) => c.category === colorCategory)
                    ).map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        title={`${c.name} · ${c.hex}`}
                        className={`relative w-9 h-9 border-2 transition-all ${
                          selectedColor?.name === c.name
                            ? "border-[#7a1c27] scale-105 shadow-md"
                            : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <span
                          className="absolute inset-0.5 inline-block"
                          style={{ backgroundColor: c.hex }}
                        />
                        {selectedColor?.name === c.name && (
                          <span className="absolute bottom-0 right-0 bg-[#7a1c27] text-white text-[6px] w-2.5 h-2.5 flex items-center justify-center font-black z-10">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Active colour readout */}
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span
                      className="w-4 h-4 border border-zinc-300 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: selectedColor?.hex }}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{selectedColor?.name}</span>
                    <span className="text-[9px] font-mono text-zinc-400 ml-auto">{selectedColor?.hex}</span>
                  </div>
                </div>
              ) : (
                /* ── Official: simple per-product colour swatches ── */
                <div className="flex items-center space-x-3">
                  {colorsList.map((col: any) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      title={col.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor?.name === col.name ? "border-[#7a1c27] scale-110" : "border-transparent hover:scale-105"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full inline-block border border-zinc-200 shadow-inner"
                        style={{ backgroundColor: col.hex }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            {/* Size Selector Grid */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Select Size</label>
              <div className="flex items-center space-x-3">
                {sizesList.map((sz: string) => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-10 text-xs font-bold transition-all border flex items-center justify-center rounded-none ${selectedSize === sz ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Logistics details */}
            <div className="flex items-center space-x-3 text-xs text-zinc-500 bg-[#f5f2eb] p-4 border border-zinc-200/60 rounded-none">
              <Truck className="w-5 h-5 text-[#7a1c27] flex-shrink-0" />
              <p className="uppercase font-bold tracking-wider text-[10px] text-zinc-700 leading-normal">
                Direct Shipping across India. Estimated delivery within 4-7 business days. COD option applied.
              </p>
            </div>
 
            {/* Core Buy / Cart CTAs */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-white hover:bg-zinc-50 text-zinc-800 font-extrabold text-xs uppercase tracking-widest border border-zinc-200 hover:border-[#7a1c27] flex items-center justify-center space-x-2 transition-all rounded-none"
              >
                <ShoppingBag className="w-4 h-4 text-[#7a1c27]" />
                <span>Add to Bag</span>
              </button>
              
              {isCommunity ? (
                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (canvasJson) params.set("canvas", encodeURIComponent(canvasJson));
                    if (selectedColor?.hex) params.set("color", selectedColor.hex);
                    router.push(`/customize?${params.toString()}`);
                  }}
                  className="flex-1 py-4 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center rounded-none shadow-md flex items-center justify-center space-x-2"
                >
                  <Palette className="w-4 h-4" />
                  <span>Customize Design</span>
                </button>
              ) : (
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center rounded-none shadow-md"
                >
                  <span>Instant Buy Now</span>
                </button>
              )}
            </div>
          </div>
 
        </div>
      </div>

      {/* Premium Animated Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#faf8f5] border-2 border-[#7a1c27] shadow-2xl p-5 text-center max-w-sm w-full font-serif flex flex-col items-center space-y-3 rounded-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#7a1c27]/10 flex items-center justify-center text-[#7a1c27]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#7a1c27]">BAG UPDATED</h4>
              <p className="text-[11px] uppercase tracking-wider text-zinc-700 font-sans font-bold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <div className="w-full bg-zinc-200 h-0.5 relative overflow-hidden">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute left-0 top-0 h-full bg-[#7a1c27]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
