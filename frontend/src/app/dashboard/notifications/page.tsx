"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["notifications"], queryFn: api.notifications });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des notifications.</p>;

  return (
    <DataTable title="Notifications & relances">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Titre</th>
            <th className="px-4 py-2">Priorité</th>
            <th className="px-4 py-2">Canal</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((notification) => (
            <tr key={notification.id} className="border-t">
              <td className="px-4 py-2">{notification.title}</td>
              <td className="px-4 py-2">{notification.priority}</td>
              <td className="px-4 py-2">{notification.channel}</td>
              <td className="px-4 py-2">{notification.isRead ? "Lue" : "Non lue"}</td>
              <td className="px-4 py-2">
                <button
                  className="rounded bg-slate-900 px-2 py-1 text-white disabled:bg-slate-300"
                  disabled={notification.isRead || readMutation.isPending}
                  onClick={() => readMutation.mutate(notification.id)}
                >
                  Marquer comme lue
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
