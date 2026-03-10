"use client";

import { AdminVenueProvider, AdminVenuePicker } from "@/components/admin/AdminVenueContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminVenueProvider>
      <AdminVenuePicker />
      {children}
    </AdminVenueProvider>
  );
}
