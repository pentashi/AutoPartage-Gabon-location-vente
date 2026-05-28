"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Car, 
  Plus, 
  Loader2, 
  MoreVertical,
  XCircle,
  ShieldAlert,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { exportToCsv } from "@/lib/export";

const vehicleStatuses = [
  { value: "ACTIVE", label: "Actif", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  { value: "IMMOBILIZED", label: "Immobilisé", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
  { value: "MAINTENANCE", label: "Maintenance", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
];

export default function VehiclesPage() {
  const { role: currentUserRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data = [], isLoading } = useQuery({ 
    queryKey: ["vehicles"], 
    queryFn: api.vehicles 
  });

  const filteredData = useMemo(() => {
    return data.filter((v: any) => {
      const matchesSearch = 
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "" || v.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const createMutation = useMutation({
    mutationFn: (newVehicle: any) => api.createVehicle(newVehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Véhicule ajouté avec succès");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      console.error("Vehicle creation error:", err);
      toast.error("Erreur lors de l'ajout", { 
        description: err.response?.data?.message || err.message || "Une erreur inconnue est survenue." 
      });
    }
  });

  const resetForm = () => {
    setBrand("");
    setModel("");
    setPlateNumber("");
    setYear(new Date().getFullYear());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ brand, model, plateNumber, year: Number(year) });
  };

  const isAuthorized = ["SUPER_ADMIN", "ADMIN", "FLEET"].includes(currentUserRole || "");

  const handleExport = () => {
    const headers = ["ID", "Marque", "Modele", "Immatriculation", "Annee", "Statut"];
    const exportData = data.map((v: any) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      plate: v.plateNumber,
      year: v.year,
      status: v.status
    }));
    exportToCsv(exportData, "Flotte_Vehicules", headers);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Accès non autorisé</h2>
        <p>Votre rôle ({currentUserRole || "Aucun"}) n'a pas accès à la gestion des véhicules.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Flotte véhicules</h1>
          <p className="text-slate-500 text-sm">Suivi et gestion de vos actifs roulants</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau véhicule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold">{data.length}</div>
          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-emerald-600">{data.filter((v: any) => v.status === "ACTIVE").length}</div>
          <p className="text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider font-semibold">Actifs</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-amber-600">{data.filter((v: any) => v.status === "MAINTENANCE").length}</div>
          <p className="text-[10px] md:text-xs text-amber-600 uppercase tracking-wider font-semibold">Maint.</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-red-600">{data.filter((v: any) => v.status === "IMMOBILIZED").length}</div>
          <p className="text-[10px] md:text-xs text-red-600 uppercase tracking-wider font-semibold">Immob.</p>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Chercher par marque, modèle ou plaque..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={vehicleStatuses}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plaque</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Année</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
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
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucun véhicule ne correspond à vos critères</td>
                </tr>
              ) : (
                filteredData.map((vehicle: any) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="flex items-center gap-3">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <Car className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate text-sm md:text-base hover:underline">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">ID: {vehicle.id.slice(-6).toUpperCase()}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-[11px] md:text-sm text-slate-700 whitespace-nowrap">
                        {vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-[13px] md:text-sm text-slate-600">
                      {vehicle.year}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          vehicleStatuses.find(s => s.value === vehicle.status)?.dot || "bg-slate-300"
                        )} />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium",
                          vehicleStatuses.find(s => s.value === vehicle.status)?.color || "bg-slate-100 text-slate-700"
                        )}>
                          {vehicleStatuses.find(s => s.value === vehicle.status)?.label || vehicle.status}
                        </span>
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-slate-900">Nouveau véhicule</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marque</label>
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Ex: Toyota"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modèle</label>
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Ex: Corolla"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro de plaque</label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  placeholder="G-000-AA"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Année</label>
                <input
                  required
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                />
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
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter au parc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
