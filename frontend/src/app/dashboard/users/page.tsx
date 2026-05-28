"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { toast } from "sonner";
import { 
  UserPlus, 
  Users as UsersIcon, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  XCircle,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  { value: "SUPER_ADMIN", label: "Super Admin", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
  { value: "ADMIN", label: "Admin", color: "text-blue-600 bg-blue-50", dot: "bg-blue-500" },
  { value: "FLEET", label: "Gestion Flotte", color: "text-indigo-600 bg-indigo-50", dot: "bg-indigo-500" },
  { value: "ACCOUNTANT", label: "Comptable", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  { value: "GARAGE", label: "Garage", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  { value: "DRIVER", label: "Chauffeur", color: "text-slate-600 bg-slate-50", dot: "bg-slate-500" },
];

export default function UsersPage() {
  const { role: currentUserRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const { data = [], isLoading } = useQuery({ 
    queryKey: ["users"], 
    queryFn: api.users 
  });

  const createMutation = useMutation({
    mutationFn: (newUser: any) => api.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé avec succès");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur de création", { description: err.message });
    }
  });

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("ADMIN");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ fullName, email, password, role });
  };

  if (currentUserRole !== "SUPER_ADMIN" && currentUserRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Accès non autorisé</h2>
        <p>Seuls les administrateurs peuvent gérer les utilisateurs.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Utilisateurs</h1>
          <p className="text-slate-500 text-sm">Gérez les accès et les rôles de votre équipe</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold">{data.length}</div>
          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-semibold">Membres</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold text-emerald-600">{data.filter((u: any) => u.isActive).length}</div>
          <p className="text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider font-semibold">Actifs</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold text-red-600">{data.filter((u: any) => !u.isActive).length}</div>
          <p className="text-[10px] md:text-xs text-red-600 uppercase tracking-wider font-semibold">Inactifs</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Membre</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                data.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs md:text-sm shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate text-sm md:text-base">{user.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                        roles.find(r => r.value === user.role)?.color || "bg-slate-100 text-slate-700"
                      )}>
                        {roles.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          user.isActive ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className="text-[11px] md:text-xs text-slate-600 font-medium">{user.isActive ? "Actif" : "Inactif"}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900">Nouvel utilisateur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 md:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom complet</label>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Ex: Marcelle Mba"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="nom@autopartage.ga"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe provisoire</label>
                <input
                  required
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle assigné</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
