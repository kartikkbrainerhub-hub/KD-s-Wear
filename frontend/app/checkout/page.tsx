"use client";
 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { CreditCard, Truck, CheckCircle2, Ticket } from "lucide-react";
import { API_BASE, RAZORPAY_KEY } from "@/config";
 
export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, applyCoupon, getSubtotal, getDiscount, getGST, getShipping, getGrandTotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
 
  // Address states
  const [name, setName] = useState(user?.name || "");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  
  // Custom dropdown & address insertion states
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>("new");
  const [saveToProfile, setSaveToProfile] = useState(false);
  
  // Coupon input
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Razorpay">("COD");
  const [processing, setProcessing] = useState(false);
 
  // Dynamic loading of Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
 
  // Set default shipping address parameters if present in profile settings
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
    if (!user?.addresses) {
      setSavedAddresses([]);
      setSelectedAddressIndex("new");
      return;
    }
    try {
      const parsed = JSON.parse(user.addresses);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSavedAddresses(parsed);
        const defIdx = parsed.findIndex((x: any) => x.is_default);
        const activeIdx = defIdx !== -1 ? defIdx : 0;
        setSelectedAddressIndex(String(activeIdx));
        
        const def = parsed[activeIdx];
        if (def) {
          setAddressLine(def.address_line || "");
          setCity(def.city || "");
          setStateName(def.state || "");
          setZipCode(def.zip_code || "");
          if (def.name) setName(def.name);
        }
      } else {
        setSavedAddresses([]);
        setSelectedAddressIndex("new");
      }
    } catch(e) {
      setSavedAddresses([]);
      setSelectedAddressIndex("new");
    }
  }, [user]);

  const handleAddressSelectChange = (val: string) => {
    setSelectedAddressIndex(val);
    if (val === "new") {
      setName(user?.name || "");
      setAddressLine("");
      setCity("");
      setStateName("");
      setZipCode("");
      setSaveToProfile(true);
    } else {
      const addr = savedAddresses[parseInt(val)];
      if (addr) {
        setName(addr.name || user?.name || "");
        setAddressLine(addr.address_line || "");
        setCity(addr.city || "");
        setStateName(addr.state || "");
        setZipCode(addr.zip_code || "");
      }
    }
  };
 
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    // Call FastAPI coupon checker
    fetch(`${API_BASE}/api/coupons/validate/${couponCode}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        applyCoupon(data);
        alert(`Success! Coupon ${couponCode} applied successfully.`);
      })
      .catch(() => {
        alert("Invalid or expired coupon code.");
      });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine || !city || !stateName || !zipCode || !phone || !email) {
      alert("Please enter full shipping address and contact details.");
      return;
    }
    
    setProcessing(true);
    const shippingAddress = { 
      name, 
      address_line: addressLine, 
      city, 
      state: stateName, 
      zip_code: zipCode,
      phone,
      email 
    };

    if (selectedAddressIndex === "new" && saveToProfile && token) {
      try {
        await fetch(`${API_BASE}/api/auth/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            address_line: addressLine,
            city,
            state: stateName,
            zip_code: zipCode,
            name: name,
            is_default: savedAddresses.length === 0
          })
        });
      } catch (err) {
        console.error("Failed to save address to profile:", err);
      }
    }
 
    try {
      // 1. Send Order to FastAPI Server
      const orderRes = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: JSON.stringify(items.map(i => ({
            product_id: i.product_id,
            title: i.title,
            custom_design_id: i.custom_design_id || null,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            price: i.price
          }))),
          shipping_address: JSON.stringify(shippingAddress),
          coupon_code: coupon?.code || null,
          payment_method: paymentMethod
        })
      });
 
      if (!orderRes.ok) throw new Error("Order creation failed.");
      const orderData = await orderRes.json();
 
      // 2. COD flow
      if (paymentMethod === "COD") {
        clearCart();
        alert("Success! Your Cash on Delivery order has been successfully placed.");
        router.push("/dashboard");
        return;
      }
 
      // 3. Online Razorpay flow
      const options = {
        key: RAZORPAY_KEY, // Central public key
        amount: getGrandTotal() * 100, // in paisa
        currency: "INR",
        name: "KD's Wear",
        description: "Streetwear Apparel Purchase",
        order_id: orderData.razorpay_order_id,
        handler: async (response: any) => {
          // Verify payment on FastAPI backend
          const verifyRes = await fetch(`${API_BASE}/api/orders/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              order_id: orderData.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || "sandbox_bypass_signature"
            })
          });
 
          if (verifyRes.ok) {
            clearCart();
            alert("Payment Verified! Your order is processing.");
            router.push("/dashboard");
          } else {
            alert("Payment verification failed! Check order details.");
          }
        },
        prefill: {
          name: name,
          email: email || user?.email || "",
          contact: phone || user?.phone || ""
        },
        theme: {
          color: "#7a1c27"
        }
      };
 
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
 
    } catch (err: any) {
      alert(`Checkout Error: ${err.message || "Something went wrong"}`);
    } finally {
      setProcessing(false);
    }
  };
 
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f5] pt-36 text-center text-zinc-500 font-serif">
        <p className="mb-4 text-xs uppercase tracking-widest font-extrabold text-[#7a1c27]">No items in cart for checkout.</p>
        <button onClick={() => router.push("/shop")} className="text-zinc-800 border-b-2 border-zinc-800 pb-0.5 font-bold uppercase text-[10px] tracking-widest hover:text-[#7a1c27] hover:border-[#7a1c27] transition-all">
          Browse Catalog
        </button>
      </main>
    );
  }
 
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: SHIPPING ADDRESS & BILLING FORMS */}
        <form onSubmit={handleOrderSubmit} className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-200 bg-white p-8 rounded-none space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#7a1c27] border-b border-zinc-200 pb-3 flex items-center space-x-2 font-serif">
              <Truck className="w-5 h-5 text-[#7a1c27]" />
              <span>Shipping Address</span>
            </h3>

            {/* Saved Addresses Dropdown Header Block */}
            {savedAddresses.length > 0 && (
              <div className="bg-[#faf8f5] border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#7a1c27]">Saved Destinations</span>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Select a pre-saved address from your account</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedAddressIndex}
                    onChange={(e) => handleAddressSelectChange(e.target.value)}
                    className="px-3 py-2 bg-white border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 focus:outline-none focus:border-[#7a1c27] rounded-none cursor-pointer max-w-xs"
                  >
                    {savedAddresses.map((addr, idx) => (
                      <option key={idx} value={String(idx)}>
                        {addr.name ? `${addr.name}: ` : ""}{addr.address_line}, {addr.city} {addr.is_default ? "(Default)" : ""}
                      </option>
                    ))}
                    <option value="new">-- USE ANOTHER ADDRESS --</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddressSelectChange("new")}
                    title="Add new address"
                    className="p-2 bg-[#7a1c27] hover:bg-[#8e2430] text-white transition-all flex items-center justify-center font-bold text-sm h-[34px] w-[34px] rounded-none shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Address Line</label>
                <input 
                  type="text" 
                  placeholder="Street details, apartment..."
                  value={addressLine} 
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">City</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">State</label>
                <input 
                  type="text" 
                  value={stateName} 
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">ZIP Code / Postal</label>
                <input 
                  type="text" 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] uppercase font-black text-zinc-450 tracking-wider">Phone / Contact Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-none text-xs text-zinc-950 focus:outline-none focus:border-[#7a1c27]"
                  required
                />
              </div>
            </div>

            {selectedAddressIndex === "new" && token && (
              <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200/60 p-3 mt-4">
                <input 
                  type="checkbox"
                  id="save-profile-address"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#7a1c27] rounded-none cursor-pointer"
                />
                <label htmlFor="save-profile-address" className="text-[9px] uppercase font-black text-zinc-600 tracking-wider cursor-pointer select-none">
                  Save this address destination to my profile for future orders
                </label>
              </div>
            )}
          </div>
 
          {/* Payment method selection */}
          <div className="border border-zinc-200 bg-white p-8 rounded-none space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#7a1c27] border-b border-zinc-200 pb-3 flex items-center space-x-2 font-serif">
              <CreditCard className="w-5 h-5 text-[#7a1c27]" />
              <span>Select Payment Method</span>
            </h3>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-6 border text-left transition-all rounded-none ${paymentMethod === "COD" ? "border-[#7a1c27] bg-[#7a1c27]/5 text-[#7a1c27]" : "border-zinc-200 bg-white hover:border-zinc-350 text-zinc-550"}`}
              >
                <h4 className="font-extrabold text-xs uppercase tracking-widest">Cash on Delivery</h4>
                <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Verify order details & pay at your door step.</p>
              </button>
 
              <button 
                type="button"
                onClick={() => setPaymentMethod("Razorpay")}
                className={`p-6 border text-left transition-all rounded-none ${paymentMethod === "Razorpay" ? "border-[#7a1c27] bg-[#7a1c27]/5 text-[#7a1c27]" : "border-zinc-200 bg-white hover:border-zinc-350 text-zinc-550"}`}
              >
                <h4 className="font-extrabold text-xs uppercase tracking-widest">Razorpay Card/UPI</h4>
                <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Accepts Credit Card, UPI, Netbanking instantly.</p>
              </button>
            </div>
          </div>
 
          <button 
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-[#7a1c27] hover:bg-[#8e2430] disabled:bg-zinc-300 text-white font-extrabold text-xs uppercase tracking-widest rounded-none transition-all flex items-center justify-center space-x-2 shadow-md"
          >
            {processing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Place Order (₹{getGrandTotal()})</span>
              </>
            )}
          </button>
        </form>
 
        {/* RIGHT: ORDER SUMMARY AND DISCOUNT CODES */}
        <div className="space-y-6">
          <div className="border border-zinc-200 bg-white p-8 rounded-none space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#7a1c27] border-b border-zinc-200 pb-3 font-serif">
              Order Summary
            </h3>
 
            {/* Cart listing summary */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs border-b border-zinc-150 pb-3 uppercase tracking-wider font-bold">
                  <div>
                    <h5 className="font-extrabold text-zinc-900 truncate max-w-40">{item.title}</h5>
                    <p className="text-[9px] text-zinc-400 mt-0.5 font-bold">Size: {item.size} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-black text-zinc-950 font-mono">₹{item.price * item.quantity}.00</span>
                </div>
              ))}
            </div>
 
            {/* Coupon field */}
            <form onSubmit={handleApplyCoupon} className="flex items-center space-x-2 border-t border-zinc-150 pt-4">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="PROMO CODE" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-none text-xs text-zinc-900 placeholder-zinc-400 uppercase focus:outline-none focus:border-[#7a1c27]"
                />
                <Ticket className="w-3.5 h-3.5 text-zinc-450 absolute right-3 top-2.5" />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-[#7a1c27] rounded-none shadow-sm"
              >
                Apply
              </button>
            </form>
            
            {coupon && (
              <span className="block text-[8px] text-[#7a1c27] font-black uppercase bg-[#7a1c27]/5 border border-[#7a1c27]/15 px-2.5 py-1 rounded-none w-fit tracking-wider">
                Coupon applied: {coupon.code}
              </span>
            )}
 
            {/* Calculations breakdown */}
            <div className="space-y-2.5 text-[10px] font-bold uppercase tracking-wider border-t border-zinc-150 pt-4 text-zinc-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-800 font-extrabold font-mono">₹{getSubtotal()}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-[#7a1c27] font-extrabold font-mono">- ₹{getDiscount()}.00</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-zinc-800 font-extrabold font-mono">₹{Math.round(getGST())}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-zinc-800 font-extrabold font-mono">{getShipping() === 0 ? "FREE" : `₹${getShipping()}.00`}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-xs font-black text-zinc-950">
                <span>Grand Total</span>
                <span className="text-[#7a1c27] font-black font-mono">₹{getGrandTotal()}.00</span>
              </div>
            </div>
          </div>
        </div>
 
      </div>
    </main>
  );
}
