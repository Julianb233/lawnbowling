export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminWaiversClient } from "./AdminWaiversClient";

export default async function AdminWaiversPage() {
  await requireAdmin();
  return <AdminWaiversClient />;
}
