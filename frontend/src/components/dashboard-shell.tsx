"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Role } from "@/lib/types";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  FileText, 
  CreditCard, 
  MapPin, 
  Wrench, 
  AlertTriangle, 
  Bell, 
  LogOut,
  ChevronLeft,
  Menu,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NavLink {
  href: string;
  label: string;
  icon: any;
  roles: Role[];
}

const navLinks: NavLink[] = [
  { 
    href: "/dashboard/overview", 
    label: "Vue d'ensemble", 
    icon: LayoutDashboard,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET, Role.ACCOUNTANT] 
  },
  { 
    href: "/dashboard/users", 
    label: "Utilisateurs", 
    icon: Users,
    roles: [Role.SUPER_ADMIN, Role.ADMIN] 
  },
  { 
    href: "/dashboard/vehicles", 
    label: "Véhicules", 
    icon: Car,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET] 
  },
  { 
    href: "/dashboard/drivers", 
    label: "Chauffeurs", 
    icon: UserCircle,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET] 
  },
  { 
    href: "/dashboard/contracts", 
    label: "Contrats", 
    icon: FileText,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET, Role.ACCOUNTANT] 
  },
  { 
    href: "/dashboard/payments", 
    label: "Paiements", 
    icon: CreditCard,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT] 
  },
  { 
    href: "/dashboard/gps", 
    label: "GPS & Tracking", 
    icon: MapPin,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET] 
  },
  { 
    href: "/dashboard/maintenance", 
    label: "Maintenance", 
    icon: Wrench,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET, Role.GARAGE] 
  },
  { 
    href: "/dashboard/incidents", 
    label: "Incidents", 
    icon: AlertTriangle,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FLEET, Role.DRIVER] 
  },
  { 
    href: "/dashboard/notifications", 
    label: "Notifications", 
    icon: Bell,
    roles: [] // Available to everyone
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, user, setUser } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      toast.success("Déconnexion réussie");
      router.push("/login");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const filteredLinks = navLinks.filter(
    link => !link.roles.length || (role && link.roles.includes(role as Role))
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative flex flex-col border-r bg-white transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <Car className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight text-slate-900 truncate">
                AutoPartage
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-slate-400 shadow-sm hover:text-slate-600"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                title={isCollapsed ? link.label : ""}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-2">
          {!isCollapsed && (
            <div className="mb-4 px-2 py-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{role?.replace("_", " ")}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Déconnexion" : ""}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <div className="flex items-center gap-4">
             <Menu className="h-5 w-5 text-slate-400 md:hidden" />
             <div className="hidden md:block">
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
