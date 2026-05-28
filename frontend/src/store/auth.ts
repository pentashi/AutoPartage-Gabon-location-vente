import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, User } from "@/lib/types";

type AuthState = {
  user: User | null;
  role: Role | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user, role: user?.role ?? null })
    }),
    {
      name: 'auth-storage', // unique name
    }
  )
);
