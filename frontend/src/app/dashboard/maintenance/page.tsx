"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Wrench, 
  Plus, 
  Loader2, 
  MoreVertical,
  Calendar,
  Car,
  XCircle,
  ShieldAlert,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const taskStatuses: Record<string, any> = {
  PLANNED: { label: "Planifié", color: "text-blue-600 bg-blue-50", dot: "bg-blue-500" },
  IN_PROGRESS: { label: "En cours", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  OVERDUE: { label: "En retard", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
  COMPLETED: { label: "Terminé", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  CANCELED: { label: "Annulé", color: "text-slate-600 bg-slate-50", dot: "bg-slate-500" },
};

export default function MaintenancePage() {
  const { role: currentUserRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [vehicleId, setVehicleId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [escalationLvl, setEscalationLvl] = useState(1);

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({ 
    queryKey: ["maintenance-tasks"], 
    queryFn: api.maintenanceTasks 
  });

  const { data: vehicles = [] } = useQuery({ 
    queryKey: ["vehicles"], 
    queryFn: api.vehicles 
  });

  const { data: users = [] } = useQuery({ 
    queryKey: ["users"], 
    queryFn: api.users 
  });

  const garageUsers = users.filter((u: any) => u.role === "GARAGE");

  const createMutation = useMutation({
    mutationFn: (newTask: any) => api.createMaintenanceTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Tâche de maintenance créée");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur de création", { description: err.message });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      api.updateMaintenanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Statut mis à jour");
    }
  });

  const resetForm = () => {
    setVehicleId("");
    setAssignedToId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setEscalationLvl(1);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      vehicleId, 
      assignedToId: assignedToId || undefined, 
      title, 
      description, 
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      escalationLvl: Number(escalationLvl)
    });
  };

  if (currentUserRole !== "SUPER_ADMIN" && currentUserRole !== "ADMIN" && currentUserRole !== "FLEET" && currentUserRole !== "GARAGE") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <ShieldAlert className="h-12 w-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Accès non autorisé</h2>
        <p>Seuls les gestionnaires et mécaniciens peuvent gérer la maintenance.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Maintenance</h1>
          <p className="text-slate-500 text-sm">Planification et suivi des interventions techniques</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tâche / Véhicule</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigné à</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Échéance</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingTasks ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucune tâche</td>
                </tr>
              ) : (
                tasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[150px] md:max-w-none">{task.title}</div>
                      <div className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Car className="h-3 w-3" /> {task.vehicle?.plateNumber}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-xs md:text-sm">
                      {task.assignedTo?.fullName || "Non assigné"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center text-xs text-slate-500 whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          taskStatuses[task.status]?.dot || "bg-slate-300"
                        )} />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                          taskStatuses[task.status]?.color || "bg-slate-100 text-slate-700"
                        )}>
                          {taskStatuses[task.status]?.label || task.status}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-slate-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900">Planifier une maintenance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 md:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Véhicule concerné</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                >
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plateNumber}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre de l'intervention</label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  placeholder="Ex: Vidange périodique"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructions</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[80px]"
                  placeholder="Détails..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attribuer au garage</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={assignedToId}
                    onChange={e => setAssignedToId(e.target.value)}
                  >
                    <option value="">Non assigné</option>
                    {garageUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Échéance</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgence</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEscalationLvl(lvl)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all shadow-sm",
                        escalationLvl === lvl 
                          ? (lvl === 3 ? "bg-red-600 text-white border-red-600" : "bg-primary text-white border-primary")
                          : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      LVL {lvl}
                    </button>
                  ))}
                </div>
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
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Planifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
