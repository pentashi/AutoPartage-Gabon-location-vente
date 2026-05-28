"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  Plus, 
  Loader2, 
  MoreVertical,
  Calendar,
  User as UserIcon,
  Car,
  XCircle,
  Clock,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const incidentStatuses: Record<string, any> = {
  OPEN: { label: "Ouvert", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
  INVESTIGATING: { label: "En cours", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  RESOLVED: { label: "Résolu", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
};

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  const { data: incidents = [], isLoading: isLoadingIncidents } = useQuery({ 
    queryKey: ["incidents"], 
    queryFn: api.incidents 
  });

  const { data: vehicles = [] } = useQuery({ 
    queryKey: ["vehicles"], 
    queryFn: api.vehicles 
  });

  const { data: drivers = [] } = useQuery({ 
    queryKey: ["drivers"], 
    queryFn: api.drivers 
  });

  const createMutation = useMutation({
    mutationFn: (newIncident: any) => api.createIncident(newIncident),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Incident déclaré");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur de déclaration", { description: err.message });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      api.updateIncidentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Statut mis à jour");
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVehicleId("");
    setDriverId("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      title, 
      description, 
      vehicleId: vehicleId || undefined, 
      driverId: driverId || undefined 
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Sécurité & Incidents</h1>
          <p className="text-slate-500 text-sm">Déclaration et suivi des événements critiques</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Déclarer un incident
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident / Détails</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contexte</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingIncidents ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucun incident</td>
                </tr>
              ) : (
                incidents.map((incident: any) => (
                  <tr key={incident.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2 text-xs md:text-sm">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate max-w-[150px] md:max-w-none">{incident.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">{incident.description}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="space-y-0.5">
                        {incident.vehicle && (
                          <div className="text-[10px] text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                            <Car className="h-3 w-3" /> {incident.vehicle.plateNumber}
                          </div>
                        )}
                        {incident.driver && (
                          <div className="text-[10px] text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                            <UserIcon className="h-3 w-3" /> {incident.driver.user?.fullName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-[10px] md:text-xs">
                      <div className="flex items-center whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1.5 text-slate-400" />
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          incidentStatuses[incident.status]?.dot || "bg-slate-300"
                        )} />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                          incidentStatuses[incident.status]?.color || "bg-slate-100 text-slate-700"
                        )}>
                          {incidentStatuses[incident.status]?.label || incident.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900">Signaler un incident</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 md:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre de l'incident</label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="Ex: Accident mineur..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[100px]"
                  placeholder="Détails..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Véhicule</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={vehicleId}
                    onChange={e => setVehicleId(e.target.value)}
                  >
                    <option value="">Aucun</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chauffeur</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={driverId}
                    onChange={e => setDriverId(e.target.value)}
                  >
                    <option value="">Aucun</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.user?.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 order-1 sm:order-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Signaler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
