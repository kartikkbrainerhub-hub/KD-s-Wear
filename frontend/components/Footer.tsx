"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-[#faf8f5] border-t border-zinc-200 text-zinc-650 text-xs mt-auto font-sans">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span style={{ fontFamily: "'Cinzel', serif" }} className="text-xl font-black text-[#7a1c27] tracking-wider uppercase">
              KD'S <span style={{ fontFamily: "'Cinzel', serif" }} className="text-zinc-950 font-normal tracking-[0.2em] text-base ml-2">WEAR</span>
            </span>
          </Link>
          <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-wider font-bold">
            Premium custom streetwear labels inspired by traditional Indian art motifs and modern silhouettes. Redefining fashion.
          </p>
          <div className="flex items-center space-x-4 pt-2">
            <a href="#" className="p-2 bg-white border border-zinc-200 rounded-none hover:bg-[#7a1c27] hover:text-white text-zinc-500 transition-all flex items-center justify-center" title="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-white border border-zinc-200 rounded-none hover:bg-[#7a1c27] hover:text-white text-zinc-500 transition-all flex items-center justify-center" title="Github">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>

        {/* Catalog */}
        <div className="space-y-4">
          <h4 className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">Shop Collection</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/shop" className="hover:text-[#7a1c27] transition-colors">Oversized Tees</Link></li>
            <li><Link href="/shop" className="hover:text-[#7a1c27] transition-colors">Minimalist Embroidery</Link></li>
            <li><Link href="/shop" className="hover:text-[#7a1c27] transition-colors">Vintage Graphics</Link></li>
            <li><Link href="/customize" className="hover:text-[#8e2430] text-[#7a1c27] transition-colors font-extrabold uppercase tracking-wider">T-Shirt Designer</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-4">
          <h4 className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">Customer Support</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard" className="hover:text-[#7a1c27] transition-colors">Track Your Order</Link></li>
            <li><Link href="#" className="hover:text-[#7a1c27] transition-colors">Shipping & Returns</Link></li>
            <li><Link href="#" className="hover:text-[#7a1c27] transition-colors">Sizing Chart Guide</Link></li>
            <li><Link href="#" className="hover:text-[#7a1c27] transition-colors">Razorpay Security</Link></li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-4">
          <h4 className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">Exclusive Drops</h4>
          <p className="text-xs text-zinc-500 leading-normal">
            Subscribe to receive immediate notification of upcoming seasonal designs and flash discounts.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27] focus:ring-1 focus:ring-[#7a1c27]"
            />
            <button 
              type="submit" 
              className="p-2 bg-[#7a1c27] hover:bg-[#8e2430] text-white rounded-none transition-all"
              title="Subscribe"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="border-t border-zinc-200 bg-[#f5f2eb] py-6 text-zinc-550 font-bold uppercase tracking-wider text-[10px]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} KD's Wear Ltd. Premium Custom Streetwear. Made in India.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#7a1c27] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#7a1c27] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#7a1c27] transition-colors">GST Registration</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
