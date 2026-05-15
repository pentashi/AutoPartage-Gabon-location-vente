"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { DataTable } from "@/components/data-table";

export default function UsersPage() {
  const { role } = useAuthStore();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["users"], queryFn: api.users });

  if (role !== "SUPER_ADMIN") {
    return <p>Accès réservé au Super Admin.</p>;
  }

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement des utilisateurs.</p>;

  return (
    <DataTable title="Gestion des utilisateurs">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.fullName}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
