"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function PaymentsPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["payments"], queryFn: api.payments });

  const total = useMemo(() => data.reduce((sum, p) => sum + Number(p.amount), 0), [data]);
  const overdue = useMemo(() => data.filter((p) => p.status === "OVERDUE").length, [data]);

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des paiements.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border bg-white p-4">Total enregistré: {total.toFixed(2)}</div>
        <div className="rounded border bg-white p-4">Nombre de paiements: {data.length}</div>
        <div className="rounded border bg-white p-4">Paiements en retard: {overdue}</div>
      </div>
      <DataTable title="Paiements">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Montant</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Échéance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="px-4 py-2">{payment.amount}</td>
                <td className="px-4 py-2">{payment.status}</td>
                <td className="px-4 py-2">{new Date(payment.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
