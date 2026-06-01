"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, FileText } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-md w-full glass-panel bg-white border border-zinc-200 p-8 text-center space-y-6 shadow-xl rounded-none relative overflow-hidden">
      {/* Dynamic Aesthetic Line top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

      {/* Premium Bouncing Success Emblem */}
      <div className="flex justify-center pt-2">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[2.5]" />
        </div>
      </div>

      {/* Main Title Headers */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-600 font-display">
          Thank you!
        </h1>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-900 font-sans">
          Your order has been successfully placed.
        </h2>
        {orderId && (
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider pt-1">
            Reference ID: <span className="text-zinc-800 font-black">{orderId}</span>
          </p>
        )}
      </div>

      <div className="w-full h-px bg-zinc-150" />

      {/* Narrative Section */}
      <div className="space-y-2.5 text-xs text-zinc-550 leading-relaxed font-medium">
        <p>
          We are currently preparing your customized streetwear drop. Every piece is handcrafted with absolute precision to match your bespoke canvas alignments.
        </p>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
          Fulfillment updates and invoice details are available in your profile.
        </p>
      </div>

      {/* Dynamic CTA Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-xs uppercase font-extrabold tracking-widest transition-all duration-200 shadow-md cursor-pointer rounded-none flex items-center justify-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Monitor fulfillment</span>
        </button>

        <button
          onClick={() => router.push("/shop")}
          className="w-full py-3 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs uppercase font-extrabold tracking-widest transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-32 pb-20 flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="text-center p-8 text-xs uppercase font-bold text-zinc-400 tracking-wider">
          Loading receipt details...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
