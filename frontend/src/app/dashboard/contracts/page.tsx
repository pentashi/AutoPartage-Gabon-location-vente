"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  FileText, 
  Plus, 
  Loader2, 
  MoreVertical,
  Calendar,
  User as UserIcon,
  Car,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { generateContractSummary } from "@/lib/pdf";

const contractStatuses: Record<string, any> = {
  ACTIVE: { label: "Actif", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  LATE: { label: "En retard", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  SUSPENDED: { label: "Suspendu", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
  TERMINATED: { label: "Terminé", color: "text-slate-600 bg-slate-50", dot: "bg-slate-500" },
};

const statusFilterOptions = Object.entries(contractStatuses).map(([val, info]) => ({
  label: info.label,
  value: val
}));

export default function ContractsPage() {
  const { role: currentUserRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState("RENTAL");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyAmount, setMonthlyAmount] = useState("");

  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({ 
    queryKey: ["contracts"], 
    queryFn: api.contracts 
  });

  const { data: drivers = [] } = useQuery({ 
    queryKey: ["drivers"], 
    queryFn: api.drivers 
  });

  const { data: vehicles = [] } = useQuery({ 
    queryKey: ["vehicles"], 
    queryFn: api.vehicles 
  });

  const filteredContracts = useMemo(() => {
    return contracts.filter((c: any) => {
      const matchesSearch = 
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.driver?.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.vehicle?.plateNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "" || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const createMutation = useMutation({
    mutationFn: (newContract: any) => api.createContract(newContract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contrat créé avec succès");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur de création", { description: err.message });
    }
  });

  const resetForm = () => {
    setDriverId("");
    setVehicleId("");
    setType("RENTAL");
    setStartDate(new Date().toISOString().split('T')[0]);
    setMonthlyAmount("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      driverId, 
      vehicleId, 
      type, 
      startDate: new Date(startDate).toISOString(), 
      monthlyAmount: Number(monthlyAmount) 
    });
  };

  if (currentUserRole !== "SUPER_ADMIN" && currentUserRole !== "ADMIN" && currentUserRole !== "FLEET" && currentUserRole !== "ACCOUNTANT") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Accès non autorisé</h2>
        <p>Seuls les administrateurs et comptables peuvent gérer les contrats.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Contrats</h1>
          <p className="text-slate-500 text-sm">Gestion des engagements location-vente</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau contrat
        </button>
      </div>

      <SearchFilterBar
        searchPlaceholder="Chercher par chauffeur, véhicule ou ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusFilterOptions}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / ID</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeur</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingContracts ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement des contrats...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Aucun contrat ne correspond à vos critères</td>
                </tr>
              ) : (
                filteredContracts.map((contract: any) => (
                  <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-semibold text-slate-900">{contract.type === "RENTAL" ? "Location" : "Vente"}</div>
                      <div className="text-xs text-slate-500 font-mono">#{contract.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-700 truncate max-w-[120px]">{contract.driver?.user?.fullName || "Chauffeur"}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-700 font-mono text-xs">{contract.vehicle?.plateNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-semibold text-slate-900">
                      {Number(contract.monthlyAmount).toLocaleString()} <span className="text-[10px] text-slate-500">FCFA</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          contractStatuses[contract.status]?.dot || "bg-slate-300"
                        )} />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          contractStatuses[contract.status]?.color || "bg-slate-100 text-slate-700"
                        )}>
                          {contractStatuses[contract.status]?.label || contract.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => generateContractSummary(contract)}
                          className="text-slate-400 hover:text-primary p-1 transition-colors"
                          title="Télécharger le contrat"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Établir un nouveau contrat</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chauffeur titulaire</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={driverId}
                    onChange={e => setDriverId(e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.user?.fullName || "Inconnu"} ({d.licenseNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Véhicule affecté</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={vehicleId}
                    onChange={e => setVehicleId(e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {vehicles.filter((v: any) => v.status === "ACTIVE").map((v: any) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type de contrat</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setType("RENTAL")}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all shadow-sm",
                        type === "RENTAL" ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      LOCATION
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("SALE")}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all shadow-sm",
                        type === "SALE" ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      VENTE
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'effet</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loyer mensuel (FCFA)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-primary shadow-sm"
                    placeholder="250 000"
                    value={monthlyAmount}
                    onChange={e => setMonthlyAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">FCFA</span>
                </div>
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
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Signer le contrat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
