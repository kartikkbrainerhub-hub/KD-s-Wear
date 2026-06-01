"use client";
 
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingBag, User, X, Plus, Minus, Trash2, ShieldAlert, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
 
const FALLBACK_SEARCH_CATALOG = [
  {
    id: "1",
    title: "Kora Signature Blank Heavy Tee",
    base_price: 699,
    images: '["/images/products/blank_tee_black.png"]',
    description: "Premium 240GSM organic cotton boxy blank."
  },
  {
    id: "2",
    title: "Neon Overdrive Oversized Graphic Tee",
    base_price: 999,
    images: '["/images/products/neon_tee.png"]',
    description: "Halftone cyberpunk graphics on dense charcoal knit."
  },
  {
    id: "3",
    title: "Sacred Lotus Minimalist T-Shirt",
    base_price: 899,
    images: '["/images/products/lotus_tee.png"]',
    description: "Ultra-fine white thread centered embroidery design."
  },
  {
    id: "4",
    title: "Cyber-Lotus Vaporwave Heavy Tee",
    base_price: 1199,
    images: '["/images/products/neon_tee.png"]',
    description: "Limited dropshoulder vaporwave aesthetic."
  },
  {
    id: "5",
    title: "Tokyo Halftone Boxy Vintage Tee",
    base_price: 1099,
    images: '["/images/products/neon_tee.png"]',
    description: "Heavyweight dropshoulder garment dyed fit."
  },
  {
    id: "6",
    title: "Alabaster Minimal Signature Tee",
    base_price: 799,
    images: '["/images/products/blank_tee_white.png"]',
    description: "Off white 240GSM cotton blank with branding label."
  }
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getSubtotal, getBundleDiscount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const customTeesCount = items
    .filter(item => item.product_id === "custom-tshirt-canvas" || !!item.custom_design_id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const getBundleProgressInfo = () => {
    if (customTeesCount === 0) {
      return {
        pct: 0,
        text: "Add 2 custom tees to unlock 10% bundle discount!",
        color: "from-zinc-400 to-zinc-500",
        unlocked: false,
        label: "0 / 2 Custom Items"
      };
    } else if (customTeesCount === 1) {
      return {
        pct: 50,
        text: "Add 1 more custom tee to unlock 10% OFF your customized designs!",
        color: "from-amber-500 to-orange-500 animate-pulse",
        unlocked: false,
        label: "1 / 2 Custom Items"
      };
    } else if (customTeesCount === 2) {
      return {
        pct: 75,
        text: "10% bundle discount unlocked! Add 1 more for 20% OFF!",
        color: "from-[#7a1c27] to-red-600 shadow-[0_0_10px_rgba(122,28,39,0.3)]",
        unlocked: true,
        label: "2 / 3 Custom Items"
      };
    } else {
      return {
        pct: 100,
        text: "VIP Streetwear Bundle unlocked: 20% OFF applied!",
        color: "from-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        unlocked: true,
        label: "VIP Streetwear Tier"
      };
    }
  };

  const progressInfo = getBundleProgressInfo();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
 
  useEffect(() => {
    setMounted(true);
    // Dynamic local connection for search items
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    fetch(`http://${hostname}:8001/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_SEARCH_CATALOG);
        }
      })
      .catch(() => {
        setProducts(FALLBACK_SEARCH_CATALOG);
      });
  }, []);

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      router.push("/dashboard?redirect=checkout");
    } else {
      router.push("/checkout");
    }
  };

  const filteredProducts = searchQuery.trim() === "" 
    ? [] 
    : products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
 
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#faf8f5]/85 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl font-black text-[#7a1c27] tracking-wider uppercase">
              KD'S <span style={{ fontFamily: "'Cinzel', serif" }} className="text-zinc-650 font-normal tracking-[0.2em] text-lg ml-2">WEAR</span>
            </span>
          </Link>
 
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase text-zinc-650 font-sans">
            <Link 
              href="/shop" 
              className={`hover:text-[#7a1c27] transition-colors ${pathname === "/shop" ? "text-[#7a1c27] font-black" : ""}`}
            >
              Shop
            </Link>
            <Link 
              href="/customize" 
              className={`hover:text-[#7a1c27] transition-colors text-[#7a1c27] font-black border border-[#7a1c27]/20 px-3 py-1.5 rounded-none bg-[#f5f2eb] hover:bg-[#faf8f5] ${pathname === "/customize" ? "border-[#7a1c27] bg-white text-[#7a1c27]" : ""}`}
            >
              T-Shirt Designer
            </Link>
            <Link 
              href="/dashboard" 
              className={`hover:text-[#7a1c27] transition-colors ${pathname.startsWith("/dashboard") ? "text-[#7a1c27] font-black" : ""}`}
            >
              Track Order
            </Link>
          </nav>
 
          {/* User, Search & Cart Controls */}
          <div className="flex items-center space-x-6">
            {/* Admin Dashboard Quick link */}
            {mounted && isAuthenticated && user?.role === "admin" && (
              <Link 
                href="/admin" 
                title="Admin Console"
                className="text-[#7a1c27] hover:text-[#8e2430] transition-colors flex items-center space-x-1 border border-[#7a1c27]/20 bg-[#7a1c27]/5 px-3 py-1 rounded-none text-[10px] font-extrabold uppercase tracking-wider"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Global Search Inline Input Bar for Desktop */}
            <div className="relative hidden md:block max-w-[200px] lg:max-w-[260px] w-full">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="FIND PRODUCTS, DESIGNS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 bg-[#f5f2eb] border border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27] focus:bg-white transition-all rounded-none"
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-455 pointer-events-none" />
              </div>

              {/* Compact Inline Floating Dropdown */}
              <AnimatePresence>
                {searchQuery.trim() !== "" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-[#faf8f5] border border-zinc-200 shadow-2xl z-50 p-3 text-xs font-bold uppercase tracking-wider space-y-2 max-h-96 overflow-y-auto"
                  >
                    {filteredProducts.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 p-3 text-center">No drops matched.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[9px] text-[#7a1c27] font-black border-b border-zinc-200/50 pb-1.5 mb-1 tracking-widest">
                          {filteredProducts.length} PRODUCTS FOUND
                        </p>
                        {filteredProducts.map((p) => {
                          let parsedImage = "/images/products/blank_tee_black.png";
                          try {
                            if (p.images) {
                              const parsed = JSON.parse(p.images);
                              if (Array.isArray(parsed) && parsed.length > 0) parsedImage = parsed[0];
                            }
                          } catch(e) {}
                          return (
                            <Link 
                              key={p.id} 
                              href={`/shop`}
                              onClick={() => setSearchQuery("")}
                              className="flex items-center space-x-3 p-1.5 hover:bg-[#7a1c27]/5 border border-transparent hover:border-zinc-200 transition-colors"
                            >
                              <img src={parsedImage} alt={p.title} className="w-8 h-8 object-contain bg-[#f5f2eb]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-zinc-800 truncate">{p.title}</p>
                                <p className="text-[9px] text-[#7a1c27] font-mono">RS.{p.base_price}.00</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Button toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-zinc-650 hover:text-[#7a1c27] transition-colors p-1 md:hidden"
              title="Search Products"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
 
            {/* Account Icon with Hover Dropdown */}
            <div className="relative group">
              <Link href="/dashboard" className="text-zinc-650 hover:text-[#7a1c27] transition-colors p-1 flex items-center" title="Account Menu">
                <User className="w-4.5 h-4.5" />
              </Link>
              
              {/* Dropdown Menu on hover */}
              <div className="absolute right-0 mt-2 w-48 bg-[#faf8f5] border border-zinc-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2 text-xs font-bold uppercase tracking-wider">
                {!mounted ? (
                  <div className="space-y-1 py-1">
                    <div className="px-3 py-1.5 text-[10px] text-zinc-400 font-black border-b border-zinc-200/50 pb-2 mb-1">
                      Loading Menu...
                    </div>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="space-y-1 py-1">
                    <div className="px-3 py-1.5 text-[10px] text-zinc-400 font-black border-b border-zinc-200/50 pb-2 mb-1">
                      Sign In / Join KD's Wear
                    </div>
                    <Link href="/dashboard?mode=login" className="block px-3 py-2 text-zinc-800 hover:text-white hover:bg-[#7a1c27] transition-colors">
                      Log In
                    </Link>
                    <Link href="/dashboard?mode=register" className="block px-3 py-2 text-zinc-800 hover:text-white hover:bg-[#7a1c27] transition-colors">
                      Register Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1 py-1">
                    <div className="px-3 py-1.5 text-[9px] text-[#7a1c27] font-black border-b border-zinc-200/50 pb-2 mb-1 truncate">
                      Hi, {user?.name || "Member"}
                    </div>
                    <Link href="/dashboard" className="block px-3 py-2 text-zinc-800 hover:text-white hover:bg-[#7a1c27] transition-colors">
                      Track Order
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" className="block px-3 py-2 text-zinc-800 hover:text-white hover:bg-[#7a1c27] transition-colors">
                        Admin Console
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        router.push("/dashboard");
                      }} 
                      className="w-full text-left block px-3 py-2 text-rose-700 hover:text-white hover:bg-rose-700 transition-colors uppercase font-bold text-xs"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
 
            {/* Shopping Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative text-zinc-650 hover:text-[#7a1c27] transition-colors p-1"
              title="View Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7a1c27] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden w-full bg-[#faf8f5] border-b border-zinc-200 px-6 py-3 z-40 fixed top-20 left-0 space-y-2 shadow-md overflow-hidden"
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="FIND PRODUCTS, DESIGNS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-[#f5f2eb] border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 focus:outline-none"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
            {searchQuery.trim() !== "" && (
              <div className="bg-white border border-zinc-200 p-2 text-xs font-bold uppercase tracking-wider space-y-1 max-h-48 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 p-2 text-center">No drops matched.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <Link 
                      key={p.id} 
                      href={`/shop`}
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="block py-1.5 px-2 hover:bg-[#7a1c27]/5 border-b border-zinc-100 last:border-0"
                    >
                      {p.title} - <span className="text-[#7a1c27] font-mono">RS.{p.base_price}.00</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer"
            />
 
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#faf8f5] border-l border-zinc-200 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 bg-[#f5f2eb] flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#7a1c27] font-serif">Your Shopping Cart ({totalItems})</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-950">
                  <X className="w-5 h-5" />
                </button>
              </div>
 
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mounted && items.length > 0 && (
                  <div className="bg-[#faf8f5] border border-zinc-200 p-4 space-y-3 shadow-sm rounded-none">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-[#7a1c27] flex items-center space-x-1 font-serif">
                        <ShoppingBag className="w-3 h-3" />
                        <span>KD's Wear Customizer Bundle Meter</span>
                      </span>
                      <span className="text-zinc-500 font-mono font-bold">{progressInfo.label}</span>
                    </div>

                    <div className="relative w-full h-2 bg-zinc-200 rounded-none overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressInfo.pct}%` }}
                        transition={{ type: "spring", stiffness: 60, damping: 15 }}
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${progressInfo.color}`}
                      />
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 leading-relaxed font-sans">
                      {progressInfo.text}
                    </p>
                  </div>
                )}

                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
                    <ShoppingBag className="w-12 h-12 stroke-[1.2] text-zinc-300" />
                    <p className="text-xs uppercase font-extrabold tracking-wider">Your shopping bag is empty</p>
                    <Link 
                      href="/shop" 
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs text-[#7a1c27] font-extrabold uppercase tracking-widest border-b border-[#7a1c27] hover:text-[#8e2430] hover:border-[#8e2430] pb-0.5"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex space-x-4 border-b border-zinc-200/80 pb-4">
                      {/* Image Thumbnail */}
                      <div 
                        className="w-20 h-20 rounded-none relative overflow-hidden flex-shrink-0 border border-zinc-150 p-1 flex items-center justify-center transition-colors duration-500"
                        style={{ backgroundColor: item.custom_design_id ? item.color : "#f5f2eb" }}
                      >
                        {item.custom_design_id && (
                          <svg className="absolute inset-0 w-full h-full p-1 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                            <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="2.2" opacity="0.8" />
                            <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.8" opacity="0.8" />
                          </svg>
                        )}
                        <img 
                          src={item.custom_design_id ? item.canvas_preview : item.image} 
                          alt={item.title} 
                          className={`w-full h-full object-contain relative ${item.custom_design_id ? "z-10 p-2" : ""}`} 
                        />
                      </div>
 
                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs uppercase font-extrabold text-zinc-900 truncate">{item.title}</h4>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mt-1 flex items-center space-x-2">
                          <span>Size: {item.size}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            Color: 
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block ml-1 border border-zinc-200" 
                              style={{ backgroundColor: item.color }}
                            />
                          </span>
                        </p>
                        {item.custom_design_id && (
                          <span className="inline-block mt-1.5 text-[8px] font-black uppercase text-[#7a1c27] bg-[#7a1c27]/5 px-2 py-0.5 border border-[#7a1c27]/10 tracking-widest">
                            Custom Artwork Template
                          </span>
                        )}
 
                        {/* Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 border border-zinc-200 bg-white">
                            <button 
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="p-1 hover:text-[#7a1c27] transition-colors text-zinc-400"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-zinc-950 w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="p-1 hover:text-[#7a1c27] transition-colors text-zinc-400"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
 
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="text-zinc-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
 
                      {/* Price Tally */}
                      <div className="text-xs font-black text-zinc-950 font-mono">
                        RS.{item.price * item.quantity}.00
                      </div>
                    </div>
                  ))
                )}
              </div>
 
              {/* Footer Billing block */}
              {items.length > 0 && (
                <div className="p-6 border-t border-zinc-200 bg-[#f5f2eb] space-y-4">
                  <div className="flex justify-between text-zinc-650 text-xs font-bold uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-zinc-950 font-black font-mono">RS.{getSubtotal()}.00</span>
                  </div>
                  {mounted && getBundleDiscount() > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs font-bold uppercase tracking-wider animate-pulse">
                      <span>Bundle Discount (Savings)</span>
                      <span className="font-black font-mono">- RS.{getBundleDiscount()}.00</span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    * GST (18%) and shipping logistics charges aggregated. COD verification applied instantly.
                  </p>
 
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 rounded-none shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
