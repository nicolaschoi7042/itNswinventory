import { create } from "zustand";
import type { Role, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedToken = localStorage.getItem("inventory_token");
  let savedUser: User | null = null;
  try {
    const raw = localStorage.getItem("inventory_user");
    if (raw) savedUser = JSON.parse(raw);
  } catch { /* ignore */ }

  return {
    user: savedUser,
    token: savedToken,

    setAuth: (user, token) => {
      localStorage.setItem("inventory_token", token);
      localStorage.setItem("inventory_user", JSON.stringify(user));
      set({ user, token });
    },

    logout: () => {
      localStorage.removeItem("inventory_token");
      localStorage.removeItem("inventory_user");
      set({ user: null, token: null });
    },

    isAdmin: () => get().user?.role === "admin",
    isManager: () => {
      const role = get().user?.role;
      return role === "admin" || role === "manager";
    },
    hasRole: (role) => {
      const userRole = get().user?.role;
      if (userRole === "admin") return true;
      if (userRole === "manager" && role !== "admin") return true;
      return userRole === role;
    },
  };
});
