export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { RatingErrorsClient } from "./RatingErrorsClient";

export default async function RatingErrorsPage() {
  await requireAdmin();

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: errors } = await svc
    .from("rating_calculation_errors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <RatingErrorsClient errors={errors ?? []} />;
}
