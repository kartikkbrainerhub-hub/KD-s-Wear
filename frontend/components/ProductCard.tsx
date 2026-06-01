"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export interface ProductProps {
  id: string;
  title: string;
  description: string;
  base_price: number;
  category_id?: string;
  sizes: string; // raw JSON string
  colors: string; // raw JSON string
  images: string; // raw JSON string
  inventory: number;
  ratings: number;
  is_customizable: boolean;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const { addToCart } = useCartStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const imagesList = JSON.parse(product.images || "[]");
  const colorsList = JSON.parse(product.colors || "[]");
  const sizesList = JSON.parse(product.sizes || "[]");
  const displayImage = imagesList[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500";
  const hoverImage = imagesList[1] || displayImage;

  const [isLiked, setIsLiked] = useState(() => {
    if (!isAuthenticated || !user) return false;
    try {
      const wishlistIds = JSON.parse(user.wishlist || "[]");
      return wishlistIds.includes(product.id);
    } catch (e) {
      return false;
    }
  });

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      alert("Please login to manage your wishlist.");
      return;
    }

    setIsLiked(!isLiked);

    // Optimistic / simulated API update for user wishlist
    try {
      const wishlist = JSON.parse(user.wishlist || "[]");
      let newWishlist;
      if (wishlist.includes(product.id)) {
        newWishlist = wishlist.filter((id: string) => id !== product.id);
      } else {
        newWishlist = [...wishlist, product.id];
      }
      const updatedUser = {
        id: user.id || "",
        email: user.email || "",
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "user",
        addresses: user.addresses || "[]",
        wishlist: JSON.stringify(newWishlist),
        created_at: user.created_at || ""
      };
      updateUser(updatedUser);
    } catch (err) { }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      product_id: product.id,
      title: product.title,
      image: displayImage,
      quantity: 1,
      size: sizesList[0] || "M",
      color: colorsList[0]?.hex || "#0a0a0a",
      price: product.base_price
    });

    alert(`Added ${product.title} to your bag!`);
  };

  return (
    <Link href={product.is_customizable ? "/customize" : `/shop/${product.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden flex flex-col h-full bg-white/40 border border-zinc-100 hover:border-zinc-200 transition-all p-3 rounded-none shadow-sm"
      >
        {/* Card Media Preview */}
        <div className="relative aspect-[1/1] bg-[#f5f2eb] overflow-hidden">
          {/* Images toggle on hover */}
          <img
            src={displayImage}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0 absolute inset-0 p-2"
          />
          <img
            src={hoverImage}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-700 ease-out scale-100 group-hover:scale-105 opacity-0 group-hover:opacity-100 absolute inset-0 p-2"
          />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col space-y-2">
            {product.is_customizable ? (
              <span className="text-[8px] font-black uppercase text-[#7a1c27] bg-[#f5f2eb] border border-[#7a1c27]/20 px-2 py-0.5 tracking-widest flex items-center space-x-1 shadow-sm font-sans">
                <Palette className="w-2.5 h-2.5 text-[#7a1c27]" />
                <span>Customize</span>
              </span>
            ) : (
              <span className="text-[8px] font-bold uppercase text-zinc-650 bg-white border border-zinc-200 px-2 py-0.5 tracking-widest font-sans shadow-sm">
                Pre-Made
              </span>
            )}
          </div>

          {/* Subtle hover ring — no button overlay */}
          <div className="absolute inset-0 ring-inset ring-0 group-hover:ring-2 group-hover:ring-[#7a1c27]/20 transition-all duration-300 pointer-events-none z-20" />
        </div>

        {/* Card Description Info */}
        <div className="pt-4 pb-2 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs uppercase font-extrabold text-zinc-900 tracking-wider font-display truncate group-hover:text-[#7a1c27] transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100/60 mt-3">
            <span className="text-xs font-black text-[#7a1c27] tracking-wider font-sans">
              RS. {product.base_price}.00
            </span>
            <span className="text-[10px] text-zinc-400 font-bold tracking-widest font-sans">
              ★ {product.ratings}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
