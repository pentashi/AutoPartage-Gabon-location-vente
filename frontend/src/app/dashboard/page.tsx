"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuthStore();

  useEffect(() => {
    if (!role) {
      return;
    }

    if (role === "SUPER_ADMIN") {
      router.replace("/dashboard/users");
      return;
    }

    if (role === "ACCOUNTANT") {
      router.replace("/dashboard/payments");
      return;
    }

    router.replace("/dashboard/vehicles");
  }, [role, router]);

  return <p>Redirection...</p>;
}
