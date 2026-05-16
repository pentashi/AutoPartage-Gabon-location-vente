"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";
import { Incident } from "@/lib/types";

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["incidents"], queryFn: api.incidents });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: api.createIncident,
    onSuccess: () => {
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: Incident["status"]; note?: string }) =>
      api.updateIncidentStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({ title, description });
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des incidents.</p>;

  return (
    <div className="space-y-6">
      <DataTable title="Déclarer un incident sécurité">
        <form className="grid gap-3" onSubmit={submit}>
          <input
            className="rounded border px-3 py-2"
            placeholder="Titre incident"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <textarea
            className="rounded border px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
          <button
            className="w-fit rounded bg-slate-900 px-3 py-2 text-white disabled:bg-slate-300"
            type="submit"
            disabled={createMutation.isPending}
          >
            Créer incident critique
          </button>
        </form>
      </DataTable>

      <DataTable title="Suivi incidents sécurité">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Titre</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((incident) => (
              <tr key={incident.id} className="border-t">
                <td className="px-4 py-2">{incident.title}</td>
                <td className="px-4 py-2">{incident.status}</td>
                <td className="px-4 py-2">{new Date(incident.occurredAt).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-amber-600 px-2 py-1 text-white disabled:bg-amber-300"
                      disabled={statusMutation.isPending || incident.status !== "OPEN"}
                      onClick={() =>
                        statusMutation.mutate({ id: incident.id, status: "INVESTIGATING", note: "Prise en charge admin" })
                      }
                    >
                      Prendre en charge
                    </button>
                    <button
                      className="rounded bg-emerald-600 px-2 py-1 text-white disabled:bg-emerald-300"
                      disabled={statusMutation.isPending || incident.status === "RESOLVED"}
                      onClick={() => {
                        const confirmed = window.confirm(`Confirmer la clôture de l'incident ${incident.id} ?`);
                        if (!confirmed) return;
                        statusMutation.mutate({ id: incident.id, status: "RESOLVED", note: "Clôturé par admin" });
                      }}
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
    </div>
  );
}
