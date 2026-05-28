"use client";

import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@/lib/api";
import { 
  Car, 
  MapPin, 
  ShieldAlert, 
  Loader2, 
  Calendar, 
  Clock, 
  LayoutList, 
  Map as MapIcon,
  XCircle,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map-view"), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center border border-slate-200">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">Chargement de la carte...</p>
      </div>
    </div>
  )
});

export default function GpsPage() {
  const [view, setView] = useState<"TABLE" | "MAP">("TABLE");
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<{
    vehicleId: string;
    plateNumber: string;
    type: "IMMOBILIZE" | "RELEASE";
  } | null>(null);

  const { data: vehicles = [], isLoading, error } = useQuery({ 
    queryKey: ["vehicles"], 
    queryFn: api.vehicles 
  });

  const locations = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ["vehicle-location", v.id],
      queryFn: () => api.gpsLatestLocation(v.id),
      refetchInterval: 10000 // Poll every 10 seconds
    }))
  });

  const immobilizeMutation = useMutation({
    mutationFn: (vehicleId: string) => api.gpsImmobilize(vehicleId, "Action manuelle dashboard"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (vehicleId: string) => api.gpsRelease(vehicleId, "Action manuelle dashboard"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  if (isLoading) return <p className="p-6 text-slate-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des données...</p>;
  if (error) return <p className="p-6 text-red-600">Erreur lors du chargement des données GPS.</p>;

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "IMMOBILIZE") {
      immobilizeMutation.mutate(pendingAction.vehicleId);
    } else {
      releaseMutation.mutate(pendingAction.vehicleId);
    }
    setPendingAction(null);
  };

  const mapLocations = locations
    .map((q, i) => {
      if (!q.data) return null;
      const v = vehicles[i];
      return {
        id: v.id,
        latitude: q.data.latitude,
        longitude: q.data.longitude,
        label: `${v.brand} ${v.model}`,
        subLabel: v.plateNumber,
        speed: q.data.speedKph,
        timestamp: q.data.recordedAt
      };
    })
    .filter(Boolean) as any[];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">GPS & Commandes</h1>
          <p className="text-slate-500 text-sm">Suivi temps réel et contrôle à distance</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setView("TABLE")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              view === "TABLE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Tableau
          </button>
          <button
            onClick={() => setView("MAP")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
              view === "MAP" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Carte Live
          </button>
        </div>
      </div>

      {view === "TABLE" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plaque</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dernière position</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle, index) => {
                  const locationQuery = locations[index];
                  const location = locationQuery?.data;

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-4 md:px-6 py-4 font-semibold text-slate-900 text-xs md:text-sm">
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-[11px] md:text-sm text-slate-700">
                          {vehicle.plateNumber}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          vehicle.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-slate-500 text-[10px] md:text-xs">
                        {location
                          ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                          : "Aucune position"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] md:text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                            disabled={immobilizeMutation.isPending}
                            onClick={() =>
                              setPendingAction({
                                vehicleId: vehicle.id,
                                plateNumber: vehicle.plateNumber,
                                type: "IMMOBILIZE"
                              })
                            }
                          >
                            Bloquer
                          </button>
                          <button
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] md:text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                            disabled={releaseMutation.isPending}
                            onClick={() =>
                              setPendingAction({
                                vehicleId: vehicle.id,
                                plateNumber: vehicle.plateNumber,
                                type: "RELEASE"
                              })
                            }
                          >
                            Libérer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="h-[500px] md:h-[600px] w-full">
          <MapView locations={mapLocations} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.type === "IMMOBILIZE" ? "Confirmer l'immobilisation" : "Confirmer le déblocage"
        }
        description={
          pendingAction
            ? `Véhicule ${pendingAction.plateNumber} — cette action sera tracée.`
            : ""
        }
        confirmLabel="Valider"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
        disabled={immobilizeMutation.isPending || releaseMutation.isPending}
      />
    </div>
  );
}
