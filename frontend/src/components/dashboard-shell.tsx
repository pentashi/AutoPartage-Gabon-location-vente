"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { role, setUser } = useAuthStore();

  const logout = async () => {
    await api.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="font-semibold">AutoPartage Admin</div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard/users">Utilisateurs</Link>
            <Link href="/dashboard/vehicles">Véhicules</Link>
            <Link href="/dashboard/drivers">Chauffeurs</Link>
            <Link href="/dashboard/contracts">Contrats</Link>
            <Link href="/dashboard/payments">Paiements</Link>
            <Link href="/dashboard/gps">GPS</Link>
            <Link href="/dashboard/maintenance">Maintenance</Link>
            <Link href="/dashboard/notifications">Notifications</Link>
            <span className="rounded bg-slate-100 px-2 py-1">{role ?? "No role"}</span>
            <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
