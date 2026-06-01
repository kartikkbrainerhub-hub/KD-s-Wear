import { create } from "zustand";

export interface CartItem {
  product_id: string;
  title: string;
  image: string;
  custom_design_id?: string;
  canvas_preview?: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface CouponData {
  code: string;
  discount_type: "percentage" | "flat";
  value: number;
  min_order_amount: number;
}

interface CartState {
  items: CartItem[];
  coupon: CouponData | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  applyCoupon: (coupon: CouponData | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getBundleDiscount: () => number;
  getDiscount: () => number;
  getGST: () => number;
  getShipping: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  const isClient = typeof window !== "undefined";
  const savedCart = isClient ? localStorage.getItem("kora_cart") : null;

  const saveCart = (items: CartItem[]) => {
    if (isClient) {
      localStorage.setItem("kora_cart", JSON.stringify(items));
    }
  };

  return {
    items: savedCart ? JSON.parse(savedCart) : [],
    coupon: null,
    
    addToCart: (newItem) => {
      const { items } = get();
      
      // Check if item with same ID, size, and color already exists
      const existingIndex = items.findIndex(
        (item) => 
          item.product_id === newItem.product_id && 
          item.size === newItem.size && 
          item.color === newItem.color &&
          item.custom_design_id === newItem.custom_design_id
      );
      
      let updatedItems = [...items];
      if (existingIndex > -1) {
        updatedItems[existingIndex].quantity += newItem.quantity;
      } else {
        updatedItems.push(newItem);
      }
      
      saveCart(updatedItems);
      set({ items: updatedItems });
    },
    
    removeFromCart: (index) => {
      const { items } = get();
      const updatedItems = items.filter((_, i) => i !== index);
      saveCart(updatedItems);
      set({ items: updatedItems });
    },
    
    updateQuantity: (index, quantity) => {
      const { items } = get();
      if (quantity <= 0) return;
      const updatedItems = [...items];
      updatedItems[index].quantity = quantity;
      saveCart(updatedItems);
      set({ items: updatedItems });
    },
    
    applyCoupon: (coupon) => {
      set({ coupon });
    },
    
    clearCart: () => {
      saveCart([]);
      set({ items: [], coupon: null });
    },
    
    getSubtotal: () => {
      return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getBundleDiscount: () => {
      const items = get().items;
      const customTeesCount = items
        .filter(item => item.product_id === "custom-tshirt-canvas" || !!item.custom_design_id)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (customTeesCount === 2) {
        return items
          .filter(item => item.product_id === "custom-tshirt-canvas" || !!item.custom_design_id)
          .reduce((sum, item) => sum + (item.price * item.quantity * 0.10), 0);
      } else if (customTeesCount >= 3) {
        return items
          .filter(item => item.product_id === "custom-tshirt-canvas" || !!item.custom_design_id)
          .reduce((sum, item) => sum + (item.price * item.quantity * 0.20), 0);
      }
      return 0.0;
    },
    
    getDiscount: () => {
      const subtotal = get().getSubtotal();
      const { coupon } = get();
      let couponDiscount = 0.0;
      
      if (coupon && subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === "percentage") {
          couponDiscount = subtotal * (coupon.value / 100.0);
        } else {
          couponDiscount = coupon.value;
        }
      }
      
      const bundleDiscount = get().getBundleDiscount();
      return couponDiscount + bundleDiscount;
    },
    
    getGST: () => {
      const subtotal = get().getSubtotal();
      const discount = get().getDiscount();
      const taxedTotal = Math.max(0.0, subtotal - discount);
      return taxedTotal * 0.18; // 18% GST
    },
    
    getShipping: () => {
      const subtotal = get().getSubtotal();
      const discount = get().getDiscount();
      const finalAmount = Math.max(0.0, subtotal - discount);
      if (finalAmount === 0.0) return 0.0;
      return finalAmount >= 999.0 ? 0.0 : 49.0; // Free above Rs. 999
    },
    
    getGrandTotal: () => {
      const subtotal = get().getSubtotal();
      const discount = get().getDiscount();
      const gst = get().getGST();
      const shipping = get().getShipping();
      return Math.round((subtotal - discount) + gst + shipping);
    }
  };
});
