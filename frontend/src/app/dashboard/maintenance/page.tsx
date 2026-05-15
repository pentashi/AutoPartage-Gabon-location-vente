"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";
import { MaintenanceTask } from "@/lib/types";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["maintenance-tasks"], queryFn: api.maintenanceTasks });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaintenanceTask["status"] }) =>
      api.updateMaintenanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    }
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des maintenances.</p>;

  return (
    <DataTable title="Gestion maintenance">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Tâche</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Niveau</th>
            <th className="px-4 py-2">Échéance</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.status}</td>
              <td className="px-4 py-2">{task.escalationLvl}</td>
              <td className="px-4 py-2">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button
                    className="rounded bg-sky-600 px-2 py-1 text-white disabled:bg-sky-300"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: task.id, status: "IN_PROGRESS" })}
                  >
                    Démarrer
                  </button>
                  <button
                    className="rounded bg-emerald-600 px-2 py-1 text-white disabled:bg-emerald-300"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: task.id, status: "COMPLETED" })}
                  >
                    Clôturer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
