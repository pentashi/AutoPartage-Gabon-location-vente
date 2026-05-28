"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Plus, 
  Loader2, 
  MoreVertical,
  ShieldCheck,
  CreditCard,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchFilterBar } from "@/components/search-filter-bar";

export default function DriversPage() {
  const { role: currentUserRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [licenseNumber, setLicenseNumber] = useState("");
  const [cnssNumber, setCnssNumber] = useState("");
  const [cnamgsNumber, setCnamgsNumber] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const { data = [], isLoading } = useQuery({ 
    queryKey: ["drivers"], 
    queryFn: api.drivers 
  });

  const filteredData = useMemo(() => {
    return data.filter((d: any) => {
      const matchesSearch = 
        (d.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (newDriver: any) => api.createDriver(newDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Chauffeur enregistré avec succès");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur d'enregistrement", { description: err.message });
    }
  });

  const resetForm = () => {
    setLicenseNumber("");
    setCnssNumber("");
    setCnamgsNumber("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      licenseNumber, 
      cnssNumber: cnssNumber || undefined, 
      cnamgsNumber: cnamgsNumber || undefined,
      riskScore: 0
    });
  };

  if (currentUserRole !== "SUPER_ADMIN" && currentUserRole !== "ADMIN" && currentUserRole !== "FLEET") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Accès non autorisé</h2>
        <p>Seuls les gestionnaires de flotte peuvent gérer les chauffeurs.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Chauffeurs</h1>
          <p className="text-slate-500 text-sm">Gestion des conducteurs et de leurs dossiers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau chauffeur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold">{data.length}</div>
          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold text-emerald-600">{data.filter((d: any) => d.riskScore < 20).length}</div>
          <p className="text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider font-semibold">Sûrs</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xl md:text-2xl font-bold text-red-600">{data.filter((d: any) => d.riskScore >= 50).length}</div>
          <p className="text-[10px] md:text-xs text-red-600 uppercase tracking-wider font-semibold">Risques</p>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Chercher par nom ou numéro de permis..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeur</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Permis</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sécurité Sociale</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucun chauffeur ne correspond à vos critères</td>
                </tr>
              ) : (
                filteredData.map((driver: any) => (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {driver.user?.fullName?.charAt(0) || "D"}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate">{driver.user?.fullName || "Chauffeur externe"}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">ID: {driver.id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center text-xs md:text-sm text-slate-700 whitespace-nowrap">
                        <CreditCard className="h-3 w-3 mr-1.5 text-slate-400" />
                        {driver.licenseNumber}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-500 font-medium font-mono whitespace-nowrap">CNSS: {driver.cnssNumber || "-"}</div>
                        <div className="text-[10px] text-slate-500 font-medium font-mono whitespace-nowrap">CNAMGS: {driver.cnamgsNumber || "-"}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 md:w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              driver.riskScore < 20 ? "bg-emerald-500" :
                              driver.riskScore < 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, driver.riskScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600">{driver.riskScore}</span>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Enregistrer un chauffeur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro de permis</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Ex: GA-00123"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro CNSS</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Optionnel"
                    value={cnssNumber}
                    onChange={e => setCnssNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro CNAMGS</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Optionnel"
                    value={cnamgsNumber}
                    onChange={e => setCnamgsNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  <strong>Note:</strong> Ce dossier sera lié à un compte utilisateur existant avec le rôle CHAUFFEUR si les emails correspondent.
                </p>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
