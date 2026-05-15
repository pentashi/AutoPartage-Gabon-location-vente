"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function DriversPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["drivers"], queryFn: api.drivers });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des chauffeurs.</p>;

  return (
    <DataTable title="Chauffeurs">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Permis</th>
            <th className="px-4 py-2">CNSS</th>
            <th className="px-4 py-2">CNAMGS</th>
            <th className="px-4 py-2">Score risque</th>
          </tr>
        </thead>
        <tbody>
          {data.map((driver) => (
            <tr key={driver.id} className="border-t">
              <td className="px-4 py-2">{driver.licenseNumber}</td>
              <td className="px-4 py-2">{driver.cnssNumber ?? "-"}</td>
              <td className="px-4 py-2">{driver.cnamgsNumber ?? "-"}</td>
              <td className="px-4 py-2">{driver.riskScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
