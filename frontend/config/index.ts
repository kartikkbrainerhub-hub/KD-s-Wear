// Global configurations pulled from .env.local on client/server loads
export const API_BASE = typeof window !== "undefined" && window.location.hostname
  ? `http://${window.location.hostname}:8001`
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001");

// Public Sandbox Key defaults for Razorpay triggers
export const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo12345";
