"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Palette, Layers, Sparkles, ShoppingBag, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard, { ProductProps } from "@/components/ProductCard";
import { API_BASE } from "@/config";

export default function Home() {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from our FastAPI backend on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        // Fallback robust mockups if API is offline
        setProducts([
          {
            id: "1",
            title: "KD's Signature Blank Heavy Tee",
            description: "Premium 240GSM organic cotton boxy blank. Specially tailored with dropshoulder seams, ready for live custom graphics placement in the designer.",
            base_price: 699,
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
            sizes: '["S","M","L","XL"]',
            colors: '[{"name":"Off White","hex":"#f4f4f7"}]',
            images: '["/images/products/blank_tee_white.png"]',
            inventory: 60,
            ratings: 4.8,
            is_customizable: false
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-[#faf8f5]">
        {/* Abstract background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,28,39,0.03),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7a1c27]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-[#f5f2eb] border border-[#7a1c27]/20 px-4 py-1.5 rounded-none text-xs font-extrabold tracking-widest text-[#7a1c27] uppercase shadow-sm font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7a1c27]" />
            <span>Traditional Indian Fusion Streetwear Label</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] tracking-tight uppercase text-zinc-950 font-serif"
          >
            Don&apos;t Just Buy Fashion.<br />
            <span className="text-[#7a1c27]">
              Co-Design It.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-zinc-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-wider"
          >
            Select your premium boxy fits, upload signature visuals, overlay traditional Indian crests, and preview your custom styles in high-resolution, instant canvas editors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link 
              href="/customize"
              className="px-8 py-4 rounded-none bg-[#7a1c27] hover:bg-[#8e2430] text-white font-black uppercase text-xs tracking-widest transition-all flex items-center space-x-2 w-full sm:w-auto justify-center shadow-md"
            >
              <Palette className="w-4.5 h-4.5" />
              <span>Design Your T-Shirt</span>
            </Link>
            
            <Link 
              href="/shop"
              className="px-8 py-4 rounded-none bg-[#f5f2eb] border border-zinc-200 hover:border-zinc-300 text-zinc-800 font-black uppercase text-xs tracking-widest transition-all flex items-center space-x-2 w-full sm:w-auto justify-center shadow-sm"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#7a1c27]" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. THREE CORE PROPS */}
      <section className="py-20 border-y border-zinc-200 bg-[#f5f2eb]/60 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#faf8f5] border border-zinc-150 p-8 rounded-none shadow-sm hover:border-[#7a1c27]/30 transition-all space-y-4">
            <div className="p-3 bg-[#7a1c27]/10 text-[#7a1c27] inline-block rounded-none">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-900 text-sm font-extrabold uppercase tracking-widest">Live Fabric Engine</h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              Add logos, input typography, alter font weight, rotate layouts, and toggle front and back canvas spaces dynamically inside your browser.
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-zinc-150 p-8 rounded-none shadow-sm hover:border-[#7a1c27]/30 transition-all space-y-4">
            <div className="p-3 bg-[#7a1c27]/10 text-[#7a1c27] inline-block rounded-none">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-900 text-sm font-extrabold uppercase tracking-widest">240GSM Heavyweight Knits</h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              We exclusively customize on high-end double knit boxy-cut blanks, utilizing rich custom organic cotton to guarantee luxury draping.
            </p>
          </div>

          <div className="bg-[#faf8f5] border border-zinc-150 p-8 rounded-none shadow-sm hover:border-[#7a1c27]/30 transition-all space-y-4">
            <div className="p-3 bg-[#7a1c27]/10 text-[#7a1c27] inline-block rounded-none">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-900 text-sm font-extrabold uppercase tracking-widest">Secure Razorpay checkouts</h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              Settle payment securely in seconds through dynamic gateway portals, with multiple Cash on Delivery order verifications supported.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CATALOG SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-12 bg-[#faf8f5]">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-zinc-950">
            HOT PRE-MADE DROPS
          </h2>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
            Check out what is trending this week or co-design yours right now
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[1/1] rounded-none bg-zinc-150 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center pt-8">
          <Link 
            href="/shop" 
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#7a1c27] font-black border-b border-[#7a1c27]/30 hover:border-[#7a1c27] pb-1"
          >
            <span>See entire drops catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. FAQ CARDS */}
      <section className="bg-[#f5f2eb]/60 py-24 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#7a1c27] mx-auto" />
            <h2 className="text-3xl font-extrabold uppercase font-serif tracking-tight text-zinc-950">
              Got Questions?
            </h2>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Everything you need to know about the designer drops</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#faf8f5] border border-zinc-150 p-6 rounded-none space-y-2 shadow-sm hover:border-[#7a1c27]/25 transition-colors">
              <h4 className="text-zinc-900 font-extrabold text-xs uppercase tracking-wider">How long do custom orders take?</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Custom graphic t-shirts require print staging. Once you order, the blank goes into high-definition DTG (Direct-to-Garment) print queues, taking 3-5 business days to ship out.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-zinc-150 p-6 rounded-none space-y-2 shadow-sm hover:border-[#7a1c27]/25 transition-colors">
              <h4 className="text-zinc-900 font-extrabold text-xs uppercase tracking-wider">Can I upload any image?</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Yes! Our live customization designer supports high-res PNG, JPG, and vector SVGs. For standard graphics, we recommend PNG files with transparent backgrounds to ensure absolute visual integration.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-zinc-150 p-6 rounded-none space-y-2 shadow-sm hover:border-[#7a1c27]/25 transition-colors">
              <h4 className="text-zinc-900 font-extrabold text-xs uppercase tracking-wider">Do you offer cash on delivery?</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Yes, Cash on Delivery (COD) is supported across all postal codes. Surcharges do not apply, though we request phone verification at checkout.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-zinc-150 p-6 rounded-none space-y-2 shadow-sm hover:border-[#7a1c27]/25 transition-colors">
              <h4 className="text-zinc-900 font-extrabold text-xs uppercase tracking-wider">Is payment secure?</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Completely. Our payments are managed and verified through **Razorpay** checkout script integrations, fully compliant with security parameters and end-to-end encryption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
