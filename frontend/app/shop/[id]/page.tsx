"use client";
 
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingBag, Star, Heart, Truck, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ProductProps } from "@/components/ProductCard";
import { API_BASE } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
 
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [loading, setLoading] = useState(true);
  
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
    fetch(`${API_BASE}/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setProduct(data);
        }
      })
      .catch((err) => console.error("Error fetching product:", err))
      .finally(() => setLoading(false));
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
            <div className="w-full aspect-[4/5] bg-[#f5f2eb] border border-zinc-200/80 flex items-center justify-center p-8 relative">
              <img 
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-contain" 
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
          </div>
 
          {/* Editorial Specs Details */}
          <div className="space-y-6">
            
            {/* Title & Tagging */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a1c27] bg-[#7a1c27]/5 border border-[#7a1c27]/10 px-2 py-0.5 inline-block">
                Original KD's Knitwear
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
              <div className="flex items-center space-x-3">
                {colorsList.map((col: any) => (
                  <button 
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    title={col.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor?.name === col.name ? "border-[#7a1c27] scale-110" : "border-transparent hover:scale-105"}`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full inline-block border border-zinc-200 shadow-inner"
                      style={{ backgroundColor: col.hex }}
                    />
                  </button>
                ))}
              </div>
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
              
              <button 
                onClick={handleBuyNow}
                className="flex-1 py-4 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center rounded-none shadow-md"
              >
                <span>Instant Buy Now</span>
              </button>
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
