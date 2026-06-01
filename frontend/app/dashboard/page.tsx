"use client";
 
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, UserProfile } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Mail, Lock, User, Phone, ClipboardList, Settings, MapPin, Palette, LogOut, CheckCircle2, Eye, EyeOff, Trash2, Plus, X, AlertTriangle, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { API_BASE } from "@/config";
 
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
  return match ? match.hex : "#f4f4f7";
};
 
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const { addToCart } = useCartStore();
  
  // Tab switcher
  const [activeTab, setActiveTab] = useState<"orders" | "designs" | "profile">("orders");
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect admin users to the dedicated administrative dashboard
  useEffect(() => {
    if (mounted && isAuthenticated && user?.role === "admin") {
      router.push("/admin");
    }
  }, [mounted, isAuthenticated, user, router]);
  
  const mode = searchParams.get("mode");
 
  useEffect(() => {
    if (mode === "register" || mode === "signup") {
      setIsLogin(false);
    } else if (mode === "login") {
      setIsLogin(true);
    }
  }, [mode]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
 
  // Dashboard Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [designsLoading, setDesignsLoading] = useState(true);
 
  // Add Address form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [consigneeName, setConsigneeName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
 
  // Form handle for registration or login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
 
    const url = isLogin 
      ? `${API_BASE}/api/auth/login` 
      : `${API_BASE}/api/auth/signup`;
 
    const body = isLogin 
      ? JSON.stringify({ email, password }) 
      : JSON.stringify({ email, password, name, phone });
 
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
 
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed.");
      }
 
      const data = await res.json();
      login(data.access_token, data.user);
      
      // Redirect if requested
      if (redirect === "checkout") {
        router.push("/checkout");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };
 
  // Load User Data (Orders, Designs)
  useEffect(() => {
    if (!isAuthenticated || !token) return;
 
    // Load Orders
    setOrdersLoading(true);
    fetch(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch(() => {
        // Fallback demo order
        setOrders([
          {
            id: "order_mock102",
            total_amount: 1798.0,
            order_status: "Processing",
            payment_status: "Paid",
            payment_method: "Razorpay",
            created_at: new Date().toISOString(),
            items: JSON.stringify([
              { title: "Neon Overdrive Oversized Graphic Tee", quantity: 1, size: "M", color: "#2e2e2e", price: 999 },
              { title: "Custom Off White Heavyweight Tee", quantity: 1, size: "M", color: "#f4f4f7", price: 799 }
            ]),
            shipping_address: JSON.stringify({ name: "User Profile", address_line: "Bldg 4, Sector 7", city: "Mumbai", state: "MH", zip_code: "400001" })
          }
        ]);
      })
      .finally(() => setOrdersLoading(false));
 
    // Load Designs
    setDesignsLoading(true);
    fetch(`${API_BASE}/api/designs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setDesigns(data))
      .catch(() => setDesigns([]))
      .finally(() => setDesignsLoading(false));
 
  }, [isAuthenticated, token]);
 
  const handleLogout = () => {
    logout();
    router.push("/");
  };
 
  const getStatusStep = (status: string) => {
    const steps = ["Pending", "Processing", "Printed", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };
 
  // Handle Address form submit
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setAddressSaving(true);
 
    try {
      const res = await fetch(`${API_BASE}/api/auth/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: consigneeName || user?.name || "Consignee",
          address_line: addressLine,
          city,
          state: stateName,
          zip_code: zipCode,
          is_default: isDefault
        })
      });
 
      if (!res.ok) {
        throw new Error("Failed to save shipping address details.");
      }
 
      const updatedUser = await res.json();
      updateUser(updatedUser);
      
      // Reset form fields
      setAddressLine("");
      setCity("");
      setStateName("");
      setZipCode("");
      setConsigneeName("");
      setShowAddForm(false);
    } catch (err: any) {
      setAddressError(err.message || "Could not connect to authentication services.");
    } finally {
      setAddressSaving(false);
    }
  };
 
  const handleDeleteAddress = async (index: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/address/${index}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
 
      if (!res.ok) throw new Error();
      const updatedUser = await res.json();
      updateUser(updatedUser);
    } catch(e) {
      alert("Failed to delete shipping destination.");
    }
  };
 
  const executeDeleteDesign = async (designId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/designs/${designId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error();
      
      // Update local state reactively
      setDesigns((prev) => prev.filter((d) => d.id !== designId));
    } catch(e) {
      alert("Failed to delete this saved custom template.");
    }
  };
 
  const handleDeleteSavedDesign = (designId: string) => {
    setDeleteTargetId(designId);
  };

  const handleAddToCart = (ds: any) => {
    setCartStatus(ds.id);
    addToCart({
      product_id: "custom-tshirt-canvas",
      title: ds.title || `Custom Canvas Tee`,
      image: ds.preview_image_url,
      custom_design_id: ds.id,
      canvas_preview: ds.preview_image_url,
      quantity: 1,
      size: "M",
      color: getShirtHex(ds.shirt_color),
      price: ds.price || 899.00
    });
    
    setTimeout(() => {
      setCartStatus(null);
    }, 1000);
  };
 
  // --- PREVENT HYDRATION MISMATCH ---
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-36 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Loading Account...</p>
        </div>
      </main>
    );
  }
 
  // --- RENDERING AUTHENTICATION FORM IF NOT LOGGED IN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-36 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="glass-panel p-8 rounded-none border border-zinc-200 bg-white space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-wider text-zinc-950 font-serif">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
                {isLogin ? "Login to track custom drops" : "Join the fashion designers guild"}
              </p>
            </div>
 
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs py-2 px-3 rounded-none text-center font-semibold">
                {authError}
              </div>
            )}
 
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fcfcfd] border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                        required
                      />
                      <User className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                    </div>
                  </div>
  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Phone</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="9876543210" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fcfcfd] border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                        required
                      />
                      <Phone className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </>
              )}
 
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fcfcfd] border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                    required
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-[#fcfcfd] border border-zinc-200 rounded-none text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#7a1c27]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-650 transition-colors focus:outline-none flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
 
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest rounded-none transition-all flex items-center justify-center shadow-md"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isLogin ? "Authenticate Account" : "Register Credentials"}</span>
                )}
              </button>
            </form>
 
            <div className="text-center pt-2">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                {isLogin ? "Create custom design guild profile" : "Already registered? Login here"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
 
  // Parse addresses array safely
  let addressList: any[] = [];
  try {
    if (user?.addresses) {
      addressList = JSON.parse(user.addresses);
    }
  } catch(e) {}
 
  // --- RENDERING USER DASHBOARD IF LOGGED IN ---
  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDE BAR NAVIGATION SELECTORS */}
        <div className="space-y-6">
          <div className="border border-zinc-200 bg-white p-6 space-y-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-zinc-950 text-white font-serif flex items-center justify-center text-lg font-black border border-zinc-950">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3 className="font-extrabold uppercase text-xs text-zinc-900 truncate font-serif">{user?.name}</h3>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold truncate">{user?.email}</p>
              </div>
            </div>
            
            <div className="inline-block text-[8px] font-black uppercase text-[#7a1c27] bg-[#7a1c27]/5 border border-[#7a1c27]/10 px-2.5 py-0.5 tracking-wider">
              {user?.role === "admin" ? "🔑 Guild Executive" : "🎨 Streetwear Designer"}
            </div>
 
            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2.5 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center space-x-2 py-2 text-left hover:text-[#7a1c27] transition-colors ${activeTab === "orders" ? "text-[#7a1c27] font-black border-l-2 border-[#7a1c27] pl-2" : ""}`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Order History</span>
              </button>
              <button 
                onClick={() => setActiveTab("designs")}
                className={`flex items-center space-x-2 py-2 text-left hover:text-[#7a1c27] transition-colors ${activeTab === "designs" ? "text-[#7a1c27] font-black border-l-2 border-[#7a1c27] pl-2" : ""}`}
              >
                <Palette className="w-4 h-4" />
                <span>Saved Designs</span>
              </button>
              <button 
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-2 py-2 text-left hover:text-[#7a1c27] transition-colors ${activeTab === "profile" ? "text-[#7a1c27] font-black border-l-2 border-[#7a1c27] pl-2" : ""}`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 py-2 text-left hover:text-rose-700 text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
 
        {/* MAIN SELECTED TAB CONTENTS */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900 font-display font-serif border-b border-zinc-200 pb-3">Your Order History</h2>
              
              {ordersLoading ? (
                <div className="h-40 bg-zinc-100 animate-pulse" />
              ) : orders.length === 0 ? (
                <div className="border border-zinc-200 bg-white p-12 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase text-zinc-800 tracking-widest">No order history available</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Start designing custom drops to request premium checkout options.</p>
                  </div>
                  <button 
                    onClick={() => router.push("/customize")}
                    className="px-6 py-2.5 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    🎨 Open Design Studio
                  </button>
                </div>
              ) : (
                orders.map((ord: any) => (
                  <div key={ord.id} className="border border-zinc-200 bg-white p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs border-b border-zinc-100 pb-3 gap-2 uppercase tracking-wider font-bold">
                      <div>
                        <span className="text-zinc-400">Order ID:</span>
                        <strong className="text-zinc-950 ml-1 font-extrabold font-mono">{ord.id}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Total Amount:</span>
                        <strong className="text-[#7a1c27] font-black ml-1 font-mono">₹{ord.total_amount}.00</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Payment:</span>
                        <span className="text-zinc-700 ml-1 font-semibold">{ord.payment_status} ({ord.payment_method})</span>
                      </div>
                    </div>
 
                    {/* Progress tracking bars */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-zinc-450">
                        {["Pending", "Processing", "Printed", "Shipped", "Delivered"].map((st, i) => {
                          const active = i <= getStatusStep(ord.order_status);
                          return (
                            <span key={st} className={active ? "text-[#7a1c27] font-black" : ""}>
                              {st}
                            </span>
                          );
                        })}
                      </div>
                      <div className="h-1 bg-zinc-100 overflow-hidden flex">
                        {[0, 1, 2, 3].map((idx) => {
                          const currentStep = getStatusStep(ord.order_status);
                          const active = idx < currentStep;
                          return (
                            <div 
                              key={idx} 
                              className={`flex-grow h-full border-r border-white/40 ${active ? "bg-[#7a1c27]" : "bg-transparent"}`} 
                            />
                          );
                        })}
                      </div>
                    </div>
 
                    {/* Items Purchased List */}
                    <div className="space-y-2 pt-4">
                      {JSON.parse(ord.items || "[]").map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs text-zinc-550 uppercase tracking-wider font-bold">
                          <span>{item.title} (Size: {item.size} • Qty: {item.quantity})</span>
                          <span className="font-black text-zinc-900 font-mono">₹{item.price * item.quantity}.00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
  
          {/* DESIGNS TAB */}
          {activeTab === "designs" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900 font-display font-serif border-b border-zinc-200 pb-3">Your Saved Canvas Projects</h2>
 
              {designsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-zinc-150 animate-pulse" />
                  ))}
                </div>
              ) : designs.length === 0 ? (
                <div className="border border-zinc-200 bg-white p-12 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Palette className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase text-zinc-800 tracking-widest">No saved designs yet</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Craft custom streetwear artwork inside the customization sandbox.</p>
                  </div>
                  <button 
                    onClick={() => router.push("/customize")}
                    className="px-6 py-2.5 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    🎨 Start Customizing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {designs.map((ds: any) => {
                    const designHex = getShirtHex(ds.shirt_color);
                    const isCartSuccess = cartStatus === ds.id;
                    
                    return (
                      <div key={ds.id} className="group overflow-hidden flex flex-col border border-zinc-200 bg-white hover:border-[#7a1c27] hover:shadow-lg transition-all p-3">
                        
                        {/* Media container matching aspect-1/1 and hover styling */}
                        <div 
                          className="aspect-[1/1] w-full relative flex items-center justify-center p-4 transition-colors select-none overflow-hidden"
                          style={{ backgroundColor: designHex }}
                        >
                          <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none select-none z-0" viewBox="0 0 100 100">
                            <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.4" />
                            <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" />
                          </svg>

                          <div className="w-[62%] aspect-[4/5] relative z-10 flex items-center justify-center">
                            <img src={ds.preview_image_url} alt="" className="h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500" />
                          </div>

                          {/* Floating Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <span className="text-[8px] font-black uppercase text-[#7a1c27] bg-[#f5f2eb] border border-[#7a1c27]/20 px-2 py-0.5 tracking-widest shadow-sm">
                              Saved Canvas
                            </span>
                          </div>

                          {/* HOVER QUICK ACTIONS */}
                          <div className="absolute inset-0 bg-[#7a1c27]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-20">
                            {/* Add to Cart */}
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart({
                                  id: ds.id,
                                  title: `Saved Custom Tee (${ds.shirt_color})`,
                                  shirt_color: ds.shirt_color,
                                  preview_image_url: ds.preview_image_url,
                                  price: 899.00
                                });
                              }}
                              className={`p-3 text-white rounded-none shadow-lg transition-transform hover:scale-105 flex items-center justify-center ${isCartSuccess ? "bg-green-600" : "bg-[#7a1c27] hover:bg-[#8e2430]"}`}
                              title="Add to Bag"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>

                            {/* Edit / Remix in Studio */}
                            <button 
                              onClick={() => router.push(`/customize?design_id=${ds.id}`)}
                              className="p-3 bg-white hover:bg-zinc-50 text-zinc-950 rounded-none shadow-lg transition-transform hover:scale-105 flex items-center justify-center border border-zinc-200"
                              title="Edit in Studio"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button 
                              onClick={() => handleDeleteSavedDesign(ds.id)}
                              className="p-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-none shadow-lg transition-transform hover:scale-105 flex items-center justify-center border border-zinc-200"
                              title="Delete Design"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Info Footer */}
                        <div className="pt-3 pb-1 flex-grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-xs uppercase font-extrabold text-zinc-900 tracking-wider font-display truncate group-hover:text-[#7a1c27] transition-colors">
                              Custom T-Shirt Design
                            </h4>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">
                              {new Date(ds.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 mt-2.5 text-[9px] font-bold uppercase tracking-wider text-zinc-450">
                            <span>Fabric: <span className="text-zinc-650 font-extrabold">{ds.shirt_color}</span></span>
                            <span className="text-[#7a1c27] font-mono font-black">₹899.00</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
 
          {/* PROFILE SETTINGS TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900 font-display font-serif border-b border-zinc-200 pb-3">Profile Configurations</h2>
              
              <div className="border border-zinc-200 bg-white p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-150 pb-4 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase text-zinc-800 tracking-widest font-serif">Shipping Address List</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal uppercase font-bold tracking-wider">
                      Management of default destinations for instant coupon calculations.
                    </p>
                  </div>
 
                  <button 
                    onClick={() => {
                      setConsigneeName(user?.name || "");
                      setShowAddForm(!showAddForm);
                    }}
                    className="px-3 py-1.5 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center space-x-1.5 transition-all shadow-sm self-start sm:self-center"
                  >
                    {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{showAddForm ? "Cancel Form" : "Add Address"}</span>
                  </button>
                </div>
 
                {/* Dynamically Render Address addition form */}
                {showAddForm && (
                  <form onSubmit={handleSaveAddress} className="bg-[#f5f2eb] p-5 border border-zinc-200 space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-[#7a1c27] tracking-widest border-b border-zinc-200/50 pb-2">
                      New Consignee Destination
                    </h5>
 
                    {addressError && (
                      <p className="text-[10px] text-rose-700 uppercase font-black">{addressError}</p>
                    )}
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Consignee Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Kartik Dev" 
                          value={consigneeName}
                          onChange={(e) => setConsigneeName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#7a1c27]"
                          required
                        />
                      </div>
 
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Address Line / Landmark</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Flat 301, Regency Tower" 
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#7a1c27]"
                          required
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">City</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mumbai" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#7a1c27]"
                          required
                        />
                      </div>
 
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">State</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Maharashtra" 
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#7a1c27]"
                          required
                        />
                      </div>
 
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Zip Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 400001" 
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#7a1c27]"
                          required
                        />
                      </div>
                    </div>
 
                    <div className="flex items-center space-x-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="is_default"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded-none border-zinc-300 accent-[#7a1c27]"
                      />
                      <label htmlFor="is_default" className="text-[9px] uppercase font-extrabold text-zinc-500 tracking-wider cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>
 
                    <button 
                      type="submit" 
                      disabled={addressSaving}
                      className="w-full py-3 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-[10px] font-extrabold uppercase tracking-widest transition-all flex items-center justify-center shadow-md"
                    >
                      {addressSaving ? "Saving Destination..." : "Save Shipping Destination"}
                    </button>
                  </form>
                )}
 
                {/* Address entries rendering */}
                <div className="space-y-3">
                  {addressList.length === 0 ? (
                    <div className="border border-zinc-200 bg-[#fcfcfd] p-4 text-xs flex justify-between items-center text-zinc-550 font-medium">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-[#7a1c27] animate-pulse" />
                        <span className="uppercase font-bold tracking-wider text-[10px]">No destinations added yet. Add your default address parameters.</span>
                      </div>
                    </div>
                  ) : (
                    addressList.map((addr: any, index: number) => (
                      <div key={index} className="border border-zinc-200 bg-[#fcfcfd] p-4 flex justify-between items-start text-xs text-zinc-800 font-bold uppercase tracking-wider">
                        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-extrabold text-[#7a1c27] font-serif">{addr.name}</span>
                            {addr.is_default && (
                              <span className="text-[8px] font-black uppercase text-[#7a1c27] bg-[#7a1c27]/5 border border-[#7a1c27]/10 px-2 py-0.5 tracking-widest">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-normal">
                            {addr.address_line}, {addr.city}, {addr.state} - <span className="font-mono text-zinc-700">{addr.zip_code}</span>
                          </p>
                        </div>
 
                        <button 
                          onClick={() => handleDeleteAddress(index)}
                          className="text-zinc-400 hover:text-rose-700 transition-colors p-1"
                          title="Delete Shipping Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
 
        </div>
 
      </div>
 
      {/* Premium Confirmation warning Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#faf8f5] border-2 border-[#7a1c27] p-6 text-center shadow-2xl relative space-y-6 rounded-none">
            
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
 
            <div className="space-y-2">
              <h3 className="text-sm uppercase font-extrabold tracking-widest text-[#7a1c27] font-serif">
                Delete Custom Template?
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                This custom canvas streetwear design will be permanently erased. This action cannot be undone.
              </p>
            </div>
 
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-100 text-[10px] uppercase font-black tracking-widest text-zinc-650 transition-colors rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetId = deleteTargetId;
                  setDeleteTargetId(null);
                  if (targetId) {
                    await executeDeleteDesign(targetId);
                  }
                }}
                className="flex-1 py-2.5 bg-[#7a1c27] hover:bg-[#5b151d] text-[10px] uppercase font-black tracking-widest text-white transition-colors rounded-none shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
 
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center text-zinc-500 space-y-3 font-sans">
        <div className="w-8 h-8 border border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#7a1c27]">Loading Account Dashboard...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
