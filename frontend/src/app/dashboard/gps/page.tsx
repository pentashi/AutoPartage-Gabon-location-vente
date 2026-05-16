"use client";

import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function GpsPage() {
  const [pendingAction, setPendingAction] = useState<{
    vehicleId: string;
    plateNumber: string;
    type: "IMMOBILIZE" | "RELEASE";
  } | null>(null);
  const queryClient = useQueryClient();
  const { data: vehicles = [], isLoading, error } = useQuery({ queryKey: ["vehicles"], queryFn: api.vehicles });

  const locations = useQueries({
    queries: vehicles.map((vehicle) => ({
      queryKey: ["gps-location", vehicle.id],
      queryFn: () => api.gpsLatestLocation(vehicle.id),
      retry: false
    }))
  });

  const immobilizeMutation = useMutation({
    mutationFn: (vehicleId: string) => api.gpsImmobilize(vehicleId, "Action manuelle dashboard"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (vehicleId: string) => api.gpsRelease(vehicleId, "Action manuelle dashboard"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    }
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des données GPS.</p>;

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "IMMOBILIZE") {
      immobilizeMutation.mutate(pendingAction.vehicleId);
    } else {
      releaseMutation.mutate(pendingAction.vehicleId);
    }
    setPendingAction(null);
  };

  return (
    <>
      <DataTable title="GPS & commandes à distance">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Véhicule</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Dernière position</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle, index) => {
              const locationQuery = locations[index];
              const location = locationQuery?.data;

              return (
                <tr key={vehicle.id} className="border-t">
                  <td className="px-4 py-2">{vehicle.brand} {vehicle.model}</td>
                  <td className="px-4 py-2">{vehicle.status}</td>
                  <td className="px-4 py-2">
                    {location
                      ? `${location.latitude}, ${location.longitude} (${new Date(location.recordedAt).toLocaleString()})`
                      : "Aucune position"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded bg-red-600 px-2 py-1 text-white disabled:bg-red-300"
                        disabled={immobilizeMutation.isPending}
                        onClick={() =>
                          setPendingAction({
                            vehicleId: vehicle.id,
                            plateNumber: vehicle.plateNumber,
                            type: "IMMOBILIZE"
                          })
                        }
                      >
                        Immobiliser
                      </button>
                      <button
                        className="rounded bg-emerald-600 px-2 py-1 text-white disabled:bg-emerald-300"
                        disabled={releaseMutation.isPending}
                        onClick={() =>
                          setPendingAction({
                            vehicleId: vehicle.id,
                            plateNumber: vehicle.plateNumber,
                            type: "RELEASE"
                          })
                        }
                      >
                        Débloquer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.type === "IMMOBILIZE" ? "Confirmer l'immobilisation" : "Confirmer le déblocage"
        }
        description={
          pendingAction
            ? `Véhicule ${pendingAction.plateNumber} — cette action est sensible.`
            : ""
        }
        confirmLabel="Valider"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
        disabled={immobilizeMutation.isPending || releaseMutation.isPending}
      />
    </>
  );
}
