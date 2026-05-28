"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { 
  Car, 
  Calendar, 
  ShieldAlert, 
  Wrench, 
  FileText, 
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VehicleDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: vehicle, isLoading } = useQuery({ 
    queryKey: ["vehicle", id], 
    queryFn: () => api.getVehicle(id) 
  });

  if (isLoading) return <p className="p-6 text-slate-500">Chargement...</p>;
  if (!vehicle) return <p className="p-6 text-slate-500">Véhicule introuvable.</p>;

  // Construct Timeline
  const events = [
    ...vehicle.contracts.map((c: any) => ({
      id: `c-${c.id}`,
      date: new Date(c.startDate),
      type: "CONTRACT",
      title: "Nouveau Contrat",
      desc: `Type: ${c.type === "RENTAL" ? "Location" : "Vente"} | Chauffeur: ${c.driver.user.fullName}`
    })),
    ...vehicle.incidents.map((i: any) => ({
      id: `i-${i.id}`,
      date: new Date(i.occurredAt),
      type: "INCIDENT",
      title: `Incident: ${i.title}`,
      desc: i.description
    })),
    ...vehicle.maintenanceTasks.map((m: any) => ({
      id: `m-${m.id}`,
      date: new Date(m.createdAt),
      type: "MAINTENANCE",
      title: `Maintenance: ${m.title}`,
      desc: `Status: ${m.status} | Assigné à: ${m.assignedTo?.fullName || "N/A"}`
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Car className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-slate-500 font-mono text-lg">{vehicle.plateNumber}</p>
        </div>
        <span className={cn(
          "ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase",
          vehicle.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
          {vehicle.status}
        </span>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Historique complet</h2>
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-0">
              <div className={cn(
                "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center",
                event.type === "CONTRACT" ? "bg-blue-500" : 
                event.type === "INCIDENT" ? "bg-red-500" : "bg-amber-500"
              )}>
                {event.type === "CONTRACT" && <FileText className="h-2 w-2 text-white" />}
                {event.type === "INCIDENT" && <ShieldAlert className="h-2 w-2 text-white" />}
                {event.type === "MAINTENANCE" && <Wrench className="h-2 w-2 text-white" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {event.date.toLocaleDateString()}
                </span>
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{event.desc}</p>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-slate-500 italic">Aucun événement enregistré.</p>}
        </div>
      </div>
    </div>
  );
}
