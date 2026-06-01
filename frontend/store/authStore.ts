import { create } from "zustand";

export interface UserAddress {
  name: string;
  address_line: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  addresses: string; // raw json string
  wishlist: string;  // raw json string
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if in client environment
  const isClient = typeof window !== "undefined";
  const savedToken = isClient ? localStorage.getItem("kora_token") : null;
  const savedUser = isClient ? localStorage.getItem("kora_user") : null;

  return {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: !!savedToken,
    
    login: (token, user) => {
      if (isClient) {
        localStorage.setItem("kora_token", token);
        localStorage.setItem("kora_user", JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },
    
    logout: () => {
      if (isClient) {
        localStorage.removeItem("kora_token");
        localStorage.removeItem("kora_user");
      }
      set({ token: null, user: null, isAuthenticated: false });
    },
    
    updateUser: (user) => {
      if (isClient) {
        localStorage.setItem("kora_user", JSON.stringify(user));
      }
      set({ user });
    }
  };
});
