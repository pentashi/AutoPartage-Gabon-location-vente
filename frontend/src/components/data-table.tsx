"use client";

import { ReactNode } from "react";

export function DataTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="overflow-hidden rounded border bg-white">{children}</div>
    </section>
  );
}
