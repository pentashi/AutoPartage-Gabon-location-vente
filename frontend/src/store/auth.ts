import { create } from "zustand";
import { Role, User } from "@/lib/types";

type AuthState = {
  user: User | null;
  role: Role | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user, role: user?.role ?? null })
}));
