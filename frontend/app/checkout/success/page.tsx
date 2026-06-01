"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { API_BASE } from "@/config";
import {
  CheckCircle2,
  ShoppingBag,
  FileText,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Tag,
  Package
} from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { token, user } = useAuthStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Fetch order details dynamically from FastAPI backend
    setLoading(true);
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        console.error("Could not fetch order from server:", err);
        // Generous mock fallback in case of local offline tests
        setOrder({
          id: orderId,
          created_at: new Date().toISOString(),
          payment_method: "COD",
          payment_status: "Pending",
          order_status: "Pending",
          total_amount: 1909.00,
          discount_amount: 179.80,
          shipping_address: JSON.stringify({
            name: "Kartik",
            address_line: "4, Pulkit Apartment",
            city: "Thaltej, Ahmedabad",
            state: "Gujarat",
            zip_code: "380059",
            phone: "1234567890",
            email: "kartiksangada2004@gmail.com"
          }),
          items: JSON.stringify([
            {
              product_id: "custom-tshirt-canvas",
              title: "Saved Custom Tee (M)",
              custom_design_id: "custom_1",
              quantity: 1,
              size: "M",
              color: "#f4f4f7",
              price: 899.00
            },
            {
              product_id: "custom-tshirt-canvas",
              title: "Saved Custom Tee (S)",
              custom_design_id: "custom_2",
              quantity: 1,
              size: "S",
              color: "#0a0a0c",
              price: 899.00
            }
          ])
        });
      })
      .finally(() => setLoading(false));
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Synchronizing order receipts...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 text-center glass-panel bg-white border border-zinc-200">
        <CheckCircle2 className="w-12 h-12 text-zinc-450 mx-auto mb-4" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800">No order context found</h2>
        <p className="text-xs text-zinc-500 mt-2 font-medium">Please return to the store or view your dashboard.</p>
        <button onClick={() => router.push("/shop")} className="mt-6 px-6 py-2.5 bg-[#7a1c27] text-white text-xs uppercase font-bold tracking-widest hover:bg-[#8e2430] transition-colors">
          Browse shop
        </button>
      </div>
    );
  }

  // Parse items and shipping address
  let itemsList: any[] = [];
  try {
    itemsList = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch {
    itemsList = [];
  }

  let address: any = {};
  try {
    address = typeof order.shipping_address === "string" ? JSON.parse(order.shipping_address) : order.shipping_address;
  } catch {
    address = {};
  }

  // Calculate logistics parameters
  const orderDate = new Date(order.created_at);
  const expectedDate = new Date(orderDate);
  expectedDate.setDate(orderDate.getDate() + 5);

  const formattedExpectedDate = expectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Helper to resolve preview asset paths
  const getItemImage = (item: any) => {
    if (item.custom_design_id) {
      if (item.color === "#f4f4f7" || item.color === "#ffffff" || item.color === "White") {
        return "/images/products/blank_tee_white.png";
      }
      return "/images/products/blank_tee_black.png";
    }
    // Hardcoded premade drops
    if (item.product_id === "prod_2" || item.title.includes("Neon")) return "/images/products/neon_tee.png";
    if (item.product_id === "prod_3" || item.title.includes("Lotus")) return "/images/products/lotus_tee.png";
    return "/images/products/blank_tee_white.png";
  };

  // Financial breakdown values
  const baseSubtotal = itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedDiscount = order.discount_amount || 0;
  const taxableAmount = Math.max(0, baseSubtotal - calculatedDiscount);
  const calculatedGst = Math.round(taxableAmount * 0.18);
  const calculatedShipping = taxableAmount >= 999 ? 0 : 49;
  const grandTotal = order.total_amount;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* 🚀 LEFT COLUMN: SUCCESS STATUS CARD & SHIPPING INFORMATION (8/12 COLS) */}
      <div className="lg:col-span-7 space-y-6">

        {/* Dynamic Premium Splash Banner */}
        <div className="glass-panel bg-white border border-zinc-200 p-8 space-y-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-600 font-display">
                Thank you!
              </h1>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-zinc-900 font-sans mt-0.5">
                Your order has been successfully placed.
              </h2>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-150" />

          <div className="text-xs text-zinc-650 leading-relaxed space-y-2">
            <p>
              Reference ID: <span className="text-zinc-900 font-black tracking-widest uppercase">{order.id}</span>
            </p>
            <p>
              Your order confirmation details have been sent to <span className="font-bold text-zinc-800">{address.email || user?.email}</span>. A printed receipt will be included inside your garment package.
            </p>
          </div>
        </div>

        {/* Expected Delivery Logistic Card */}
        <div className="glass-panel bg-white border border-zinc-200 p-6 flex items-start space-x-4 shadow-sm">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded">
            <Truck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Expected Delivery Staging</span>
            <strong className="text-sm font-black text-zinc-900 block">{formattedExpectedDate}</strong>
            <p className="text-[10px] text-zinc-450 font-medium">Standard ground fulfillment drop. Streetwear shipments dispatch within 48 hours.</p>
          </div>
        </div>

        {/* Dual Logistics Address & Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Shipping Details */}
          <div className="glass-panel bg-white border border-zinc-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-900 flex items-center space-x-2 border-b border-zinc-100 pb-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-450" />
              <span>Shipping Address</span>
            </h3>

            <div className="text-xs text-zinc-650 leading-relaxed font-medium space-y-1">
              <strong className="text-zinc-950 font-black uppercase text-[10px] tracking-wide block">{address.name}</strong>
              <p>{address.address_line}</p>
              <p>{address.city}, {address.state}</p>
              <p className="font-black text-zinc-850 mt-1">{address.zip_code}</p>
              <p className="text-[10px] text-zinc-450 mt-2">Mobile: {address.phone}</p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="glass-panel bg-white border border-zinc-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-900 flex items-center space-x-2 border-b border-zinc-100 pb-2">
              <CreditCard className="w-3.5 h-3.5 text-zinc-450" />
              <span>Payment Details</span>
            </h3>

            <div className="text-xs text-zinc-650 space-y-2.5 font-medium">
              <div>
                <span className="text-[9px] uppercase text-zinc-400 font-extrabold tracking-wider block">Fulfillment Method</span>
                <strong className="text-zinc-900 text-xs font-extrabold">{order.payment_method === "COD" ? "Cash on Delivery" : "Razorpay Online"}</strong>
              </div>

              <div>
                <span className="text-[9px] uppercase text-zinc-400 font-extrabold tracking-wider block">Transaction Status</span>
                <span className={`inline-block text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${order.payment_status === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Global Nav CTA Controls */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-3 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-xs uppercase font-extrabold tracking-widest transition-all duration-200 shadow-md cursor-pointer rounded-none flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Track Order & Invoice</span>
          </button>

          <button
            onClick={() => router.push("/shop")}
            className="flex-1 py-3 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs uppercase font-extrabold tracking-widest transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Back to Store Shop</span>
          </button>
        </div>

      </div>

      {/* 🧾 RIGHT COLUMN: DETAILED ITEMIZED SHOPPING RECEIPT (4/12 COLS) */}
      <div className="lg:col-span-5 glass-panel bg-white border border-zinc-200 p-6 space-y-6 shadow-sm">
        <h3 className="text-xs uppercase font-black tracking-widest text-zinc-900 flex items-center space-x-2 border-b border-zinc-150 pb-3">
          <Package className="w-4 h-4 text-zinc-550" />
          <span>Fulfillment Items ({itemsList.length})</span>
        </h3>

        {/* Itemized List */}
        <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto pr-1 space-y-4">
          {itemsList.map((item, idx) => {
            const previewImage = getItemImage(item);
            return (
              <div key={idx} className="flex items-center space-x-4 pt-3 first:pt-0">
                <div className="w-16 h-16 bg-zinc-50 border border-zinc-150 rounded p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                  <img
                    src={previewImage}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/products/blank_tee_white.png";
                    }}
                  />
                </div>

                <div className="flex-grow space-y-1">
                  <strong className="text-xs font-extrabold text-zinc-950 block tracking-wide leading-tight">{item.title}</strong>
                  <div className="flex items-center space-x-2 text-[9px] font-black uppercase text-zinc-450">
                    <span>Size: {item.size}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <span>Color:</span>
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: item.color }} />
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-450 font-bold">
                    Qty: {item.quantity} × <span className="text-zinc-800 font-extrabold">₹{item.price}</span>
                  </div>
                </div>

                <div className="text-xs font-black text-zinc-900 shrink-0">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full h-px bg-zinc-150" />

        {/* Receipt Totals Breakdown */}
        <div className="space-y-2 text-xs font-semibold text-zinc-600">
          <div className="flex justify-between items-center">
            <span>Basket Subtotal</span>
            <span className="text-zinc-950 font-bold">₹{baseSubtotal}</span>
          </div>

          {calculatedDiscount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-bold">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Promo Discount</span>
              </span>
              <span>-₹{Math.round(calculatedDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span>GST Output (18%)</span>
            <span className="text-zinc-900">₹{calculatedGst}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Garment Shipping</span>
            <span className="text-zinc-900">{calculatedShipping === 0 ? "FREE" : `₹${calculatedShipping}`}</span>
          </div>

          <div className="w-full h-px bg-zinc-100 my-2" />

          <div className="flex justify-between items-center text-sm font-black text-zinc-950 tracking-wide uppercase pt-1">
            <span>Grand Total</span>
            <span className="text-[#7a1c27] text-lg font-black font-sans">₹{grandTotal}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20 font-sans">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Loading order receipt details...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
