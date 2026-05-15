"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function ContractsPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["contracts"], queryFn: api.contracts });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des contrats.</p>;

  return (
    <DataTable title="Contrats location-vente">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Montant mensuel</th>
          </tr>
        </thead>
        <tbody>
          {data.map((contract) => (
            <tr key={contract.id} className="border-t">
              <td className="px-4 py-2">{contract.type}</td>
              <td className="px-4 py-2">{contract.status}</td>
              <td className="px-4 py-2">{contract.monthlyAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
