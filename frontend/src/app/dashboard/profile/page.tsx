"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { User, Mail, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.updateUser(user!.id, payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success("Profil mis à jour");
      setPassword("");
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error("Erreur de mise à jour", { description: err.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { fullName };
    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("Le mot de passe doit faire au moins 6 caractères");
        return;
      }
      payload.password = newPassword;
    }
    updateMutation.mutate(payload);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                value={user?.email}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Changer de mot de passe</h3>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
