"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";

export default function VehiclesPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["vehicles"], queryFn: api.vehicles });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des véhicules.</p>;

  return (
    <DataTable title="Flotte véhicules">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Véhicule</th>
            <th className="px-4 py-2">Plaque</th>
            <th className="px-4 py-2">Année</th>
            <th className="px-4 py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {data.map((vehicle) => (
            <tr key={vehicle.id} className="border-t">
              <td className="px-4 py-2">{vehicle.brand} {vehicle.model}</td>
              <td className="px-4 py-2">{vehicle.plateNumber}</td>
              <td className="px-4 py-2">{vehicle.year}</td>
              <td className="px-4 py-2">{vehicle.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
